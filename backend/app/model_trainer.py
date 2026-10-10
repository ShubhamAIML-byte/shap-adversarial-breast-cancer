import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple, Optional
from xgboost import XGBClassifier
from app.data_loader import data_loader
from app.config import MODELS_DIR, RANDOM_SEED, DEFAULT_EPSILON
from app.dataset_info import FEATURE_NAMES
from app.explainer import ShapExplainerManager
from app.adversarial import generate_adversarial_sample, calculate_shap_rank_correlation

BASELINE_MODEL_PATH = MODELS_DIR / "baseline_model.joblib"
ROBUST_MODEL_PATH = MODELS_DIR / "robust_model.joblib"

class ModelManager:
    def __init__(self):
        self.baseline_model: Optional[XGBClassifier] = None
        self.robust_model: Optional[XGBClassifier] = None
        self.explainer_manager: Optional[ShapExplainerManager] = None
        self._load_or_train()

    def _load_or_train(self):
        if BASELINE_MODEL_PATH.exists() and ROBUST_MODEL_PATH.exists():
            try:
                self.baseline_model = joblib.load(BASELINE_MODEL_PATH)
                self.robust_model = joblib.load(ROBUST_MODEL_PATH)
                print("[INFO] Successfully loaded persisted models from joblib.")
            except Exception as e:
                print(f"[WARN] Error loading models: {e}. Retraining...")
                self._train_models()
        else:
            print("[INFO] Model files not found. Initializing training pipeline...")
            self._train_models()

        self.explainer_manager = ShapExplainerManager(
            baseline_model=self.baseline_model,
            robust_model=self.robust_model
        )

    def _train_models(self):
        X_train, y_train = data_loader.X_train, data_loader.y_train

        # 1. Train Baseline XGBoost
        self.baseline_model = XGBClassifier(
            n_estimators=100,
            max_depth=3,
            learning_rate=0.08,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=RANDOM_SEED,
            eval_metric="logloss"
        )
        self.baseline_model.fit(X_train, y_train)

        # 2. Generate SHAP-Guided Adversarial Training Augmentation
        temp_explainer = ShapExplainerManager(baseline_model=self.baseline_model)
        perturbed_samples = []
        perturbed_labels = []

        # Generate bounded perturbed variants for a subset of training data (50% random sample)
        sample_indices = X_train.sample(frac=0.6, random_state=RANDOM_SEED).index
        for idx in sample_indices:
            row = X_train.loc[idx]
            true_lbl = int(y_train.loc[idx])
            explanation = temp_explainer.explain_instance("baseline", row)
            pert_row, _ = generate_adversarial_sample(
                x_sample=row,
                shap_values=explanation["all_shap_values"],
                predicted_class=true_lbl,
                feature_stats=data_loader.feature_stats,
                epsilon=DEFAULT_EPSILON,
                perturbation_type="shap_guided",
                top_k=5
            )
            perturbed_samples.append(pert_row)
            perturbed_labels.append(true_lbl)

        df_perturbed = pd.DataFrame(perturbed_samples)
        s_perturbed_y = pd.Series(perturbed_labels)

        # Combine clean and adversarial training sets
        X_augmented = pd.concat([X_train, df_perturbed], ignore_index=True)
        y_augmented = pd.concat([y_train, s_perturbed_y], ignore_index=True)

        # 3. Train Robust XGBoost Classifier
        self.robust_model = XGBClassifier(
            n_estimators=100,
            max_depth=3,
            learning_rate=0.08,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=RANDOM_SEED,
            eval_metric="logloss"
        )
        self.robust_model.fit(X_augmented, y_augmented)

        # 4. Persist to disk
        try:
            joblib.dump(self.baseline_model, BASELINE_MODEL_PATH)
            joblib.dump(self.robust_model, ROBUST_MODEL_PATH)
            print("[INFO] Persisted baseline and robust models successfully.")
        except Exception as e:
            print(f"[WARN] Could not persist models to disk: {e}")

    def predict(self, features_dict: Dict[str, float], model_type: str = "baseline") -> Dict[str, Any]:
        """
        Runs inference on given 30 numerical features and returns explanation.
        """
        model = self.robust_model if model_type == "robust" else self.baseline_model
        sample_series = pd.Series(features_dict)[FEATURE_NAMES]
        df_sample = pd.DataFrame([sample_series])

        # Predict probability
        probs = model.predict_proba(df_sample)[0]
        # In our mapping: 0 = Benign, 1 = Malignant
        prob_benign = float(probs[0])
        prob_malignant = float(probs[1])
        pred_class = 1 if prob_malignant >= 0.5 else 0
        pred_label = "Malignant" if pred_class == 1 else "Benign"
        confidence = float(max(prob_benign, prob_malignant))

        # Log odds margin
        eps_clip = 1e-7
        p_clipped = np.clip(prob_malignant, eps_clip, 1.0 - eps_clip)
        log_odds = float(np.log(p_clipped / (1.0 - p_clipped)))

        # SHAP explanation
        explanation = self.explainer_manager.explain_instance(model_type, sample_series)

        return {
            "model_used": f"XGBoost ({model_type.capitalize()})",
            "predicted_label": pred_label,
            "predicted_class": pred_class,
            "probability_malignant": round(prob_malignant, 4),
            "probability_benign": round(prob_benign, 4),
            "confidence": round(confidence, 4),
            "margin_log_odds": round(log_odds, 4),
            "top_contributions": explanation["top_contributions"],
            "all_shap_values": explanation["all_shap_values"],
            "base_value": explanation["expected_value"],
            "waterfall": explanation["waterfall"],
            "disclaimer": "Academic Research & Educational Demonstration Only. Not for clinical diagnostic use."
        }

    def evaluate_adversarial_instance(
        self,
        features_dict: Dict[str, float],
        epsilon: float = 0.15,
        perturbation_type: str = "shap_guided",
        top_k: int = 5,
        model_type: str = "baseline"
    ) -> Dict[str, Any]:
        """
        Evaluates a single sample under bounded adversarial perturbation.
        """
        # 1. Clean inference
        clean_res = self.predict(features_dict, model_type=model_type)
        sample_series = pd.Series(features_dict)[FEATURE_NAMES]

        # 2. Perturbation
        pert_sample, pert_details = generate_adversarial_sample(
            x_sample=sample_series,
            shap_values=clean_res["all_shap_values"],
            predicted_class=clean_res["predicted_class"],
            feature_stats=data_loader.feature_stats,
            epsilon=epsilon,
            perturbation_type=perturbation_type,
            top_k=top_k
        )

        # 3. Perturbed inference
        pert_features_dict = {col: float(pert_sample[col]) for col in FEATURE_NAMES}
        pert_res = self.predict(pert_features_dict, model_type=model_type)

        # 4. Compare
        is_flipped = (clean_res["predicted_class"] != pert_res["predicted_class"])
        rank_corr = calculate_shap_rank_correlation(
            clean_res["all_shap_values"],
            pert_res["all_shap_values"]
        )

        shift_metrics = self.explainer_manager.compute_attribution_shift(
            clean_res["all_shap_values"],
            pert_res["all_shap_values"]
        )

        return {
            "original_prediction": clean_res,
            "perturbed_prediction": pert_res,
            "is_flipped": is_flipped,
            "epsilon": epsilon,
            "perturbation_type": perturbation_type,
            "perturbed_features": pert_details,
            "shap_rank_correlation": rank_corr,
            "max_shap_shift": shift_metrics["max_attribution_shift"],
            "mean_shap_shift": shift_metrics["mean_attribution_shift"],
            "feature_shifts": shift_metrics["feature_shifts"],
            "clinical_validity_note": (
                "Perturbations were strictly bounded within empirical feature min-max limits "
                f"and scaled by {epsilon} × standard deviation. Note that synthetic perturbations "
                "probe model sensitivity and do not necessarily correspond to plausible biological shifts."
            )
        }

model_manager = ModelManager()

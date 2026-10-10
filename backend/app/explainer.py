import numpy as np
import pandas as pd
from typing import Dict, List, Any, Tuple
from app.dataset_info import FEATURE_NAMES, FEATURE_GROUPS

class ShapExplainerManager:
    def __init__(self, baseline_model=None, robust_model=None):
        self.baseline_model = baseline_model
        self.robust_model = robust_model
        self.baseline_explainer = None
        self.robust_explainer = None
        self._init_explainers()

    def _init_explainers(self):
        try:
            import shap
            if self.baseline_model is not None:
                self.baseline_explainer = shap.TreeExplainer(self.baseline_model)
            if self.robust_model is not None:
                self.robust_explainer = shap.TreeExplainer(self.robust_model)
        except Exception as e:
            print(f"[Warning] TreeExplainer initialization notice: {e}")

    def explain_instance(self, model_type: str, x_sample: pd.Series) -> Dict[str, Any]:
        """
        Computes local SHAP attributions for a single instance.
        """
        explainer = self.robust_explainer if model_type == "robust" else self.baseline_explainer
        model = self.robust_model if model_type == "robust" else self.baseline_model

        # Convert to 2D DataFrame with correct feature names
        if isinstance(x_sample, pd.Series):
            df_sample = pd.DataFrame([x_sample])
        else:
            df_sample = pd.DataFrame([x_sample], columns=FEATURE_NAMES)

        if explainer is not None:
            raw_shap = explainer.shap_values(df_sample)
            # TreeExplainer on binary XGBoost returns 1D array of log-odds attributions
            if isinstance(raw_shap, list):
                shap_vals = raw_shap[1][0] if len(raw_shap) > 1 else raw_shap[0][0]
            elif len(raw_shap.shape) == 2:
                shap_vals = raw_shap[0]
            else:
                shap_vals = raw_shap

            expected_val = float(explainer.expected_value) if not isinstance(explainer.expected_value, (list, np.ndarray)) else float(explainer.expected_value[0])
        else:
            # Fallback approximation based on tree feature importances if explainer is unavailable
            importances = getattr(model, "feature_importances_", np.ones(len(FEATURE_NAMES)) / len(FEATURE_NAMES))
            # Approximate sign using deviation from standard mean
            shap_vals = (df_sample.values[0] - np.zeros(len(FEATURE_NAMES))) * importances * 0.1
            expected_val = -0.5

        shap_dict = {col: float(shap_vals[i]) for i, col in enumerate(FEATURE_NAMES)}

        # Rank contributions by absolute SHAP value
        sorted_items = sorted(shap_dict.items(), key=lambda item: abs(item[1]), reverse=True)
        top_contributions = []
        for rank, (feat, val) in enumerate(sorted_items[:5], start=1):
            top_contributions.append({
                "feature": feat,
                "value": float(x_sample[feat]),
                "shap_value": round(float(val), 4),
                "direction": "increases_risk" if val > 0 else "decreases_risk",
                "impact_rank": rank
            })

        # Waterfall representation cumulative steps
        running_sum = expected_val
        waterfall = [{"step": "Base Value", "attribution": round(expected_val, 4), "cumulative": round(running_sum, 4)}]
        for feat, val in sorted_items[:7]:
            running_sum += val
            waterfall.append({
                "step": feat,
                "attribution": round(val, 4),
                "cumulative": round(running_sum, 4)
            })
        waterfall.append({"step": "Model Output (Log-odds)", "attribution": 0.0, "cumulative": round(running_sum, 4)})

        return {
            "all_shap_values": shap_dict,
            "top_contributions": top_contributions,
            "expected_value": round(expected_val, 4),
            "waterfall": waterfall
        }

    def compute_attribution_shift(self, clean_shap: Dict[str, float], pert_shap: Dict[str, float]) -> Dict[str, Any]:
        """
        Quantifies feature attribution change under adversarial attack.
        """
        shift_data = []
        for feat in FEATURE_NAMES:
            c_val = clean_shap.get(feat, 0.0)
            p_val = pert_shap.get(feat, 0.0)
            shift = p_val - c_val
            shift_data.append({
                "feature": feat,
                "clean_shap": round(c_val, 4),
                "perturbed_shap": round(p_val, 4),
                "shift": round(shift, 4),
                "abs_shift": round(abs(shift), 4)
            })

        # Sort by absolute shift descending
        shift_data.sort(key=lambda item: item["abs_shift"], reverse=True)
        mean_shift = float(np.mean([item["abs_shift"] for item in shift_data]))
        max_shift = float(max([item["abs_shift"] for item in shift_data]))

        return {
            "feature_shifts": shift_data,
            "mean_attribution_shift": round(mean_shift, 4),
            "max_attribution_shift": round(max_shift, 4)
        }

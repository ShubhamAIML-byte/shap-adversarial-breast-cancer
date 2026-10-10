import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Any
from scipy.stats import spearmanr
from app.dataset_info import FEATURE_NAMES

def generate_adversarial_sample(
    x_sample: pd.Series,
    shap_values: Dict[str, float],
    predicted_class: int,
    feature_stats: Dict[str, Dict[str, float]],
    epsilon: float = 0.15,
    perturbation_type: str = "shap_guided",
    top_k: int = 5,
    random_seed: int = 42
) -> Tuple[pd.Series, List[Dict[str, Any]]]:
    """
    Applies bounded, feature-level adversarial perturbation to an input sample.
    
    Safe bounds:
    - Perturbation delta is bounded by epsilon * feature_std.
    - Resulting value is clipped to [min, max] observed in training data.
    
    Adversarial Direction:
    - If predicted_class == 1 (Malignant), adversary perturbs to push log-odds DOWN (towards Benign).
    - If predicted_class == 0 (Benign), adversary perturbs to push log-odds UP (towards Malignant).
    """
    x_perturbed = x_sample.copy()
    details = []

    if perturbation_type == "shap_guided":
        # Sort features by absolute SHAP attribution
        sorted_features = sorted(
            shap_values.items(),
            key=lambda item: abs(item[1]),
            reverse=True
        )
        target_features = [feat for feat, _ in sorted_features[:top_k]]
    else:
        # Random perturbation
        rng = np.random.RandomState(random_seed)
        target_features = list(rng.choice(FEATURE_NAMES, size=top_k, replace=False))

    for feat in target_features:
        orig_val = float(x_sample[feat])
        std_val = feature_stats[feat]["std"]
        min_val = feature_stats[feat]["min"]
        max_val = feature_stats[feat]["max"]
        shap_val = shap_values.get(feat, 0.0)

        if perturbation_type == "shap_guided":
            # For class 1 (Malignant): decrease features that contribute positively, increase features that contribute negatively
            # In general: direction = -sign(shap_val) if predicted 1, else +sign(shap_val)
            if predicted_class == 1:
                direction = -1.0 if shap_val >= 0 else 1.0
            else:
                direction = 1.0 if shap_val >= 0 else -1.0
        else:
            rng = np.random.RandomState(hash(feat + str(random_seed)) % (2**31))
            direction = float(rng.choice([-1.0, 1.0]))

        delta = direction * epsilon * std_val
        new_val = orig_val + delta
        # Clip to safe realistic clinical empirical bounds
        new_val = max(min_val, min(max_val, new_val))
        actual_delta = new_val - orig_val
        pct_change = (actual_delta / orig_val * 100.0) if orig_val != 0 else 0.0

        x_perturbed[feat] = new_val
        details.append({
            "feature": feat,
            "original_value": round(orig_val, 4),
            "perturbed_value": round(new_val, 4),
            "delta": round(actual_delta, 4),
            "percent_change": round(pct_change, 2),
            "feature_std": round(std_val, 4)
        })

    return x_perturbed, details

def calculate_shap_rank_correlation(
    clean_shap: Dict[str, float],
    perturbed_shap: Dict[str, float]
) -> float:
    """
    Computes Spearman's rank correlation between pre- and post-perturbation SHAP attributions.
    A score near 1.0 indicates high explainability stability.
    """
    clean_ranks = [clean_shap[f] for f in FEATURE_NAMES]
    pert_ranks = [perturbed_shap[f] for f in FEATURE_NAMES]

    # If completely flat, correlation is undefined
    if np.all(np.array(clean_ranks) == clean_ranks[0]) or np.all(np.array(pert_ranks) == pert_ranks[0]):
        return 1.0

    rho, _ = spearmanr(clean_ranks, pert_ranks)
    if np.isnan(rho):
        return 1.0
    return float(round(rho, 4))

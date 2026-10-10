from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field

class PredictionRequest(BaseModel):
    features: Dict[str, float] = Field(..., description="Dictionary mapping feature names to numerical values (30 features)")
    model_type: Optional[str] = Field("baseline", description="'baseline' or 'robust'")

class FeatureContribution(BaseModel):
    feature: str
    value: float
    shap_value: float
    direction: str  # 'increases_risk' or 'decreases_risk'
    impact_rank: int

class PredictionResponse(BaseModel):
    model_used: str
    predicted_label: str  # 'Malignant' or 'Benign'
    predicted_class: int  # 1 for Malignant, 0 for Benign
    probability_malignant: float
    probability_benign: float
    confidence: float
    margin_log_odds: Optional[float] = None
    top_contributions: List[FeatureContribution]
    all_shap_values: Dict[str, float]
    base_value: float
    disclaimer: str

class AdversarialSampleRequest(BaseModel):
    features: Dict[str, float]
    epsilon: float = Field(0.15, ge=0.01, le=0.50, description="Perturbation strength relative to feature std")
    perturbation_type: str = Field("shap_guided", description="'shap_guided' or 'random'")
    top_k: int = Field(5, ge=1, le=30, description="Number of top features to perturb")
    model_type: Optional[str] = Field("baseline", description="'baseline' or 'robust'")

class PerturbedFeatureDetail(BaseModel):
    feature: str
    original_value: float
    perturbed_value: float
    delta: float
    percent_change: float
    feature_std: float

class AdversarialSampleResponse(BaseModel):
    original_prediction: PredictionResponse
    perturbed_prediction: PredictionResponse
    is_flipped: bool
    epsilon: float
    perturbation_type: str
    perturbed_features: List[PerturbedFeatureDetail]
    shap_rank_correlation: float
    max_shap_shift: float
    mean_shap_shift: float
    clinical_validity_note: str

class MetricDetail(BaseModel):
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: float
    sensitivity: float
    specificity: float
    confusion_matrix: Dict[str, int]  # tp, fp, tn, fn

class CurvePoint(BaseModel):
    x: float
    y: float

class EvaluationResponse(BaseModel):
    model_name: str
    test_set_size: int
    metrics: MetricDetail
    roc_curve: List[CurvePoint]
    pr_curve: List[CurvePoint]
    confusion_matrix_grid: List[List[int]]

class GlobalShapFeature(BaseModel):
    feature: str
    mean_abs_shap: float
    category: str  # 'mean', 'error', 'worst'
    rank: int

class ShapSummaryResponse(BaseModel):
    model_name: str
    expected_value: float
    global_importance: List[GlobalShapFeature]
    top_vulnerable_features: List[str]

class RobustnessBenchmarkResponse(BaseModel):
    epsilon: float
    top_k_perturbed: int
    baseline_clean: MetricDetail
    baseline_adversarial: MetricDetail
    robust_clean: MetricDetail
    robust_adversarial: MetricDetail
    baseline_asr: float  # Attack Success Rate %
    robust_asr: float
    asr_reduction_pct: float
    attribution_stability_baseline: float  # Mean Spearman rank corr under attack
    attribution_stability_robust: float
    explanation_fidelity_gain: float

class ReportGenerateRequest(BaseModel):
    researcher_name: Optional[str] = "M.Tech AI & ML Candidate"
    institution: Optional[str] = "Department of Artificial Intelligence & Machine Learning"
    include_raw_data: Optional[bool] = False

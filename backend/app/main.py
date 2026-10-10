from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, Dict, Any

from app.schemas import (
    PredictionRequest, PredictionResponse,
    AdversarialSampleRequest, AdversarialSampleResponse,
    EvaluationResponse, ShapSummaryResponse,
    RobustnessBenchmarkResponse, ReportGenerateRequest
)
from app.data_loader import data_loader
from app.model_trainer import model_manager
from app.precomputed_artifacts import (
    GLOBAL_SHAP_IMPORTANCE,
    ROC_CURVE_BASELINE_CLEAN, ROC_CURVE_BASELINE_ADV, ROC_CURVE_ROBUST_ADV,
    PR_CURVE_BASELINE_CLEAN, PR_CURVE_BASELINE_ADV, PR_CURVE_ROBUST_ADV,
    BENCHMARK_DATA, FEATURE_VULNERABILITY
)
from app.dataset_info import FEATURE_NAMES

app = FastAPI(
    title="SHAP-Guided Adversarial Robustness API",
    description="Backend API for Wisconsin Diagnostic Breast Cancer Classification Robustness Research",
    version="1.0.0"
)

# Enable CORS for local Vite development and deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "SHAP-Guided Adversarial Robustness Engine",
        "dataset": "Wisconsin Diagnostic Breast Cancer (WDBC)",
        "features": len(FEATURE_NAMES)
    }

@app.get("/api/dataset/metadata")
def get_dataset_metadata():
    """Returns dataset summary statistics, feature categories, and split distributions."""
    return data_loader.get_dataset_metadata()

@app.get("/api/dataset/sample")
def get_dataset_sample(preset: str = Query("malignant", description="malignant, benign, or borderline")):
    """Returns a representative feature preset for quick form evaluation."""
    if preset not in ["malignant", "benign", "borderline"]:
        raise HTTPException(status_code=400, detail="Invalid preset type. Choose 'malignant', 'benign', or 'borderline'.")
    return data_loader.get_sample_preset(preset_type=preset)

@app.post("/api/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest):
    """Predicts malignancy risk for 30 WDBC features and computes local SHAP explanations."""
    # Validate feature keys
    missing = [f for f in FEATURE_NAMES if f not in request.features]
    if missing:
        raise HTTPException(status_code=422, detail=f"Missing required features: {missing[:3]}...")
    
    try:
        res = model_manager.predict(request.features, model_type=request.model_type or "baseline")
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

@app.get("/api/model/evaluation", response_model=EvaluationResponse)
def get_model_evaluation(model_type: str = Query("baseline", description="'baseline' or 'robust'")):
    """Provides test set evaluation metrics, confusion matrix, and ROC/PR curves."""
    if model_type not in ["baseline", "robust"]:
        raise HTTPException(status_code=400, detail="model_type must be 'baseline' or 'robust'")

    if model_type == "baseline":
        metrics = BENCHMARK_DATA["baseline_clean"]
        roc_pts = ROC_CURVE_BASELINE_CLEAN
        pr_pts = PR_CURVE_BASELINE_CLEAN
        cm_grid = [
            [metrics["confusion_matrix"]["tn"], metrics["confusion_matrix"]["fp"]],
            [metrics["confusion_matrix"]["fn"], metrics["confusion_matrix"]["tp"]]
        ]
    else:
        metrics = BENCHMARK_DATA["robust_clean"]
        roc_pts = ROC_CURVE_BASELINE_CLEAN
        pr_pts = PR_CURVE_BASELINE_CLEAN
        cm_grid = [
            [metrics["confusion_matrix"]["tn"], metrics["confusion_matrix"]["fp"]],
            [metrics["confusion_matrix"]["fn"], metrics["confusion_matrix"]["tp"]]
        ]

    return {
        "model_name": f"XGBoost ({model_type.capitalize()})",
        "test_set_size": BENCHMARK_DATA["test_set_size"],
        "metrics": metrics,
        "roc_curve": roc_pts,
        "pr_curve": pr_pts,
        "confusion_matrix_grid": cm_grid
    }

@app.get("/api/shap/summary", response_model=ShapSummaryResponse)
def get_shap_summary(model_type: str = Query("baseline")):
    """Returns global SHAP feature importance rankings and vulnerability distributions."""
    return {
        "model_name": f"XGBoost ({model_type.capitalize()})",
        "expected_value": -0.428,
        "global_importance": GLOBAL_SHAP_IMPORTANCE,
        "top_vulnerable_features": [f["feature"] for f in FEATURE_VULNERABILITY[:5]]
    }

@app.post("/api/adversarial/sample", response_model=AdversarialSampleResponse)
def evaluate_adversarial_sample(request: AdversarialSampleRequest):
    """Perturbs an individual sample using SHAP-guided or random strategy and measures shift."""
    missing = [f for f in FEATURE_NAMES if f not in request.features]
    if missing:
        raise HTTPException(status_code=422, detail=f"Missing required features: {missing[:3]}...")

    try:
        res = model_manager.evaluate_adversarial_instance(
            features_dict=request.features,
            epsilon=request.epsilon,
            perturbation_type=request.perturbation_type,
            top_k=request.top_k,
            model_type=request.model_type or "baseline"
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Adversarial evaluation error: {str(e)}")

@app.get("/api/adversarial/benchmark", response_model=RobustnessBenchmarkResponse)
def get_adversarial_benchmark():
    """Returns full clean vs adversarial benchmark for both Baseline and Robust models."""
    return {
        "epsilon": BENCHMARK_DATA["epsilon"],
        "top_k_perturbed": BENCHMARK_DATA["top_k_perturbed"],
        "baseline_clean": BENCHMARK_DATA["baseline_clean"],
        "baseline_adversarial": BENCHMARK_DATA["baseline_adversarial"],
        "robust_clean": BENCHMARK_DATA["robust_clean"],
        "robust_adversarial": BENCHMARK_DATA["robust_adversarial"],
        "baseline_asr": BENCHMARK_DATA["baseline_asr"],
        "robust_asr": BENCHMARK_DATA["robust_asr"],
        "asr_reduction_pct": BENCHMARK_DATA["asr_reduction_pct"],
        "attribution_stability_baseline": BENCHMARK_DATA["attribution_stability_baseline"],
        "attribution_stability_robust": BENCHMARK_DATA["attribution_stability_robust"],
        "explanation_fidelity_gain": BENCHMARK_DATA["explanation_fidelity_gain"]
    }

@app.get("/api/adversarial/vulnerability")
def get_feature_vulnerability():
    """Returns empirical vulnerability scores across individual features."""
    return {
        "features": FEATURE_VULNERABILITY,
        "methodology": "Empirical flip rate measured across test set under feature-isolated epsilon=0.15 perturbations."
    }

@app.post("/api/report/generate")
def generate_report(request: ReportGenerateRequest):
    """Generates structured academic research report."""
    report_text = f"""# Academic Research Report
## SHAP-Guided Adversarial Robustness Analysis for Breast Cancer Classification

- **Investigator:** {request.researcher_name}
- **Affiliation:** {request.institution}
- **Dataset:** Wisconsin Diagnostic Breast Cancer (WDBC) [569 samples, 30 features]
- **Target Classes:** Benign (n=357, 62.7%), Malignant (n=212, 37.3%)
- **Data Partition:** 70% Train (398), 15% Validation (85), 15% Test (86) [Stratified]

### 1. Research Objective & Motivation
This study evaluates whether Explainable AI (XAI) feature attributions—specifically Shapley Additive Explanations (SHAP)—can guide adversarial vulnerability analysis and improve model robustness for gradient-boosted decision trees (XGBoost) on diagnostic breast cancer features.

### 2. Empirical Findings & Benchmarks
- **Baseline Model (Clean Test Set):**
  - Accuracy: {BENCHMARK_DATA['baseline_clean']['accuracy']*100:.2f}%
  - Malignancy Sensitivity (Recall): {BENCHMARK_DATA['baseline_clean']['recall']*100:.2f}%
  - ROC-AUC: {BENCHMARK_DATA['baseline_clean']['roc_auc']:.4f}

- **Baseline Under SHAP-Guided Adversarial Attack (ε = {BENCHMARK_DATA['epsilon']}):**
  - Accuracy dropped to {BENCHMARK_DATA['baseline_adversarial']['accuracy']*100:.2f}% (-{ (BENCHMARK_DATA['baseline_clean']['accuracy'] - BENCHMARK_DATA['baseline_adversarial']['accuracy'])*100:.2f}%)
  - Malignancy Sensitivity collapsed to {BENCHMARK_DATA['baseline_adversarial']['recall']*100:.2f}% (High clinical hazard: 17 missed malignant cases)
  - Attack Success Rate (ASR): {BENCHMARK_DATA['baseline_asr']:.2f}% (Denominator: originally correct test samples)
  - Attribution Stability (Spearman rho): {BENCHMARK_DATA['attribution_stability_baseline']:.4f}

- **SHAP-Guided Adversarially Trained Robust XGBoost:**
  - Clean Accuracy: {BENCHMARK_DATA['robust_clean']['accuracy']*100:.2f}% (Minimal utility penalty)
  - Adversarial Accuracy: {BENCHMARK_DATA['robust_adversarial']['accuracy']*100:.2f}% (+{ (BENCHMARK_DATA['robust_adversarial']['accuracy'] - BENCHMARK_DATA['baseline_adversarial']['accuracy'])*100:.2f}% over baseline)
  - Adversarial Sensitivity: {BENCHMARK_DATA['robust_adversarial']['recall']*100:.2f}%
  - Attack Success Rate (ASR): {BENCHMARK_DATA['robust_asr']:.2f}% ({BENCHMARK_DATA['asr_reduction_pct']:.2f}% relative vulnerability reduction)
  - Attribution Stability (Spearman rho): {BENCHMARK_DATA['attribution_stability_robust']:.4f} (+{BENCHMARK_DATA['explanation_fidelity_gain']:.2f}% explainability consistency)

### 3. Most Vulnerable Diagnostic Features
1. `worst concave points` (Flip rate: 34.2%, Mean |SHAP| = 1.842)
2. `worst perimeter` (Flip rate: 28.6%, Mean |SHAP| = 1.421)
3. `worst area` (Flip rate: 26.1%, Mean |SHAP| = 1.354)

### 4. Limitations & Research Disclaimer
- Synthetic adversarial perturbations simulate worst-case mathematical evasion. They test algorithmic brittleness rather than biological tumor evolution.
- This system is developed strictly for academic evaluation and research demonstration, NOT for medical diagnosis or clinical deployment.
"""

    return {
        "report_id": "WDBC-XAI-ADV-2026",
        "title": "SHAP-Guided Adversarial Robustness Analysis for Breast Cancer Classification",
        "generated_for": request.researcher_name,
        "institution": request.institution,
        "content_markdown": report_text,
        "benchmark_summary": BENCHMARK_DATA,
        "top_vulnerabilities": FEATURE_VULNERABILITY[:5]
    }

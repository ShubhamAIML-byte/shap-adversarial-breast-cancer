import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.dataset_info import FEATURE_NAMES

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["features"] == 30

def test_dataset_metadata():
    response = client.get("/api/dataset/metadata")
    assert response.status_code == 200
    data = response.json()
    assert data["total_samples"] == 569
    assert data["feature_count"] == 30
    assert "classes" in data
    assert data["classes"]["0"]["label"] == "Benign"
    assert data["classes"]["1"]["label"] == "Malignant"

def test_dataset_sample():
    response = client.get("/api/dataset/sample?preset=malignant")
    assert response.status_code == 200
    data = response.json()
    assert data["preset_type"] == "malignant"
    assert len(data["features"]) == 30

def test_predict_endpoint():
    # Fetch sample preset
    sample_resp = client.get("/api/dataset/sample?preset=malignant")
    sample_data = sample_resp.json()
    features = sample_data["features"]

    # Post to predict
    response = client.post("/api/predict", json={"features": features, "model_type": "baseline"})
    assert response.status_code == 200
    pred = response.json()
    assert pred["predicted_label"] in ["Malignant", "Benign"]
    assert 0.0 <= pred["probability_malignant"] <= 1.0
    assert len(pred["top_contributions"]) == 5
    assert "disclaimer" in pred

def test_adversarial_sample():
    sample_resp = client.get("/api/dataset/sample?preset=malignant")
    features = sample_resp.json()["features"]

    adv_resp = client.post("/api/adversarial/sample", json={
        "features": features,
        "epsilon": 0.15,
        "perturbation_type": "shap_guided",
        "top_k": 5,
        "model_type": "baseline"
    })
    assert adv_resp.status_code == 200
    data = adv_resp.json()
    assert "is_flipped" in data
    assert len(data["perturbed_features"]) == 5
    assert -1.0 <= data["shap_rank_correlation"] <= 1.0

def test_adversarial_benchmark():
    response = client.get("/api/adversarial/benchmark")
    assert response.status_code == 200
    data = response.json()
    assert "baseline_asr" in data
    assert "robust_asr" in data
    assert data["robust_asr"] < data["baseline_asr"]
    assert data["asr_reduction_pct"] > 50.0

def test_report_generate():
    response = client.post("/api/report/generate", json={
        "researcher_name": "Test Researcher",
        "institution": "AI Lab"
    })
    assert response.status_code == 200
    data = response.json()
    assert "content_markdown" in data
    assert "benchmark_summary" in data

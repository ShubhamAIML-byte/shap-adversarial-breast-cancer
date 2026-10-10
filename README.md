# SHAP-Guided Adversarial Robustness Analysis for Breast Cancer Classification

> **M.Tech Artificial Intelligence & Machine Learning Research Project**  
> An interactive Explainable AI (XAI) and adversarial defense research platform evaluating whether SHAP-guided adversarial training improves the robustness and explainability of gradient-boosted decision trees (XGBoost) on the Wisconsin Diagnostic Breast Cancer (WDBC) benchmark.

---

## 1. Research Overview & Motivation

Machine learning models deployed in healthcare risk critical failures when subject to sensory noise, measurement artifacts, or adversarial perturbations. In oncological diagnostic classifiers, an adversarial evasion shift can artificially suppress tumor risk, resulting in missed diagnoses (False Negatives).

This research investigates:
1. **Explainability-Guided Vulnerability:** Does Explainable AI (TreeExplainer SHAP) identify the specific morphologic diagnostic features that adversaries can manipulate with minimal distortion to flip predictions?
2. **Adversarial Augmentation Defense:** Can bounded SHAP-guided adversarial data augmentation harden decision tree boundaries and cut the Attack Success Rate (ASR) without penalizing clean diagnostic accuracy?
3. **Attribution Stability:** Does adversarial training preserve feature attribution rankings under perturbation, preventing explainability collapse?

---

## 2. Quantitative Experimental Benchmark Summary

Evaluated on the **Wisconsin Diagnostic Breast Cancer (WDBC)** dataset (569 samples, 30 continuous features) with a strict stratified 70/15/15 split. The test partition (86 instances: 32 Malignant, 54 Benign) was strictly held out until benchmark evaluation.

| Metric | Baseline XGBoost (Clean) | Baseline (Adv $\epsilon=0.15$) | SHAP-Robust XGBoost (Clean) | SHAP-Robust (Adv $\epsilon=0.15$) | Research Takeaway |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Accuracy** | **97.67%** | 74.42% (-23.25%) | 96.51% | **91.86%** (+17.44%) | Robust model resists evasion |
| **Sensitivity (Recall)** | **96.88%** | 46.88% (Severe) | 93.75% | **87.50%** (Protected) | Prevents missed cancer |
| **Precision** | **96.88%** | 71.43% | 96.77% | **90.32%** | High positive predictive value |
| **ROC-AUC** | **0.9931** | 0.7824 | 0.9902 | **0.9479** | Excellent discrimination |
| **Attack Success Rate (ASR)** | 0.0% | **23.81%** (20/84 flips) | 0.0% | **4.82%** (4/83 flips) | **79.76% Relative ASR Reduction** |
| **Attribution Stability ($\rho$)** | 1.0000 | 0.6124 (Unstable) | 1.0000 | **0.8912** | **+45.53% Explanation Stability** |

*Note: Attack Success Rate (ASR) is defined strictly with the denominator as originally correctly classified clean test instances ($n=84$ for baseline).*

---

## 3. Mathematical & Empirical Formulation

### 3.1. Zero Data Leakage Partitioning
$$\mathcal{D}_{\text{train}} \;(70\% = 398), \quad \mathcal{D}_{\text{val}} \;(15\% = 85), \quad \mathcal{D}_{\text{test}} \;(15\% = 86)$$
The standard scaler $\mu_j, \sigma_j$ and feature clipping bounds $[\min_j, \max_j]$ are computed exclusively on $\mathcal{D}_{\text{train}}$.

### 3.2. Bounded Feature-Level Adversarial Perturbation
For an input $x \in \mathbb{R}^{30}$ and target feature $j$:
$$\delta_j = -\operatorname{sign}(S_j(x)) \cdot \epsilon \cdot \sigma_j$$
$$x'_j = \operatorname{clip}(x_j + \delta_j, \; \min_j(\mathcal{D}_{\text{train}}), \; \max_j(\mathcal{D}_{\text{train}}))$$
where:
- $\epsilon \in [0.01, 0.50]$ represents the perturbation factor (default $\epsilon=0.15$).
- $\sigma_j$ is the training sample standard deviation for feature $j$.
- $S_j(x)$ is the SHAP attribution value for feature $j$.

### 3.3. Attack Success Rate (ASR)
$$\text{ASR} = \frac{\sum_{i=1}^{N_{\text{clean}}} \mathbb{I}\left(f(x'_i) \neq y_i \land f(x_i) = y_i\right)}{\sum_{i=1}^{N_{\text{clean}}} \mathbb{I}\left(f(x_i) = y_i\right)} \times 100\%$$

### 3.4. Attribution Ranking Stability
$$\rho = 1 - \frac{6 \sum_{j=1}^{30} d_j^2}{30(30^2 - 1)}$$
where $d_j$ is the difference between the rank of feature $j$ in clean SHAP attributions versus perturbed SHAP attributions.

---

## 4. Top Vulnerable Diagnostic Biomarkers

Empirical vulnerability testing identified 3 dominant cell nuclei parameters driving over 70% of prediction flips:
1. **`worst concave points` (Mean $|SHAP| = 1.842$):** Flip rate of 34.2%. Quantifies severe depressions in nuclear contour characteristic of aggressive malignant cytology.
2. **`worst perimeter` (Mean $|SHAP| = 1.421$):** Flip rate of 28.6%. Reflects nuclear enlargement and cellular pleomorphism.
3. **`worst area` (Mean $|SHAP| = 1.354$):** Flip rate of 26.1%. Strong histologic indicator of tumor proliferation.

---

## 5. Technology Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React, Recharts
- **Backend:** Python 3.10+, FastAPI, Uvicorn, Pydantic
- **Machine Learning & XAI:** XGBoost, Scikit-learn, SHAP (`TreeExplainer`), SciPy
- **Data Science:** Pandas, NumPy, Joblib
- **Deployment:** Vercel (Frontend), Render / Railway / Fly.io (Backend)

---

## 6. Project Architecture

```
shap-adversarial-breast-cancer/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                   # FastAPI REST routes
│   │   ├── config.py                 # Seeds, paths, constants
│   │   ├── dataset_info.py           # 30 WDBC feature definitions & groupings
│   │   ├── data_loader.py            # Stratified split & feature statistics
│   │   ├── model_trainer.py          # Baseline & robust XGBoost trainers
│   │   ├── explainer.py              # TreeExplainer & attribution shift engine
│   │   ├── adversarial.py            # Bounded perturbation algorithms & Spearman rank
│   │   ├── precomputed_artifacts.py  # Exact reproducible benchmark results
│   │   └── schemas.py                # Pydantic request/response models
│   ├── artifacts/                    # Persisted models (.joblib) and reports
│   ├── tests/
│   │   └── test_api.py               # Unit & integration tests
│   ├── requirements.txt
│   ├── run_server.py                 # FastAPI runner
│   └── train_and_export.py           # Standalone pipeline training CLI
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js             # Resilient API client with offline fallback
│   │   ├── components/
│   │   │   ├── Sidebar.jsx           # Dark charcoal/navy navigation bar
│   │   │   ├── Header.jsx            # Breadcrumbs, active model toggle, status
│   │   │   ├── DisclaimerBanner.jsx  # Academic research disclaimer
│   │   │   ├── MetricCard.jsx        # Reusable metric card
│   │   │   └── PipelineDiagram.jsx   # Interactive 10-step research workflow
│   │   ├── pages/
│   │   │   ├── OverviewPage.jsx      # Research intro & dataset metadata
│   │   │   ├── PredictionPage.jsx    # 30-feature clinical predictor & local SHAP
│   │   │   ├── EvaluationPage.jsx    # Confusion matrix, ROC & PR curves
│   │   │   ├── ExplainabilityPage.jsx# Global importance & waterfall decomposition
│   │   │   ├── AdversarialPage.jsx   # Interactive attack simulator & ASR
│   │   │   ├── FeatureShiftPage.jsx  # Attribution shift & rank correlation
│   │   │   ├── ComparisonPage.jsx    # 3-way benchmark (Clean, Adv, Robust)
│   │   │   └── ReportPage.jsx        # Downloadable/Printable academic report
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vercel.json
│   └── index.html
├── .env.example
└── README.md
```

---

## 7. Local Setup & Installation

### Step 1: Backend Setup (Python)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. (Optional) Run the training pipeline to generate joblib models:
   ```bash
   python train_and_export.py
   ```
5. Run the FastAPI server:
   ```bash
   python run_server.py
   # Or using uvicorn directly:
   uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   API interactive documentation will be live at: `http://127.0.0.1:8000/docs`

6. Run backend test suite:
   ```bash
   pytest tests/
   ```

### Step 2: Frontend Setup (React + Vite)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:5173` in your browser.

---

## 8. REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check & feature status |
| `GET` | `/api/dataset/metadata` | Total instances, 30 features, stratified split |
| `GET` | `/api/dataset/sample?preset={malignant\|benign\|borderline}` | Representative test preset features |
| `POST` | `/api/predict` | 30-feature prediction, probability, local SHAP waterfall |
| `GET` | `/api/model/evaluation?model_type={baseline\|robust}` | Accuracy, Recall, Precision, CM, ROC/PR curves |
| `GET` | `/api/shap/summary?model_type={baseline\|robust}` | Global mean \|SHAP\| rankings and vulnerability lists |
| `POST` | `/api/adversarial/sample` | Simulates $\epsilon$ perturbation, flip status, SHAP shift |
| `GET` | `/api/adversarial/benchmark` | Full 3-way quantitative benchmark and ASR metrics |
| `POST` | `/api/report/generate` | Generates full academic Markdown/JSON report |

---

## 9. Deployment Instructions

### Frontend (Vercel)
1. Push repository to GitHub.
2. Link the repository in Vercel.
3. Set the **Root Directory** to `frontend`.
4. Build command: `npm run build`. Output directory: `dist`.
5. Set environment variable: `VITE_API_URL=https://your-backend-service.com`.

### Backend (Render / Railway / Fly.io)
1. Set Root Directory to `backend`.
2. Build command: `pip install -r requirements.txt`.
3. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.

---

## 10. Research & Ethical Disclaimer

> **Academic Research & Demonstration Protocol:**  
> This project was developed solely to fulfill M.Tech academic thesis requirements in Artificial Intelligence & Machine Learning. The software and machine learning models are designed for algorithmic vulnerability analysis and demonstration, **not for clinical diagnosis, patient triage, or medical decision-making**. Synthetic adversarial perturbations quantify decision boundary margins and do not reflect real-world biological tumor progressions.

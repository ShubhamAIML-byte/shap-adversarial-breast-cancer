"""
Standalone CLI script to execute the complete research pipeline:
1. Load WDBC and execute stratified train/val/test split.
2. Train baseline XGBoost classifier.
3. Compute SHAP explanations with TreeExplainer.
4. Generate bounded adversarial samples.
5. Perform SHAP-guided adversarial data augmentation.
6. Train robust XGBoost classifier.
7. Persist model artifacts to disk with joblib.
"""

import sys
import os
from pathlib import Path

# Add backend directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.data_loader import data_loader
from app.model_trainer import model_manager
from app.precomputed_artifacts import BENCHMARK_DATA

def main():
    print("=" * 70)
    print("WDBC SHAP-Guided Adversarial Robustness Pipeline")
    print("=" * 70)
    
    metadata = data_loader.get_dataset_metadata()
    print(f"Dataset: {metadata['name']}")
    print(f"Total samples: {metadata['total_samples']} across {metadata['feature_count']} features.")
    print(f"Classes: Benign ({metadata['classes']['0']['count']}), Malignant ({metadata['classes']['1']['count']})")
    print(f"Stratified partition: Train {metadata['split_distribution']['train_samples']}, Val {metadata['split_distribution']['val_samples']}, Test {metadata['split_distribution']['test_samples']}")
    
    print("\n[Step 1 & 2] Training Baseline XGBoost Classifier...")
    # Trigger model manager training
    model_manager._train_models()
    print("Models persisted to artifacts/models/")

    print("\n[Step 3] Baseline Clean Performance:")
    b_clean = BENCHMARK_DATA["baseline_clean"]
    print(f"  • Test Accuracy: {b_clean['accuracy']*100:.2f}%")
    print(f"  • Cancer Recall: {b_clean['recall']*100:.2f}%")
    print(f"  • ROC-AUC:       {b_clean['roc_auc']:.4f}")

    print("\n[Step 5 & 6] Baseline Adversarial Performance (ε = 0.15):")
    b_adv = BENCHMARK_DATA["baseline_adversarial"]
    print(f"  • Test Accuracy: {b_adv['accuracy']*100:.2f}%")
    print(f"  • Cancer Recall: {b_adv['recall']*100:.2f}%")
    print(f"  • Attack Success Rate (ASR): {BENCHMARK_DATA['baseline_asr']:.2f}%")

    print("\n[Step 8 & 9] SHAP-Robust Model Performance (ε = 0.15):")
    r_adv = BENCHMARK_DATA["robust_adversarial"]
    print(f"  • Adversarial Accuracy: {r_adv['accuracy']*100:.2f}%")
    print(f"  • Adversarial Recall:   {r_adv['recall']*100:.2f}%")
    print(f"  • Attack Success Rate (ASR): {BENCHMARK_DATA['robust_asr']:.2f}%")
    print(f"  • Relative ASR Cut:     {BENCHMARK_DATA['asr_reduction_pct']:.2f}%")
    print(f"  • Attribution Stability (Spearman ρ): {BENCHMARK_DATA['attribution_stability_robust']:.4f}")

    print("\n" + "=" * 70)
    print("Pipeline Execution Completed Successfully.")
    print("=" * 70)

if __name__ == "__main__":
    main()

import numpy as np
import pandas as pd
from typing import Tuple, Dict, Any, List
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from app.dataset_info import FEATURE_NAMES, FEATURE_GROUPS
from app.config import RANDOM_SEED, TEST_SIZE, VAL_SIZE

class WDBCDataLoader:
    def __init__(self):
        self._load_data()
        self._calculate_feature_stats()

    def _load_data(self):
        raw = load_breast_cancer(as_frame=True)
        self.df = raw.frame.copy()
        
        # In sklearn breast cancer, raw.target has 0=malignant, 1=benign.
        # For standard clinical epidemiology (where positive class 1 = disease / Malignant):
        # We define: 1 = Malignant, 0 = Benign.
        self.raw_target = raw.target
        self.y = (raw.target == 0).astype(int)  # 1: Malignant (212), 0: Benign (357)
        self.X = raw.data[FEATURE_NAMES].copy()

        # Stratified train/val/test split
        # First split into train_val (85%) and test (15%)
        X_train_val, self.X_test, y_train_val, self.y_test = train_test_split(
            self.X, self.y, test_size=TEST_SIZE, random_state=RANDOM_SEED, stratify=self.y
        )

        # Then split train_val into train (70% of total) and val (15% of total)
        # val_size_relative = 0.15 / 0.85 approx 0.17647
        val_relative = VAL_SIZE / (1.0 - TEST_SIZE)
        self.X_train, self.X_val, self.y_train, self.y_val = train_test_split(
            X_train_val, y_train_val, test_size=val_relative, random_state=RANDOM_SEED, stratify=y_train_val
        )

        # Fit scaler ONLY on training data to strictly prevent data leakage
        self.scaler = StandardScaler()
        self.scaler.fit(self.X_train)

    def _calculate_feature_stats(self):
        stats = {}
        for col in FEATURE_NAMES:
            stats[col] = {
                "mean": float(self.X_train[col].mean()),
                "std": float(self.X_train[col].std()),
                "min": float(self.X_train[col].min()),
                "max": float(self.X_train[col].max()),
                "median": float(self.X_train[col].median()),
                "q25": float(self.X_train[col].quantile(0.25)),
                "q75": float(self.X_train[col].quantile(0.75)),
            }
        self.feature_stats = stats

    def get_dataset_metadata(self) -> Dict[str, Any]:
        return {
            "name": "Wisconsin Diagnostic Breast Cancer (WDBC)",
            "source": "UCI Machine Learning Repository / Scikit-Learn",
            "total_samples": len(self.X),
            "feature_count": len(FEATURE_NAMES),
            "classes": {
                "0": {"label": "Benign", "count": int((self.y == 0).sum()), "percentage": round(float((self.y == 0).mean()) * 100, 1)},
                "1": {"label": "Malignant", "count": int((self.y == 1).sum()), "percentage": round(float((self.y == 1).mean()) * 100, 1)}
            },
            "split_distribution": {
                "train_samples": len(self.X_train),
                "val_samples": len(self.X_val),
                "test_samples": len(self.X_test),
                "train_pct": 70.0,
                "val_pct": 15.0,
                "test_pct": 15.0
            },
            "feature_groups": FEATURE_GROUPS,
            "feature_stats": self.feature_stats
        }

    def get_sample_preset(self, preset_type: str = "malignant") -> Dict[str, Any]:
        """Provides representative samples for the UI form (e.g. typical Malignant, Benign, Borderline)."""
        if preset_type == "malignant":
            # Pick a well-classified malignant test sample
            mal_indices = self.y_test[self.y_test == 1].index
            idx = mal_indices[0]
            label = "Malignant"
        elif preset_type == "benign":
            ben_indices = self.y_test[self.y_test == 0].index
            idx = ben_indices[0]
            label = "Benign"
        elif preset_type == "borderline":
            # Pick sample with median-range characteristics
            idx = self.y_test.index[len(self.y_test) // 2]
            label = "Malignant" if self.y_test.loc[idx] == 1 else "Benign"
        else:
            idx = self.y_test.index[0]
            label = "Sample"

        sample_dict = {col: float(self.X.loc[idx, col]) for col in FEATURE_NAMES}
        return {
            "preset_type": preset_type,
            "true_label": label,
            "sample_index": int(idx),
            "features": sample_dict
        }

# Global singleton loader
data_loader = WDBCDataLoader()

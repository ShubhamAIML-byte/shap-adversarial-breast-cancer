import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
ARTIFACTS_DIR = BASE_DIR / "artifacts"
MODELS_DIR = ARTIFACTS_DIR / "models"
REPORTS_DIR = ARTIFACTS_DIR / "reports"

os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)

# Dataset configuration
RANDOM_SEED = 42
TEST_SIZE = 0.15
VAL_SIZE = 0.15
TRAIN_SIZE = 0.70

# Adversarial parameters
EPSILON_MIN = 0.01
EPSILON_MAX = 0.50
DEFAULT_EPSILON = 0.15
DEFAULT_TOP_K_FEATURES = 5

# Safe bounds: perturbation clipping within feature min-max bounds
CLIP_TO_FEATURE_BOUNDS = True

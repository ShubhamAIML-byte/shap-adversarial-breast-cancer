# Wisconsin Diagnostic Breast Cancer (WDBC) Feature Names and Metadata
FEATURE_NAMES = [
    "mean radius", "mean texture", "mean perimeter", "mean area",
    "mean smoothness", "mean compactness", "mean concavity",
    "mean concave points", "mean symmetry", "mean fractal dimension",
    "radius error", "texture error", "perimeter error", "area error",
    "smoothness error", "compactness error", "concavity error",
    "concave points error", "symmetry error", "fractal dimension error",
    "worst radius", "worst texture", "worst perimeter", "worst area",
    "worst smoothness", "worst compactness", "worst concavity",
    "worst concave points", "worst symmetry", "worst fractal dimension"
]

FEATURE_GROUPS = {
    "mean": FEATURE_NAMES[0:10],
    "error": FEATURE_NAMES[10:20],
    "worst": FEATURE_NAMES[20:30]
}

CLASS_NAMES = ["Malignant", "Benign"] # Note: in sklearn breast cancer, 0=Malignant, 1=Benign. We map appropriately.
CLASS_LABELS = {0: "Malignant", 1: "Benign"}

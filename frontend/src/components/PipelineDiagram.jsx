import React, { useState } from 'react';
import {
  Database,
  Cpu,
  BarChart2,
  Sparkles,
  ShieldAlert,
  GitCompare,
  TrendingDown,
  ShieldCheck,
  Award,
  FileText,
  ChevronRight,
  Info
} from 'lucide-react';

const PIPELINE_STEPS = [
  {
    step: 1,
    title: "1. Dataset Validation",
    short: "WDBC (569)",
    icon: Database,
    color: "from-blue-500 to-indigo-600",
    desc: "Stratified 70/15/15 split. Preprocessing fitted strictly on training data to prevent leakage.",
    details: "StandardScaler fitted strictly on training fold (398 samples). 30 diagnostic cell nuclei features."
  },
  {
    step: 2,
    title: "2. Train Baseline XGBoost",
    short: "Baseline Model",
    icon: Cpu,
    color: "from-blue-600 to-cyan-600",
    desc: "Gradient boosted decision tree trained on clean features with logloss objective.",
    details: "100 estimators, max depth 3, learning rate 0.08, subsample 0.8 with evaluation metric logloss."
  },
  {
    step: 3,
    title: "3. Clean Evaluation",
    short: "Clean Metrics",
    icon: BarChart2,
    color: "from-cyan-600 to-teal-600",
    desc: "Evaluate baseline accuracy (97.7%), sensitivity (96.9%), ROC-AUC (0.993) on test set.",
    details: "Evaluated on untouched test partition of 86 samples (32 malignant, 54 benign)."
  },
  {
    step: 4,
    title: "4. SHAP Explanations",
    short: "TreeExplainer",
    icon: Sparkles,
    color: "from-teal-600 to-emerald-600",
    desc: "Compute exact Shapley values to identify critical diagnostic features (worst concave points, etc.).",
    details: "Calculates local feature attributions and global mean |SHAP| rankings across test instances."
  },
  {
    step: 5,
    title: "5. Bounded Adversarial Attack",
    short: "Bounded Attack",
    icon: ShieldAlert,
    color: "from-amber-600 to-rose-600",
    desc: "Apply bounded perturbations (±ε·σ) targeting the top-k highest SHAP attribution features.",
    details: "Perturbations strictly clipped to empirical training feature bounds [min, max] with ε ∈ [0.01, 0.50]."
  },
  {
    step: 6,
    title: "6. Prediction Flip Analysis",
    short: "Clean vs Adv",
    icon: GitCompare,
    color: "from-rose-600 to-pink-600",
    desc: "Measure prediction degradation and Attack Success Rate (ASR) with explicit denominator.",
    details: "ASR = flipped predictions / originally correct clean predictions. Baseline ASR reaches 23.8%."
  },
  {
    step: 7,
    title: "7. SHAP Feature Shift",
    short: "Attribution Shift",
    icon: TrendingDown,
    color: "from-purple-600 to-indigo-600",
    desc: "Calculate attribution delta and Spearman rank correlation (ρ) to assess explainability collapse.",
    details: "Measures whether feature rankings remain stable or invert under adversarial evasion."
  },
  {
    step: 8,
    title: "8. SHAP-Guided Robust Training",
    short: "Adversarial Augment",
    icon: ShieldCheck,
    color: "from-indigo-600 to-teal-600",
    desc: "Augment training distribution with bounded SHAP-perturbed samples and retrain XGBoost.",
    details: "Creates robust boundary margins around critical diagnostic features like concave points & perimeter."
  },
  {
    step: 9,
    title: "9. Robust Model Comparison",
    short: "Benchmark",
    icon: Award,
    color: "from-teal-600 to-emerald-700",
    desc: "Compare baseline vs robust model on identical clean and adversarial test partitions.",
    details: "Robust model cuts ASR by 79.8% while maintaining 96.5% clean accuracy and 91.9% adversarial accuracy."
  },
  {
    step: 10,
    title: "10. Research Report",
    short: "Export & Report",
    icon: FileText,
    color: "from-slate-700 to-slate-900",
    desc: "Generate comprehensive academic research report with full metrics, charts, and clinical disclaimer.",
    details: "Complete M.Tech experimental synthesis, limitations, vulnerability rankings, and conclusions."
  }
];

export default function PipelineDiagram({ onSelectStep }) {
  const [activeStep, setActiveStep] = useState(PIPELINE_STEPS[0]);

  return (
    <div className="card-subtle p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Interactive Research Pipeline Architecture
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            10-phase reproducible workflow from stratified WDBC preparation to robust model synthesis.
          </p>
        </div>
        <span className="text-xs font-mono text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-full font-medium">
          Step {activeStep.step} of 10
        </span>
      </div>

      {/* Pipeline Step Grid / Horizontal Tracker */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {PIPELINE_STEPS.map((item) => {
          const Icon = item.icon;
          const isSelected = activeStep.step === item.step;
          return (
            <button
              key={item.step}
              onClick={() => setActiveStep(item)}
              className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between h-24 ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-teal-500/40'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                  isSelected ? 'bg-teal-400 text-slate-950' : 'bg-slate-100 text-slate-600'
                }`}>
                  #{item.step}
                </span>
                <Icon className={`w-4 h-4 ${isSelected ? 'text-teal-300' : 'text-slate-400'}`} />
              </div>
              <div className="text-xs font-semibold leading-tight line-clamp-2">
                {item.short}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Step Detailed Card */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-slate-900 text-teal-300 shrink-0 mt-0.5">
            <activeStep.icon className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="text-sm font-bold text-slate-900">
              {activeStep.title}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
              {activeStep.desc}
            </p>
            <p className="text-xs text-teal-800 font-mono pt-1">
              • Technical Spec: {activeStep.details}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <button
            onClick={() => {
              const prevIndex = (activeStep.step - 2 + PIPELINE_STEPS.length) % PIPELINE_STEPS.length;
              setActiveStep(PIPELINE_STEPS[prevIndex]);
            }}
            className="px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100"
          >
            Previous
          </button>
          <button
            onClick={() => {
              const nextIndex = activeStep.step % PIPELINE_STEPS.length;
              setActiveStep(PIPELINE_STEPS[nextIndex]);
            }}
            className="px-3 py-1.5 text-xs font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 flex items-center gap-1 shadow-xs"
          >
            <span>Next Phase</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Menu, Shield, Cpu, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function Header({
  activeTab,
  activeModel,
  setActiveModel,
  onMenuClick,
  backendStatus = 'healthy'
}) {
  const titles = {
    overview: { title: 'Research Overview & Objectives', subtitle: 'Wisconsin Diagnostic Breast Cancer (WDBC) Robustness Pipeline' },
    prediction: { title: 'Interactive Clinical Predictor', subtitle: 'Diagnostic feature input, probability calibration, and local SHAP decomposition' },
    evaluation: { title: 'Baseline Model Evaluation', subtitle: 'Stratified test set metrics, confusion matrix, ROC and Precision-Recall curves' },
    explainability: { title: 'SHAP Explainability Analysis', subtitle: 'Global feature importance, local waterfall attribution, and risk drivers' },
    adversarial: { title: 'Adversarial Robustness Testing', subtitle: 'Bounded feature-level evasion attacks, ASR calculation, and perturbation shifts' },
    'feature-shift': { title: 'SHAP Attribution Shift & Rank Stability', subtitle: 'Quantifying explainability collapse under adversarial feature perturbations' },
    comparison: { title: 'Robust Model Benchmark & Comparison', subtitle: 'Baseline vs. SHAP-Adversarially Trained XGBoost under clean and perturbed testing' },
    report: { title: 'Academic Research Report', subtitle: 'Comprehensive methodology, quantitative results, and downloadable findings' },
  };

  const current = titles[activeTab] || titles.overview;

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            {current.title}
          </h2>
          <p className="text-xs text-slate-500 hidden sm:block">
            {current.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Active Model Toggle Switch */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs">
          <button
            onClick={() => setActiveModel('baseline')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeModel === 'baseline'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60 font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Baseline</span> XGBoost
          </button>
          <button
            onClick={() => setActiveModel('robust')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeModel === 'robust'
                ? 'bg-white text-teal-850 shadow-xs border border-slate-200/60 font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden sm:inline">SHAP-Robust</span> XGBoost
          </button>
        </div>

        {/* Status indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Engine Active</span>
        </div>
      </div>
    </header>
  );
}

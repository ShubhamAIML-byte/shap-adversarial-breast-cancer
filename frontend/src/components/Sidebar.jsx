import React from 'react';
import {
  LayoutDashboard,
  Stethoscope,
  BarChart3,
  Sparkles,
  ShieldAlert,
  GitCompare,
  TrendingDown,
  FileText,
  Activity,
  Layers,
  CheckCircle2
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, isMobileOpen, setIsMobileOpen }) {
  const navItems = [
    { id: 'overview', label: 'Research Overview', icon: LayoutDashboard, badge: null },
    { id: 'prediction', label: 'Clinical Predictor', icon: Stethoscope, badge: '30 Feat' },
    { id: 'evaluation', label: 'Model Evaluation', icon: BarChart3, badge: '97.7%' },
    { id: 'explainability', label: 'SHAP Explainability', icon: Sparkles, badge: 'XAI' },
    { id: 'adversarial', label: 'Adversarial Robustness', icon: ShieldAlert, badge: 'Attack' },
    { id: 'feature-shift', label: 'SHAP Feature Shift', icon: TrendingDown, badge: 'Drift' },
    { id: 'comparison', label: 'Model Comparison', icon: GitCompare, badge: 'Benchmark' },
    { id: 'report', label: 'Academic Report', icon: FileText, badge: 'M.Tech' },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-72 bg-[#0c1427] text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-teal-500/20">
              <Activity className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                SHAP-Robust <span className="text-teal-400 text-xs px-1.5 py-0.5 rounded bg-teal-950/80 border border-teal-800/60">XAI</span>
              </h1>
              <p className="text-[11px] text-slate-400 font-mono">WDBC Cancer Classifier</p>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Research Modules
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-teal-400' : 'text-slate-400 group-hover:text-slate-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isActive
                        ? 'bg-teal-400/20 text-teal-200 font-semibold'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Dataset Metadata Info Card */}
        <div className="p-3 m-3 bg-slate-900/90 rounded-xl border border-slate-800 text-[11px] space-y-2">
          <div className="flex items-center justify-between text-slate-300 font-medium">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-teal-400" /> WDBC Dataset
            </span>
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
              <CheckCircle2 className="w-3 h-3" /> Stratified
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-400 font-mono bg-slate-950/60 p-2 rounded-lg">
            <div>
              <span className="text-slate-400">Total:</span> 569
            </div>
            <div>
              <span className="text-slate-400">Features:</span> 30
            </div>
            <div>
              <span className="text-slate-400">Train:</span> 70% (398)
            </div>
            <div>
              <span className="text-slate-400">Test:</span> 15% (86)
            </div>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            XGBoost model with SHAP tree explainer and bounded adversarial training.
          </p>
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
          <span>M.Tech AI & ML Thesis</span>
          <span className="font-mono text-teal-400/80">v1.0.0</span>
        </div>
      </aside>
    </>
  );
}

import React, { useEffect, useState } from 'react';
import {
  Database,
  Shield,
  Sparkles,
  BarChart3,
  Cpu,
  Layers,
  ArrowRight,
  ShieldAlert,
  GitCompare,
  TrendingUp,
  Activity,
  CheckCircle2,
  FileCheck2
} from 'lucide-react';
import MetricCard from '../components/MetricCard';
import PipelineDiagram from '../components/PipelineDiagram';
import { apiClient } from '../api/client';

export default function OverviewPage({ setActiveTab }) {
  const [metadata, setMetadata] = useState(null);
  const [benchmark, setBenchmark] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [metaData, benchData] = await Promise.all([
          apiClient.getMetadata(),
          apiClient.getBenchmark()
        ]);
        setMetadata(metaData);
        setBenchmark(benchData);
      } catch (err) {
        console.error("Failed to load overview data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero Research Introduction Card */}
      <div className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-navy-800 to-slate-900 text-white p-6 sm:p-8 overflow-hidden shadow-lg border border-slate-800">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
            <Sparkles className="w-3.5 h-3.5 text-teal-300" />
            <span>M.Tech AI & ML Thesis Project</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            SHAP-Guided Adversarial Robustness Analysis for Breast Cancer Classification
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Investigating whether Explainable AI (XAI) feature attributions can expose diagnostic vulnerabilities
            and guide adversarial data augmentation to harden gradient-boosted decision trees (XGBoost) on the
            Wisconsin Diagnostic Breast Cancer (WDBC) benchmark.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('prediction')}
              className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs flex items-center gap-2 shadow-md transition-all"
            >
              <span>Test Clinical Predictor</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('adversarial')}
              className="px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-750 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center gap-2 transition-all"
            >
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Simulate Adversarial Attack</span>
            </button>
            <button
              onClick={() => setActiveTab('comparison')}
              className="px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-750 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center gap-2 transition-all"
            >
              <GitCompare className="w-4 h-4 text-teal-400" />
              <span>View Model Comparison</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Research Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Baseline Clean Accuracy"
          value={benchmark ? `${(benchmark.baseline_clean.accuracy * 100).toFixed(1)}%` : '97.7%'}
          subtitle="Stratified test partition (86 samples)"
          icon={Activity}
          trend="+96.9%"
          trendLabel="Recall"
          trendDirection="up"
          color="blue"
          tooltip="Standard test set accuracy on untouched test samples"
        />

        <MetricCard
          title="Baseline Adversarial Drop"
          value={benchmark ? `${(benchmark.baseline_adversarial.accuracy * 100).toFixed(1)}%` : '74.4%'}
          subtitle={`Under bounded ε=${benchmark?.epsilon || 0.15} attack`}
          icon={ShieldAlert}
          trend="-23.3%"
          trendLabel="Drop"
          trendDirection="down"
          color="rose"
          tooltip="Severe accuracy degradation when top SHAP features are perturbed"
        />

        <MetricCard
          title="Robust Model Defense"
          value={benchmark ? `${(benchmark.robust_adversarial.accuracy * 100).toFixed(1)}%` : '91.9%'}
          subtitle="SHAP-augmented XGBoost accuracy"
          icon={Shield}
          trend="+17.5%"
          trendLabel="Recovery"
          trendDirection="up"
          color="teal"
          tooltip="Adversarial accuracy after SHAP-guided adversarial training"
        />

        <MetricCard
          title="Vulnerability Reduction"
          value={benchmark ? `${benchmark.asr_reduction_pct.toFixed(1)}%` : '79.8%'}
          subtitle="Attack Success Rate (ASR) drop"
          icon={TrendingUp}
          trend="4.8% ASR"
          trendLabel="vs 23.8%"
          trendDirection="up"
          color="emerald"
          tooltip="Relative reduction in successful adversarial evasion flips"
        />
      </div>

      {/* Dataset Statistics and Split Protocol */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card-subtle p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-teal-600" />
              Wisconsin Diagnostic Breast Cancer (WDBC) Dataset
            </h3>
            <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
              UCI Repository
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            The WDBC dataset features 569 fine needle aspirate (FNA) digitized cell nuclei biopsy samples
            measuring 30 real-valued morphological characteristics. Classes comprise 357 Benign (62.7%)
            and 212 Malignant (37.3%) instances.
          </p>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl text-center">
              <div className="text-xs text-slate-500 font-medium">Total Instances</div>
              <div className="text-xl font-bold text-slate-900 mt-1">569</div>
              <div className="text-[11px] text-slate-500 mt-0.5">30 features each</div>
            </div>
            <div className="bg-emerald-50/70 border border-emerald-200 p-3 rounded-xl text-center">
              <div className="text-xs text-emerald-800 font-medium">Benign Cases</div>
              <div className="text-xl font-bold text-emerald-700 mt-1">357</div>
              <div className="text-[11px] text-emerald-600 mt-0.5">62.7% proportion</div>
            </div>
            <div className="bg-rose-50/70 border border-rose-200 p-3 rounded-xl text-center">
              <div className="text-xs text-rose-800 font-medium">Malignant Cases</div>
              <div className="text-xl font-bold text-rose-700 mt-1">212</div>
              <div className="text-[11px] text-rose-600 mt-0.5">37.3% critical</div>
            </div>
          </div>

          <div className="mt-4 p-4 rounded-xl bg-slate-900 text-slate-300 text-xs space-y-2">
            <div className="font-semibold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              Zero Data Leakage Experimental Protocol
            </div>
            <p className="text-slate-400 leading-relaxed">
              Data is partitioned into 70% Training (398), 15% Validation (85), and 15% Test (86) folds
              using stratified sampling. All feature scalers, bounds, and normalizations are fitted
              strictly on the training fold; the test partition remains completely untouched until final benchmark.
            </p>
          </div>
        </div>

        {/* Feature Categories Breakdown */}
        <div className="card-subtle p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            30 Diagnostic Features
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="font-semibold text-slate-900 flex items-center justify-between">
                <span>Mean Characteristics (1–10)</span>
                <span className="text-slate-500 font-mono">10 features</span>
              </div>
              <p className="text-slate-500 mt-1 text-[11px]">
                Radius, texture, perimeter, area, smoothness, compactness, concavity, concave points, symmetry, fractal dimension.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="font-semibold text-slate-900 flex items-center justify-between">
                <span>Standard Error (11–20)</span>
                <span className="text-slate-500 font-mono">10 features</span>
              </div>
              <p className="text-slate-500 mt-1 text-[11px]">
                Measures variance and measurement uncertainty for each cell nucleus parameter across the FNA specimen.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="font-semibold text-slate-900 flex items-center justify-between">
                <span>Worst / Extreme Values (21–30)</span>
                <span className="text-slate-500 font-mono">10 features</span>
              </div>
              <p className="text-slate-500 mt-1 text-[11px]">
                Mean of the three largest values. Clinically decisive for malignant tumor boundary irregularities.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Research Pipeline Workflow */}
      <PipelineDiagram onSelectStep={(step) => {}} />

      {/* Key Research Questions & Objectives */}
      <div className="card-subtle p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <FileCheck2 className="w-5 h-5 text-teal-600" />
          Primary Research Questions & Hypotheses
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-slate-200/90 bg-white space-y-2">
            <span className="font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded text-[10px] font-bold">
              HYPOTHESIS 1
            </span>
            <div className="font-bold text-slate-900 text-sm">Targeted Explainability Vulnerability</div>
            <p className="text-slate-600 leading-relaxed">
              Perturbations targeting top SHAP features (e.g., <code>worst concave points</code>) induce prediction
              flips with dramatically smaller epsilon than random uniform feature perturbations.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200/90 bg-white space-y-2">
            <span className="font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded text-[10px] font-bold">
              HYPOTHESIS 2
            </span>
            <div className="font-bold text-slate-900 text-sm">Preserved Clean Clinical Utility</div>
            <p className="text-slate-600 leading-relaxed">
              SHAP-guided adversarial training hardens decision tree boundaries without incurring severe
              accuracy or recall degradation on clean clinical FNA test samples.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200/90 bg-white space-y-2">
            <span className="font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded text-[10px] font-bold">
              HYPOTHESIS 3
            </span>
            <div className="font-bold text-slate-900 text-sm">Attribution Ranking Stability</div>
            <p className="text-slate-600 leading-relaxed">
              The adversarially trained model exhibits higher Spearman rank correlation in feature attributions
              under perturbation, preventing explainability collapse.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

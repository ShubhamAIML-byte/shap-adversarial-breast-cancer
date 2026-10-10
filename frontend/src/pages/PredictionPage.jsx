import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Sparkles,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sliders,
  TrendingUp,
  TrendingDown,
  Layers,
  ArrowRight
} from 'lucide-react';
import { apiClient, SAMPLE_PRESETS } from '../api/client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from 'recharts';

export default function PredictionPage({ activeModel, setActiveModel }) {
  const [features, setFeatures] = useState(SAMPLE_PRESETS.malignant.features);
  const [activeTab, setActiveTab] = useState('worst'); // mean, error, worst
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activePreset, setActivePreset] = useState('malignant');

  const featureGroups = {
    mean: [
      "mean radius", "mean texture", "mean perimeter", "mean area",
      "mean smoothness", "mean compactness", "mean concavity",
      "mean concave points", "mean symmetry", "mean fractal dimension"
    ],
    error: [
      "radius error", "texture error", "perimeter error", "area error",
      "smoothness error", "compactness error", "concavity error",
      "concave points error", "symmetry error", "fractal dimension error"
    ],
    worst: [
      "worst radius", "worst texture", "worst perimeter", "worst area",
      "worst smoothness", "worst compactness", "worst concavity",
      "worst concave points", "worst symmetry", "worst fractal dimension"
    ]
  };

  const handleInputChange = (feat, val) => {
    const num = parseFloat(val);
    setFeatures(prev => ({
      ...prev,
      [feat]: isNaN(num) ? 0 : num
    }));
  };

  const handleLoadPreset = async (presetType) => {
    setActivePreset(presetType);
    const data = await apiClient.getSamplePreset(presetType);
    if (data && data.features) {
      setFeatures(data.features);
    }
  };

  const runPrediction = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.predict(features, activeModel);
      setPrediction(res);
    } catch (err) {
      setError(err.message || "Failed to compute prediction");
    } finally {
      setLoading(false);
    }
  };

  // Run prediction on mount or when features change
  useEffect(() => {
    runPrediction();
  }, [activeModel, features]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Preset Pickers and Action Bar */}
      <div className="card-subtle p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-teal-600" />
            WDBC Feature Input & Diagnostic Inference
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluate individual biopsy measurements across 30 digitized cell nuclei parameters.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium mr-1">Load Preset:</span>
          <button
            onClick={() => handleLoadPreset('malignant')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activePreset === 'malignant'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            Malignant Biopsy
          </button>
          <button
            onClick={() => handleLoadPreset('benign')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activePreset === 'benign'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            Benign Biopsy
          </button>
          <button
            onClick={() => handleLoadPreset('borderline')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activePreset === 'borderline'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            Borderline Case
          </button>
        </div>
      </div>

      {/* Main Grid: Form Left, Results Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 30 Features Form (7 cols) */}
        <div className="lg:col-span-7 card-subtle p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-teal-600" />
              <span className="text-sm font-bold text-slate-900">Feature Parameters</span>
            </div>

            {/* Feature Group Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-medium">
              <button
                onClick={() => setActiveTab('worst')}
                className={`px-3 py-1 rounded-md transition-all ${
                  activeTab === 'worst'
                    ? 'bg-white text-slate-900 shadow-xs font-bold text-teal-850'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Worst Extremes (10)
              </button>
              <button
                onClick={() => setActiveTab('mean')}
                className={`px-3 py-1 rounded-md transition-all ${
                  activeTab === 'mean'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Mean Values (10)
              </button>
              <button
                onClick={() => setActiveTab('error')}
                className={`px-3 py-1 rounded-md transition-all ${
                  activeTab === 'error'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Standard Errors (10)
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            {activeTab === 'worst' && "Extreme cell nuclear values. These typically hold the highest SHAP attribution in separating malignant margins."}
            {activeTab === 'mean' && "Mean morphological measures computed over all segmented cell nuclei in the FNA sample."}
            {activeTab === 'error' && "Standard error of nuclear attributes across the biopsy sample, representing structural heterogeneity."}
          </p>

          {/* Form input grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {featureGroups[activeTab].map((feat) => {
              const val = features[feat] !== undefined ? features[feat] : 0;
              const isHighlight = feat.includes("concave") || feat.includes("perimeter");
              return (
                <div
                  key={feat}
                  className={`p-2.5 rounded-xl border text-xs transition-all ${
                    isHighlight
                      ? 'bg-teal-50/40 border-teal-200'
                      : 'bg-white border-slate-200/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700 capitalize flex items-center gap-1">
                      {feat}
                      {isHighlight && (
                        <span className="text-[10px] text-teal-700 font-mono font-bold">
                          [Top SHAP]
                        </span>
                      )}
                    </label>
                  </div>
                  <input
                    type="number"
                    step="any"
                    value={val}
                    onChange={(e) => handleInputChange(feat, e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <span className="text-xs text-slate-400">
              Editing updates inference & SHAP explanations automatically.
            </span>
            <button
              onClick={() => handleLoadPreset(activePreset)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Group
            </button>
          </div>
        </div>

        {/* Right Column: Prediction Results & Local SHAP (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Prediction Result Card */}
          <div className="card-subtle p-6 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Inference Result
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                {prediction?.model_used || "XGBoost"}
              </span>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-teal-600" />
                Computing probability & SHAP values...
              </div>
            ) : prediction ? (
              <div className="space-y-5">
                {/* Prediction Classification Badge */}
                <div
                  className={`p-4 rounded-xl border flex items-center justify-between ${
                    prediction.predicted_label === 'Malignant'
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {prediction.predicted_label === 'Malignant' ? (
                      <AlertTriangle className="w-7 h-7 text-rose-600 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />
                    )}
                    <div>
                      <div className="text-xs font-medium opacity-80 uppercase tracking-wider">
                        Predicted Class
                      </div>
                      <div className="text-xl font-extrabold tracking-tight">
                        {prediction.predicted_label}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-medium opacity-80">Confidence</div>
                    <div className="text-xl font-bold font-mono">
                      {(prediction.confidence * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Probability Calibration Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                    <span className="text-emerald-700">Benign: {(prediction.probability_benign * 100).toFixed(1)}%</span>
                    <span className="text-rose-700">Malignant: {(prediction.probability_malignant * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-3 w-full bg-emerald-100 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-300"
                      style={{ width: `${prediction.probability_benign * 100}%` }}
                    />
                    <div
                      className="bg-rose-500 h-full transition-all duration-300"
                      style={{ width: `${prediction.probability_malignant * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>Threshold: 0.50</span>
                    <span>Log-odds: {prediction.margin_log_odds}</span>
                  </div>
                </div>

                {/* Top 5 SHAP Feature Contributors */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-teal-600" />
                      Top 5 Local SHAP Attributions
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Base: {prediction.base_value}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {prediction.top_contributions.map((item) => {
                      const isRisk = item.shap_value > 0;
                      return (
                        <div
                          key={item.feature}
                          className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-semibold text-slate-800 capitalize flex items-center gap-1.5">
                              #{item.impact_rank} {item.feature}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              Measured: {item.value}
                            </div>
                          </div>

                          <div className="text-right">
                            <span
                              className={`inline-flex items-center gap-1 font-mono text-xs font-bold px-2 py-0.5 rounded ${
                                isRisk
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-emerald-100 text-emerald-700'
                              }`}
                            >
                              {isRisk ? (
                                <TrendingUp className="w-3.5 h-3.5" />
                              ) : (
                                <TrendingDown className="w-3.5 h-3.5" />
                              )}
                              {item.shap_value > 0 ? `+${item.shap_value}` : item.shap_value}
                            </span>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {isRisk ? "Increases Malignancy" : "Favors Benign"}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  BarChart2,
  Layers,
  Info,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Filter,
  CheckCircle2,
  Stethoscope
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
  CartesianGrid
} from 'recharts';

export default function ExplainabilityPage({ activeModel }) {
  const [shapData, setShapData] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState('malignant');
  const [sampleExplanation, setSampleExplanation] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all'); // all, mean, error, worst

  useEffect(() => {
    async function loadData() {
      const summary = await apiClient.getShapSummary(activeModel);
      setShapData(summary);

      const sample = SAMPLE_PRESETS[selectedPreset];
      if (sample) {
        const res = await apiClient.predict(sample.features, activeModel);
        setSampleExplanation(res);
      }
    }
    loadData();
  }, [activeModel, selectedPreset]);

  // Filter global importance
  const filteredFeatures = (shapData?.global_importance || []).filter(item => {
    if (categoryFilter === 'all') return true;
    return item.category === categoryFilter;
  });

  const categoryColors = {
    worst: '#0d9488', // teal-600
    mean: '#2563eb',  // blue-600
    error: '#8b5cf6'  // purple-500
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="card-subtle p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-600" />
            SHAP (Shapley Additive Explanations) Feature Attribution
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            TreeExplainer calculates exact local game-theoretic attributions and global feature rankings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Filter Group:</span>
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {['all', 'worst', 'mean', 'error'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-lg capitalize transition-all ${
                  categoryFilter === cat
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Global Feature Importance Chart */}
      <div className="card-subtle p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Global Feature Importance (Mean |SHAP Value|)
            </h3>
            <p className="text-xs text-slate-500">
              Average absolute attribution magnitude across the dataset. Higher values signify greater overall influence.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-3 h-3 rounded-sm bg-teal-600" /> Worst (Extreme)
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-3 h-3 rounded-sm bg-blue-600" /> Mean Value
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-3 h-3 rounded-sm bg-purple-500" /> Standard Error
            </span>
          </div>
        </div>

        {/* Bar chart container */}
        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={filteredFeatures.slice(0, 15)}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis
                type="number"
                tick={{ fontSize: 10 }}
                label={{ value: 'Mean |SHAP Value| (Impact on Log-odds)', position: 'bottom', offset: -2, fontSize: 11 }}
              />
              <YAxis
                type="category"
                dataKey="feature"
                tick={{ fontSize: 10 }}
                width={120}
              />
              <Tooltip
                formatter={(val, name, item) => [`${val} (|SHAP|)`, `Category: ${item.payload.category}`]}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '11px' }}
              />
              <Bar dataKey="mean_abs_shap" radius={[0, 4, 4, 0]}>
                {filteredFeatures.slice(0, 15).map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={categoryColors[entry.category] || '#0d9488'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Local Sample Waterfall Attribution Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Waterfall Plot (7 cols) */}
        <div className="lg:col-span-7 card-subtle p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Local Waterfall Attribution Decomposition
              </h3>
              <p className="text-xs text-slate-500">
                Step-by-step contribution: Base Expected Value E[f(x)] → Feature Shifts → f(x)
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setSelectedPreset('malignant')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  selectedPreset === 'malignant' ? 'bg-white text-rose-700 shadow-xs font-bold' : 'text-slate-500'
                }`}
              >
                Malignant Specimen
              </button>
              <button
                onClick={() => setSelectedPreset('benign')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  selectedPreset === 'benign' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-slate-500'
                }`}
              >
                Benign Specimen
              </button>
            </div>
          </div>

          {/* Waterfall Steps Chart */}
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sampleExplanation?.waterfall || []}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 110, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="step" tick={{ fontSize: 10 }} width={130} />
                <Tooltip
                  formatter={(val, name, item) => [
                    `Shift: ${item.payload.attribution} (Cum: ${item.payload.cumulative})`,
                    item.payload.step
                  ]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '11px' }}
                />
                <Bar dataKey="cumulative" radius={[0, 4, 4, 0]}>
                  {(sampleExplanation?.waterfall || []).map((entry, index) => {
                    const isBase = entry.step === 'Base Value' || entry.step.includes('Model Output');
                    const isPos = entry.attribution > 0;
                    return (
                      <Cell
                        key={`wf-${index}`}
                        fill={isBase ? '#475569' : isPos ? '#f43f5e' : '#0d9488'}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-rose-500" />
              <span>Positive Attribution (Increases Malignancy Risk)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-teal-600" />
              <span>Negative Attribution (Favors Benign)</span>
            </div>
          </div>
        </div>

        {/* Top 5 Most Influential Features Deep Dive (5 cols) */}
        <div className="lg:col-span-5 card-subtle p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-teal-600" />
              Clinical Morphological Rationale
            </h3>
            <span className="text-xs font-mono bg-teal-50 text-teal-700 px-2 py-0.5 rounded font-semibold">
              XAI Clinical Insight
            </span>
          </div>

          <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="font-bold text-slate-900 flex items-center justify-between">
                <span>1. Worst Concave Points (SHAP: 1.842)</span>
                <span className="text-rose-600 font-mono font-bold">Primary Driver</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Measures number of severe indentations in nuclear contour. Malignant nuclei exhibit irregular,
                grooved boundaries due to rapid chromatin replication and aggressive cytoskeletal breakdown.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="font-bold text-slate-900 flex items-center justify-between">
                <span>2. Worst Perimeter & Area (SHAP: 1.421 / 1.354)</span>
                <span className="text-amber-600 font-mono font-bold">Size Biomarkers</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Cellular pleomorphism causes cancer cells to grow abnormally large compared to uniform benign
                ductal cells. Nuclear enlargement correlates strongly with histologic tumor grade.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="font-bold text-slate-900 flex items-center justify-between">
                <span>3. Mean Concave Points (SHAP: 1.182)</span>
                <span className="text-blue-600 font-mono font-bold">Uniformity Metric</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Even on average across the entire sample, concave point frequency differentiates non-cancerous
                fibroadenomas from invasive ductal carcinoma.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

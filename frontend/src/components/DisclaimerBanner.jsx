import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export default function DisclaimerBanner() {
  return (
    <div className="bg-amber-500/10 border-l-4 border-amber-500 p-3 rounded-r-lg mb-6 flex items-start justify-between text-xs sm:text-sm text-amber-900 shadow-xs">
      <div className="flex items-start gap-2.5">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-amber-950">Academic Research & Demonstration Protocol:</span>{' '}
          This dashboard and its underlying machine learning models are designed exclusively for M.Tech academic research on explainability and adversarial robustness. They are strictly not validated for clinical diagnosis, patient triage, or medical decision-making.
        </div>
      </div>
      <div className="hidden md:flex items-center gap-1.5 text-xs text-amber-700 font-medium px-2 py-1 bg-amber-100 rounded-md shrink-0">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>WDBC Benchmark</span>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DisclaimerBanner from './components/DisclaimerBanner';

// Dashboard Pages
import OverviewPage from './pages/OverviewPage';
import PredictionPage from './pages/PredictionPage';
import EvaluationPage from './pages/EvaluationPage';
import ExplainabilityPage from './pages/ExplainabilityPage';
import AdversarialPage from './pages/AdversarialPage';
import FeatureShiftPage from './pages/FeatureShiftPage';
import ComparisonPage from './pages/ComparisonPage';
import ReportPage from './pages/ReportPage';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeModel, setActiveModel] = useState('baseline'); // 'baseline' or 'robust'
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans text-slate-800">
      {/* Dark Navy/Charcoal Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          activeModel={activeModel}
          setActiveModel={setActiveModel}
          onMenuClick={() => setIsMobileOpen(true)}
        />

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Research Disclaimer Banner across all pages */}
          <DisclaimerBanner />

          {/* Active Page View */}
          {activeTab === 'overview' && (
            <OverviewPage setActiveTab={setActiveTab} />
          )}

          {activeTab === 'prediction' && (
            <PredictionPage
              activeModel={activeModel}
              setActiveModel={setActiveModel}
            />
          )}

          {activeTab === 'evaluation' && (
            <EvaluationPage
              activeModel={activeModel}
              setActiveModel={setActiveModel}
            />
          )}

          {activeTab === 'explainability' && (
            <ExplainabilityPage activeModel={activeModel} />
          )}

          {activeTab === 'adversarial' && (
            <AdversarialPage
              activeModel={activeModel}
              setActiveModel={setActiveModel}
            />
          )}

          {activeTab === 'feature-shift' && (
            <FeatureShiftPage activeModel={activeModel} />
          )}

          {activeTab === 'comparison' && (
            <ComparisonPage />
          )}

          {activeTab === 'report' && (
            <ReportPage />
          )}
        </main>
      </div>
    </div>
  );
}

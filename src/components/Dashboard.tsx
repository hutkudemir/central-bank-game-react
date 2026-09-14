import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { translations } from '../data/translations';
import { TimeSeriesChart } from './charts/TimeSeriesChart';
import { PhillipsCurveChart } from './charts/PhillipsCurveChart';
import { PolicyAnalysisChart } from './charts/PolicyAnalysisChart';
import { AdvisorsPanel } from './AdvisorsPanel';
import { PressStatement } from './PressStatement';
import { LineChart, Users, Brain, FileText } from 'lucide-react';


type TabId = 'timeseries' | 'phillips' | 'policy' | 'advisors';

export function Dashboard() {
  const { language, month, pressTitle, pressStatement, showPressConference, setShowPressConference } = useGameStore();
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<TabId>('timeseries');

  const tabs = [
    { id: 'timeseries' as TabId, label: t.timeSeries, icon: LineChart },
    { id: 'phillips' as TabId, label: t.phillipsCurve, icon: Users },
    { id: 'policy' as TabId, label: t.policyAnalysis, icon: Brain },
    { id: 'advisors' as TabId, label: t.advisors, icon: FileText },
  ];

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-1.5">
        <div className="flex gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30 shadow-lg shadow-blue-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
              }`}
            >
              <tab.icon size={16} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-4 min-h-[400px]">
        {activeTab === 'timeseries' && <TimeSeriesChart />}
        {activeTab === 'phillips' && <PhillipsCurveChart />}
        {activeTab === 'policy' && <PolicyAnalysisChart />}
        {activeTab === 'advisors' && <AdvisorsPanel />}
      </div>

      {/* Press Statement */}
      <PressStatement />

      {/* Press Conference Button */}
      {month > 0 && (
        <button
          onClick={() => setShowPressConference(true)}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 border border-purple-500/30 text-purple-300 font-medium text-sm transition-all"
        >
          🎤 {t.pressConference}
        </button>
      )}
    </div>
  );
}

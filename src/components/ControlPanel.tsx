import { useGameStore } from '../store/gameStore';
import { translations } from '../data/translations';
import { regionDefaults } from '../store/gameStore';
import { 
  Globe, BarChart3,
  ChevronUp, ChevronDown
} from 'lucide-react';


export function ControlPanel() {
  const {
    language, setLanguage, difficulty, setDifficulty,
    region, setRegion, selectedRate, setSelectedRate,
    applyDecision, month, maxMonths, gameOver,
    infl, unemp, interest, credibility, piStar, uStar,
    shockNews, shockDesc, pressStatement, pressTitle,
    shockHistory,
  } = useGameStore();
  
  const t = translations[language];


  const currentInfl = infl[month];
  const currentUnemp = unemp[month];
  const currentRate = interest[month];
  
  const inflDev = currentInfl - piStar;
  const unempDev = currentUnemp - uStar;
  
  const healthScore = Math.max(0, Math.min(100,
    (100 - Math.abs(currentInfl - piStar) * 10) * 0.6 +
    (100 - Math.abs(currentUnemp - uStar) * 12) * 0.4
  ));
  
  const healthLabel = healthScore >= 90 ? t.excellent
    : healthScore >= 75 ? t.good
    : healthScore >= 60 ? t.moderate
    : healthScore >= 40 ? t.risky
    : t.critical;
  
  const healthColor = healthScore >= 90 ? 'text-emerald-400'
    : healthScore >= 75 ? 'text-green-400'
    : healthScore >= 60 ? 'text-yellow-400'
    : healthScore >= 40 ? 'text-orange-400'
    : 'text-red-400';

  const progressPct = Math.round((month / maxMonths) * 100);

  return (
    <div className="space-y-4">
      {/* Settings Row */}
      <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">{t.language}</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'en' | 'tr')}
              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="en">English</option>
              <option value="tr">Türkçe</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">{t.difficulty}</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="easy">{t.easy}</option>
              <option value="medium">{t.medium}</option>
              <option value="hard">{t.hard}</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="text-xs text-slate-400 mb-1 block flex items-center gap-1">
              <Globe size={12} /> {t.region}
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              {Object.keys(regionDefaults).map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Economic Indicators */}
      <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-700/30 rounded-xl p-3">
            <div className="text-xs text-slate-400 mb-1">{t.inflation}</div>
            <div className="text-2xl font-bold text-red-400">{currentInfl.toFixed(1)}%</div>
            <div className={`text-xs mt-1 ${inflDev > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {t.targetDeviation}: {inflDev > 0 ? '+' : ''}{inflDev.toFixed(1)}%
            </div>
          </div>
          <div className="bg-slate-700/30 rounded-xl p-3">
            <div className="text-xs text-slate-400 mb-1">{t.unemployment}</div>
            <div className="text-2xl font-bold text-blue-400">{currentUnemp.toFixed(1)}%</div>
            <div className={`text-xs mt-1 ${unempDev > 0 ? 'text-orange-400' : 'text-emerald-400'}`}>
              {t.targetDeviation}: {unempDev > 0 ? '+' : ''}{unempDev.toFixed(1)}%
            </div>
          </div>
          <div className="bg-slate-700/30 rounded-xl p-3">
            <div className="text-xs text-slate-400 mb-1">{t.economicHealth}</div>
            <div className={`text-2xl font-bold ${healthColor}`}>{healthScore.toFixed(0)}/100</div>
            <div className={`text-xs mt-1 ${healthColor}`}>{healthLabel}</div>
          </div>
          <div className="bg-slate-700/30 rounded-xl p-3">
            <div className="text-xs text-slate-400 mb-1">{t.credibility}</div>
            <div className="text-2xl font-bold text-purple-400">{credibility.toFixed(0)}/100</div>
            <div className="text-xs mt-1 text-purple-300">
              {credibility >= 80 ? '🟢' : credibility >= 60 ? '🟡' : '🔴'}
            </div>
          </div>
        </div>
      </div>

      {/* Interest Rate Control */}
      <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <BarChart3 size={16} className="text-blue-400" />
            {t.setRate}
          </h3>
          <span className="text-xs text-slate-400">{t.currentRate}: {currentRate.toFixed(2)}%</span>
        </div>
        
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setSelectedRate(selectedRate - 0.25)}
            disabled={gameOver || selectedRate <= 0}
            className="w-10 h-10 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 flex items-center justify-center transition-all disabled:opacity-30"
          >
            <ChevronDown size={20} className="text-red-400" />
          </button>
          
          <div className="flex-1 relative">
            <input
              type="range"
              min={0}
              max={50}
              step={0.25}
              value={selectedRate}
              onChange={(e) => setSelectedRate(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              disabled={gameOver}
            />
            <div className="text-center mt-2">
              <span className="text-3xl font-bold text-white">{selectedRate.toFixed(2)}%</span>
            </div>
          </div>
          
          <button
            onClick={() => setSelectedRate(selectedRate + 0.25)}
            disabled={gameOver || selectedRate >= 50}
            className="w-10 h-10 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 flex items-center justify-center transition-all disabled:opacity-30"
          >
            <ChevronUp size={20} className="text-emerald-400" />
          </button>
        </div>
        
        <button
          onClick={applyDecision}
          disabled={gameOver}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 font-semibold text-sm transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20"
        >
          {t.applyDecision}
        </button>
      </div>

      {/* News / Shock */}
      {(shockNews || shockDesc) && (
        <div className="bg-amber-500/10 backdrop-blur-sm rounded-2xl border border-amber-500/30 p-4 animate-pulse">
          <div className="text-amber-400 font-semibold text-sm mb-1">{shockNews}</div>
          <div className="text-amber-300/80 text-xs">{shockDesc}</div>
        </div>
      )}

      {/* Progress */}
      <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400">{t.month} {month}/{maxMonths}</span>
          <span className="text-xs text-blue-400">{progressPct}%</span>
        </div>
        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Shock History */}
      {shockHistory.length > 0 && (
        <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-4">
          <h3 className="text-sm font-semibold mb-3">{t.shockHistory}</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {shockHistory.map((entry, i) => (
              <div key={i} className="flex items-center justify-between text-xs bg-slate-700/30 rounded-lg px-3 py-2">
                <span className="text-slate-300">{t.monthLabel} {entry.month}</span>
                <span className="text-amber-300 truncate ml-2 flex-1 text-center">{entry.event}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  entry.severity === 'high' ? 'bg-red-500/20 text-red-300' :
                  entry.severity === 'medium' ? 'bg-amber-500/20 text-amber-300' :
                  'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {entry.severity === 'high' ? t.high : entry.severity === 'medium' ? t.medium_impact : t.low}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

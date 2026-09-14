import { useGameStore } from '../store/gameStore';
import { translations } from '../data/translations';
import { Trophy, XCircle, RotateCcw } from 'lucide-react';

export function GameOverModal() {
  const { language, gameResult, infl, unemp, credibility, month, maxMonths, resetGame } = useGameStore();
  const t = translations[language];

  const isHired = gameResult === t.hired;
  
  // Calculate final score
  const inflDev = infl.slice(1, month + 1).reduce((s, v) => s + Math.abs(v - 5), 0) / Math.max(1, month);
  const unempDev = unemp.slice(1, month + 1).reduce((s, v) => s + Math.abs(v - 8), 0) / Math.max(1, month);
  const score = Math.max(0, Math.round(100 - (inflDev * 1.5 + unempDev) * 8));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-8 shadow-2xl text-center max-h-[90vh] overflow-y-auto">
        <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${
          isHired ? 'bg-emerald-500/20 border-2 border-emerald-500/50' : 'bg-red-500/20 border-2 border-red-500/50'
        }`}>
          {isHired ? (
            <Trophy size={36} className="text-emerald-400" />
          ) : (
            <XCircle size={36} className="text-red-400" />
          )}
        </div>

        <h2 className="text-2xl font-bold mb-2">
          {isHired ? '🎉' : '💼'} {t.gameComplete}
        </h2>
        
        <p className="text-slate-300 mb-6 text-sm leading-relaxed">
          {gameResult}
        </p>

        <div className="bg-slate-700/30 rounded-xl p-4 mb-6">
          <div className="text-3xl font-bold mb-2">
            <span className={score >= 70 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-red-400'}>
              {score}
            </span>
            <span className="text-slate-400 text-lg">/100</span>
          </div>
          <div className="text-xs text-slate-400">{t.score}</div>
          
          <div className="grid grid-cols-3 gap-3 mt-4 text-center">
            <div>
              <div className="text-lg font-bold text-red-400">{infl[month]?.toFixed(1)}%</div>
              <div className="text-[10px] text-slate-500">{t.inflation}</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-400">{unemp[month]?.toFixed(1)}%</div>
              <div className="text-[10px] text-slate-500">{t.unemployment}</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-400">{credibility.toFixed(0)}</div>
              <div className="text-[10px] text-slate-500">{t.credibility}</div>
            </div>
          </div>
        </div>

        <button
          onClick={resetGame}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 font-semibold text-sm transition-all shadow-lg flex items-center justify-center gap-2"
        >
          <RotateCcw size={16} />
          {t.resetGame}
        </button>
      </div>
    </div>
  );
}

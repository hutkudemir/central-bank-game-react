import { useGameStore } from '../store/gameStore';
import { translations } from '../data/translations';
import { Trash2 } from 'lucide-react';

export function AdvisorsPanel() {
  const { language, advisorOptions, applyAdvisor, fireAdvisor, firedAdvisors, gameOver } = useGameStore();
  const t = translations[language];

  const biasColors = {
    keynesian: { bg: 'from-blue-500/10 to-blue-600/5', border: 'border-blue-500/30', badge: 'bg-blue-500/20 text-blue-300', icon: '📊' },
    monetarist: { bg: 'from-red-500/10 to-red-600/5', border: 'border-red-500/30', badge: 'bg-red-500/20 text-red-300', icon: '🏦' },
    'supply-side': { bg: 'from-emerald-500/10 to-emerald-600/5', border: 'border-emerald-500/30', badge: 'bg-emerald-500/20 text-emerald-300', icon: '🏭' },
  };

  const biasLabels = {
    keynesian: language === 'tr' ? 'Keynesyen' : 'Keynesian',
    monetarist: language === 'tr' ? 'Monetarist' : 'Monetarist',
    'supply-side': language === 'tr' ? 'Arz Yanlısı' : 'Supply-Side',
  };

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-300 mb-4">{t.advisors}</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {advisorOptions.map((advisor, idx) => {
          const slot = `opt${idx + 1}` as 'opt1' | 'opt2' | 'opt3';
          const isFired = firedAdvisors[slot];
          const colors = biasColors[advisor.bias];
          
          return (
            <div
              key={idx}
              className={`rounded-xl border p-4 bg-gradient-to-b ${colors.bg} ${colors.border} ${isFired ? 'opacity-60' : ''}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{colors.icon}</span>
                  <div>
                    <h4 className="font-semibold text-sm">{advisor.name}</h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${colors.badge}`}>
                      {advisor.philosophy || biasLabels[advisor.bias]}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="text-xs text-slate-400">{t.recommendedRate}</div>
                <div className="text-xl font-bold text-white">{advisor.rate.toFixed(2)}%</div>
                {advisor.confidence > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                        style={{ width: `${advisor.confidence}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400">{advisor.confidence}%</span>
                  </div>
                )}
              </div>
              
              <p className="text-xs text-slate-300 mb-3 leading-relaxed line-clamp-6">
                {advisor.rationale}
              </p>
              
              {advisor.press && (
                <p className="text-[11px] text-blue-300/70 mb-3 italic line-clamp-2">
                  {advisor.press}
                </p>
              )}
              
              <div className="flex gap-2 mt-auto">
                <button
                  onClick={() => applyAdvisor(idx)}
                  disabled={gameOver || isFired}
                  className="flex-1 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 text-xs font-medium transition-all disabled:opacity-30"
                >
                  {t.apply}
                </button>
                <button
                  onClick={() => fireAdvisor(idx)}
                  disabled={gameOver || isFired}
                  className="py-1.5 px-3 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-300 text-xs transition-all disabled:opacity-30"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

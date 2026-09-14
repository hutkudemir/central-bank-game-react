import { useGameStore } from '../store/gameStore';
import { translations } from '../data/translations';
import { X, TrendingUp, TrendingDown, BarChart3, Users } from 'lucide-react';

export function TutorialModal() {
  const { language, setShowTutorial } = useGameStore();
  const t = translations[language];

  const isTr = language === 'tr';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-lg w-full shadow-2xl max-h-[90vh] flex flex-col">
        {/* Fixed Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
          <h2 className="text-lg font-bold flex items-center gap-2">
            🏦 {t.tutorial}
          </h2>
          <button
            onClick={() => setShowTutorial(false)}
            className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-4 space-y-3">
          <p className="text-sm text-slate-300 leading-relaxed">
            {t.tutorialText}
          </p>

          <div className="space-y-2">
            <div className="flex items-start gap-3 bg-slate-700/30 rounded-xl p-3">
              <div className="w-7 h-7 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <TrendingUp size={14} className="text-red-400" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-200">
                  {isTr ? 'Faiz Oranını Belirle' : 'Set Interest Rate'}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isTr
                    ? 'Her ay politika faiz oranını ayarlayarak enflasyonu kontrol et.'
                    : 'Each month, adjust the policy rate to control inflation.'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-700/30 rounded-xl p-3">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <BarChart3 size={14} className="text-amber-400" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-200">
                  {isTr ? 'Şoklara Tepki Ver' : 'React to Shocks'}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isTr
                    ? 'Enerji krizleri, döviz oynaklığı ve diğer sürpriz olaylara hazırlıklı ol.'
                    : 'Be prepared for energy crises, currency volatility, and other surprises.'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-700/30 rounded-xl p-3">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Users size={14} className="text-blue-400" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-200">
                  {isTr ? 'Danışmanlarla Çalış' : 'Work with Advisors'}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isTr
                    ? 'Üç danışmanın önerilerini değerlendir: Dengeli, Güvercin ve Şahin.'
                    : 'Evaluate three advisors\' recommendations: Balancer, Dove, and Hawk.'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-700/30 rounded-xl p-3">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <TrendingDown size={14} className="text-purple-400" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-200">
                  {isTr ? 'Güvenilirliği Koru' : 'Maintain Credibility'}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isTr
                    ? 'Tutarlı kararlar al. Büyük ve ani değişiklikler güvenilirliğini düşürür.'
                    : 'Make consistent decisions. Large sudden changes reduce your credibility.'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-700/30 rounded-xl p-3">
            <h4 className="text-xs font-semibold text-slate-200 mb-2">
              {isTr ? '🎯 Hedefler' : '🎯 Targets'}
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
              <div>
                <span className="text-red-400">●</span> {isTr ? 'Enflasyon' : 'Inflation'}: ~5%
              </div>
              <div>
                <span className="text-blue-400">●</span> {isTr ? 'İşsizlik' : 'Unemployment'}: ~8%
              </div>
              <div>
                <span className="text-purple-400">●</span> {isTr ? 'Güvenilirlik' : 'Credibility'}: ≥60
              </div>
              <div>
                <span className="text-emerald-400">●</span> {isTr ? 'Süre' : 'Duration'}: 36 {isTr ? 'ay' : 'months'}
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Footer Button */}
        <div className="p-4 border-t border-slate-700 flex-shrink-0">
          <button
            onClick={() => setShowTutorial(false)}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 font-semibold text-sm transition-all shadow-lg"
          >
            {t.startGame} 🚀
          </button>
        </div>
      </div>
    </div>
  );
}

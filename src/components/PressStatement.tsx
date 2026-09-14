import { useGameStore } from '../store/gameStore';
import { translations } from '../data/translations';
import { FileText } from 'lucide-react';

export function PressStatement() {
  const { language, pressTitle, pressStatement, month } = useGameStore();
  const t = translations[language];

  if (!pressTitle && !pressStatement) return null;

  return (
    <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-4">
      <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
        <FileText size={16} className="text-blue-400" />
        {t.pressStatement}
      </h3>
      {pressTitle && (
        <div className="font-semibold text-sm text-blue-300 mb-2">{pressTitle}</div>
      )}
      {pressStatement && (
        <p className="text-xs text-slate-300 leading-relaxed">{pressStatement}</p>
      )}
    </div>
  );
}

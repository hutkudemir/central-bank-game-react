import { useGameStore } from '../../store/gameStore';
import { translations } from '../../data/translations';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine
} from 'recharts';

export function PolicyAnalysisChart() {
  const { language, month, infl, unemp, interest, piStar, uStar, rStar } = useGameStore();
  const t = translations[language];

  const data = [];
  for (let i = 1; i <= month; i++) {
    const optimalRate = rStar + infl[i] + 0.6 * (infl[i] - piStar) + 0.4 * (uStar - unemp[i]);
    data.push({
      month: i,
      appliedRate: parseFloat(interest[i].toFixed(2)),
      optimalRate: parseFloat(Math.max(0, optimalRate).toFixed(2)),
      inflation: parseFloat(infl[i].toFixed(2)),
    });
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[350px] text-slate-500">
        <p>{t.month} 1+ {language === 'tr' ? 'gerekli' : 'required'}</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-300 mb-4">
        {t.policyAnalysis} — {t.appliedRate} vs {t.optimalRate}
      </h3>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="month"
            stroke="#64748b"
            fontSize={12}
            label={{ value: t.monthLabel, position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 11 }}
          />
          <YAxis stroke="#64748b" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '12px',
              fontSize: '12px',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Line type="monotone" dataKey="appliedRate" stroke="#10b981" strokeWidth={2.5} dot={false} name={t.appliedRate} />
          <Line type="monotone" dataKey="optimalRate" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="5 5" name={t.optimalRate} />
          <Line type="monotone" dataKey="inflation" stroke="#ef4444" strokeWidth={1.5} dot={false} strokeOpacity={0.7} name={t.inflation} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

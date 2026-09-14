import { useGameStore } from '../../store/gameStore';
import { translations } from '../../data/translations';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ReferenceArea, Legend
} from 'recharts';

export function TimeSeriesChart() {
  const { language, month, infl, unemp, interest, gdpGrowth, inflationExpectations, piStar, uStar } = useGameStore();
  const t = translations[language];

  const data = [];
  for (let i = 0; i <= month; i++) {
    data.push({
      month: i,
      inflation: parseFloat(infl[i].toFixed(2)),
      unemployment: parseFloat(unemp[i].toFixed(2)),
      policyRate: parseFloat(interest[i].toFixed(2)),
      gdpGrowth: parseFloat(gdpGrowth[i].toFixed(2)),
      expectations: parseFloat(inflationExpectations[i].toFixed(2)),
    });
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-300 mb-4">{t.timeSeries}</h3>
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
            labelStyle={{ color: '#94a3b8' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <ReferenceArea y1={piStar - 1} y2={piStar + 1} fill="#ef4444" fillOpacity={0.05} />
          <ReferenceLine y={piStar} stroke="#ef4444" strokeDasharray="5 5" label={{ value: `${t.inflation} ${t.target}: ${piStar}%`, fill: '#ef4444', fontSize: 10, position: 'right' }} />
          <ReferenceLine y={uStar} stroke="#3b82f6" strokeDasharray="5 5" label={{ value: `${t.unemployment} ${t.target}: ${uStar}%`, fill: '#3b82f6', fontSize: 10, position: 'right' }} />
          <Line type="monotone" dataKey="inflation" stroke="#ef4444" strokeWidth={2.5} dot={false} name={t.inflation} />
          <Line type="monotone" dataKey="expectations" stroke="#f97316" strokeWidth={2} dot={false} strokeDasharray="3 3" name={language === 'tr' ? 'Beklentiler' : 'Expectations'} />
          <Line type="monotone" dataKey="unemployment" stroke="#3b82f6" strokeWidth={2.5} dot={false} name={t.unemployment} />
          <Line type="monotone" dataKey="policyRate" stroke="#10b981" strokeWidth={2.5} dot={false} name={t.policyRate} />
          <Line type="monotone" dataKey="gdpGrowth" stroke="#f59e0b" strokeWidth={1.5} dot={false} strokeDasharray="5 5" name={t.gdpGrowth} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

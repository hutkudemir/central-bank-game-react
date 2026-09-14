import { useGameStore } from '../../store/gameStore';
import { translations } from '../../data/translations';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Line, ComposedChart, ZAxis
} from 'recharts';

export function PhillipsCurveChart() {
  const { language, month, infl, unemp, piStar, uStar } = useGameStore();
  const t = translations[language];

  const data = [];
  for (let i = 1; i <= month; i++) {
    data.push({
      unemployment: parseFloat(unemp[i].toFixed(2)),
      inflation: parseFloat(infl[i].toFixed(2)),
      month: i,
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
        {t.phillipsCurve} — {t.inflation} vs {t.unemployment}
      </h3>
      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="unemployment"
            stroke="#64748b"
            fontSize={12}
            label={{ value: `${t.unemployment} (%)`, position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 11 }}
          />
          <YAxis
            dataKey="inflation"
            stroke="#64748b"
            fontSize={12}
            label={{ value: `${t.inflation} (%)`, angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
          />
          <ZAxis range={[60, 200]} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '12px',
              fontSize: '12px',
            }}
            formatter={(value: number, name: string) => [`${value}%`, name]}
            labelFormatter={(label) => `${t.unemployment}: ${label}%`}
          />
          <ReferenceLine y={piStar} stroke="#ef4444" strokeDasharray="5 5" label={{ value: `π* = ${piStar}%`, fill: '#ef4444', fontSize: 10 }} />
          <ReferenceLine x={uStar} stroke="#3b82f6" strokeDasharray="5 5" label={{ value: `u* = ${uStar}%`, fill: '#3b82f6', fontSize: 10, position: 'top' }} />
          <Scatter
            data={data}
            fill="#8b5cf6"
            stroke="#a78bfa"
            strokeWidth={1}
            fillOpacity={0.8}
          />
          <Line
            type="monotone"
            dataKey="inflation"
            stroke="#8b5cf6"
            strokeWidth={1}
            strokeOpacity={0.4}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

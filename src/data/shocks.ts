export interface Shock {
  key: string;
  headline: string;
  headline_tr: string;
  description: string;
  description_tr: string;
  type: 'supply' | 'demand' | 'currency' | 'positive';
  severity: 'high' | 'medium' | 'low';
  inflEffect: number;
  unempEffect: number;
  gdpEffect: number;
  duration: number;
  mag: number;
}

export const shockList = [
  {
    key: "shock_energy",
    headline: "🛢️ Energy Crisis!",
    headline_tr: "🛢️ Enerji Krizi!",
    description: "Oil prices surge after geopolitical tensions.",
    description_tr: "Jeopolitik gerilimler petrol fiyatını sıçrattı.",
    type: "supply" as const,
    severity: "high" as const,
    inflEffect: 0.4,
    unempEffect: 0.2,
    gdpEffect: -0.3,
  },
  {
    key: "shock_consumer",
    headline: "📉 Consumer Confidence Falls!",
    headline_tr: "📉 Tüketici Güveni Düştü!",
    description: "Unexpected drop in household sentiment cuts demand.",
    description_tr: "Hane halkı güvenindeki beklenmedik düşüş talebi kesti.",
    type: "demand" as const,
    severity: "medium" as const,
    inflEffect: -0.2,
    unempEffect: 0.3,
    gdpEffect: -0.4,
  },
  {
    key: "shock_finance",
    headline: "💰 Fiscal Stimulus!",
    headline_tr: "💰 Mali Teşvik!",
    description: "Government ramps up spending; economy gets a boost.",
    description_tr: "Hükümet harcamaları artırdı; ekonomiye destek geldi.",
    type: "demand" as const,
    severity: "medium" as const,
    inflEffect: 0.3,
    unempEffect: -0.3,
    gdpEffect: 0.5,
  },
  {
    key: "shock_currency",
    headline: "💱 Currency Volatility!",
    headline_tr: "💱 Döviz Oynaklığı!",
    description: "Sharp swings in the exchange rate unsettle markets.",
    description_tr: "Kurda keskin dalgalanmalar piyasayı tedirgin etti.",
    type: "currency" as const,
    severity: "high" as const,
    inflEffect: 0.5,
    unempEffect: 0.1,
    gdpEffect: -0.5,
  },
  {
    key: "shock_industry",
    headline: "🏭 Industrial Boom!",
    headline_tr: "🏭 Sanayi Patlaması!",
    description: "Manufacturing sector expands faster than expected.",
    description_tr: "İmalat sektörü beklenenden hızlı büyüdü.",
    type: "positive" as const,
    severity: "medium" as const,
    inflEffect: -0.3,
    unempEffect: -0.4,
    gdpEffect: 0.6,
  },
  {
    key: "shock_agriculture",
    headline: "🌾 Agricultural Crisis!",
    headline_tr: "🌾 Tarım Krizi!",
    description: "Drought sends food prices higher.",
    description_tr: "Kuraklık gıda fiyatlarını yükseltti.",
    type: "supply" as const,
    severity: "high" as const,
    inflEffect: 0.4,
    unempEffect: 0.2,
    gdpEffect: -0.3,
  },
  {
    key: "shock_construction",
    headline: "🏠 Construction Boom!",
    headline_tr: "🏠 İnşaat Patlaması!",
    description: "Real-estate frenzy fuels jobs and prices.",
    description_tr: "Gayrimenkul çılgınlığı istihdamı ve fiyatları artırıyor.",
    type: "demand" as const,
    severity: "medium" as const,
    inflEffect: 0.2,
    unempEffect: -0.5,
    gdpEffect: 0.4,
  },
  {
    key: "shock_tech",
    headline: "📱 Tech Investment Surge!",
    headline_tr: "📱 Teknoloji Yatırımı Patladı!",
    description: "Digital transformation gains momentum.",
    description_tr: "Dijital dönüşüm ivme kazandı.",
    type: "positive" as const,
    severity: "medium" as const,
    inflEffect: -0.2,
    unempEffect: -0.2,
    gdpEffect: 0.5,
  },
  {
    key: "shock_logistics",
    headline: "🚢 Logistics Disruptions!",
    headline_tr: "🚢 Lojistik Aksaklıkları!",
    description: "Global supply chain delays raise costs.",
    description_tr: "Küresel tedarik zinciri gecikmeleri maliyetleri artırdı.",
    type: "supply" as const,
    severity: "medium" as const,
    inflEffect: 0.3,
    unempEffect: 0.2,
    gdpEffect: -0.4,
  },
  {
    key: "shock_energy_eff",
    headline: "⚡ Energy Efficiency Gains!",
    headline_tr: "⚡ Enerji Verimliliği Artışı!",
    description: "Renewables cut production costs.",
    description_tr: "Yenilenebilir enerji üretim maliyetlerini düşürüyor.",
    type: "positive" as const,
    severity: "low" as const,
    inflEffect: -0.3,
    unempEffect: -0.1,
    gdpEffect: 0.3,
  },
];

export function createNewShock(difficulty: string, usedKeys: string[]): Shock {
  const available = shockList.filter(s => !usedKeys.includes(s.key));
  const pool = available.length > 0 ? available : shockList;
  const def = pool[Math.floor(Math.random() * pool.length)];
  
  const diffMult = difficulty === 'hard' ? 1.5 : difficulty === 'medium' ? 1.2 : 1.0;
  const duration = Math.floor(Math.random() * 3) + 2; // 2-4
  const mag = 0.8 + Math.random() * 0.4; // 0.8-1.2

  return {
    ...def,
    inflEffect: def.inflEffect * diffMult,
    unempEffect: def.unempEffect * diffMult,
    gdpEffect: def.gdpEffect * diffMult,
    duration,
    mag,
  };
}

export function updateShock(shock: Shock, decayRate = 0.85): Shock {
  return {
    ...shock,
    duration: shock.duration - 1,
    mag: shock.mag * decayRate,
  };
}

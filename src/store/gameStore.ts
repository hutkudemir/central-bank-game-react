import { create } from 'zustand';
import { type Language, translations } from '../data/translations';
import { Shock, createNewShock, updateShock } from '../data/shocks';

export interface AdvisorOption {
  name: string;
  rate: number;
  rationale: string;
  press: string;
  philosophy: string;
  bias: 'keynesian' | 'monetarist' | 'supply-side';
  confidence: number;
}

export interface ShockHistoryEntry {
  month: number;
  event: string;
  severity: string;
}

export interface RegionConfig {
  pi_star: number;
  u_star: number;
  r_star: number;
  init_pi: number;
  init_u: number;
  init_r: number;
  public_sentiment: 'hawkish' | 'dovish' | 'balanced';
  political_pressure: number; // 0-1, how much public cares about unemployment vs inflation
}

export const regionDefaults: Record<string, RegionConfig> = {
  "Türkiye": { 
    pi_star: 5, u_star: 8, r_star: 3, 
    init_pi: 12, init_u: 8, init_r: 12,
    public_sentiment: 'hawkish',
    political_pressure: 0.7 // High inflation sensitivity
  },
  "United States": { 
    pi_star: 2, u_star: 4, r_star: 0.5, 
    init_pi: 5, init_u: 4.2, init_r: 4.5,
    public_sentiment: 'balanced',
    political_pressure: 0.5 // Balanced dual mandate
  },
  "Euro Area": { 
    pi_star: 2, u_star: 6.5, r_star: 0, 
    init_pi: 2.5, init_u: 6.7, init_r: 2.5,
    public_sentiment: 'dovish',
    political_pressure: 0.3 // More concerned about growth
  },
};

interface GameState {
  // Settings
  language: Language;
  difficulty: string;
  region: string;
  
  // Game state
  month: number;
  maxMonths: number;
  gameOver: boolean;
  gameResult: string;
  
  // Economic indicators
  infl: number[];
  unemp: number[];
  interest: number[];
  gdpGrowth: number[];
  inflationExpectations: number[]; // NEW: Anchored expectations
  
  // Region targets
  piStar: number;
  uStar: number;
  rStar: number;
  publicSentiment: 'hawkish' | 'dovish' | 'balanced';
  politicalPressure: number;
  
  // Shock state
  currentShock: Shock | null;
  shockNews: string;
  shockDesc: string;
  shockCount: number;
  nextShockMonth: number;
  shockKeysUsed: string[];
  shockHistory: ShockHistoryEntry[];
  
  // Policy
  lastDecision: string;
  lastRateChange: number;
  credibility: number;
  policyBuffer: { rate: number; effect: number }[];
  
  // Press
  pressTitle: string;
  pressStatement: string;
  publicApproval: number; // NEW: 0-100 public approval rating
  
  // Advisors
  advisorOptions: AdvisorOption[];
  firedAdvisors: Record<string, boolean>;
  emptySince: Record<string, number | null>;
  lastApplied: Record<string, number | null>;
  
  // UI
  selectedRate: number;
  showTutorial: boolean;
  showPressConference: boolean;
  
  // Actions
  setLanguage: (lang: Language) => void;
  setDifficulty: (diff: string) => void;
  setRegion: (region: string) => void;
  setSelectedRate: (rate: number) => void;
  setShowTutorial: (show: boolean) => void;
  setShowPressConference: (show: boolean) => void;
  applyDecision: () => void;
  applyAdvisor: (index: number) => void;
  fireAdvisor: (index: number) => void;
  resetGame: () => void;
  updateAdvisors: () => void;
}

const TOTAL_PERIODS = 36;

function generateAdvisors(
  infl: number, unemp: number, currentRate: number,
  piStar: number, uStar: number, rStar: number,
  shock: Shock | null, language: Language, month: number,
  inflationExpectations: number, gdpGrowth: number,
  credibility: number
): AdvisorOption[] {
  const shockActive = shock !== null;
  const t = translations[language];
  const isTr = language === 'tr';
  
  // Calculate output gap (negative = recessionary)
  const outputGap = (uStar - unemp) * 0.5;
  const inflGap = infl - piStar;
  
  // K E Y N E S I A N  A D V I S O R
  // Focus: Counter-cyclical policy, prioritize employment during downturns
  const keynesianRate = Math.max(0, 
    rStar + infl + 
    0.3 * inflGap +           // Lower weight on inflation
    0.8 * outputGap +         // Higher weight on output
    (shockActive && shock.unempEffect > 0 ? -0.5 : 0) // Stimulus during unemployment shocks
  );
  
  const keynesianRationale = isTr
    ? `Mevcut işsizlik ${unemp.toFixed(1)}%. Keynesyen perspektiften, ${unemp > uStar ? 'ekonomi durgunluk yaşıyor ve mali teşvik gerekli' : 'toplam talebi desteklemeliyiz'}. Enflasyon beklentileri ${inflationExpectations.toFixed(1)}%. ${shockActive && shock.unempEffect > 0 ? 'Şok istihdamı tehdit ediyor - faiz indirimleri gerekli.' : 'Parasal genişleme büyümeyi destekleyecektir.'}`
    : `Current unemployment at ${unemp.toFixed(1)}%. From a Keynesian perspective, ${unemp > uStar ? 'the economy is in a slump and fiscal stimulus is needed' : 'we must support aggregate demand'}. Inflation expectations at ${inflationExpectations.toFixed(1)}%. ${shockActive && shock.unempEffect > 0 ? 'The shock threatens employment - rate cuts are necessary.' : 'Monetary easing will support growth.'}`;
  
  // M O N E T A R I S T  A D V I S O R
  // Focus: Price stability, inflation targeting, credibility
  const monetaristRate = Math.max(0,
    rStar + infl + 
    1.5 * inflGap +           // High weight on inflation
    0.3 * outputGap +         // Lower weight on output
    (shockActive && shock.inflEffect > 0 ? 0.75 : 0) // Hawkish response to supply shocks
  );
  
  const monetaristRationale = isTr
    ? `Enflasyon ${infl.toFixed(1)}% ile hedefin ${infl > piStar ? 'üzerinde' : 'altında'}. Monetarist yaklaşım fiyat istikrarını önceliklendirir. Enflasyon beklentileri ${inflationExpectations.toFixed(1)}% - ${inflationExpectations > piStar ? 'çıpadan sapma var, sıkı politika gerekli' : 'kontrol altında'}. ${credibility < 60 ? 'Düşük güvenilirlik beklentileri çıpasızlaştırıyor - kararlılık şart.' : 'Güvenilirliğimiz güçlü - tutarlı kalalım.'}`
    : `Inflation at ${infl.toFixed(1)}% is ${infl > piStar ? 'above' : 'below'} target. Monetarist approach prioritizes price stability. Inflation expectations at ${inflationExpectations.toFixed(1)}% - ${inflationExpectations > piStar ? 'deviating from anchor, tight policy needed' : 'well-anchored'}. ${credibility < 60 ? 'Low credibility is unanchoring expectations - decisiveness is critical.' : 'Our credibility is strong - stay the course.'}`;
  
  // S U P P L Y - S I D E  A D V I S O R
  // Focus: Long-term growth, structural reforms, productivity
  const supplySideRate = Math.max(0,
    rStar + infl + 
    0.5 * inflGap +           // Moderate inflation weight
    0.5 * outputGap +         // Moderate output weight
    (gdpGrowth < 2 ? -0.25 : 0.25) // Stimulate if growth is low
  );
  
  const supplySideRationale = isTr
    ? `GSYİH büyümesi ${gdpGrowth.toFixed(1)}%. Uzun vadeli büyüme için yapısal reformlar ve verimlilik artışı gerekli. ${gdpGrowth < 2 ? 'Düşük büyüme endişe verici - yatırım ortamını iyileştirmeliyiz.' : 'Büyüme sağlam - reformlara devam edelim.'} Faiz politikası ${gdpGrowth < 2 ? 'yatırımları desteklemek için' : 'fiyat istikrarını korumak için'} ${gdpGrowth < 2 ? 'düşük' : 'nötr'} kalmalı.`
    : `GDP growth at ${gdpGrowth.toFixed(1)}%. Long-term growth requires structural reforms and productivity gains. ${gdpGrowth < 2 ? 'Low growth is concerning - we must improve the investment climate.' : 'Growth is solid - continue reforms.'} Interest policy should remain ${gdpGrowth < 2 ? 'low to support investment' : 'neutral to maintain price stability'}.`;
  
  // Round to nearest 0.25
  const keyRate = Math.round(keynesianRate / 0.25) * 0.25;
  const monRate = Math.round(monetaristRate / 0.25) * 0.25;
  const supRate = Math.round(supplySideRate / 0.25) * 0.25;
  
  // Confidence based on how close current situation is to their ideal
  const keyConfidence = Math.min(100, Math.max(40, 100 - Math.abs(unemp - uStar) * 10));
  const monConfidence = Math.min(100, Math.max(40, 100 - Math.abs(infl - piStar) * 8));
  const supConfidence = Math.min(100, Math.max(40, 100 - Math.abs(gdpGrowth - 3) * 15));
  
  return [
    {
      name: isTr ? "Prof. Dr. Ayşe Yılmaz" : "Prof. Dr. Ayşe Yilmaz",
      rate: keyRate,
      rationale: keynesianRationale,
      press: isTr
        ? `Ay ${month + 1}: Faiz ${keyRate.toFixed(2)}% - istihdam ve büyümeyi destekliyoruz.`
        : `Month ${month + 1}: Rate at ${keyRate.toFixed(2)}% - supporting employment and growth.`,
      philosophy: isTr ? "Keynesyen - Talep Odaklı" : "Keynesian - Demand Focus",
      bias: 'keynesian',
      confidence: keyConfidence,
    },
    {
      name: isTr ? "Prof. Dr. Mehmet Öz" : "Prof. Dr. Mehmet Oz",
      rate: monRate,
      rationale: monetaristRationale,
      press: isTr
        ? `Ay ${month + 1}: Faiz ${monRate.toFixed(2)}% - fiyat istikrarı önceliğimiz.`
        : `Month ${month + 1}: Rate at ${monRate.toFixed(2)}% - price stability is our priority.`,
      philosophy: isTr ? "Monetarist - Fiyat İstikrarı" : "Monetarist - Price Stability",
      bias: 'monetarist',
      confidence: monConfidence,
    },
    {
      name: isTr ? "Prof. Dr. Can Demir" : "Prof. Dr. Can Demir",
      rate: supRate,
      rationale: supplySideRationale,
      press: isTr
        ? `Ay ${month + 1}: Faiz ${supRate.toFixed(2)}% - uzun vadeli büyümeye odaklanıyoruz.`
        : `Month ${month + 1}: Rate at ${supRate.toFixed(2)}% - focusing on long-term growth.`,
      philosophy: isTr ? "Arz Yanlısı - Yapısal Reform" : "Supply-Side - Structural Reform",
      bias: 'supply-side',
      confidence: supConfidence,
    },
  ];
}

export const useGameStore = create<GameState>((set, get) => ({
  language: 'en',
  difficulty: 'easy',
  region: 'Türkiye',
  
  month: 0,
  maxMonths: TOTAL_PERIODS,
  gameOver: false,
  gameResult: '',
  
  infl: [12.0, ...Array(TOTAL_PERIODS).fill(0)],
  unemp: [8.0, ...Array(TOTAL_PERIODS).fill(0)],
  interest: [12.0, ...Array(TOTAL_PERIODS).fill(0)],
  gdpGrowth: [2.5, ...Array(TOTAL_PERIODS).fill(0)],
  inflationExpectations: [8.0, ...Array(TOTAL_PERIODS).fill(0)], // NEW
  
  piStar: 5,
  uStar: 8,
  rStar: 3,
  publicSentiment: 'hawkish',
  politicalPressure: 0.7,
  
  currentShock: null,
  shockNews: '',
  shockDesc: '',
  shockCount: 0,
  nextShockMonth: Math.floor(Math.random() * 4) + 3,
  shockKeysUsed: [],
  shockHistory: [],
  
  lastDecision: 'maintain',
  lastRateChange: 0,
  credibility: 100,
  policyBuffer: [],
  
  pressTitle: '',
  pressStatement: '',
  publicApproval: 75, // NEW: Start with decent approval
  
  advisorOptions: [],
  firedAdvisors: { opt1: false, opt2: false, opt3: false },
  emptySince: { opt1: null, opt2: null, opt3: null },
  lastApplied: { opt1: null, opt2: null, opt3: null },
  
  selectedRate: 12.0,
  showTutorial: true,
  showPressConference: false,
  
  setLanguage: (lang) => {
    set({ language: lang });
    get().updateAdvisors();
  },
  
  setDifficulty: (diff) => set({ difficulty: diff }),
  
  setRegion: (region) => {
    const cfg = regionDefaults[region];
    const state = get();
    if (state.month === 0) {
      const newInfl = [...state.infl];
      const newUnemp = [...state.unemp];
      const newInterest = [...state.interest];
      const newExpectations = [...state.inflationExpectations];
      newInfl[0] = cfg.init_pi;
      newUnemp[0] = cfg.init_u;
      newInterest[0] = cfg.init_r;
      newExpectations[0] = cfg.init_pi * 0.8; // Expectations start slightly below actual
      set({
        region,
        piStar: cfg.pi_star,
        uStar: cfg.u_star,
        rStar: cfg.r_star,
        publicSentiment: cfg.public_sentiment,
        politicalPressure: cfg.political_pressure,
        infl: newInfl,
        unemp: newUnemp,
        interest: newInterest,
        inflationExpectations: newExpectations,
        selectedRate: cfg.init_r,
      });
    } else {
      set({ region, publicSentiment: cfg.public_sentiment, politicalPressure: cfg.political_pressure });
    }
    get().updateAdvisors();
  },
  
  setSelectedRate: (rate) => set({ selectedRate: Math.max(0, Math.min(50, rate)) }),
  
  setShowTutorial: (show) => set({ showTutorial: show }),
  setShowPressConference: (show) => set({ showPressConference: show }),
  
  applyDecision: () => {
    const state = get();
    if (state.gameOver || state.month >= state.maxMonths) return;
    
    const curr = state.month;
    const nextIdx = curr + 1;
    
    const iChosen = state.selectedRate;
    const piT = state.infl[curr];
    const uT = state.unemp[curr];
    const { rStar, piStar, uStar } = state;
    
    // Decision info
    const rateChange = Math.abs(iChosen - state.interest[curr]);
    let lastDecision = 'maintain';
    if (iChosen > state.interest[curr]) lastDecision = 'increase';
    else if (iChosen < state.interest[curr]) lastDecision = 'decrease';
    
    // REALISTIC TAYLOR RULE with expectations
    const expectedInfl = state.inflationExpectations[curr];
    const taylorMult = (piT < 0 || uT > 15) ? 0.5 : 1;
    const outputGap = (uStar - uT) * 1.0;
    
    // Modern Taylor rule: r = r* + π + 0.5(π - π*) + 0.5(u* - u)
    const iOpt = rStar + expectedInfl + 0.5 * taylorMult * (piT - piStar) + 0.5 * taylorMult * outputGap;
    const diff = iChosen - iOpt;
    
    // Credibility: More nuanced - depends on consistency AND outcomes
    let newCred = state.credibility;
    if (curr > 0) {
      // Penalize large unexpected changes
      if (rateChange > 2) newCred = Math.max(30, newCred - 15);
      // Reward consistency
      else if (lastDecision === 'maintain') newCred = Math.min(100, newCred + 3);
      // Reward good outcomes
      const inflDev = Math.abs(piT - piStar);
      const unempDev = Math.abs(uT - uStar);
      if (inflDev < 1 && unempDev < 1) newCred = Math.min(100, newCred + 2);
      // Penalize bad outcomes
      else if (inflDev > 3 || unempDev > 3) newCred = Math.max(30, newCred - 2);
    }
    
    // Policy buffer with realistic lags (6-12 months)
    let newBuffer = [...state.policyBuffer.map(b => ({ ...b, effect: b.effect - 1 }))];
    const dueItems = newBuffer.filter(b => b.effect <= 0);
    const delayedEffect = dueItems.reduce((sum, b) => sum + b.rate, 0);
    newBuffer = newBuffer.filter(b => b.effect > 0);
    newBuffer.push({ rate: diff, effect: 3 }); // 3-month lag
    
    const totalEffect = diff + delayedEffect;
    
    // Shock logic
    const shockCap = state.difficulty === 'hard' ? 6 : state.difficulty === 'medium' ? 4 : 3;
    let currentShock = state.currentShock;
    let shockNews = state.shockNews;
    let shockDesc = state.shockDesc;
    let shockCount = state.shockCount;
    let nextShockMonth = state.nextShockMonth;
    let shockKeysUsed = [...state.shockKeysUsed];
    let shockHistory = [...state.shockHistory];
    
    if (curr >= nextShockMonth && shockCount < shockCap && !currentShock) {
      const newShock = createNewShock(state.difficulty, shockKeysUsed);
      currentShock = newShock;
      shockKeysUsed.push(newShock.key);
      shockNews = state.language === 'tr' ? newShock.headline_tr : newShock.headline;
      shockDesc = state.language === 'tr' ? newShock.description_tr : newShock.description;
      shockCount++;
      nextShockMonth = curr + (state.difficulty === 'hard'
        ? Math.floor(Math.random() * 4) + 3
        : Math.floor(Math.random() * 5) + 6);
      shockHistory.push({
        month: curr + 1,
        event: state.language === 'tr' ? newShock.headline_tr : newShock.headline,
        severity: newShock.severity,
      });
    } else if (currentShock) {
      currentShock = updateShock(currentShock, 0.85);
      if (currentShock.duration <= 0 || currentShock.mag < 0.1) {
        shockNews = '';
        shockDesc = '';
        currentShock = null;
      } else {
        shockNews = state.language === 'tr' ? currentShock.headline_tr : currentShock.headline;
        shockDesc = state.language === 'tr' ? currentShock.description_tr : currentShock.description;
      }
    } else {
      shockNews = '';
      shockDesc = '';
    }
    
    // REALISTIC ECONOMIC DYNAMICS
    const shockInf = currentShock ? currentShock.inflEffect * currentShock.mag : 0;
    const shockUnemp = currentShock ? currentShock.unempEffect * currentShock.mag : 0;
    const shockGdp = currentShock ? currentShock.gdpEffect * currentShock.mag : 0;
    
    // Credibility multiplier affects policy transmission
    const credMult = 0.5 + (newCred / 200);
    
    // Phillips curve with expectations
    const kInf = 0.3 * credMult; // Inflation responds to policy with lag
    const kUnemp = 0.2 * credMult; // Unemployment responds to policy
    const kGdp = 0.25;
    
    // Random shocks to the economy
    const epsInf = (Math.random() - 0.5) * 0.3;
    const epsUnemp = (Math.random() - 0.5) * 0.2;
    const epsGdp = (Math.random() - 0.5) * 0.4;
    
    // NEW: Calculate new economic indicators
    const newInfl = [...state.infl];
    const newUnemp = [...state.unemp];
    const newInterest = [...state.interest];
    const newGdp = [...state.gdpGrowth];
    const newExpectations = [...state.inflationExpectations];
    
    newInterest[nextIdx] = iChosen;
    
    // Inflation: Phillips curve + expectations + policy effect + shocks
    // π_t = π_{t-1} - κ(π - π*) + β(π^e - π*) - α(i - i*) + shock + ε
    const expectationsEffect = 0.2 * (state.inflationExpectations[curr] - piStar);
    newInfl[nextIdx] = Math.max(-2, Math.min(40,
      piT + 
      0.15 * (piStar - piT) +           // Mean reversion
      expectationsEffect +                // Expectations channel
      (-kInf * totalEffect) +             // Policy effect
      shockInf +                          // Shock effect
      epsInf                              // Random noise
    ));
    
    // Unemployment: Okun's law + Phillips curve + policy + shocks
    // u_t = u_{t-1} + γ(π - π*) - δ(i - i*) + shock + ε
    const okunEffect = -0.2 * (newInfl[nextIdx] - piT); // Higher inflation → lower unemployment (short run)
    newUnemp[nextIdx] = Math.max(3, Math.min(25,
      0.85 * uT +                         // Persistence
      0.15 * uStar +                      // Mean reversion
      okunEffect +                        // Phillips curve trade-off
      (-kUnemp * totalEffect) +           // Policy effect
      shockUnemp +                        // Shock effect
      epsUnemp                            // Random noise
    ));
    
    // GDP growth: IS curve + shocks
    // g_t = g_{t-1} - α(i - i*) + shock + ε
    newGdp[nextIdx] = Math.max(-10, Math.min(15,
      0.6 * state.gdpGrowth[curr] +       // Persistence
      0.4 * 3.0 +                         // Potential growth
      (kGdp * totalEffect) +              // Policy effect
      shockGdp +                          // Shock effect
      epsGdp                              // Random noise
    ));
    
    // NEW: Update inflation expectations (adaptive + forward-looking)
    // π^e_t = 0.6 * π^e_{t-1} + 0.4 * π_t (if credibility is low)
    // π^e_t = 0.8 * π^e_{t-1} + 0.2 * π* (if credibility is high)
    const anchorStrength = newCred / 100; // Higher credibility = better anchored
    newExpectations[nextIdx] = Math.max(0,
      (1 - anchorStrength * 0.5) * state.inflationExpectations[curr] +
      anchorStrength * 0.5 * piStar +
      (1 - anchorStrength) * 0.3 * (newInfl[nextIdx] - piStar)
    );
    
    // NEW: Update public approval
    // Public cares about inflation AND unemployment, weighted by political pressure
    const inflSatisfaction = Math.max(0, 100 - Math.abs(newInfl[nextIdx] - piStar) * 20);
    const unempSatisfaction = Math.max(0, 100 - Math.abs(newUnemp[nextIdx] - uStar) * 15);
    const newApproval = Math.max(0, Math.min(100,
      state.publicApproval * 0.7 + // Persistence
      0.3 * (state.politicalPressure * inflSatisfaction + (1 - state.politicalPressure) * unempSatisfaction)
    ));
    
    const newMonth = curr + 1;
    
    // Press statement
    const isTr = state.language === 'tr';
    let pressTitle = '';
    let pressStatement = '';
    if (lastDecision === 'maintain') {
      pressTitle = isTr
        ? `Para Politikası Kurulu ${newMonth}. Toplantı Kararı`
        : `Monetary Policy Committee Meeting ${newMonth} Decision`;
      pressStatement = isTr
        ? 'Kurul politika faizini sabit tutmaya karar vermiştir.'
        : 'The Committee has decided to maintain the policy rate.';
    } else if (lastDecision === 'increase') {
      pressTitle = isTr
        ? `Para Politikası Kurulu ${newMonth}. Toplantı Kararı`
        : `Monetary Policy Committee Meeting ${newMonth} Decision`;
      pressStatement = isTr
        ? `Kurul politika faizini ${rateChange.toFixed(2)} puan artırmıştır.`
        : `The Committee has raised the policy rate by ${rateChange.toFixed(2)} percentage points.`;
    } else {
      pressTitle = isTr
        ? `Para Politikası Kurulu ${newMonth}. Toplantı Kararı`
        : `Monetary Policy Committee Meeting ${newMonth} Decision`;
      pressStatement = isTr
        ? `Kurul politika faizini ${rateChange.toFixed(2)} puan indirmiştir.`
        : `The Committee has cut the policy rate by ${rateChange.toFixed(2)} percentage points.`;
    }
    
    if (newInfl[nextIdx] > 10) {
      pressStatement += isTr
        ? ` Enflasyon ${newInfl[nextIdx].toFixed(1)}% ile yüksek seyretmektedir.`
        : ` Inflation remains elevated at ${newInfl[nextIdx].toFixed(1)}%.`;
    } else if (newUnemp[nextIdx] > 10) {
      pressStatement += isTr
        ? ` İşsizlik ${newUnemp[nextIdx].toFixed(1)}% ile endişe verici seviyededir.`
        : ` Unemployment is concerning at ${newUnemp[nextIdx].toFixed(1)}%.`;
    }
    
    // Game over check
    let gameOver = false;
    let gameResult = '';
    if (newMonth >= state.maxMonths) {
      gameOver = true;
      const inflDev = state.infl.slice(1, newMonth + 1).reduce((s, v) => s + Math.abs(v - 5), 0) / newMonth;
      const unempDev = state.unemp.slice(1, newMonth + 1).reduce((s, v) => s + Math.abs(v - 8), 0) / newMonth;
      const score = inflDev * 1.5 + unempDev;
      const threshold = state.difficulty === 'hard' ? 2.0 : state.difficulty === 'medium' ? 2.5 : 3.25;
      
      const t = translations[state.language];
      if (score <= threshold && newCred >= 60) {
        gameResult = t.hired;
      } else {
        gameResult = t.fired;
      }
    }
    
    set({
      month: newMonth,
      infl: newInfl,
      unemp: newUnemp,
      interest: newInterest,
      gdpGrowth: newGdp,
      inflationExpectations: newExpectations,
      currentShock,
      shockNews,
      shockDesc,
      shockCount,
      nextShockMonth,
      shockKeysUsed,
      shockHistory,
      lastDecision,
      lastRateChange: rateChange,
      credibility: newCred,
      policyBuffer: newBuffer,
      pressTitle,
      pressStatement,
      publicApproval: newApproval,
      gameOver,
      gameResult,
    });
    
    get().updateAdvisors();
  },
  
  applyAdvisor: (index) => {
    const state = get();
    const advisor = state.advisorOptions[index];
    if (!advisor) return;
    
    const snappedRate = Math.round(advisor.rate / 0.25) * 0.25;
    const slot = `opt${index + 1}` as 'opt1' | 'opt2' | 'opt3';
    
    set({
      selectedRate: snappedRate,
      pressStatement: advisor.press.replace('%.2f', snappedRate.toFixed(2)),
      lastApplied: { ...state.lastApplied, [slot]: state.month },
    });
  },
  
  fireAdvisor: (index) => {
    const state = get();
    const slot = `opt${index + 1}` as 'opt1' | 'opt2' | 'opt3';
    
    set({
      firedAdvisors: { ...state.firedAdvisors, [slot]: true },
      emptySince: { ...state.emptySince, [slot]: state.month },
      credibility: Math.max(30, state.credibility - 10),
      shockNews: state.language === 'tr' ? 'Basın: Danışman kovuldu!' : 'Media: Advisor dismissed!',
    });
  },
  
  resetGame: () => {
    const cfg = regionDefaults[get().region];
    set({
      month: 0,
      gameOver: false,
      gameResult: '',
      infl: [cfg.init_pi, ...Array(TOTAL_PERIODS).fill(0)],
      unemp: [cfg.init_u, ...Array(TOTAL_PERIODS).fill(0)],
      interest: [cfg.init_r, ...Array(TOTAL_PERIODS).fill(0)],
      gdpGrowth: [2.5, ...Array(TOTAL_PERIODS).fill(0)],
      inflationExpectations: [cfg.init_pi * 0.8, ...Array(TOTAL_PERIODS).fill(0)],
      currentShock: null,
      shockNews: '',
      shockDesc: '',
      shockCount: 0,
      nextShockMonth: Math.floor(Math.random() * 4) + 3,
      shockKeysUsed: [],
      shockHistory: [],
      lastDecision: 'maintain',
      lastRateChange: 0,
      credibility: 100,
      policyBuffer: [],
      pressTitle: '',
      pressStatement: '',
      publicApproval: 75,
      selectedRate: cfg.init_r,
      firedAdvisors: { opt1: false, opt2: false, opt3: false },
      emptySince: { opt1: null, opt2: null, opt3: null },
      lastApplied: { opt1: null, opt2: null, opt3: null },
    });
    get().updateAdvisors();
  },
  
  updateAdvisors: () => {
    const state = get();
    const currIdx = state.month;
    const advisors = generateAdvisors(
      state.infl[currIdx],
      state.unemp[currIdx],
      state.interest[currIdx],
      state.piStar,
      state.uStar,
      state.rStar,
      state.currentShock,
      state.language,
      state.month,
      state.inflationExpectations[currIdx],
      state.gdpGrowth[currIdx],
      state.credibility
    );
    
    // Handle fired advisors
    const newAdvisors = advisors.map((adv, idx) => {
      const slot = `opt${idx + 1}` as 'opt1' | 'opt2' | 'opt3';
      if (state.firedAdvisors[slot]) {
        const emptyMonth = state.emptySince[slot];
        if (emptyMonth !== null && state.month - emptyMonth >= 4) {
          return {
            ...adv,
            name: state.language === 'tr' ? `Yeni ${adv.name}` : `New ${adv.name}`,
            rate: Math.round((adv.rate + (Math.random() * 2 - 1)) / 0.25) * 0.25,
          };
        }
        return {
          name: state.language === 'tr' ? '—Boş Koltuk—' : '—Vacant Seat—',
          rate: state.interest[currIdx],
          rationale: state.language === 'tr' ? 'Bu danışman görevden alındı.' : 'This advisor was dismissed.',
          press: '',
          philosophy: '',
          bias: adv.bias,
          confidence: 0,
        };
      }
      return adv;
    });
    
    const newFired = { ...state.firedAdvisors };
    const newEmpty = { ...state.emptySince };
    newAdvisors.forEach((adv, idx) => {
      const slot = `opt${idx + 1}` as 'opt1' | 'opt2' | 'opt3';
      if (state.firedAdvisors[slot] && state.emptySince[slot] !== null && state.month - (state.emptySince[slot] || 0) >= 4) {
        newFired[slot] = false;
        newEmpty[slot] = null;
      }
    });
    
    set({
      advisorOptions: newAdvisors,
      firedAdvisors: newFired,
      emptySince: newEmpty,
    });
  },
}));

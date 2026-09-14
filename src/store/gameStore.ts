import { create } from 'zustand';
import { type Language, translations } from '../data/translations';
import { Shock, createNewShock, updateShock } from '../data/shocks';

export interface AdvisorOption {
  name: string;
  rate: number;
  rationale: string;
  press: string;
  bias: 'balancer' | 'dove' | 'hawk';
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
}

export const regionDefaults: Record<string, RegionConfig> = {
  "Türkiye": { pi_star: 5, u_star: 8, r_star: 3, init_pi: 12, init_u: 8, init_r: 12 },
  "United States": { pi_star: 2, u_star: 4, r_star: 0.5, init_pi: 5, init_u: 4.2, init_r: 4.5 },
  "Euro Area": { pi_star: 2, u_star: 6.5, r_star: 0, init_pi: 2.5, init_u: 6.7, init_r: 2.5 },
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
  
  // Economic indicators (arrays indexed by month)
  infl: number[];
  unemp: number[];
  interest: number[];
  gdpGrowth: number[];
  
  // Region targets
  piStar: number;
  uStar: number;
  rStar: number;
  
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
  shock: Shock | null, language: Language, month: number
): AdvisorOption[] {
  const taylorMult = (infl < piStar || unemp > 15) ? 0.5 : 1;
  const inflGap = infl - piStar;
  const outputGap = 0.5 * (uStar - unemp);
  
  const baseRate = rStar + infl + 0.6 * taylorMult * inflGap + 0.4 * taylorMult * outputGap;
  const optRate = Math.round(baseRate / 0.25) * 0.25;
  
  const shockActive = shock !== null;
  const doveStep = unemp > 12 ? 0.75 : (shockActive && shock.inflEffect < 0) ? 0.50 : 0.40;
  const hawkStep = infl > 10 ? 0.75 : (shockActive && shock.inflEffect > 0) ? 0.60 : 0.50;
  
  const balRate = Math.max(0, optRate);
  const dovRate = Math.max(0, Math.round((optRate - doveStep) / 0.25) * 0.25);
  const hawRate = Math.max(0, Math.round((optRate + hawkStep) / 0.25) * 0.25);
  
  const t = translations[language];
  const shockNote = shockActive
    ? (language === 'tr' ? shock.headline_tr : shock.headline)
    : '';
  
  return [
    {
      name: "Dr. Selim Kaya",
      rate: balRate,
      rationale: language === 'tr'
        ? `İç modelimiz %.2f%% optimal; enflasyon %.1f%%, işsizlik %.1f%%. ${shockNote}`
        : `Our framework calls for %.2f%%; inflation at %.1f%%, unemployment at %.1f%%. ${shockNote}`,
      press: language === 'tr'
        ? `Ay ${month + 1}: faiz %.2f%% sabit—denge korunuyor.`
        : `Month ${month + 1}: rate held at %.2f%%—balance maintained.`,
      bias: 'balancer',
    },
    {
      name: "Dr. Aylin Demir",
      rate: dovRate,
      rationale: language === 'tr'
        ? `İşsizlik %.1f%%; hane halkı riski var. İndirim öneriyorum: %.2f%%. ${shockNote}`
        : `Unemployment at %.1f%% creating household strains. Cut recommended: %.2f%%. ${shockNote}`,
      press: language === 'tr'
        ? `Ay ${month + 1}: faiz %.2f%%'e indirildi—istihdam önceliğinde.`
        : `Month ${month + 1}: cut to %.2f%%—prioritizing jobs.`,
      bias: 'dove',
    },
    {
      name: language === 'tr' ? "Dr. Murat Gür" : "Dr. Murat Gur",
      rate: hawRate,
      rationale: language === 'tr'
        ? `Enflasyon %.1f%%; fiyat baskıları artıyor. Artır: %.2f%%. ${shockNote}`
        : `Inflation at %.1f%%; rising pressures. Hike recommended: %.2f%%. ${shockNote}`,
      press: language === 'tr'
        ? `Ay ${month + 1}: faiz %.2f%%'e yükseltildi—enflasyona net tepki.`
        : `Month ${month + 1}: raised to %.2f%%—firm response to inflation.`,
      bias: 'hawk',
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
  
  piStar: 5,
  uStar: 8,
  rStar: 3,
  
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
      newInfl[0] = cfg.init_pi;
      newUnemp[0] = cfg.init_u;
      newInterest[0] = cfg.init_r;
      set({
        region,
        piStar: cfg.pi_star,
        uStar: cfg.u_star,
        rStar: cfg.r_star,
        infl: newInfl,
        unemp: newUnemp,
        interest: newInterest,
        selectedRate: cfg.init_r,
      });
    } else {
      set({ region });
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
    const currIdx = curr;
    const nextIdx = curr + 1;
    
    const iChosen = state.selectedRate;
    const piT = state.infl[currIdx];
    const uT = state.unemp[currIdx];
    const { rStar, piStar, uStar } = state;
    
    // Decision info
    const rateChange = Math.abs(iChosen - state.interest[currIdx]);
    let lastDecision = 'maintain';
    if (iChosen > state.interest[currIdx]) lastDecision = 'increase';
    else if (iChosen < state.interest[currIdx]) lastDecision = 'decrease';
    
    // Taylor rule optimal rate
    const taylorMult = (piT < 0 || uT > 15) ? 0.5 : 1;
    const outputGap = (uStar - uT) * 1.0;
    const iOpt = rStar + 1.5 * taylorMult * piT - 0.5 * taylorMult * piStar + 1.0 * taylorMult * outputGap;
    const diff = iChosen - iOpt;
    
    // Credibility
    let newCred = state.credibility;
    if (curr > 0) {
      if (rateChange > 2) newCred = Math.max(30, newCred - 15);
      else if (lastDecision === 'maintain') newCred = Math.min(100, newCred + 5);
    }
    
    // Policy buffer
    let newBuffer = [...state.policyBuffer.map(b => ({ ...b, effect: b.effect - 1 }))];
    const dueItems = newBuffer.filter(b => b.effect <= 0);
    const delayedEffect = dueItems.reduce((sum, b) => sum + b.rate, 0);
    newBuffer = newBuffer.filter(b => b.effect > 0);
    newBuffer.push({ rate: diff, effect: 2 });
    
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
    
    // Economic effects
    const shockInf = currentShock ? currentShock.inflEffect * currentShock.mag : 0;
    const shockUnemp = currentShock ? currentShock.unempEffect * currentShock.mag : 0;
    const shockGdp = currentShock ? currentShock.gdpEffect * currentShock.mag : 0;
    
    const credMult = 0.5 + (newCred / 200);
    const kInf = 0.35 * credMult;
    const kUnemp = 0.25 * (1 - 0.04 * Math.min(8, uT)) * credMult;
    const kGdp = 0.30;
    
    const epsInf = (Math.random() - 0.5) * 0.2;
    const epsUnemp = (Math.random() - 0.5) * 0.16;
    const epsGdp = (Math.random() - 0.5) * 0.3;
    
    const gap = piStar - piT;
    const revert = 0.15 * gap;
    
    const newInfl = [...state.infl];
    const newUnemp = [...state.unemp];
    const newInterest = [...state.interest];
    const newGdp = [...state.gdpGrowth];
    
    newInterest[nextIdx] = iChosen;
    newInfl[nextIdx] = Math.max(-2, Math.min(40,
      piT + revert + (-kInf * totalEffect) + shockInf + epsInf
    ));
    const phillipsEffect = -0.3 * (newInfl[nextIdx] - piT);
    newUnemp[nextIdx] = Math.max(3, Math.min(25,
      0.90 * uT + 0.10 * uStar + (-kUnemp * totalEffect) + shockUnemp + phillipsEffect + epsUnemp
    ));
    newGdp[nextIdx] = Math.max(-10, Math.min(15,
      0.7 * state.gdpGrowth[currIdx] + 0.3 * 3.0 + (kGdp * totalEffect) + shockGdp + epsGdp
    ));
    
    const newMonth = curr + 1;
    
    // Press statement
    const t = translations[state.language];
    let pressTitle = '';
    let pressStatement = '';
    if (lastDecision === 'maintain') {
      pressTitle = state.language === 'tr'
        ? `Para Politikası Kurulu ${newMonth}. Toplantı Kararı`
        : `Monetary Policy Committee Meeting ${newMonth} Decision`;
      pressStatement = state.language === 'tr'
        ? 'Kurul politika faizini sabit tutmaya karar vermiştir.'
        : 'The Committee has decided to maintain the policy rate.';
    } else if (lastDecision === 'increase') {
      pressTitle = state.language === 'tr'
        ? `Para Politikası Kurulu ${newMonth}. Toplantı Kararı`
        : `Monetary Policy Committee Meeting ${newMonth} Decision`;
      pressStatement = state.language === 'tr'
        ? `Kurul politika faizini ${rateChange.toFixed(2)} puan artırmıştır.`
        : `The Committee has raised the policy rate by ${rateChange.toFixed(2)} percentage points.`;
    } else {
      pressTitle = state.language === 'tr'
        ? `Para Politikası Kurulu ${newMonth}. Toplantı Kararı`
        : `Monetary Policy Committee Meeting ${newMonth} Decision`;
      pressStatement = state.language === 'tr'
        ? `Kurul politika faizini ${rateChange.toFixed(2)} puan indirmiştir.`
        : `The Committee has cut the policy rate by ${rateChange.toFixed(2)} percentage points.`;
    }
    
    if (newInfl[nextIdx] > 10) {
      pressStatement += state.language === 'tr'
        ? ` Enflasyon ${newInfl[nextIdx].toFixed(1)}% ile yüksek seyretmektedir.`
        : ` Inflation remains elevated at ${newInfl[nextIdx].toFixed(1)}%.`;
    } else if (newUnemp[nextIdx] > 10) {
      pressStatement += state.language === 'tr'
        ? ` İşsizlik ${newUnemp[nextIdx].toFixed(1)}% ile endişe verici seviyededir.`
        : ` Unemployment is concerning at ${newUnemp[nextIdx].toFixed(1)}%.`;
    }
    
    // Game over check
    let gameOver = false;
    let gameResult = '';
    if (newMonth >= state.maxMonths) {
      gameOver = true;
      const inflDev = state.infl.slice(1, newMonth + 2).reduce((s, v) => s + Math.abs(v - 5), 0) / newMonth;
      const unempDev = state.unemp.slice(1, newMonth + 2).reduce((s, v) => s + Math.abs(v - 8), 0) / newMonth;
      const score = inflDev * 1.5 + unempDev;
      const threshold = state.difficulty === 'hard' ? 2.0 : state.difficulty === 'medium' ? 2.5 : 3.25;
      
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
      state.month
    );
    
    // Handle fired advisors
    const newAdvisors = advisors.map((adv, idx) => {
      const slot = `opt${idx + 1}` as 'opt1' | 'opt2' | 'opt3';
      if (state.firedAdvisors[slot]) {
        const emptyMonth = state.emptySince[slot];
        if (emptyMonth !== null && state.month - emptyMonth >= 4) {
          // Respawn
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
          bias: adv.bias,
        };
      }
      return adv;
    });
    
    // Reset fired status for respawned advisors
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

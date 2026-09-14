import { useState } from 'react';
import { useGameStore, regionDefaults } from '../store/gameStore';
import { translations } from '../data/translations';
import { X, Mic, Send, ChevronRight, ThumbsUp, ThumbsDown } from 'lucide-react';

interface PressQuestion {
  reporter: string;
  media: string;
  text: string;
  topic: 'inflation' | 'unemployment' | 'credibility' | 'growth' | 'shock';
}

function generateQuestions(
  language: string, 
  infl: number, unemp: number, cred: number, 
  lastDecision: string, region: string,
  gdpGrowth: number, inflationExpectations: number,
  currentShock: any
): PressQuestion[] {
  const isTr = language === 'tr';
  
  // Country-specific reporters and media
  const reportersByCountry: Record<string, string[]> = {
    "Türkiye": ['Ayşe Yılmaz', 'Mehmet Demir', 'Fatma Kaya', 'Ahmet Şahin', 'Zeynep Çelik'],
    "United States": ['Alice Smith', 'Bob Johnson', 'Clara Brown', 'David Wilson', 'Emma Taylor'],
    "Euro Area": ['Hans Mueller', 'Marie Dupont', 'Marco Rossi', 'Sofia Garcia', 'Jan de Vries'],
  };
  
  const mediaByCountry: Record<string, string[]> = {
    "Türkiye": ['Hürriyet', 'BloombergHT', 'CNNTürk', 'Ekonomist', 'Dünya'],
    "United States": ['Reuters', 'Bloomberg', 'Financial Times', 'CNBC', 'Wall Street Journal'],
    "Euro Area": ['Reuters', 'Financial Times', 'Handelsblatt', 'Les Echos', 'Il Sole 24 Ore'],
  };
  
  const reporters = reportersByCountry[region] || reportersByCountry["United States"];
  const media = mediaByCountry[region] || mediaByCountry["United States"];
  
  const questions: PressQuestion[] = [];
  
  // Q1: About current inflation situation (country-specific framing)
  const inflAboveTarget = infl > (regionDefaults[region]?.pi_star || 5);
  if (region === "Türkiye") {
    questions.push({
      reporter: reporters[Math.floor(Math.random() * reporters.length)],
      media: media[Math.floor(Math.random() * media.length)],
      text: isTr
        ? `Enflasyon ${infl.toFixed(1)}% seviyesinde. Halk alım gücünün eridiğini söylüyor. Faiz kararınızı nasıl gerekçendiriyorsunuz?`
        : `Inflation is at ${infl.toFixed(1)}%. The public says purchasing power is eroding. How do you justify your rate decision?`,
      topic: 'inflation',
    });
  } else if (region === "United States") {
    questions.push({
      reporter: reporters[Math.floor(Math.random() * reporters.length)],
      media: media[Math.floor(Math.random() * media.length)],
      text: isTr
        ? `Fed'in çift mandate'ü kapsamında, enflasyon ${infl.toFixed(1)}% ile hedefin ${inflAboveTarget ? 'üzerinde' : 'altında'}. Politika duruşunuzu açıklayabilir misiniz?`
        : `Under the Fed's dual mandate, inflation at ${infl.toFixed(1)}% is ${inflAboveTarget ? 'above' : 'below'} target. Can you explain your policy stance?`,
      topic: 'inflation',
    });
  } else {
    questions.push({
      reporter: reporters[Math.floor(Math.random() * reporters.length)],
      media: media[Math.floor(Math.random() * media.length)],
      text: isTr
        ? `ECB'nin fiyat istikrarı mandate'i çerçevesinde, enflasyon ${infl.toFixed(1)}%. Euro Bölgesi genelinde durumu nasıl değerlendiriyorsunuz?`
        : `Under the ECB's price stability mandate, inflation is at ${infl.toFixed(1)}%. How do you assess the situation across the Euro Area?`,
      topic: 'inflation',
    });
  }
  
  // Q2: About unemployment/growth (depends on situation)
  if (unemp > 10) {
    questions.push({
      reporter: reporters[Math.floor(Math.random() * reporters.length)],
      media: media[Math.floor(Math.random() * media.length)],
      text: isTr
        ? `İşsizlik ${unemp.toFixed(1)}% ile çok yüksek. Vatandaşlar iş bulamıyor. Para politikanız istihdamı nasıl destekleyecek?`
        : `Unemployment is very high at ${unemp.toFixed(1)}%. Citizens can't find jobs. How will your monetary policy support employment?`,
      topic: 'unemployment',
    });
  } else if (gdpGrowth < 2) {
    questions.push({
      reporter: reporters[Math.floor(Math.random() * reporters.length)],
      media: media[Math.floor(Math.random() * media.length)],
      text: isTr
        ? `GSYİH büyümesi sadece ${gdpGrowth.toFixed(1)}%. Resesyon riski var. Büyümeyi canlandırmak için ne yapacaksınız?`
        : `GDP growth is only ${gdpGrowth.toFixed(1)}%. There's a recession risk. What will you do to stimulate growth?`,
      topic: 'growth',
    });
  } else {
    questions.push({
      reporter: reporters[Math.floor(Math.random() * reporters.length)],
      media: media[Math.floor(Math.random() * media.length)],
      text: isTr
        ? `Enflasyon beklentileri ${inflationExpectations.toFixed(1)}% seviyesinde. Beklenti çıpalamanız hakkında ne söyleyebilirsiniz?`
        : `Inflation expectations are at ${inflationExpectations.toFixed(1)}%. What can you tell us about your expectations anchoring?`,
      topic: 'credibility',
    });
  }
  
  // Q3: About credibility or shock response
  if (cred < 50) {
    questions.push({
      reporter: reporters[Math.floor(Math.random() * reporters.length)],
      media: media[Math.floor(Math.random() * media.length)],
      text: isTr
        ? `Piyasalar ve halk güvenilirliğinizi sorguluyor. ${cred.toFixed(0)}% güvenilirlik puanınız var. Güveni nasıl yeniden tesis edeceksiniz?`
        : `Markets and the public are questioning your credibility. You have a ${cred.toFixed(0)}% credibility score. How will you restore confidence?`,
      topic: 'credibility',
    });
  } else if (currentShock) {
    const shockHeadline = isTr ? currentShock.headline_tr : currentShock.headline;
    questions.push({
      reporter: reporters[Math.floor(Math.random() * reporters.length)],
      media: media[Math.floor(Math.random() * media.length)],
      text: isTr
        ? `"${shockHeadline}" - Bu şok karşısında para politikanız nasıl şekillenecek? Halk endişeli.`
        : `"${shockHeadline}" - How will your monetary policy respond to this shock? The public is worried.`,
      topic: 'shock',
    });
  } else {
    questions.push({
      reporter: reporters[Math.floor(Math.random() * reporters.length)],
      media: media[Math.floor(Math.random() * media.length)],
      text: isTr
        ? `Önümüzdeki dönem için para politikası yol haritanız nedir? Piyasalar ne beklemeli?`
        : `What is your monetary policy roadmap for the coming period? What should markets expect?`,
      topic: 'credibility',
    });
  }
  
  return questions;
}

function evaluateResponse(
  response: string, 
  question: PressQuestion, 
  language: string,
  region: string,
  infl: number,
  unemp: number,
  piStar: number,
  uStar: number
): { score: number; feedback: string[]; publicReaction: 'positive' | 'mixed' | 'negative' } {
  let score = 0;
  const feedback: string[] = [];
  const isTr = language === 'tr';
  const words = response.trim().split(/\s+/).filter(w => w.length > 0);
  
  // Length check
  if (words.length >= 30) score += 20;
  else if (words.length >= 15) { score += 12; feedback.push(isTr ? 'Yanıtınız biraz daha detaylı olabilir.' : 'Your response could be more detailed.'); }
  else feedback.push(isTr ? 'Yanıtınız çok kısa.' : 'Your response is too short.');
  
  // Relevance check - topic-specific keywords
  const topicKeywords: Record<string, string[]> = {
    inflation: isTr ? ['enflasyon', 'fiyat', 'alım gücü', 'maliyet'] : ['inflation', 'price', 'purchasing', 'cost'],
    unemployment: isTr ? ['işsizlik', 'istihdam', 'iş', 'işgücü'] : ['unemployment', 'employment', 'jobs', 'labor'],
    credibility: isTr ? ['güven', 'güvenilirlik', 'bağlılık', 'şeffaf'] : ['confidence', 'credibility', 'commitment', 'transparent'],
    growth: isTr ? ['büyüme', 'GSYİH', 'yatırım', 'üretim'] : ['growth', 'GDP', 'investment', 'production'],
    shock: isTr ? ['şok', 'müdahale', 'istikrar', 'tedbir'] : ['shock', 'intervention', 'stability', 'measure'],
  };
  
  const rLower = response.toLowerCase();
  const relevantKeywords = topicKeywords[question.topic] || topicKeywords.inflation;
  const hasRelevantKeyword = relevantKeywords.some(kw => rLower.includes(kw));
  
  if (hasRelevantKeyword) score += 25;
  else feedback.push(isTr ? 'Sorunun konusuna daha fazla odaklanın.' : 'Focus more on the question topic.');
  
  // Confidence/assertiveness check
  if (response.includes('!') || /\b(commit|firm|determined|kararlı|kesin|confident|emin)\b/i.test(response)) {
    score += 20;
  } else {
    feedback.push(isTr ? 'Daha kararlı bir ton kullanın.' : 'Use a more assertive tone.');
  }
  
  // Data usage check
  if (/\d/.test(response)) score += 20;
  else feedback.push(isTr ? 'Veri ve rakam kullanın.' : 'Use data and figures.');
  
  // Empathy check (important for public approval)
  const empathyWords = isTr 
    ? ['halk', 'vatandaş', 'anlıyoruz', 'farkındayız', 'endişe'] 
    : ['people', 'citizens', 'understand', 'aware', 'concern'];
  const hasEmpathy = empathyWords.some(w => rLower.includes(w));
  if (hasEmpathy) score += 15;
  else feedback.push(isTr ? 'Halkın endişelerini daha fazla dikkate alın.' : 'Acknowledge public concerns more.');
  
  // PUBLIC REACTION based on country sentiment
  const config = regionDefaults[region];
  let publicReaction: 'positive' | 'mixed' | 'negative';
  
  if (score >= 70) {
    publicReaction = 'positive';
  } else if (score >= 45) {
    publicReaction = 'mixed';
  } else {
    publicReaction = 'negative';
  }
  
  // Country-specific public reaction modifier
  if (config?.public_sentiment === 'hawkish' && infl > piStar) {
    // Turkish public is very inflation-sensitive
    if (question.topic === 'inflation' && score < 60) {
      publicReaction = 'negative';
      feedback.push(isTr ? 'Halk enflasyon konusunda çok hassas - daha ikna edici olun.' : 'The public is very sensitive about inflation - be more convincing.');
    }
  } else if (config?.public_sentiment === 'dovish' && unemp > uStar) {
    // European public cares more about employment
    if (question.topic === 'unemployment' && score < 60) {
      publicReaction = 'negative';
      feedback.push(isTr ? 'Kamuoyu istihdam konusunda endişeli - daha fazla empati gösterin.' : 'The public is concerned about employment - show more empathy.');
    }
  }
  
  return { score, feedback, publicReaction };
}

export function PressConferenceModal() {
  const { 
    language, showPressConference, setShowPressConference, 
    infl, unemp, credibility, month, lastDecision, region,
    gdpGrowth, inflationExpectations, currentShock, piStar, uStar,
    publicApproval
  } = useGameStore();
  const t = translations[language];
  
  const [questions, setQuestions] = useState<PressQuestion[]>(() => 
    generateQuestions(language, infl[month], unemp[month], credibility, lastDecision, region, gdpGrowth[month], inflationExpectations[month], currentShock)
  );
  const [currentQ, setCurrentQ] = useState(0);
  const [response, setResponse] = useState('');
  const [lastResult, setLastResult] = useState<{ score: number; feedback: string[]; publicReaction: 'positive' | 'mixed' | 'negative' } | null>(null);
  const [totalScore, setTotalScore] = useState(0);
  const [answered, setAnswered] = useState(0);

  const handleSubmit = () => {
    if (!response.trim()) return;
    
    const evaluation = evaluateResponse(response, questions[currentQ], language, region, infl[month], unemp[month], piStar, uStar);
    setLastResult(evaluation);
    setTotalScore(prev => prev + evaluation.score);
    setAnswered(prev => prev + 1);
    
    // Update credibility and public approval based on response
    const credChange = Math.round(evaluation.score / 100 * 8);
    const approvalChange = evaluation.publicReaction === 'positive' ? 5 : evaluation.publicReaction === 'mixed' ? 0 : -5;
    
    useGameStore.setState(state => ({
      credibility: Math.min(100, Math.max(30, state.credibility + credChange)),
      publicApproval: Math.min(100, Math.max(0, state.publicApproval + approvalChange)),
    }));
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(prev => prev + 1);
      setResponse('');
      setLastResult(null);
    }
  };

  const handleClose = () => {
    setShowPressConference(false);
  };

  if (!showPressConference) return null;

  const question = questions[currentQ];
  const isLast = currentQ >= questions.length - 1;
  const isTr = language === 'tr';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Mic size={20} className="text-purple-400" />
            {t.pressConference}
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">
              {currentQ + 1}/{questions.length}
            </span>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Question */}
          <div className="bg-slate-700/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full">
                {question.reporter}
              </span>
              <span className="text-xs text-slate-500">{question.media}</span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">
              {question.text}
            </p>
          </div>

          {/* Response Input */}
          <div>
            <label className="text-xs text-slate-400 mb-1 block">{t.yourResponse}</label>
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              rows={4}
              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
              placeholder={isTr ? 'Yanıtınızı buraya yazın...' : 'Type your response here...'}
            />
          </div>

          {/* Score Feedback */}
          {lastResult && (
            <div className="bg-slate-700/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-400">{t.scoreLabel}</span>
                <span className={`text-lg font-bold ${
                  lastResult.score >= 75 ? 'text-emerald-400' :
                  lastResult.score >= 50 ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {lastResult.score}/100
                </span>
              </div>
              
              {/* Public Reaction */}
              <div className="flex items-center gap-2 mb-3 bg-slate-800/50 rounded-lg p-2">
                {lastResult.publicReaction === 'positive' && (
                  <>
                    <ThumbsUp size={16} className="text-emerald-400" />
                    <span className="text-xs text-emerald-300">
                      {isTr ? 'Halk olumlu tepki verdi' : 'Public reacted positively'}
                    </span>
                  </>
                )}
                {lastResult.publicReaction === 'mixed' && (
                  <>
                    <span className="text-xs text-amber-300">
                      {isTr ? '🤔 Halk karışık tepki verdi' : '🤔 Public had mixed reactions'}
                    </span>
                  </>
                )}
                {lastResult.publicReaction === 'negative' && (
                  <>
                    <ThumbsDown size={16} className="text-red-400" />
                    <span className="text-xs text-red-300">
                      {isTr ? 'Halk olumsuz tepki verdi' : 'Public reacted negatively'}
                    </span>
                  </>
                )}
              </div>
              
              {lastResult.feedback.length > 0 && (
                <ul className="space-y-1">
                  {lastResult.feedback.map((fb, i) => (
                    <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                      <span className="text-amber-400 mt-0.5">•</span>
                      {fb}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Fixed Footer Actions */}
        <div className="p-4 border-t border-slate-700 flex-shrink-0">
          <div className="flex gap-3">
            {!lastResult ? (
              <button
                onClick={handleSubmit}
                disabled={!response.trim()}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-medium text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Send size={14} />
                {t.submit}
              </button>
            ) : !isLast ? (
              <button
                onClick={handleNext}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-medium text-sm transition-all flex items-center justify-center gap-2"
              >
                {t.next}
                <ChevronRight size={14} />
              </button>
            ) : (
              <button
                onClick={handleClose}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-medium text-sm transition-all"
              >
                {t.endPress}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

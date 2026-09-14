import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { translations } from '../data/translations';
import { X, Mic, Send, ChevronRight } from 'lucide-react';

interface PressQuestion {
  reporter: string;
  media: string;
  text: string;
}

function generateQuestions(language: string, infl: number, unemp: number, cred: number, lastDecision: string): PressQuestion[] {
  const reporters = language === 'tr'
    ? ['Ayşe Yılmaz', 'Mehmet Demir', 'Fatma Kaya', 'Ahmet Şahin']
    : ['Alice Smith', 'Bob Johnson', 'Clara Brown', 'David Wilson'];
  const media = language === 'tr'
    ? ['Hürriyet', 'BloombergHT', 'CNNTürk', 'Ekonomist']
    : ['Reuters', 'Bloomberg', 'Financial Times', 'CNBC'];

  const questions: PressQuestion[] = [];

  // Q1: About inflation
  questions.push({
    reporter: reporters[Math.floor(Math.random() * reporters.length)],
    media: media[Math.floor(Math.random() * media.length)],
    text: language === 'tr'
      ? `Enflasyon şu anda ${infl.toFixed(1)}%. Politika faizini ${lastDecision === 'increase' ? 'artırdınız' : lastDecision === 'decrease' ? 'düşürdünüz' : 'sabit tuttunuz'}. Bu kararı nasıl açıklıyorsunuz?`
      : `Inflation is currently at ${infl.toFixed(1)}%. You've ${lastDecision === 'increase' ? 'raised' : lastDecision === 'decrease' ? 'cut' : 'maintained'} the policy rate. How do you justify this decision?`,
  });

  // Q2: About unemployment or currency
  if (unemp > 10) {
    questions.push({
      reporter: reporters[Math.floor(Math.random() * reporters.length)],
      media: media[Math.floor(Math.random() * media.length)],
      text: language === 'tr'
        ? `İşsizlik ${unemp.toFixed(1)}% ile yüksek. İşsizliğin düşürülmesi için ne yapacaksınız?`
        : `Unemployment is high at ${unemp.toFixed(1)}%. What will you do to reduce unemployment?`,
    });
  } else {
    questions.push({
      reporter: reporters[Math.floor(Math.random() * reporters.length)],
      media: media[Math.floor(Math.random() * media.length)],
      text: language === 'tr'
        ? 'Önümüzdeki dönem için para politikası yol haritanız nedir?'
        : 'What is your monetary policy roadmap for the coming period?',
    });
  }

  // Q3: About credibility
  if (cred < 50) {
    questions.push({
      reporter: reporters[Math.floor(Math.random() * reporters.length)],
      media: media[Math.floor(Math.random() * media.length)],
      text: language === 'tr'
        ? 'Piyasalar güvenilirliğini sorguluyor. Güveni nasıl yeniden tesis edeceksiniz?'
        : 'Markets are questioning your credibility. How will you restore confidence?',
    });
  } else {
    questions.push({
      reporter: reporters[Math.floor(Math.random() * reporters.length)],
      media: media[Math.floor(Math.random() * media.length)],
      text: language === 'tr'
        ? `Güvenilirlik puanınız ${cred.toFixed(0)}. Bu seviyeden memnun musunuz?`
        : `Your credibility score is ${cred.toFixed(0)}. Are you satisfied with this level?`,
    });
  }

  return questions;
}

function evaluateResponse(response: string, question: string, language: string): { score: number; feedback: string[] } {
  let score = 0;
  const feedback: string[] = [];
  const words = response.trim().split(/\s+/).filter(w => w.length > 0);

  // Length check
  if (words.length >= 30) score += 25;
  else if (words.length >= 15) { score += 15; feedback.push(language === 'tr' ? 'Yanıtınız biraz daha detaylı olabilir.' : 'Your response could be more detailed.'); }
  else feedback.push(language === 'tr' ? 'Yanıtınız çok kısa.' : 'Your response is too short.');

  // Relevance check
  const qLower = question.toLowerCase();
  const rLower = response.toLowerCase();
  const keywords = language === 'tr'
    ? ['enflasyon', 'işsizlik', 'faiz', 'ekonomi', 'politika', 'güven', 'büyüme']
    : ['inflation', 'unemployment', 'rate', 'economy', 'policy', 'confidence', 'growth'];
  
  const hasRelevantKeyword = keywords.some(kw => rLower.includes(kw));
  if (hasRelevantKeyword) score += 25;
  else feedback.push(language === 'tr' ? 'Ekonomik terimler kullanmaya çalışın.' : 'Try using economic terminology.');

  // Confidence check
  if (response.includes('!') || /\b(commit|firm|determined|kararlı|kesin)\b/i.test(response)) {
    score += 25;
  } else {
    feedback.push(language === 'tr' ? 'Daha kararlı bir ton kullanın.' : 'Use a more assertive tone.');
  }

  // Data check
  if (/\d/.test(response)) score += 25;
  else feedback.push(language === 'tr' ? 'Veri ve rakam kullanın.' : 'Use data and figures.');

  return { score, feedback };
}

export function PressConferenceModal() {
  const { language, showPressConference, setShowPressConference, infl, unemp, credibility, month, lastDecision } = useGameStore();
  const t = translations[language];
  
  const [questions, setQuestions] = useState<PressQuestion[]>(() => 
    generateQuestions(language, infl[month], unemp[month], credibility, lastDecision)
  );
  const [currentQ, setCurrentQ] = useState(0);
  const [response, setResponse] = useState('');
  const [lastScore, setLastScore] = useState<{ score: number; feedback: string[] } | null>(null);
  const [totalScore, setTotalScore] = useState(0);
  const [answered, setAnswered] = useState(0);

  const handleSubmit = () => {
    if (!response.trim()) return;
    
    const evaluation = evaluateResponse(response, questions[currentQ].text, language);
    setLastScore(evaluation);
    setTotalScore(prev => prev + evaluation.score);
    setAnswered(prev => prev + 1);
    
    // Update credibility in store
    const credChange = Math.round(evaluation.score / 100 * 10);
    useGameStore.setState(state => ({
      credibility: Math.min(100, Math.max(30, state.credibility + credChange))
    }));
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(prev => prev + 1);
      setResponse('');
      setLastScore(null);
    }
  };

  const handleClose = () => {
    setShowPressConference(false);
  };

  if (!showPressConference) return null;

  const question = questions[currentQ];
  const isLast = currentQ >= questions.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
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
              placeholder={language === 'tr' ? 'Yanıtınızı buraya yazın...' : 'Type your response here...'}
            />
          </div>

          {/* Score Feedback */}
          {lastScore && (
            <div className="bg-slate-700/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-400">{t.scoreLabel}</span>
                <span className={`text-lg font-bold ${
                  lastScore.score >= 75 ? 'text-emerald-400' :
                  lastScore.score >= 50 ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {lastScore.score}/100
                </span>
              </div>
              {lastScore.feedback.length > 0 && (
                <ul className="space-y-1">
                  {lastScore.feedback.map((fb, i) => (
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
            {!lastScore ? (
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

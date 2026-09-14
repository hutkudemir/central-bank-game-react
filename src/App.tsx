import { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import { translations } from './data/translations';
import { ControlPanel } from './components/ControlPanel';
import { Dashboard } from './components/Dashboard';
import { TutorialModal } from './components/TutorialModal';
import { GameOverModal } from './components/GameOverModal';
import { PressConferenceModal } from './components/PressConferenceModal';

function App() {
  const { language, showTutorial, gameOver, resetGame, showPressConference } = useGameStore();
  const t = translations[language];

  useEffect(() => {
    document.title = `${t.title} - Central Bank Game`;
  }, [language, t.title]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl shadow-lg shadow-blue-500/20">
              🏦
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">{t.title}</h1>
              <p className="text-xs text-slate-400 hidden sm:block">{t.subtitle}</p>
            </div>
          </div>
          <button
            onClick={resetGame}
            className="px-3 py-1.5 text-sm rounded-lg bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 transition-colors"
          >
            {t.resetGame}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-4">
            <ControlPanel />
          </div>
          
          {/* Right Panel - Dashboard */}
          <div className="lg:col-span-8">
            <Dashboard />
          </div>
        </div>
      </main>

      {/* Modals */}
      {showTutorial && <TutorialModal />}
      {gameOver && <GameOverModal />}
      {showPressConference && <PressConferenceModal />}
    </div>
  );
}

export default App;

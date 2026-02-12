import React, { useState, useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import Scene from './components/Scene';
import Interface from './components/UI/Interface';
import BestGirlOverlay from './components/UI/BestGirlOverlay';
import TouchController from './components/TouchController';
import IntroScreen from './components/UI/IntroScreen';
import FinalScreen from './components/UI/FinalScreen';

function App() {
  const [loaded, setLoaded] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [showFinal, setShowFinal] = useState(false);
  const [appPhase, setAppPhase] = useState('loading'); // loading, intro, interactive, finale

  useEffect(() => {
    const t = setTimeout(() => {
      setLoaded(true);
      setAppPhase('intro');
    }, 1200);
    return () => clearTimeout(t);
  }, []);

  const handleIntroComplete = () => {
    setShowIntro(false);
    setAppPhase('interactive');
  };

  const handleSecretTriggered = () => {
    setAppPhase('finale');
    // Small delay before showing final screen for smooth transition
    setTimeout(() => setShowFinal(true), 300);
  };

  const handleRestart = () => {
    setShowFinal(false);
    setAppPhase('intro');
    setShowIntro(true);
  };

  return (
    <AppProvider>
      <div className="relative w-full h-full bg-black overflow-hidden">

        {/* 3D Scene — always rendering in background */}
        <div className="absolute inset-0 z-0">
          <Scene />
        </div>

        {/* Interactive Phase UI */}
        {appPhase === 'interactive' && (
          <>
            <Interface />
            {/* Camera and Gesture Controllers removed for Touch UI */}

            <TouchController />
            <BestGirlOverlay onSecretTriggered={handleSecretTriggered} />
          </>
        )}

        {/* Intro Screen */}
        {showIntro && appPhase !== 'loading' && (
          <IntroScreen onComplete={handleIntroComplete} />
        )}

        {/* Final Screen */}
        {showFinal && (
          <FinalScreen onRestart={handleRestart} />
        )}

        {/* Loading Screen */}
        <div className={`absolute inset-0 z-[300] flex items-center justify-center transition-opacity duration-1000 pointer-events-none ${loaded ? 'opacity-0' : 'opacity-100'}`}
          style={{ background: 'radial-gradient(ellipse at center, #1a0a2e 0%, #000 100%)' }}
        >
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 border-t-2 border-l-2 border-pink-500 rounded-full animate-spin" />
              <div className="absolute inset-2 border-b-2 border-r-2 border-purple-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl animate-pulse">💕</span>
              </div>
            </div>
            <h1 className="text-lg sm:text-xl font-light tracking-[0.3em] text-white/50 uppercase font-romantic">
              Love
            </h1>
            <p className="text-xs text-pink-400/40 mt-2 tracking-wider animate-pulse">
              preparing something special...
            </p>
          </div>
        </div>

      </div>
    </AppProvider>
  );
}

export default App;

import React, { Suspense, useState, useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import Scene from './components/Scene';
import Interface from './components/UI/Interface';
import HandController from './components/HandController';

function App() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Simulate initial load or asset prep
    const t = setTimeout(() => setLoaded(true), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <AppProvider>
      <div className="relative w-full h-full bg-black overflow-hidden">

        {/* 3D Scene */}
        <div className="absolute inset-0 z-0">
          <Scene />
        </div>

        {/* UI Overlay */}
        <Interface />

        {/* Logic / Hand Tracking Controller (Invisible logic + Mini Preview) */}
        <HandController />

        {/* Loading Screen */}
        <div className={`absolute inset-0 z-[100] bg-black flex items-center justify-center transition-opacity duration-1000 pointer-events-none ${loaded ? 'opacity-0' : 'opacity-100'}`}>
          <div className="text-center">
            <div className="w-16 h-16 border-t-2 border-l-2 border-cyan-500 rounded-full animate-spin mb-4 mx-auto"></div>
            <h1 className="text-xl font-light tracking-[0.3em] text-white/50 uppercase">Antigravity</h1>
          </div>
        </div>

      </div>
    </AppProvider>
  );
}

export default App;

import React, { useState, useEffect, useMemo } from 'react';
import { Heart, Sparkles } from 'lucide-react';

// Pre-generate floating hearts
const generateFloatingHearts = (count) => {
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 8,
        duration: 6 + Math.random() * 6,
        size: 10 + Math.random() * 20,
        opacity: 0.3 + Math.random() * 0.5,
        color: ['#ff0080', '#ff1493', '#ff69b4', '#e91e63', '#f06292'][Math.floor(Math.random() * 5)],
    }));
};

const IntroScreen = ({ onComplete }) => {
    const [stage, setStage] = useState(0);
    // 0 = dark, 1 = first text, 2 = valentine text, 3 = hearts, 4 = prompt, 5 = fade out

    const hearts = useMemo(() => generateFloatingHearts(20), []);

    useEffect(() => {
        const timers = [
            setTimeout(() => setStage(1), 800),      // "Привет, моя любимая..."
            setTimeout(() => setStage(2), 3500),      // "С Днём Святого Валентина"
            setTimeout(() => setStage(3), 6000),      // Hearts explosion
            setTimeout(() => setStage(4), 8500),      // "Покажи мне ✌️"
        ];
        return () => timers.forEach(clearTimeout);
    }, []);

    const handleContinue = () => {
        setStage(5);
        setTimeout(() => onComplete(), 1000);
    };

    return (
        <div className={`fixed inset-0 z-[200] flex items-center justify-center transition-opacity duration-1000 ${stage === 5 ? 'opacity-0' : 'opacity-100'}`}
            style={{ background: 'radial-gradient(ellipse at center, #1a0a2e 0%, #08050f 60%, #000000 100%)' }}
        >
            {/* Floating hearts background */}
            {stage >= 3 && hearts.map((heart) => (
                <div
                    key={heart.id}
                    className="absolute pointer-events-none"
                    style={{
                        left: `${heart.x}%`,
                        bottom: '-5%',
                        animation: `floatHeart ${heart.duration}s ease-in-out infinite`,
                        animationDelay: `${heart.delay}s`,
                    }}
                >
                    <Heart
                        size={heart.size}
                        fill={heart.color}
                        stroke="none"
                        style={{ opacity: heart.opacity, filter: 'drop-shadow(0 0 6px rgba(255, 0, 128, 0.4))' }}
                    />
                </div>
            ))}

            {/* Sparkle particles */}
            {stage >= 2 && Array.from({ length: 30 }, (_, i) => (
                <div
                    key={`sparkle-${i}`}
                    className="absolute rounded-full pointer-events-none"
                    style={{
                        left: `${10 + Math.random() * 80}%`,
                        top: `${10 + Math.random() * 80}%`,
                        width: `${2 + Math.random() * 4}px`,
                        height: `${2 + Math.random() * 4}px`,
                        background: ['#fff', '#ffd700', '#ff69b4', '#ff00de'][Math.floor(Math.random() * 4)],
                        animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
                        animationDelay: `${Math.random() * 3}s`,
                        boxShadow: '0 0 6px currentColor',
                    }}
                />
            ))}

            {/* Main content */}
            <div className="text-center px-6 relative z-10 max-w-lg">

                {/* Stage 1: Hello greeting */}
                <div className={`transition-all duration-1000 ${stage >= 1 && stage < 2 ? 'opacity-100 translate-y-0' : stage >= 2 ? 'opacity-0 -translate-y-10' : 'opacity-0 translate-y-10'}`}
                    style={{ position: stage >= 2 ? 'absolute' : 'relative', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <p className="text-xl sm:text-2xl md:text-3xl font-light text-white/80 tracking-wide font-romantic">
                        Привет, моя любимая... 💫
                    </p>
                </div>

                {/* Stage 2: Valentine's greeting */}
                <div className={`transition-all duration-1000 ${stage >= 2 && stage < 5 ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
                    {/* Big heart */}
                    <div className="mb-6 sm:mb-8 flex justify-center">
                        <Heart
                            size={80}
                            fill="#ff0080"
                            stroke="white"
                            strokeWidth={1}
                            className={`${stage >= 3 ? 'animate-heartbeat' : ''} drop-shadow-[0_0_30px_rgba(255,0,128,0.8)]`}
                        />
                    </div>

                    <h1
                        className="font-bold mb-4 sm:mb-6 leading-tight"
                        style={{
                            fontSize: 'clamp(1.8rem, 7vw, 4rem)',
                            background: 'linear-gradient(135deg, #ff0080, #ff00de, #ff69b4, #ffffff)',
                            backgroundSize: '300% 300%',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            animation: 'shimmer 3s ease infinite',
                            textShadow: 'none',
                            filter: 'drop-shadow(0 0 20px rgba(255, 0, 128, 0.3))',
                        }}
                    >
                        С Днём Святого<br />Валентина
                    </h1>

                    <p className="text-white/60 text-sm sm:text-base md:text-lg font-light tracking-wider mb-2 font-romantic">
                        ✨ У меня есть для тебя кое-что особенное ✨
                    </p>
                </div>

                {/* Stage 4: Continue prompt */}
                <div className={`mt-8 sm:mt-10 transition-all duration-700 ${stage >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <button
                        onClick={handleContinue}
                        className="group relative px-8 sm:px-10 py-3 sm:py-4 rounded-full text-white font-semibold text-sm sm:text-base tracking-wider uppercase overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                        style={{
                            background: 'linear-gradient(135deg, #ff0080, #ff00de)',
                            boxShadow: '0 0 30px rgba(255, 0, 128, 0.5), 0 0 60px rgba(255, 0, 128, 0.2)',
                        }}
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            <Sparkles size={16} />
                            Открыть подарок
                            <Sparkles size={16} />
                        </span>
                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
                    </button>
                    <p className="text-white/30 text-xs mt-4 animate-pulse">
                        нажми, чтобы продолжить 💕
                    </p>
                </div>
            </div>
        </div>
    );
};

export default IntroScreen;

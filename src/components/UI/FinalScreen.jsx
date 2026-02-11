import React, { useEffect, useState, useMemo } from 'react';
import { Heart, Sparkles, Star } from 'lucide-react';

// Generate hearts rain
const generateHearts = (count) => {
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 3 + Math.random() * 3,
        size: 12 + Math.random() * 30,
        opacity: 0.5 + Math.random() * 0.5,
        rotation: Math.random() * 360,
        color: ['#ff0080', '#ff1493', '#ff69b4', '#ff007f', '#e91e63', '#f48fb1'][Math.floor(Math.random() * 6)]
    }));
};

// Generate stars
const generateStars = (count) => {
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 2,
        size: 3 + Math.random() * 8,
        color: ['#ffd700', '#fff', '#ff69b4', '#ff00de'][Math.floor(Math.random() * 4)]
    }));
};

const FinalScreen = ({ onRestart }) => {
    const [stage, setStage] = useState(0);
    // 0 = flash, 1 = hearts+stars, 2 = main text, 3 = subtitle, 4 = full

    const hearts = useMemo(() => generateHearts(35), []);
    const stars = useMemo(() => generateStars(50), []);

    useEffect(() => {
        const timers = [
            setTimeout(() => setStage(1), 300),
            setTimeout(() => setStage(2), 1200),
            setTimeout(() => setStage(3), 3000),
            setTimeout(() => setStage(4), 4500),
        ];
        return () => timers.forEach(clearTimeout);
    }, []);

    // Letter-by-letter reveal for "I love you my baby"
    const mainText = "I love you my baby";
    const letters = mainText.split('');

    return (
        <div className="fixed inset-0 z-[99999] overflow-hidden"
            style={{ background: 'radial-gradient(ellipse at center, #2d0a3e 0%, #0f0518 50%, #000000 100%)' }}
        >
            {/* Pink Flash */}
            <div className={`absolute inset-0 transition-opacity duration-500 ${stage === 0 ? 'opacity-80' : 'opacity-0'}`}
                style={{ background: 'radial-gradient(circle, #ff0080, #ff00de)' }}
            />

            {/* Backdrop blur overlay */}
            <div className={`absolute inset-0 backdrop-blur-sm transition-opacity duration-700 ${stage >= 1 ? 'opacity-100' : 'opacity-0'}`}
                style={{ background: 'rgba(0,0,0,0.3)' }}
            />

            {/* Falling Hearts */}
            {stage >= 1 && hearts.map((heart) => (
                <div
                    key={`heart-${heart.id}`}
                    className="absolute animate-fall pointer-events-none"
                    style={{
                        left: `${heart.x}%`,
                        top: '-50px',
                        animationDelay: `${heart.delay}s`,
                        animationDuration: `${heart.duration}s`,
                    }}
                >
                    <Heart
                        size={heart.size}
                        fill={heart.color}
                        stroke="rgba(255,255,255,0.3)"
                        strokeWidth={1}
                        style={{
                            transform: `rotate(${heart.rotation}deg)`,
                            filter: 'drop-shadow(0 0 10px rgba(255, 0, 128, 0.6))',
                            opacity: heart.opacity,
                        }}
                    />
                </div>
            ))}

            {/* Twinkling Stars */}
            {stage >= 1 && stars.map((star) => (
                <div
                    key={`star-${star.id}`}
                    className="absolute pointer-events-none"
                    style={{
                        left: `${star.x}%`,
                        top: `${star.y}%`,
                        animation: `sparkle-burst 2.5s ease-out infinite`,
                        animationDelay: `${star.delay}s`,
                    }}
                >
                    <Star
                        size={star.size}
                        fill={star.color}
                        stroke="none"
                        style={{ filter: `drop-shadow(0 0 6px ${star.color})` }}
                    />
                </div>
            ))}

            {/* Main Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6">

                {/* Top decorative hearts */}
                {stage >= 2 && (
                    <div className="absolute top-[10%] sm:top-[15%] flex items-center gap-3 animate-fade-in">
                        <Heart size={20} fill="#ff69b4" stroke="none" className="animate-pulse-slow" style={{ animationDelay: '0s' }} />
                        <Heart size={30} fill="#ff0080" stroke="none" className="animate-pulse-slow" style={{ animationDelay: '0.3s' }} />
                        <Heart size={24} fill="#ff1493" stroke="none" className="animate-pulse-slow" style={{ animationDelay: '0.6s' }} />
                    </div>
                )}

                {/* Main text: "I love you my baby" — letter by letter */}
                <div className={`text-center transition-all duration-1000 ${stage >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                    <h1 className="font-romantic leading-tight mb-4" style={{ fontSize: 'clamp(2.5rem, 10vw, 6rem)' }}>
                        {letters.map((letter, i) => (
                            <span
                                key={i}
                                className="inline-block"
                                style={{
                                    animation: stage >= 2 ? `letterReveal 0.6s ease-out forwards` : 'none',
                                    animationDelay: `${i * 0.08}s`,
                                    opacity: 0,
                                    color: letter === '♥' ? '#ff0080' : 'white',
                                    textShadow: '0 0 30px rgba(255, 0, 128, 0.6), 0 0 60px rgba(255, 0, 128, 0.3)',
                                    // Add space width for actual spaces
                                    width: letter === ' ' ? '0.3em' : 'auto',
                                }}
                            >
                                {letter === ' ' ? '\u00A0' : letter}
                            </span>
                        ))}
                    </h1>

                    {/* Pulsing heart below text */}
                    <div className={`flex justify-center mb-6 transition-all duration-700 delay-500 ${stage >= 2 ? 'opacity-100' : 'opacity-0'}`}>
                        <Heart
                            size={60}
                            fill="#ff0080"
                            stroke="white"
                            strokeWidth={1.5}
                            className="animate-heartbeat"
                            style={{
                                filter: 'drop-shadow(0 0 25px rgba(255, 0, 128, 0.8)) drop-shadow(0 0 50px rgba(255, 0, 128, 0.4))',
                            }}
                        />
                    </div>
                </div>

                {/* Subtitle */}
                <div className={`text-center transition-all duration-1000 ${stage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <p className="text-white/70 text-base sm:text-lg md:text-xl font-light tracking-wider font-romantic">
                        Ты — самое лучшее, что есть в моей жизни 💕
                    </p>
                </div>

                {/* Bottom signature */}
                <div className={`absolute bottom-[10%] sm:bottom-[12%] text-center transition-all duration-700 ${stage >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                    <div
                        className="inline-block px-6 sm:px-8 py-3 sm:py-4 rounded-full border border-pink-500/40"
                        style={{
                            background: 'linear-gradient(135deg, rgba(255,0,128,0.15), rgba(255,0,222,0.15))',
                            boxShadow: '0 0 30px rgba(255, 0, 128, 0.3)',
                        }}
                    >
                        <p className="text-pink-300/80 text-xs sm:text-sm tracking-widest uppercase font-semibold">
                            ✨ Навсегда твой ✨
                        </p>
                    </div>

                    {/* Restart button */}
                    <div className="mt-6">
                        <button
                            onClick={onRestart}
                            className="text-white/20 hover:text-white/50 text-xs transition-colors duration-300 cursor-pointer"
                        >
                            начать заново 🔄
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinalScreen;

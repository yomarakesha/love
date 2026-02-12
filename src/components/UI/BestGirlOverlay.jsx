import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Heart, Sparkles } from 'lucide-react';

// Generate random hearts for rain effect
const generateHearts = (count) => {
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 3 + Math.random() * 2,
        size: 15 + Math.random() * 25,
        opacity: 0.6 + Math.random() * 0.4,
        rotation: Math.random() * 360,
        color: ['#ff0080', '#ff1493', '#ff69b4', '#ff007f', '#e91e63'][Math.floor(Math.random() * 5)]
    }));
};

const BestGirlOverlay = ({ onSecretTriggered }) => {
    const { gesture, updateConfig } = useApp();
    const [show, setShow] = useState(false);
    const [stage, setStage] = useState('hidden');
    const timerRef = useRef(null);
    const triggeredRef = useRef(false);

    const hearts = useMemo(() => generateHearts(25), []);

    useEffect(() => {
        if ((gesture === 'Victory' || gesture === 'ILoveYou') && !triggeredRef.current) {
            if (!show) {
                triggeredRef.current = true;
                setShow(true);
                setStage('flash');

                setTimeout(() => setStage('reveal'), 200);
                setTimeout(() => setStage('full'), 800);

                updateConfig('color', '#ff0080');
                updateConfig('pattern', 'heart');

                timerRef.current = setTimeout(() => {
                    setStage('hidden');
                    setTimeout(() => {
                        setShow(false);
                        if (onSecretTriggered) onSecretTriggered();
                    }, 500);
                }, 5000);
            }
        }
    }, [gesture, updateConfig, show, onSecretTriggered]);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    if (!show) return null;

    return (
        <div className={`fixed inset-0 z-[99999] pointer-events-none overflow-hidden transition-opacity duration-500 ${stage === 'hidden' ? 'opacity-0' : 'opacity-100'}`}>
            {/* Pink Flash */}
            <div className={`absolute inset-0 bg-pink-500 transition-opacity duration-300 ${stage === 'flash' ? 'opacity-60' : 'opacity-0'}`} />

            {/* Background */}
            <div className={`absolute inset-0 bg-black/50 backdrop-blur-md transition-opacity duration-500 ${stage === 'full' || stage === 'reveal' ? 'opacity-100' : 'opacity-0'}`} />

            {/* Hearts Rain */}
            {hearts.map((heart) => (
                <div
                    key={heart.id}
                    className="absolute animate-fall"
                    style={{
                        left: `${heart.x}%`,
                        top: '-50px',
                        animationDelay: `${heart.delay}s`,
                        animationDuration: `${heart.duration}s`,
                        opacity: stage === 'full' ? heart.opacity : 0,
                        transition: 'opacity 0.5s',
                    }}
                >
                    <Heart
                        size={heart.size}
                        fill={heart.color}
                        stroke="white"
                        strokeWidth={1}
                        style={{
                            transform: `rotate(${heart.rotation}deg)`,
                            filter: 'drop-shadow(0 0 8px rgba(255, 0, 128, 0.6))'
                        }}
                    />
                </div>
            ))}

            {/* Main Text */}
            <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ${stage === 'full' || stage === 'reveal' ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
                <div className="relative text-center animate-float px-6">
                    <div className="flex justify-center mb-4">
                        <Heart size={60} fill="#ff0080" stroke="white" strokeWidth={1.5}
                            className="animate-heartbeat"
                            style={{ filter: 'drop-shadow(0 0 20px rgba(255, 0, 128, 0.8))' }}
                        />
                    </div>
                    <h1
                        className="font-bold leading-none mb-4"
                        style={{
                            fontSize: 'clamp(1.5rem, 8vw, 4rem)',
                            color: 'white',
                            textShadow: '0 0 20px #ff00de, 0 0 40px #ff00de, 0 0 60px #ff0080',
                            backgroundImage: 'linear-gradient(45deg, #fff, #ffd1dc, #fff, #ff69b4, #fff)',
                            backgroundSize: '200% 200%',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            animation: 'shimmer 2s linear infinite',
                        }}
                    >
                        ✨ Ты самая лучшая у меня ✨
                    </h1>
                </div>

                <div className={`mt-4 transition-all duration-500 delay-500 ${stage === 'full' ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    <p className="text-white/80 text-lg sm:text-xl animate-pulse font-romantic font-bold">
                        я люблю тебя ❤️
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BestGirlOverlay;

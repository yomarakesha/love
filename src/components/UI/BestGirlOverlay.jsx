import React, { useEffect, useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Heart } from 'lucide-react';

const BestGirlOverlay = () => {
    const { gesture, updateConfig } = useApp();
    const [show, setShow] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => {
        if (gesture === 'Victory' || gesture === 'ILoveYou') {
            setShow(true);
            updateConfig('color', '#ff0080');
            updateConfig('pattern', 'galaxy');

            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => {
                setShow(false);
            }, 5000);
        }
    }, [gesture, updateConfig]);

    // Render plain DOM to ensure visibility (removed complex animations)
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center pointer-events-none bg-black/60 backdrop-blur-md">

            <div className="relative text-center animate-bounce-slow">
                <h1
                    className="font-bold font-main uppercase tracking-tighter leading-none"
                    style={{
                        fontSize: '15vw',
                        color: 'white',
                        textShadow: '0px 0px 20px #ff00de, 5px 5px 0px #000',
                        WebkitTextStroke: '3px black',
                        paintOrder: 'stroke fill'
                    }}
                >
                    The Best<br /> Girl Ever
                </h1>

                {/* Hearts - Simple CSS Position */}
                <div className="absolute -top-[10%] -right-[15%] text-pink-500 drop-shadow-2xl animate-pulse">
                    <Heart size="15vw" fill="#ff0080" stroke="white" strokeWidth={2} />
                </div>
                <div className="absolute -bottom-[5%] -left-[15%] text-purple-400 drop-shadow-2xl animate-pulse" style={{ animationDelay: '0.5s' }}>
                    <Heart size="10vw" fill="#d000ff" stroke="white" strokeWidth={2} />
                </div>
            </div>

            <div
                className="mt-[5vh] text-white font-bold tracking-[0.5em] uppercase bg-pink-600 px-12 py-6 rounded-full shadow-[0_0_50px_rgba(255,0,128,1)] border-4 border-white"
                style={{ fontSize: '2vw' }}
            >
                Secret Mode Unlocked
            </div>
        </div>
    );
};

export default BestGirlOverlay;

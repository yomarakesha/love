import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';

const TouchController = () => {
    const { updateTouchGesture, updateConfig, isMobile } = useApp();
    const touchRef = useRef({ startY: 0, currentY: 0, active: false });
    const opennessRef = useRef(0.5);
    const [showHint, setShowHint] = useState(true);

    useEffect(() => {
        if (!isMobile) return;

        // Hide hint after 5 seconds
        const hintTimer = setTimeout(() => setShowHint(false), 5000);

        let lastTap = 0;
        const patternList = ['sphere', 'heart', 'galaxy', 'dna', 'cube'];
        let patternIndex = 0;

        const handleTouchStart = (e) => {
            // Ignore touches on UI elements
            if (e.target.closest('.ui-panel') || e.target.closest('button') || e.target.closest('input')) return;

            const touch = e.touches[0];
            touchRef.current.startY = touch.clientY;
            touchRef.current.active = true;

            // Double-tap detection for pattern switching
            const now = Date.now();
            if (now - lastTap < 300) {
                patternIndex = (patternIndex + 1) % patternList.length;
                updateConfig('pattern', patternList[patternIndex]);
                setShowHint(false);
            }
            lastTap = now;
        };

        const handleTouchMove = (e) => {
            if (!touchRef.current.active) return;
            // Don't prevent default on UI elements
            if (e.target.closest('.ui-panel') || e.target.closest('button') || e.target.closest('input')) return;

            const touch = e.touches[0];
            const deltaY = (touchRef.current.startY - touch.clientY) / window.innerHeight;

            // Map vertical swipe to openness (up = open, down = closed)
            opennessRef.current = Math.max(0, Math.min(1, 0.5 + deltaY * 2));

            const normalizedX = touch.clientX / window.innerWidth;
            const normalizedY = touch.clientY / window.innerHeight;

            updateTouchGesture(opennessRef.current, {
                x: normalizedX,
                y: normalizedY,
                z: 0
            });
        };

        const handleTouchEnd = () => {
            touchRef.current.active = false;
            // Slowly return to neutral
            const returnToNeutral = () => {
                opennessRef.current += (0.5 - opennessRef.current) * 0.1;
                if (Math.abs(opennessRef.current - 0.5) > 0.01) {
                    requestAnimationFrame(returnToNeutral);
                }
            };
            returnToNeutral();
        };

        window.addEventListener('touchstart', handleTouchStart, { passive: true });
        window.addEventListener('touchmove', handleTouchMove, { passive: true });
        window.addEventListener('touchend', handleTouchEnd, { passive: true });

        return () => {
            clearTimeout(hintTimer);
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isMobile, updateTouchGesture, updateConfig]);

    if (!isMobile) return null;

    return (
        <>
            {showHint && (
                <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
                    <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-3 text-center animate-fade-in">
                        <p className="text-xs text-white/70 font-light tracking-wide">
                            ☝️ Свайп вверх/вниз — управление частицами
                        </p>
                        <p className="text-xs text-white/50 mt-1">
                            Двойной тап — смена формы
                        </p>
                    </div>
                </div>
            )}
        </>
    );
};

export default TouchController;

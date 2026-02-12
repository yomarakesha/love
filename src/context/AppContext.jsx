import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';

const AppContext = createContext();

// Detect mobile device
const getIsMobile = () => {
    if (typeof window === 'undefined') return false;
    return (
        window.innerWidth < 768 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        ('ontouchstart' in window && navigator.maxTouchPoints > 0)
    );
};

export const AppProvider = ({ children }) => {
    const [gesture, setGesture] = useState('None');
    const [gestureValue, setGestureValue] = useState(0);
    const [isMobile, setIsMobile] = useState(getIsMobile());
    const [soundEnabled, setSoundEnabled] = useState(false);
    const [autoMode, setAutoMode] = useState(false);
    const idleTimerRef = useRef(null);

    const [config, setConfig] = useState({
        pattern: 'sphere',
        color: '#ff0080',
        particleSize: 0.12,
        count: getIsMobile() ? 2000 : 4000,
        starCount: getIsMobile() ? 600 : 1500,
        dispersion: 1.5,
    });

    // Listen for resize to update isMobile
    useEffect(() => {
        const handleResize = () => {
            const mobile = getIsMobile();
            setIsMobile(mobile);
            setConfig(prev => ({
                ...prev,
                count: mobile ? 2000 : 4000,
                starCount: mobile ? 600 : 1500,
            }));
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Ref for high-frequency animation updates
    const gestureRef = useRef({
        value: 0.5,
        rawGesture: 'None',
        handPresent: false,
        handPosition: { x: 0.5, y: 0.5, z: 0 }
    });

    // Auto-mode: cycle patterns when idle for 15 seconds
    const patternList = ['sphere', 'heart', 'galaxy', 'dna', 'cube'];
    const autoPatternIndex = useRef(0);

    const resetIdleTimer = useCallback(() => {
        if (idleTimerRef.current) clearInterval(idleTimerRef.current);
        setAutoMode(false);

        idleTimerRef.current = setInterval(() => {
            setAutoMode(true);
            autoPatternIndex.current = (autoPatternIndex.current + 1) % patternList.length;
            setConfig(prev => ({
                ...prev,
                pattern: patternList[autoPatternIndex.current]
            }));
        }, 8000);

        // Start the first idle timer
        setTimeout(() => {
            // After 15s of no interaction, auto mode kicks in
        }, 15000);
    }, []);

    useEffect(() => {
        // Start idle detection after 15 seconds
        const startTimer = setTimeout(() => {
            idleTimerRef.current = setInterval(() => {
                setAutoMode(true);
                autoPatternIndex.current = (autoPatternIndex.current + 1) % patternList.length;
                setConfig(prev => ({
                    ...prev,
                    pattern: patternList[autoPatternIndex.current]
                }));
            }, 8000);
        }, 15000);

        return () => {
            clearTimeout(startTimer);
            if (idleTimerRef.current) clearInterval(idleTimerRef.current);
        };
    }, []);

    const updateGesture = (recognizedGesture, handLandmarks) => {
        // Reset idle timer on any gesture
        resetIdleTimer();

        let targetValue = gestureRef.current.value;

        if (recognizedGesture === 'Open_Palm') {
            targetValue = 1;
        } else if (recognizedGesture === 'Closed_Fist') {
            targetValue = 0;
        }

        // SPECIAL TRIGGER: VICTORY (Peace Sign) / ILoveYou
        if (recognizedGesture === 'Victory' || recognizedGesture === 'ILoveYou') {
            if (config.pattern !== 'heart') {
                setConfig(prev => ({
                    ...prev,
                    color: '#ff0080',
                    pattern: 'heart'
                }));
            }
        }

        gestureRef.current.rawGesture = recognizedGesture;
        setGesture(recognizedGesture);
        gestureRef.current.value = targetValue;

        // Always set handPresent to true if we receive a specific gesture (like from a button click)
        gestureRef.current.handPresent = true;

        if (handLandmarks && handLandmarks.length > 0) {
            const palm = handLandmarks[0][0];
            gestureRef.current.handPosition = { x: palm.x, y: palm.y, z: palm.z };
        } else {
            // If triggered by button (no landmarks), set a default "center" position
            gestureRef.current.handPosition = { x: 0.5, y: 0.5, z: 0 };
        }
    };

    // Touch-based gesture simulation
    const updateTouchGesture = useCallback((openness, position) => {
        resetIdleTimer();
        gestureRef.current.value = openness;
        gestureRef.current.handPresent = true;
        if (position) {
            gestureRef.current.handPosition = position;
        }
        setGesture(openness > 0.7 ? 'Open_Palm' : openness < 0.3 ? 'Closed_Fist' : 'Pointing_Up');
    }, [resetIdleTimer]);

    const setHandLost = () => {
        gestureRef.current.handPresent = false;
        setGesture('None');
    };

    const updateConfig = (key, value) => {
        resetIdleTimer();
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    // Screenshot function
    const takeScreenshot = useCallback(() => {
        const canvas = document.querySelector('canvas');
        if (!canvas) return;

        try {
            const dataURL = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `love-particles-${Date.now()}.png`;
            link.href = dataURL;
            link.click();
        } catch (e) {
            console.error('Screenshot failed:', e);
        }
    }, []);

    return (
        <AppContext.Provider value={{
            gesture,
            gestureValue,
            config,
            isMobile,
            soundEnabled,
            setSoundEnabled,
            autoMode,
            updateConfig,
            gestureRef,
            updateGesture,
            updateTouchGesture,
            setHandLost,
            takeScreenshot,
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);

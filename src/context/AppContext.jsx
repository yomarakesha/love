import React, { createContext, useContext, useState, useRef } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [gesture, setGesture] = useState('None');
    const [gestureValue, setGestureValue] = useState(0); // 0 = Closed, 1 = Open
    const [config, setConfig] = useState({
        pattern: 'sphere', // sphere, cube, galaxy, wave
        color: '#00f2ff',
        particleSize: 0.08, // Reduced from 0.18
        count: 6000,        // Reduced from 10000
        dispersion: 1.5,
    });

    // We use a ref for high-frequency updates (animation loop) to avoid React render thrashing
    const gestureRef = useRef({
        value: 0,
        rawGesture: 'None',
        handPresent: false,
        handPosition: { x: 0, y: 0, z: 0 }
    });

    const updateGesture = (recognizedGesture, handLandmarks) => {
        // Basic logic mapping gestures to a value 0-1
        let targetValue = gestureRef.current.value;

        if (recognizedGesture === 'Open_Palm') {
            targetValue = 1;
        } else if (recognizedGesture === 'Closed_Fist') {
            targetValue = 0;
        }

        // SPECIAL TRIGGER: VICTORY (Peace Sign)
        if (recognizedGesture === 'Victory' || recognizedGesture === 'ILoveYou') {
            // Switch to Pink Heart
            if (config.pattern !== 'heart') {
                setConfig(prev => ({
                    ...prev,
                    color: '#ff0080',
                    pattern: 'heart'
                }));
            }
        }

        // Smooth interpolation could happen here or in the loop, let's just set target
        // Actually, let's do simple lerp in the loop, here we just update state
        gestureRef.current.rawGesture = recognizedGesture;
        setGesture(recognizedGesture);

        // Calculate a more continuous "openness" based on landmarks if available
        // For now, simpler binary target is fine, smoothed by the particle system
        gestureRef.current.value = targetValue;
        gestureRef.current.handPresent = true;

        if (handLandmarks && handLandmarks.length > 0) {
            // Could map hand position to camera movement or particle center
            // normalized coordinates [0,1]
            const palm = handLandmarks[0][0]; // Wrist
            gestureRef.current.handPosition = { x: palm.x, y: palm.y, z: palm.z };
        }
    };

    const setHandLost = () => {
        gestureRef.current.handPresent = false;
        setGesture('None');
    };

    const updateConfig = (key, value) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    return (
        <AppContext.Provider value={{
            gesture,
            gestureValue,
            config,
            updateConfig,
            gestureRef,
            updateGesture,
            setHandLost
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);

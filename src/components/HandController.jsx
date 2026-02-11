import React, { useEffect, useRef, useState } from 'react';
import { GestureRecognizer, FilesetResolver } from '@mediapipe/tasks-vision';
import { useApp } from '../context/AppContext';
import { Camera, X, AlertCircle, Loader2 } from 'lucide-react';

const HandController = () => {
    const videoRef = useRef(null);
    const { updateGesture, setHandLost, isMobile } = useApp();
    const [status, setStatus] = useState('initializing');
    const [errorMessage, setErrorMessage] = useState('');
    const [isVisible, setIsVisible] = useState(!isMobile); // Hidden by default on mobile

    const recognizerRef = useRef(null);
    const requestRef = useRef(null);

    useEffect(() => {
        // Don't auto-start on mobile (save battery)
        if (!isVisible) return;

        let active = true;

        const setupModel = async () => {
            try {
                setStatus('loading-model');
                console.log("Starting Model Load...");

                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
                );

                if (!active) return;
                console.log("WASM loaded, loading Graph...");

                recognizerRef.current = await GestureRecognizer.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath:
                            "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
                        delegate: "GPU"
                    },
                    runningMode: "VIDEO",
                    numHands: 1
                });

                console.log("Graph loaded.");
                if (!active) return;

                setStatus('starting-camera');
                await startWebcam();
                setStatus('ready');
            } catch (e) {
                console.error("Setup error:", e);
                setErrorMessage(e.message || "Failed to load AI Model");
                setStatus('error');
            }
        };

        setupModel();

        return () => {
            active = false;
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(t => t.stop());
            }
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [isVisible]);

    const startWebcam = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: isMobile ? 160 : 320,
                    height: isMobile ? 120 : 240,
                    frameRate: { ideal: isMobile ? 15 : 30 },
                    facingMode: 'user'
                }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (e) {
            console.error("Webcam error:", e);
            throw new Error("Unable to access Camera. Please allow permission.");
        }
    };

    const predictWebcam = async () => {
        requestRef.current = requestAnimationFrame(predictWebcam);

        if (!recognizerRef.current || !videoRef.current) return;

        if (videoRef.current.videoWidth === 0 || videoRef.current.paused || videoRef.current.ended) {
            return;
        }

        try {
            const result = recognizerRef.current.recognizeForVideo(videoRef.current, Date.now());

            if (result.gestures.length > 0) {
                const gestureName = result.gestures[0][0].categoryName;
                const score = result.gestures[0][0].score;
                if (score > 0.5) {
                    updateGesture(gestureName, result.landmarks);
                }
            } else {
                setHandLost();
            }
        } catch (err) {
            // Ignore single frame failures
        }
    };

    if (!isVisible) {
        return (
            <button
                onClick={() => setIsVisible(true)}
                className="fixed bottom-16 sm:bottom-4 right-3 sm:right-4 z-50 bg-white/10 p-2.5 rounded-full backdrop-blur-md border border-white/10 text-white hover:bg-white/20 transition-colors"
                title="Enable Camera"
            >
                <Camera size={isMobile ? 16 : 20} />
            </button>
        )
    }

    return (
        <div className={`fixed z-50 flex flex-col items-end space-y-2 ${isMobile ? 'bottom-16 right-3' : 'bottom-4 right-4'}`}>
            <div className={`relative rounded-xl overflow-hidden shadow-2xl border border-white/20 bg-black/80 backdrop-blur-md transition-all ${isMobile ? 'w-36 h-28' : 'w-64 h-48'}`}>
                {/* Header */}
                <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-1.5 sm:p-2 bg-gradient-to-b from-black/60 to-transparent">
                    <span className={`text-[8px] sm:text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 ${status === 'ready' ? 'text-green-400' : 'text-yellow-400'}`}>
                        {status === 'ready' ? <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 animate-pulse" /> : <Loader2 size={8} className="animate-spin" />}
                        {status.replace('-', ' ')}
                    </span>
                    <button onClick={() => setIsVisible(false)} className="text-white/50 hover:text-white p-0.5">
                        <X size={isMobile ? 10 : 14} />
                    </button>
                </div>

                {/* Video Feed */}
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    onLoadedData={() => {
                        console.log("Video loaded data. Starting prediction.");
                        if (videoRef.current) {
                            videoRef.current.play().catch(e => console.error("Play error:", e));
                        }
                        predictWebcam();
                    }}
                    className="w-full h-full object-cover transform -scale-x-100"
                />

                {/* Overlays for States */}
                {status !== 'ready' && status !== 'error' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white space-y-1.5 bg-black/50">
                        <Loader2 className="animate-spin text-cyan-400" size={isMobile ? 20 : 32} />
                        <span className="text-[8px] sm:text-xs text-center px-2 font-mono text-cyan-200/70">Initializing AI...</span>
                    </div>
                )}

                {status === 'error' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-2 sm:p-4 text-center bg-red-900/80">
                        <AlertCircle className="text-red-400 mb-1" size={isMobile ? 20 : 32} />
                        <p className="text-[8px] sm:text-xs font-bold text-red-200">Error</p>
                        <p className="text-[7px] sm:text-[10px] text-red-100/70 mt-0.5 line-clamp-2">{errorMessage}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-2 px-2 py-0.5 sm:px-3 sm:py-1 bg-white/10 hover:bg-white/20 rounded text-[8px] sm:text-xs border border-white/20"
                        >
                            Retry
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HandController;

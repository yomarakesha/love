import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';

const GestureController = () => {
    const { updateGesture } = useApp();
    const [isDrawing, setIsDrawing] = useState(false);
    const canvasRef = useRef(null);
    const pointsRef = useRef([]);
    const pathRef = useRef(null);

    // Setup canvas for visual feedback (optional, but good for UX)
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const startDrawing = (x, y) => {
        setIsDrawing(true);
        pointsRef.current = [{ x, y }];

        // Clear previous drawing
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    };

    const draw = (x, y) => {
        if (!isDrawing) return;
        pointsRef.current.push({ x, y });

        // Visual feedback
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx && pointsRef.current.length > 1) {
            const lastPoint = pointsRef.current[pointsRef.current.length - 2];
            ctx.beginPath();
            ctx.moveTo(lastPoint.x, lastPoint.y);
            ctx.lineTo(x, y);
            ctx.strokeStyle = 'rgba(255, 105, 180, 0.5)'; // Hot pink, semi-transparent
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.stroke();
        }
    };

    const endDrawing = () => {
        setIsDrawing(false);
        analyzeShape(pointsRef.current);

        // Fade out drawing
        setTimeout(() => {
            const ctx = canvasRef.current?.getContext('2d');
            if (ctx) {
                // Simple fade effect could go here, or just clear
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            }
        }, 1000);
    };

    // --- Shape Recognition Logic ---
    const analyzeShape = (points) => {
        if (points.length < 20) return; // Too short

        // Normalize points to a 0-1 box to handle different sizes
        const xs = points.map(p => p.x);
        const ys = points.map(p => p.y);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);

        const width = maxX - minX;
        const height = maxY - minY;

        if (width < 50 || height < 50) return; // Too small

        const normalized = points.map(p => ({
            x: (p.x - minX) / width,
            y: (p.y - minY) / height
        }));

        // Check for Heart Shape
        // Heuristic:
        // 1. Starts near top-center (x ~0.5, y < 0.4)
        // 2. Goes Left and Up (x < 0.5, y decreases then increases)
        // 3. Goes to bottom center (x ~0.5, y ~1.0)
        // 4. Goes Right and Up
        // 5. Ends near start

        const start = normalized[0];
        const end = normalized[normalized.length - 1];

        // Check closed loop (start and end close together)
        const dist = Math.hypot(start.x - end.x, start.y - end.y);
        if (dist > 0.3) return;

        // Split into two halves based on lowest point
        let lowestPointIndex = 0;
        let maxValY = -1;

        normalized.forEach((p, i) => {
            if (p.y > maxValY) {
                maxValY = p.y;
                lowestPointIndex = i;
            }
        });

        // Lowest point should be near bottom center
        const lowest = normalized[lowestPointIndex];
        if (lowest.y < 0.8 || lowest.x < 0.3 || lowest.x > 0.7) return;

        // Check Left Lobe (0 to lowest)
        // Should go left of 0.5 then come back
        let wentLeft = false;
        for (let i = 0; i < lowestPointIndex; i++) {
            if (normalized[i].x < 0.3) wentLeft = true;
        }

        // Check Right Lobe (lowest to end)
        // Should go right of 0.5 then come back
        let wentRight = false;
        for (let i = lowestPointIndex; i < normalized.length; i++) {
            if (normalized[i].x > 0.7) wentRight = true;
        }

        if (wentLeft && wentRight) {
            console.log("Heart Detected!");
            updateGesture('Victory'); // Trigger the "Victory" effect
        }
    };

    // --- Event Handlers ---

    // Mouse
    const handleMouseDown = (e) => startDrawing(e.clientX, e.clientY);
    const handleMouseMove = (e) => draw(e.clientX, e.clientY);
    const handleMouseUp = () => endDrawing();

    // Touch
    const handleTouchStart = (e) => {
        // Prevent default only if we want to block scrolling, but maybe better not to block everything
        // e.preventDefault(); 
        const touch = e.touches[0];
        startDrawing(touch.clientX, touch.clientY);
    };
    const handleTouchMove = (e) => {
        // e.preventDefault();
        const touch = e.touches[0];
        draw(touch.clientX, touch.clientY);
    };
    const handleTouchEnd = () => endDrawing();

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-[100] pointer-events-auto touch-none" // z-index high to catch events
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ background: 'transparent' }}
        />
    );
};

export default GestureController;

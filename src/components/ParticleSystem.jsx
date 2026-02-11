import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useApp } from '../context/AppContext';

// Create soft circular particle texture programmatically
const createParticleTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.4)');
    gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.1)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
};

// Helper to generate shapes
const getTargetPositions = (type, count) => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        let x, y, z;
        const i3 = i * 3;

        const phi = Math.acos(-1 + (2 * i) / count);
        const theta = Math.sqrt(count * Math.PI) * phi;

        if (type === 'sphere') {
            const r = 2.5;
            x = r * Math.sin(phi) * Math.cos(theta);
            y = r * Math.sin(phi) * Math.sin(theta);
            z = r * Math.cos(phi);
        } else if (type === 'cube') {
            const s = 4;
            x = (Math.random() - 0.5) * s;
            y = (Math.random() - 0.5) * s;
            z = (Math.random() - 0.5) * s;
        } else if (type === 'galaxy') {
            const radius = Math.random() * 5;
            const spinAngle = radius * 4;
            const branchAngle = (i % 3) * ((2 * Math.PI) / 3);

            x = (radius * Math.cos(spinAngle + branchAngle)) + (Math.random() - 0.5) * 0.5;
            y = (Math.random() - 0.5) * (radius * 0.2);
            z = (radius * Math.sin(spinAngle + branchAngle)) + (Math.random() - 0.5) * 0.5;

        } else if (type === 'dna') {
            const len = 12;
            const yPos = (Math.random() - 0.5) * len;
            const radius = 2;
            const turn = yPos * 2;
            const strand = i % 2 === 0 ? 0 : Math.PI;
            x = Math.cos(turn + strand) * radius;
            y = yPos;
            z = Math.sin(turn + strand) * radius;

            x += (Math.random() - 0.5) * 0.5;
            y += (Math.random() - 0.5) * 0.5;
            z += (Math.random() - 0.5) * 0.5;
        } else if (type === 'heart') {
            const t = Math.random() * Math.PI * 2;
            const scale = 0.4;

            let hx = 16 * Math.pow(Math.sin(t), 3);
            let hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);

            x = hx * scale;
            y = hy * scale;

            const depthLayer = Math.pow(Math.random(), 0.5);
            z = (depthLayer - 0.5) * 2.5;

            const noise = 0.3;
            x += (Math.random() - 0.5) * noise;
            y += (Math.random() - 0.5) * noise;
            z += (Math.random() - 0.5) * noise * 0.5;
        } else {
            x = 0; y = 0; z = 0;
        }

        positions[i3] = x;
        positions[i3 + 1] = y;
        positions[i3 + 2] = z;
    }
    return positions;
};

const ParticleSystem = () => {
    const { config, gestureRef } = useApp();
    const pointsRef = useRef();
    const materialRef = useRef();

    // Smooth transition state
    const currentOpenness = useRef(0.5);

    // For smooth pattern morphing
    const previousPattern = useRef(config.pattern);
    const morphProgress = useRef(1);
    const previousPositions = useRef(null);

    const count = config.count;

    // Create particle texture once
    const particleTexture = useMemo(() => createParticleTexture(), []);

    // Generate random sizes for each particle
    const sizes = useMemo(() => {
        const arr = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            arr[i] = 0.5 + Math.random() * 1.5;
        }
        return arr;
    }, [count]);

    // Generate targets
    const targetPositions = useMemo(() => {
        return getTargetPositions(config.pattern, count);
    }, [config.pattern, count]);

    // Initial positions (random)
    const initialPositions = useMemo(() => {
        const arr = new Float32Array(count * 3);
        for (let i = 0; i < count * 3; i++) arr[i] = (Math.random() - 0.5) * 15;
        return arr;
    }, [count]);

    // Track pattern changes for smooth morphing
    useEffect(() => {
        if (previousPattern.current !== config.pattern) {
            if (pointsRef.current) {
                const currentPos = pointsRef.current.geometry.attributes.position.array;
                previousPositions.current = new Float32Array(currentPos);
            }
            morphProgress.current = 0;
            previousPattern.current = config.pattern;
        }
    }, [config.pattern]);

    // Update color when config changes
    useEffect(() => {
        if (materialRef.current) {
            materialRef.current.color.set(config.color);
        }
    }, [config.color]);

    useFrame((state, delta) => {
        if (!pointsRef.current) return;

        const positions = pointsRef.current.geometry.attributes.position.array;

        // Hand Gesture smoothing
        let targetOpenness = 0.5;

        if (gestureRef.current.handPresent) {
            targetOpenness = gestureRef.current.value;
        } else {
            // Auto breathe
            targetOpenness = 0.5 + Math.sin(state.clock.elapsedTime * 0.8) * 0.15;
        }

        // Lerp current openness
        currentOpenness.current = THREE.MathUtils.lerp(currentOpenness.current, targetOpenness, delta * 3);

        const openFactor = currentOpenness.current;
        const expansion = 0.3 + (openFactor * 1.8);

        // Progress morphing animation
        if (morphProgress.current < 1) {
            morphProgress.current = Math.min(1, morphProgress.current + delta * 1.5);
        }

        // Hand Interaction Coordinates
        const handX = (gestureRef.current.handPosition.x - 0.5) * 8;
        const handY = -(gestureRef.current.handPosition.y - 0.5) * 5;
        const handZ = 2;

        const time = state.clock.elapsedTime;
        const pulseBase = Math.sin(time * 2) * 0.1 + 1;

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;

            let tx = targetPositions[i3] * expansion;
            let ty = targetPositions[i3 + 1] * expansion;
            let tz = targetPositions[i3 + 2] * expansion;

            // If morphing, interpolate from previous positions
            if (morphProgress.current < 1 && previousPositions.current) {
                const ease = easeOutCubic(morphProgress.current);
                tx = THREE.MathUtils.lerp(previousPositions.current[i3] * expansion, tx, ease);
                ty = THREE.MathUtils.lerp(previousPositions.current[i3 + 1] * expansion, ty, ease);
                tz = THREE.MathUtils.lerp(previousPositions.current[i3 + 2] * expansion, tz, ease);
            }

            let cx = positions[i3];
            let cy = positions[i3 + 1];
            let cz = positions[i3 + 2];

            const speed = 2.5 + (sizes[i] * 0.5);

            cx += (tx - cx) * speed * delta;
            cy += (ty - cy) * speed * delta;
            cz += (tz - cz) * speed * delta;

            // Gentle noise/wander effect
            const noiseAmp = 0.03 * expansion * pulseBase;
            const particlePhase = i * 0.1;
            cx += Math.sin(time * 1.5 + particlePhase) * noiseAmp;
            cy += Math.cos(time * 1.2 + particlePhase) * noiseAmp;
            cz += Math.sin(time * 1.8 + particlePhase) * noiseAmp;

            // Hand attraction/repulsion
            if (gestureRef.current.handPresent) {
                const dx = handX - cx;
                const dy = handY - cy;
                const dz = handZ - cz;
                const distSq = dx * dx + dy * dy + dz * dz;

                if (distSq < 15) {
                    const force = (1.5 - openFactor) * 4.0;
                    const falloff = 1.0 / (1.0 + distSq);

                    cx += dx * force * falloff * delta;
                    cy += dy * force * falloff * delta;
                    cz += dz * force * falloff * delta;
                }
            }

            positions[i3] = cx;
            positions[i3 + 1] = cy;
            positions[i3 + 2] = cz;
        }

        pointsRef.current.geometry.attributes.position.needsUpdate = true;
        pointsRef.current.rotation.y = time * 0.08;

        if (materialRef.current) {
            materialRef.current.size = config.particleSize * pulseBase;
        }
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={initialPositions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                ref={materialRef}
                size={config.particleSize || 0.12}
                color={config.color}
                map={particleTexture}
                sizeAttenuation
                transparent
                opacity={0.85}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                alphaTest={0.01}
            />
        </points>
    );
};

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

export default ParticleSystem;

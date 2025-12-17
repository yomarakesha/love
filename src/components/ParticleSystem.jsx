import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useApp } from '../context/AppContext';

const PARTICLE_COUNT = 8000; // Optimized count for smooth playback

// Helper to generate shapes
const getTargetPositions = (type, count) => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        let x, y, z;
        const i3 = i * 3;

        // Normalize index
        const t = i / count;
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

            const randomOffset = Math.pow(Math.random(), 3) * (0.5 - Math.random()); // Concentration

            x = (radius * Math.cos(spinAngle + branchAngle)) + (Math.random() - 0.5) * 0.5;
            y = (Math.random() - 0.5) * (radius * 0.2); // Flattened
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

            // Add some scatter
            x += (Math.random() - 0.5) * 0.5;
            y += (Math.random() - 0.5) * 0.5;
            z += (Math.random() - 0.5) * 0.5;
        } else if (type === 'heart') {
            // 3D Heart Contour
            // Use `t` to trace the outline
            const t = Math.random() * Math.PI * 2;

            // Much bigger scale
            const scale = 0.35;

            let hx = 16 * Math.pow(Math.sin(t), 3);
            let hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);

            x = hx * scale;
            y = hy * scale;

            // Reduce Z depth so it looks more like a distinct shape than a ball
            z = (Math.random() - 0.5) * 1.5;

            // Core Logic:
            // To make contour stand out, we DON'T pull particles to the center significantly.
            // We add slight noise for "fuzziness" but keep the shape hollow.

            const noise = 0.5;
            x += (Math.random() - 0.5) * noise;
            y += (Math.random() - 0.5) * noise;
            z += (Math.random() - 0.5) * noise;
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

    // Smooth transition state
    const currentOpenness = useRef(0.5); // Start neutral

    const count = config.count || PARTICLE_COUNT;

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

    // Update uColor when config changes
    useEffect(() => {
        if (pointsRef.current) {
            pointsRef.current.material.color.set(config.color);
        }
    }, [config.color]);

    useFrame((state, delta) => {
        if (!pointsRef.current) return;

        const positions = pointsRef.current.geometry.attributes.position.array;

        // Hand Gesture smoothing
        let targetOpenness = 0.5; // Default neutral

        if (gestureRef.current.handPresent) {
            // If hand is present, map value strictly
            targetOpenness = gestureRef.current.value;
        } else {
            // Auto breathe if no hand
            targetOpenness = 0.5 + Math.sin(state.clock.elapsedTime) * 0.2;
        }

        // Lerp current openness
        currentOpenness.current = THREE.MathUtils.lerp(currentOpenness.current, targetOpenness, delta * 4);

        const openFactor = currentOpenness.current; // 0 (contract) to 1 (expand)

        // Define Scale/Dispersion based on factor
        const expansion = 0.2 + (openFactor * 2.0); // Range 0.2 (very tight) to 2.2 (very large)

        // Hand Interaction Coordinates (Normalized 0-1 to Scene Space)
        // Camera is at z=8 usually. 
        // We map 0..1 to approx -4..4 range
        const handX = (gestureRef.current.handPosition.x - 0.5) * 8;
        const handY = -(gestureRef.current.handPosition.y - 0.5) * 5; // Invert Y
        const handZ = 2; // Slightly in front

        const time = state.clock.elapsedTime;

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;

            // Interaction Target (The pattern scaled)
            const tx = targetPositions[i3] * expansion;
            const ty = targetPositions[i3 + 1] * expansion;
            const tz = targetPositions[i3 + 2] * expansion;

            // Current
            let cx = positions[i3];
            let cy = positions[i3 + 1];
            let cz = positions[i3 + 2];

            // Physics: Move towards target (Lerp) with some elasticity
            const speed = 3.0 + (Math.random() * 2.0);

            cx += (tx - cx) * speed * delta;
            cy += (ty - cy) * speed * delta;
            cz += (tz - cz) * speed * delta;

            // NOISE / WANDERING
            const noiseAmp = 0.05 * expansion;
            cx += Math.sin(time * 3 + i) * noiseAmp;
            cy += Math.cos(time * 2 + i) * noiseAmp;
            cz += Math.sin(time * 4 + i) * noiseAmp;

            // HAND ATTRACTION / REPULSION
            if (gestureRef.current.handPresent) {
                // Calculate distance to hand
                const dx = handX - cx;
                const dy = handY - cy;
                const dz = handZ - cz;
                const distSq = dx * dx + dy * dy + dz * dz;

                // If very close, repel or attract?
                // Let's create a "Magnetic Field" effect using Openness
                // If Open -> Repel (explode from hand)
                // If Closed -> Attract (gather to hand)

                if (distSq < 15) {
                    const force = (1.5 - openFactor) * 5.0; // Stronger fetch when closed
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

        // Rotate the whole system slowly
        pointsRef.current.rotation.y = time * 0.1;
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
                size={config.particleSize}
                color={config.color}
                sizeAttenuation
                transparent
                opacity={0.9}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    );
};

export default ParticleSystem;

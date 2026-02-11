import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import ParticleSystem from './ParticleSystem';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useApp } from '../context/AppContext';

// Animated twinkling stars component
const TwinklingStars = ({ count = 1500 }) => {
    const positions = useMemo(() => {
        const arr = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const radius = 50 + Math.random() * 100;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            arr[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            arr[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            arr[i * 3 + 2] = radius * Math.cos(phi);
        }
        return arr;
    }, [count]);

    return (
        <points>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.8}
                color="#ffffff"
                transparent
                opacity={0.6}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    );
};

// Gradient background
const GradientBackground = () => {
    return (
        <mesh scale={[-1, 1, 1]}>
            <sphereGeometry args={[200, 32, 32]} />
            <meshBasicMaterial
                side={THREE.BackSide}
                color="#050510"
            />
        </mesh>
    );
};

const Scene = () => {
    const { config, isMobile } = useApp();

    return (
        <Canvas
            camera={{ position: [0, 0, 8], fov: 60 }}
            gl={{
                antialias: !isMobile,
                alpha: false,
                powerPreference: "high-performance",
                preserveDrawingBuffer: true, // Needed for screenshots
            }}
            dpr={isMobile ? [1, 1] : [1, 1.5]}
        >
            {/* Deep purple-black background */}
            <color attach="background" args={['#08050f']} />

            <Suspense fallback={null}>
                <ParticleSystem />
                <GradientBackground />
            </Suspense>

            {/* Twinkling background stars — fewer on mobile */}
            <TwinklingStars count={config.starCount} />

            {/* Controls */}
            <OrbitControls
                makeDefault
                enablePan={false}
                maxDistance={15}
                minDistance={3}
                autoRotate
                autoRotateSpeed={0.3}
                enableDamping
                dampingFactor={0.05}
                // Better touch behavior on mobile
                touches={{
                    ONE: THREE.TOUCH.ROTATE,
                    TWO: THREE.TOUCH.DOLLY_ROTATE
                }}
            />

            {/* Enhanced Post Processing — Mobile Optimized */}
            <EffectComposer disableNormalPass multisampling={0}>
                <Bloom
                    luminanceThreshold={0.1}
                    luminanceSmoothing={0.9}
                    height={isMobile ? 150 : 200}
                    intensity={isMobile ? 0.5 : 0.8}
                    radius={0.8}
                />
                <Vignette
                    offset={0.3}
                    darkness={0.7}
                    eskil={false}
                />
            </EffectComposer>
        </Canvas>
    );
};

export default Scene;

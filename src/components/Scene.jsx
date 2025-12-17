import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Environment } from '@react-three/drei';
import ParticleSystem from './ParticleSystem';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

const Scene = () => {
    return (
        <Canvas
            camera={{ position: [0, 0, 8], fov: 60 }}
            gl={{ antialias: true, alpha: false }}
            dpr={[1, 2]} // Handle pixel ratio
        >
            <color attach="background" args={['#050505']} />

            <Suspense fallback={null}>
                <ParticleSystem />
                <Environment preset="city" />
            </Suspense>

            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

            <OrbitControls makeDefault enablePan={false} maxDistance={20} minDistance={2} />

            {/* Post Processing for Glow */}
            <EffectComposer disableNormalPass>
                <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} intensity={0.5} />
            </EffectComposer>
        </Canvas>
    );
};

export default Scene;

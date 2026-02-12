import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Maximize, Minimize, Box, Disc, Activity, Zap, Heart, Palette, ChevronUp, ChevronDown, Camera } from 'lucide-react';

const patterns = [
    { id: 'sphere', label: 'Sphere', icon: Disc },
    { id: 'cube', label: 'Cube', icon: Box },
    { id: 'galaxy', label: 'Galaxy', icon: Activity },
    { id: 'dna', label: 'Twist', icon: Zap },
    { id: 'heart', label: 'Heart', icon: Heart },
];

const colorPalettes = [
    { id: 'twilight', color: '#9b59b6', emoji: '💜' },
    { id: 'rose', color: '#ff69b4', emoji: '💗' },
    { id: 'sunset', color: '#f39c12', emoji: '🌅' },
    { id: 'ocean', color: '#00d4ff', emoji: '💙' },
    { id: 'starlight', color: '#ffd700', emoji: '⭐' },
    { id: 'love', color: '#ff0080', emoji: '❤️' },
];

const Interface = () => {
    const { config, updateConfig, gesture, updateGesture, isMobile, takeScreenshot } = useApp();
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isPanelOpen, setIsPanelOpen] = useState(false); // Start closed — this is a gift!
    const [activePalette, setActivePalette] = useState('love');

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    const selectPalette = (palette) => {
        setActivePalette(palette.id);
        updateConfig('color', palette.color);
    };

    return (
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-4 md:p-6 z-10">
            {/* Top Right */}
            <div className="flex justify-end items-start pointer-events-auto gap-2">
                <button
                    onClick={takeScreenshot}
                    className="glass-panel p-2.5 sm:p-3 hover:bg-white/10 text-white transition-colors"
                    title="Screenshot"
                >
                    <Camera size={isMobile ? 16 : 20} />
                </button>
                <button
                    onClick={toggleFullscreen}
                    className="glass-panel p-2.5 sm:p-3 hover:bg-white/10 text-white transition-colors"
                    title="Fullscreen"
                >
                    {isFullscreen ? <Minimize size={isMobile ? 16 : 20} /> : <Maximize size={isMobile ? 16 : 20} />}
                </button>
            </div>

            {/* Bottom: Controls + Hint */}
            <div className="flex flex-col items-start gap-3">
                {/* Controls Panel */}

                {/* SECRET HEART TRIGGER */}
                <div className="w-full flex justify-center mb-6 pointer-events-auto">
                    <button
                        onClick={() => updateGesture('Victory')}
                        className="group relative flex items-center justify-center p-4 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-600/20 border border-pink-500/30 backdrop-blur-md transition-all hover:scale-110 active:scale-95 duration-500 shadow-[0_0_30px_rgba(255,0,128,0.3)] hover:shadow-[0_0_50px_rgba(255,0,128,0.6)]"
                    >
                        <div className="absolute inset-0 rounded-full bg-pink-500/10 animate-ping opacity-75" />
                        <Heart
                            size={isMobile ? 32 : 48}
                            fill="#ff0080"
                            className="text-pink-500 animate-heartbeat drop-shadow-[0_0_10px_rgba(255,0,128,0.8)]"
                        />
                        <span className="absolute -bottom-8 text-[10px] sm:text-xs text-pink-300/50 font-romantic tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            нажми на меня
                        </span>
                    </button>
                </div>
                <div className="ui-panel pointer-events-auto max-w-xs sm:max-w-sm w-full transition-all duration-500">
                    <div className={`glass-panel overflow-hidden transition-all duration-500 ${isPanelOpen ? 'max-h-[500px] sm:max-h-[600px] opacity-100' : 'max-h-0 opacity-0 !border-0'}`}>
                        <div className="p-3 sm:p-4 space-y-3 max-h-[55vh] overflow-y-auto">

                            {/* Patterns */}
                            <div className="space-y-2">
                                <label className="text-[10px] sm:text-xs text-white/50 font-medium uppercase tracking-wide">Форма</label>
                                <div className="grid grid-cols-5 gap-1 sm:gap-2">
                                    {patterns.map((p) => {
                                        const Icon = p.icon;
                                        const isActive = config.pattern === p.id;
                                        return (
                                            <button
                                                key={p.id}
                                                onClick={() => updateConfig('pattern', p.id)}
                                                className={`flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-lg text-[10px] sm:text-xs transition-all border min-h-[44px] ${isActive
                                                    ? 'bg-pink-500/20 border-pink-400 text-white shadow-[0_0_10px_rgba(255,0,128,0.3)]'
                                                    : 'border-transparent hover:bg-white/5 text-gray-400'
                                                    }`}
                                            >
                                                <Icon size={isMobile ? 14 : 18} className={isActive ? 'text-pink-400' : ''} />
                                                <span className="mt-0.5 leading-none">{p.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Particle Size */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] sm:text-xs text-white/50 font-medium uppercase tracking-wide flex justify-between">
                                    <span>Размер частиц</span>
                                    <span className="text-pink-400/70 font-mono">{config.particleSize.toFixed(2)}</span>
                                </label>
                                <input
                                    type="range"
                                    min="0.04"
                                    max="0.35"
                                    step="0.01"
                                    value={config.particleSize}
                                    onChange={(e) => updateConfig('particleSize', parseFloat(e.target.value))}
                                    className="w-full h-6"
                                />
                            </div>

                            {/* Colors */}
                            <div className="space-y-2">
                                <label className="text-[10px] sm:text-xs text-white/50 font-medium uppercase tracking-wide flex items-center gap-1.5">
                                    <Palette size={10} />
                                    Цвет
                                </label>
                                <div className="grid grid-cols-6 gap-1.5">
                                    {colorPalettes.map((palette) => {
                                        const isActive = activePalette === palette.id;
                                        return (
                                            <button
                                                key={palette.id}
                                                onClick={() => selectPalette(palette)}
                                                className={`flex items-center justify-center p-2 rounded-lg transition-all border min-h-[36px] ${isActive
                                                    ? 'border-white/50 bg-white/10'
                                                    : 'border-transparent hover:bg-white/5'
                                                    }`}
                                            >
                                                <span
                                                    className="w-5 h-5 rounded-full"
                                                    style={{
                                                        backgroundColor: palette.color,
                                                        boxShadow: isActive ? `0 0 12px ${palette.color}` : 'none'
                                                    }}
                                                />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Custom Color */}
                            <div className="flex items-center space-x-3 bg-black/20 p-2 rounded-lg border border-white/5">
                                <div className="relative w-7 h-7 rounded-full overflow-hidden border border-white/20 shrink-0">
                                    <input
                                        type="color"
                                        value={config.color}
                                        onChange={(e) => {
                                            updateConfig('color', e.target.value);
                                            setActivePalette(null);
                                        }}
                                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 border-0 cursor-pointer"
                                    />
                                </div>
                                <span className="text-[10px] font-mono text-gray-400">{config.color}</span>
                            </div>

                        </div>
                    </div>

                    {/* Toggle */}
                    <button
                        onClick={() => setIsPanelOpen(!isPanelOpen)}
                        className="mt-1.5 glass-panel p-2 flex items-center space-x-2 px-3 hover:bg-white/10 text-white/70 transition-colors text-[10px] sm:text-xs font-medium"
                    >
                        {isPanelOpen ? (
                            <><ChevronDown size={12} /> <span>Скрыть настройки</span></>
                        ) : (
                            <><ChevronUp size={12} /> <span>⚙️ Настройки</span></>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Interface;

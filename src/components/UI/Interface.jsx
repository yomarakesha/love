import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Maximize, Minimize, Box, Disc, Activity, Zap, Palette, Settings2, ChevronUp, ChevronDown } from 'lucide-react';

const patterns = [
    { id: 'sphere', label: 'Sphere', icon: Disc },
    { id: 'cube', label: 'Cube', icon: Box },
    { id: 'galaxy', label: 'Galaxy', icon: Activity },
    { id: 'dna', label: 'Twist', icon: Zap },
];

const Interface = () => {
    const { config, updateConfig, gesture } = useApp();
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isPanelOpen, setIsPanelOpen] = useState(true);

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

    return (
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-10">
            {/* Header / Top Right Tools */}
            <div className="flex justify-end pointer-events-auto">
                <button
                    onClick={toggleFullscreen}
                    className="glass-panel p-3 hover:bg-white/10 text-white transition-colors"
                    title="Toggle Fullscreen"
                >
                    {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                </button>
            </div>

            {/* Main Controls Panel - Bottom Left */}
            <div className="pointer-events-auto max-w-xs w-full transition-all duration-500">
                <div className={`glass-panel overflow-hidden transition-all duration-500 ${isPanelOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="p-5 space-y-6">

                        {/* Header */}
                        <div className="flex items-center space-x-2 border-b border-white/10 pb-3">
                            <Settings2 size={18} className="text-cyan-400" />
                            <h2 className="text-sm font-semibold tracking-wider uppercase text-cyan-400">Configuration</h2>
                        </div>

                        {/* Patterns */}
                        <div className="space-y-3">
                            <label className="text-xs text-white/50 font-medium uppercase tracking-wide">Pattern Generator</label>
                            <div className="grid grid-cols-2 gap-2">
                                {patterns.map((p) => {
                                    const Icon = p.icon;
                                    const isActive = config.pattern === p.id;
                                    return (
                                        <button
                                            key={p.id}
                                            onClick={() => updateConfig('pattern', p.id)}
                                            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-all border ${isActive
                                                    ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_10px_rgba(34,211,238,0.3)]'
                                                    : 'border-transparent hover:bg-white/5 text-gray-400'
                                                }`}
                                        >
                                            <Icon size={16} />
                                            <span>{p.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Visual Customization */}
                        <div className="space-y-3">
                            <label className="text-xs text-white/50 font-medium uppercase tracking-wide">Visuals & Tone</label>
                            <div className="flex items-center space-x-4">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 bg-black/20 p-2 rounded-lg border border-white/5">
                                        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/20">
                                            <input
                                                type="color"
                                                value={config.color}
                                                onChange={(e) => updateConfig('color', e.target.value)}
                                                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 border-0 cursor-pointer"
                                            />
                                        </div>
                                        <span className="text-xs font-mono text-gray-300">{config.color}</span>
                                        <Palette size={14} className="text-gray-500 ml-auto" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Status */}
                        <div className="pt-2 border-t border-white/10">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-500">System Status</span>
                                <span className={`px-2 py-0.5 rounded-full ${gesture !== 'None' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/10 text-red-500/50'}`}>
                                    {gesture !== 'None' ? `Active: ${gesture}` : 'Standby'}
                                </span>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Toggle Handle */}
                <button
                    onClick={() => setIsPanelOpen(!isPanelOpen)}
                    className="mt-2 glass-panel p-2 flex items-center space-x-2 px-4 hover:bg-white/10 text-white/80 transition-colors text-xs font-medium"
                >
                    {isPanelOpen ? (
                        <>
                            <ChevronDown size={14} /> <span>Hide Controls</span>
                        </>
                    ) : (
                        <>
                            <ChevronUp size={14} /> <span>Show Controls</span>
                        </>
                    )}
                </button>
            </div>

            {/* Center Overlay Hints */}
            {gesture === 'None' && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none opacity-50">
                    <p className="text-sm font-light tracking-widest uppercase">Show Hand to Interact</p>
                </div>
            )}

        </div>
    );
};

export default Interface;

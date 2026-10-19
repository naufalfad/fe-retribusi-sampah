import React, { useState, useEffect } from 'react';
import { Droplets, Plus, Minus, Maximize } from 'lucide-react';
import { useGisUIStore } from '../../../../store/useGisUIStore';

/**
 * RIVER HORIZONTAL LEGEND & EMBEDDED ZOOM HUD
 * Menjelaskan spektrum warna baku mutu air sungai PP 22/2021 Kelas II.
 */
export default function RiverHorizontalLegend() {
    const { activeLayers, activePanels } = useGisUIStore();

    const [windowWidth, setWindowWidth] = useState(
        typeof window !== 'undefined' ? window.innerWidth : 1200
    );
    const [isMobile, setIsMobile] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setWindowWidth(width);
            setIsMobile(width < 768);
            if (width >= 768) {
                setIsExpanded(true);
            } else {
                setIsExpanded(false);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!activeLayers.includes('layer-river')) return null;

    const riverSpectrum = [
        { label: 'Normal (Sehat)', range: 'BOD < 2.0 mg/L', color: '#22d3ee', text: 'text-slate-900' },
        { label: 'Waspada (Ringan)', range: 'BOD 2.0 - 3.0', color: '#fbbf24', text: 'text-slate-900' },
        { label: 'Kritis (Berat)', range: 'BOD > 3.0 mg/L', color: '#f43f5e', text: 'text-white' },
    ];

    const isAqiActive = activeLayers.includes('layer-aqi');

    const leftSidebarWidth = 64;
    const activePanelsWidth = activePanels.reduce((sum, panel) => {
        if (panel.type === 'detil-objek' || panel.type === 'detil-tempat-sampah') return sum + 390;
        return sum + 360;
    }, 0);

    const totalLeftBlockedWidth = leftSidebarWidth + activePanelsWidth;
    const remainingWidth = windowWidth - totalLeftBlockedWidth;
    const calculatedLeftPosition = totalLeftBlockedWidth + (remainingWidth / 2);

    return (
        <div
            className={`absolute z-[28] pointer-events-auto flex animate-in fade-in duration-300 shadow-2xl transition-all ease-in-out ${
                isMobile
                    ? isAqiActive
                        ? 'bottom-36 left-4 flex-col items-start'
                        : 'bottom-20 left-4 flex-col items-start'
                    : isAqiActive
                    ? 'bottom-20 flex-col items-center'
                    : 'bottom-6 flex-col items-center'
            }`}
            style={isMobile ? {} : { left: `${calculatedLeftPosition}px`, transform: 'translateX(-50%)' }}
        >
            {isMobile && !isExpanded ? (
                <button
                    onClick={() => setIsExpanded(true)}
                    className="bg-white/90 backdrop-blur border border-slate-300 shadow-sm w-10 h-10 flex items-center justify-center text-cyan-600 hover:text-cyan-700 transition-colors rounded-none outline-none"
                    title="Buka Legenda Air"
                >
                    <Droplets size={18} strokeWidth={2.5} />
                </button>
            ) : (
                <>
                    {/* Header Legenda */}
                    <div
                        className="bg-white/95 backdrop-blur border border-slate-200 border-b-0 px-3 py-1 flex items-center justify-between gap-4 shadow-sm w-full md:w-auto cursor-pointer md:cursor-default select-none"
                        onClick={() => isMobile && setIsExpanded(false)}
                    >
                        <div className="flex items-center gap-1.5">
                            <Droplets size={12} className="text-cyan-600 animate-pulse" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-700">
                                Baku Mutu Air Sungai (PP No. 22/2021 Kelas II)
                            </span>
                        </div>
                    </div>

                    {/* Bilah Warna & Kontrol Zoom */}
                    <div className="flex flex-col md:flex-row bg-white border border-slate-300 shadow-lg rounded-none overflow-hidden w-full md:w-auto select-none">
                        <div className="flex flex-col md:flex-row w-full md:w-auto">
                            {riverSpectrum.map((item, idx) => (
                                <div
                                    key={idx}
                                    className={`flex flex-col items-center justify-center px-4 py-1.5 md:px-5 md:py-1 min-w-[90px] md:min-w-[120px] border-b md:border-b-0 md:border-r border-black/10 last:border-b-0 md:last:border-r-0 hover:backdrop-brightness-110 ${item.text}`}
                                    style={{ backgroundColor: item.color }}
                                    title={`Status: ${item.label}`}
                                >
                                    <span className="text-[9px] font-black tracking-tight whitespace-nowrap leading-none uppercase drop-shadow-sm">
                                        {item.label}
                                    </span>
                                    <span className="text-[8px] font-bold opacity-90 mt-0.5 leading-none drop-shadow-sm font-mono">
                                        {item.range}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {!isAqiActive && (
                            <div className="hidden md:flex bg-slate-950 text-slate-300 select-none divide-x divide-white/10 shrink-0">
                                <button
                                    onClick={() => window.dispatchEvent(new Event('map-zoom-in'))}
                                    className="w-9 h-full flex items-center justify-center hover:bg-cyan-600 hover:text-white transition-colors outline-none cursor-pointer"
                                >
                                    <Plus size={13} strokeWidth={3} />
                                </button>
                                <button
                                    onClick={() => window.dispatchEvent(new Event('map-reset-view'))}
                                    className="w-9 h-full flex items-center justify-center hover:bg-cyan-600 hover:text-white transition-colors outline-none cursor-pointer"
                                >
                                    <Maximize size={11} strokeWidth={3} />
                                </button>
                                <button
                                    onClick={() => window.dispatchEvent(new Event('map-zoom-out'))}
                                    className="w-9 h-full flex items-center justify-center hover:bg-cyan-600 hover:text-white transition-colors outline-none cursor-pointer"
                                >
                                    <Minus size={13} strokeWidth={3} />
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

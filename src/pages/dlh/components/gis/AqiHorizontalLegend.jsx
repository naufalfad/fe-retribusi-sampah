import React, { useState, useEffect } from 'react';
import { Wind, Plus, Minus, Maximize } from 'lucide-react';
import { useGisUIStore } from '../../../../store/useGisUIStore';

/**
 * AQI HORIZONTAL LEGEND & EMBEDDED ZOOM HUD (GFW PARADIGM)
 * Menampilkan bilah spektrum warna kualitas udara secara mendatar di bawah layar
 * dengan perhitungan dynamic centering offset dan integrasi kontrol zoom taktis.
 */
export default function AqiHorizontalLegend() {
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

    if (!activeLayers.includes('layer-aqi')) return null;

    const aqiSpectrum = [
        { label: 'Baik', range: '0 - 50', color: '#10b981', text: 'text-white' },
        { label: 'Sedang', range: '51 - 100', color: '#facc15', text: 'text-slate-900' },
        { label: 'Sensitif', range: '101 - 150', color: '#f97316', text: 'text-white' },
        { label: 'Tidak Sehat', range: '151 - 200', color: '#ef4444', text: 'text-white' },
        { label: 'Sgt Tdk Sehat', range: '201 - 300', color: '#9333ea', text: 'text-white' },
        { label: 'Berbahaya', range: '300+', color: '#7e0023', text: 'text-white' },
    ];

    // Dynamic Centering Calculation
    const leftSidebarWidth = 64;
    const activePanelsWidth = activePanels.reduce((sum, panel) => {
        if (panel.type === 'detil-objek' || panel.type === 'detil-tempat-sampah') return sum + 390;
        return sum + 360;
    }, 0);

    const totalLeftBlockedWidth = leftSidebarWidth + activePanelsWidth;
    const remainingWidth = windowWidth - totalLeftBlockedWidth;
    const calculatedLeftPosition = totalLeftBlockedWidth + (remainingWidth / 2);

    const colorStops = aqiSpectrum
        .map((item, index) => {
            const centerPercent = ((index * 2 + 1) / (aqiSpectrum.length * 2)) * 100;
            return `${item.color} ${centerPercent}%`;
        })
        .join(', ');

    const smoothGradientBackground = isMobile
        ? `linear-gradient(to bottom, ${colorStops})`
        : `linear-gradient(to right, ${colorStops})`;

    return (
        <div
            className={`absolute z-[29] pointer-events-auto flex animate-in fade-in duration-300 shadow-2xl transition-all ease-in-out ${
                isMobile ? 'bottom-20 left-4 flex-col items-start' : 'bottom-6 flex-col items-center'
            }`}
            style={isMobile ? {} : { left: `${calculatedLeftPosition}px`, transform: 'translateX(-50%)' }}
        >
            {isMobile && !isExpanded ? (
                <button
                    onClick={() => setIsExpanded(true)}
                    className="bg-white/90 backdrop-blur border border-slate-300 shadow-sm w-10 h-10 flex items-center justify-center text-slate-600 hover:text-emerald-700 transition-colors rounded-none outline-none"
                    title="Buka Legenda Udara"
                >
                    <Wind size={18} strokeWidth={2.5} />
                </button>
            ) : (
                <>
                    {/* Header Legenda */}
                    <div
                        className="bg-white/95 backdrop-blur border border-slate-200 border-b-0 px-3 py-1.5 flex items-center justify-between gap-4 shadow-sm w-full md:w-auto cursor-pointer md:cursor-default select-none"
                        onClick={() => isMobile && setIsExpanded(false)}
                    >
                        <div className="flex items-center gap-1.5">
                            <Wind size={12} className="text-emerald-700 animate-pulse" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-700">
                                US EPA Air Quality Index (AQI) - Kualitas Udara
                            </span>
                        </div>
                    </div>

                    {/* Bilah Warna & Kontrol Zoom */}
                    <div className="flex flex-col md:flex-row bg-white border border-slate-300 shadow-lg rounded-none overflow-hidden w-full md:w-auto select-none">
                        {/* Segmen Spektrum Warna */}
                        <div
                            className="flex flex-col md:flex-row w-full md:w-auto"
                            style={{ background: smoothGradientBackground }}
                        >
                            {aqiSpectrum.map((item, idx) => (
                                <div
                                    key={idx}
                                    className={`flex flex-col items-center justify-center px-2 py-1.5 md:px-3.5 md:py-1 min-w-[55px] md:min-w-[80px] border-b md:border-b-0 md:border-r border-black/10 last:border-b-0 md:last:border-r-0 hover:backdrop-brightness-110 bg-transparent ${item.text}`}
                                    title={`AQI ${item.range}: ${item.label}`}
                                >
                                    <span className="text-[9px] font-black tracking-tight whitespace-nowrap leading-none uppercase drop-shadow-sm">
                                        {item.label}
                                    </span>
                                    <span className="text-[8px] font-bold opacity-90 mt-0.5 leading-none drop-shadow-sm">
                                        {item.range}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Kontrol Zoom Embedded */}
                        <div className="hidden md:flex bg-slate-950 text-slate-300 select-none divide-x divide-white/10 shrink-0">
                            <button
                                onClick={() => window.dispatchEvent(new Event('map-zoom-in'))}
                                className="w-9 h-full flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-colors outline-none cursor-pointer"
                                title="Perbesar (Zoom In)"
                            >
                                <Plus size={13} strokeWidth={3} />
                            </button>
                            <button
                                onClick={() => window.dispatchEvent(new Event('map-reset-view'))}
                                className="w-9 h-full flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-colors outline-none cursor-pointer"
                                title="Pusatkan Ulang Peta"
                            >
                                <Maximize size={11} strokeWidth={3} />
                            </button>
                            <button
                                onClick={() => window.dispatchEvent(new Event('map-zoom-out'))}
                                className="w-9 h-full flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-colors outline-none cursor-pointer"
                                title="Perkecil (Zoom Out)"
                            >
                                <Minus size={13} strokeWidth={3} />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

import React, { useMemo } from 'react';
import { Plus, Minus, Maximize, Map as MapIcon, Home, Building2, AlertTriangle } from 'lucide-react';
import { useGisUIStore } from '../../../../store/useGisUIStore';

export default function MapHUD() {
    const { activeLayers } = useGisUIStore();

    const triggerZoomIn = () => window.dispatchEvent(new Event('map-zoom-in'));
    const triggerZoomOut = () => window.dispatchEvent(new Event('map-zoom-out'));
    const triggerResetView = () => window.dispatchEvent(new Event('map-reset-view'));

    const legendItems = useMemo(() => {
        return [
            {
                label: 'Rumah Tinggal (Domestik)',
                color: 'bg-emerald-600',
                type: 'home',
                layerId: 'layer-rumah',
            },
            {
                label: 'Non Rumah Tinggal (Bisnis/Usaha)',
                color: 'bg-blue-600',
                type: 'building',
                layerId: 'layer-non-rumah',
            },
            {
                label: 'Alarm EWS (Nunggak SKRD)',
                color: 'bg-rose-600',
                type: 'ews',
                layerId: 'layer-status-nunggak',
            },
            {
                label: 'Batas Administrasi Wilayah',
                color: 'border-indigo-600',
                type: 'boundary',
            },
        ];
    }, []);

    return (
        <div className="absolute bottom-6 right-6 z-30 pointer-events-auto flex flex-row items-end gap-3 select-none">
            {/* LEGENDA KEPATUHAN RETRIBUSI */}
            <div className="bg-white/95 backdrop-blur-md border border-slate-300 shadow-xl rounded-none w-68 animate-in fade-in flex flex-col text-left">
                {/* Header Legenda */}
                <div className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-50/90 border-b border-slate-200">
                    <MapIcon size={13} className="text-emerald-700" />
                    <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-widest">
                        Legenda Peta Retribusi
                    </h4>
                </div>

                {/* List Item Legenda */}
                <div className="flex flex-col py-1.5 divide-y divide-slate-100">
                    {legendItems.map((item, idx) => {
                        let isLayerActive = true;
                        if (item.layerId) {
                            isLayerActive = activeLayers.includes(item.layerId);
                        }

                        return (
                            <div
                                key={idx}
                                className={`flex items-center gap-3 px-3.5 py-2 hover:bg-slate-50/60 transition-all duration-200 ${
                                    isLayerActive ? 'opacity-100' : 'opacity-40'
                                }`}
                            >
                                <div className="relative w-5 h-5 shrink-0 flex items-center justify-center">
                                    {item.type === 'home' && (
                                        <div className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center shadow-sm border border-white">
                                            <Home size={11} strokeWidth={2.5} />
                                        </div>
                                    )}

                                    {item.type === 'building' && (
                                        <div className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center shadow-sm border border-white">
                                            <Building2 size={11} strokeWidth={2.5} />
                                        </div>
                                    )}

                                    {item.type === 'ews' && (
                                        <div className="relative w-5 h-5 flex items-center justify-center">
                                            <span
                                                className={`absolute inline-flex h-full w-full rounded-md opacity-60 bg-rose-400 ${
                                                    isLayerActive ? 'animate-ping' : ''
                                                }`}
                                            />
                                            <div className="relative w-5 h-5 rounded-md bg-rose-600 text-white flex items-center justify-center shadow-sm border border-white">
                                                <AlertTriangle size={11} strokeWidth={2.5} />
                                            </div>
                                        </div>
                                    )}

                                    {item.type === 'boundary' && (
                                        <div className="w-5 h-2.5 border-2 border-indigo-600 border-dashed" />
                                    )}
                                </div>

                                <span
                                    className={`text-[11px] font-semibold leading-tight ${
                                        isLayerActive ? 'text-slate-800' : 'text-slate-400'
                                    }`}
                                >
                                    {item.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* NAVIGASI ZOOM & RESET KONTROL */}
            <div className="flex flex-col bg-white/95 backdrop-blur-md border border-slate-300 shadow-xl rounded-none overflow-hidden divide-y divide-slate-200 shrink-0">
                <button
                    onClick={triggerZoomIn}
                    className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-emerald-700 transition-colors active:bg-slate-200 rounded-none outline-none cursor-pointer"
                    title="Perbesar Peta (Zoom In)"
                >
                    <Plus size={18} strokeWidth={2.5} />
                </button>
                <button
                    onClick={triggerResetView}
                    className="w-10 h-9 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-emerald-700 transition-colors active:bg-slate-200 group rounded-none outline-none cursor-pointer"
                    title="Pusatkan Ulang Peta (Reset View)"
                >
                    <Maximize size={14} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
                </button>
                <button
                    onClick={triggerZoomOut}
                    className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-emerald-700 transition-colors active:bg-slate-200 rounded-none outline-none cursor-pointer"
                    title="Perkecil Peta (Zoom Out)"
                >
                    <Minus size={18} strokeWidth={2.5} />
                </button>
            </div>
        </div>
    );
}

import React, { useState, useMemo } from 'react';
import {
    Plus,
    Minus,
    Maximize,
    Map as MapIcon,
    Home,
    Building2,
    AlertTriangle,
    Recycle,
    Trash2,
    Factory,
    Truck,
    ChevronDown,
    ChevronUp,
    Wind,
    Droplets,
    Flame,
    Mountain,
} from 'lucide-react';
import { useGisUIStore } from '../../../../store/useGisUIStore';

export default function MapHUD() {
    const { activeLayers } = useGisUIStore();
    const [isLegendCollapsed, setIsLegendCollapsed] = useState(false);

    const triggerZoomIn = () => window.dispatchEvent(new Event('map-zoom-in'));
    const triggerZoomOut = () => window.dispatchEvent(new Event('map-zoom-out'));
    const triggerResetView = () => window.dispatchEvent(new Event('map-reset-view'));

    // Daftar Item Legenda Lengkap (Objek Retribusi & Fasilitas Persampahan & Lingkungan)
    const legendSections = useMemo(() => {
        return [
            {
                title: 'Fasilitas Persampahan',
                items: [
                    {
                        label: 'Bank Sampah (BS)',
                        desc: 'Pemilahan Mandiri & Bernilai Jual',
                        color: 'bg-teal-600',
                        icon: Recycle,
                        layerId: 'layer-bank-sampah',
                    },
                    {
                        label: 'TPS (Sementara)',
                        desc: 'Transit Sampah Lingkungan',
                        color: 'bg-amber-600',
                        icon: Trash2,
                        layerId: 'layer-tps',
                    },
                    {
                        label: 'TPST (3R Terpadu)',
                        desc: 'Pusat Pengolahan & Daur Ulang',
                        color: 'bg-indigo-600',
                        icon: Factory,
                        layerId: 'layer-tpst',
                    },
                    {
                        label: 'TPA (Pemrosesan Akhir)',
                        desc: 'TPA Galuga Kab. Bogor',
                        color: 'bg-purple-700',
                        icon: Truck,
                        layerId: 'layer-tpa',
                    },
                ],
            },
            {
                title: 'Objek Retribusi',
                items: [
                    {
                        label: 'Rumah Tinggal (Domestik)',
                        color: 'bg-emerald-600',
                        type: 'home',
                        layerId: 'layer-rumah',
                    },
                    {
                        label: 'Non Rumah Tinggal (Usaha)',
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
                ],
            },
            {
                title: 'Kualitas Lingkungan',
                items: [
                    {
                        label: 'Kualitas Udara & Angin',
                        desc: 'US EPA AQI & Vektor Angin',
                        color: 'bg-teal-500',
                        icon: Wind,
                        layerId: 'layer-aqi',
                    },
                    {
                        label: 'Aliran Sungai (PP 22/2021)',
                        desc: 'Baku Mutu Air & Arus Sungai',
                        color: 'bg-cyan-400',
                        icon: Droplets,
                        layerId: 'layer-river',
                    },
                    {
                        label: 'Stasiun Sampel Air',
                        desc: 'Sensor BOD, COD, DO & pH',
                        color: 'bg-blue-600',
                        icon: Droplets,
                        layerId: 'layer-water-stations',
                    },
                ],
            },
            {
                title: 'Kebakaran & Vulkanik',
                items: [
                    {
                        label: 'Titik Api Aktif (NASA FIRMS)',
                        desc: 'Anomali Termal & Suhu Kecerahan',
                        color: 'bg-rose-500',
                        icon: Flame,
                        layerId: 'layer-wildfire',
                    },
                    {
                        label: 'Abu Vulkanik & SO2 (GIBS)',
                        desc: 'Sentinel Gn. Salak, Gede & SO2',
                        color: 'bg-purple-600',
                        icon: Mountain,
                        layerId: 'layer-volcano-ash',
                    },
                ],
            },
            {
                title: 'Batas Wilayah',
                items: [
                    {
                        label: 'Batas Administrasi Wilayah',
                        type: 'boundary',
                    },
                ],
            },
        ];
    }, []);

    return (
        <div className="absolute bottom-6 right-6 z-30 pointer-events-auto flex flex-row items-end gap-3 select-none">
            {/* LEGENDA PETA RETRIBUSI & FASILITAS PERSAMPAHAN */}
            <div className="bg-white/95 backdrop-blur-md border border-slate-300 shadow-xl rounded-none w-72 animate-in fade-in flex flex-col text-left overflow-hidden">
                {/* Header Legenda */}
                <div
                    onClick={() => setIsLegendCollapsed(!isLegendCollapsed)}
                    className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50/90 border-b border-slate-200 cursor-pointer hover:bg-slate-100/80 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <MapIcon size={13} className="text-emerald-700" />
                        <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-widest">
                            Legenda Peta & Fasilitas
                        </h4>
                    </div>
                    <button
                        type="button"
                        className="text-slate-400 hover:text-slate-600 p-0.5"
                    >
                        {isLegendCollapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                </div>

                {/* Body Legenda */}
                {!isLegendCollapsed && (
                    <div className="flex flex-col py-1 max-h-80 overflow-y-auto custom-scrollbar divide-y divide-slate-100">
                        {legendSections.map((sec, sIdx) => (
                            <div key={sIdx} className="py-1.5">
                                {/* Subheader Seksi */}
                                <div className="px-3.5 pb-1 pt-0.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                    {sec.title}
                                </div>

                                <div className="flex flex-col divide-y divide-slate-50">
                                    {sec.items.map((item, idx) => {
                                        let isLayerActive = true;
                                        if (item.layerId) {
                                            isLayerActive = activeLayers.includes(item.layerId);
                                        }

                                        const IconComp = item.icon;

                                        return (
                                            <div
                                                key={idx}
                                                className={`flex items-center gap-2.5 px-3.5 py-1.5 hover:bg-slate-50/60 transition-all duration-200 ${isLayerActive ? 'opacity-100' : 'opacity-40'
                                                    }`}
                                            >
                                                {/* Visual Icon / Marker Box */}
                                                <div className="relative w-6 h-6 shrink-0 flex items-center justify-center">
                                                    {/* Fasilitas Tempat Sampah (Icon + Badge menimpa) */}
                                                    {IconComp && (
                                                        <div className={`relative w-5 h-5 rounded-md ${item.color} text-white flex items-center justify-center shadow-sm border border-white overflow-hidden`}>
                                                            <IconComp size={11} strokeWidth={2.4} className="opacity-90" />
                                                        </div>
                                                    )}

                                                    {/* Rumah Tinggal */}
                                                    {item.type === 'home' && (
                                                        <div className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center shadow-sm border border-white">
                                                            <Home size={11} strokeWidth={2.5} />
                                                        </div>
                                                    )}

                                                    {/* Non Rumah Tinggal */}
                                                    {item.type === 'building' && (
                                                        <div className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center shadow-sm border border-white">
                                                            <Building2 size={11} strokeWidth={2.5} />
                                                        </div>
                                                    )}

                                                    {/* Alarm EWS */}
                                                    {item.type === 'ews' && (
                                                        <div className="relative w-5 h-5 flex items-center justify-center">
                                                            <span
                                                                className={`absolute inline-flex h-full w-full rounded-md opacity-60 bg-rose-400 ${isLayerActive ? 'animate-ping' : ''
                                                                    }`}
                                                            />
                                                            <div className="relative w-5 h-5 rounded-md bg-rose-600 text-white flex items-center justify-center shadow-sm border border-white">
                                                                <AlertTriangle size={11} strokeWidth={2.5} />
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Batas Administrasi */}
                                                    {item.type === 'boundary' && (
                                                        <div className="w-5 h-2.5 border-2 border-indigo-600 border-dashed" />
                                                    )}
                                                </div>

                                                {/* Text Label & Sublabel */}
                                                <div className="flex flex-col min-w-0">
                                                    <span
                                                        className={`text-[11px] font-semibold leading-tight truncate ${isLayerActive ? 'text-slate-800' : 'text-slate-400'
                                                            }`}
                                                    >
                                                        {item.label}
                                                    </span>
                                                    {item.desc && (
                                                        <span className="text-[9px] text-slate-400 leading-none mt-0.5 truncate">
                                                            {item.desc}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
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

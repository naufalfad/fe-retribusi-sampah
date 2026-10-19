import React, { useState, useEffect } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Droplets, Activity, Thermometer, Wind, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useGisUIStore } from '../../../../../store/useGisUIStore';
import { WATER_STATIONS_DATA } from './RiverLayer';
import api from '../../../../../api/axios';

const BAKU_MUTU_LIMITS = {
    BOD: 3.0, // mg/L Max PP 22/2021 Kelas II
    COD: 25.0,
    DO: 4.0,  // mg/L Min
    PH_MIN: 6.0,
    PH_MAX: 9.0,
};

const checkIsCritical = (station) => {
    const data = station.currentData;
    return (
        data.bod > BAKU_MUTU_LIMITS.BOD ||
        data.cod > BAKU_MUTU_LIMITS.COD ||
        data.do < BAKU_MUTU_LIMITS.DO ||
        data.ph < BAKU_MUTU_LIMITS.PH_MIN ||
        data.ph > BAKU_MUTU_LIMITS.PH_MAX
    );
};

const createWaterIcon = (station) => {
    const critical = checkIsCritical(station);
    const colorClass = critical ? 'bg-rose-500' : 'bg-cyan-400';
    const ringClass = critical ? 'sonar-ripple-rose' : 'sonar-ripple-cyan';

    return L.divIcon({
        html: `
            <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
                <span class="absolute inline-flex rounded-full h-8 w-8 ${ringClass} opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3.5 w-3.5 ${colorClass} border-2 border-white shadow-md"></span>
            </div>
        `,
        className: 'custom-water-station-icon bg-transparent border-none',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
    });
};

/**
 * WATER SAMPLE MARKER LAYER (LOD & THRESHOLD DETECTOR)
 * Merender titik stasiun pantau baku mutu air sungai dengan efek sonar radar apung.
 */
export default function WaterSampleMarkerLayer() {
    const { activeLayers } = useGisUIStore();
    const [stations, setStations] = useState(WATER_STATIONS_DATA);

    useEffect(() => {
        let isMounted = true;
        const fetchStations = async () => {
            try {
                const res = await api.get('/analytics/water-stations');
                if (isMounted && res.data && res.data.success && Array.isArray(res.data.data)) {
                    setStations(res.data.data);
                }
            } catch (err) {
                // Fallback default WATER_STATIONS_DATA
            }
        };

        if (activeLayers.includes('layer-water-stations')) {
            fetchStations();
        }

        return () => { isMounted = false; };
    }, [activeLayers]);

    if (!activeLayers.includes('layer-water-stations')) return null;

    return (
        <React.Fragment>
            {/* Style Keyframes untuk Sonar Ripple */}
            <style>{`
                @keyframes sonar-wave-expand {
                    0% {
                        transform: scale(0.3);
                        opacity: 1;
                    }
                    100% {
                        transform: scale(2.2);
                        opacity: 0;
                    }
                }
                .sonar-ripple-cyan {
                    border: 2px solid #22d3ee;
                    background-color: rgba(34, 211, 238, 0.18);
                    animation: sonar-wave-expand 1.8s cubic-bezier(0.215, 0.610, 0.355, 1) infinite;
                }
                .sonar-ripple-rose {
                    border: 2px solid #f43f5e;
                    background-color: rgba(244, 63, 94, 0.22);
                    animation: sonar-wave-expand 1.2s cubic-bezier(0.215, 0.610, 0.355, 1) infinite;
                }
            `}</style>

            {stations.map((station) => {
                const critical = checkIsCritical(station);
                const data = station.currentData;

                return (
                    <Marker
                        key={station.id}
                        position={[station.lat, station.lng]}
                        icon={createWaterIcon(station)}
                        zIndexOffset={300}
                    >
                        <Popup className="custom-water-popup">
                            <div className="p-1 min-w-[250px] font-sans text-slate-800 text-left">
                                {/* Header */}
                                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                    <div className="flex items-center gap-1.5 text-cyan-700">
                                        <Droplets size={14} className="animate-pulse" />
                                        <span className="text-xs font-black tracking-tight uppercase">Stasiun Pantau Air</span>
                                    </div>
                                    <span
                                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                            critical ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                                        }`}
                                    >
                                        {critical ? 'TERCEMAR' : 'MEMENUHI SYARAT'}
                                    </span>
                                </div>

                                <div className="mt-2 text-xs font-bold text-slate-800 leading-tight">
                                    {station.name}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                    ID: {station.id} &bull; {station.lat.toFixed(4)}, {station.lng.toFixed(4)}
                                </div>

                                {/* Parameter Kimia Air */}
                                <div className="grid grid-cols-2 gap-2 my-2.5 bg-slate-50 p-2 border border-slate-200">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-500 font-medium">BOD (Biochemical)</span>
                                        <span className="text-xs font-bold text-slate-800 font-mono">
                                            {data.bod} <span className="text-[9px] text-slate-400 font-normal">mg/L</span>
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-500 font-medium">COD (Chemical)</span>
                                        <span className="text-xs font-bold text-slate-800 font-mono">
                                            {data.cod} <span className="text-[9px] text-slate-400 font-normal">mg/L</span>
                                        </span>
                                    </div>
                                    <div className="flex flex-col pt-1 border-t border-slate-200/60">
                                        <span className="text-[10px] text-slate-500 font-medium">DO (Oksigen Terlarut)</span>
                                        <span className="text-xs font-bold text-slate-800 font-mono">
                                            {data.do} <span className="text-[9px] text-slate-400 font-normal">mg/L</span>
                                        </span>
                                    </div>
                                    <div className="flex flex-col pt-1 border-t border-slate-200/60">
                                        <span className="text-[10px] text-slate-500 font-medium">Derajat Keasaman (pH)</span>
                                        <span className="text-xs font-bold text-slate-800 font-mono">
                                            {data.ph}
                                        </span>
                                    </div>
                                </div>

                                {/* Status Cuaca BMKG */}
                                <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                                    <span className="flex items-center gap-1">
                                        <Thermometer size={11} className="text-amber-500" /> Kondisi Cuaca:
                                    </span>
                                    <span className="font-semibold text-slate-700">{data.weather}</span>
                                </div>

                                {/* Footer Peringatan / Regulasi */}
                                <div className="mt-2 pt-1 border-t border-dashed border-slate-200 flex items-center gap-1 text-[9px] text-slate-500">
                                    {critical ? (
                                        <ShieldAlert size={12} className="text-rose-600 shrink-0" />
                                    ) : (
                                        <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                                    )}
                                    <span>Standar Baku Mutu PP No. 22 Th 2021 (Kelas II)</span>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                );
            })}
        </React.Fragment>
    );
}

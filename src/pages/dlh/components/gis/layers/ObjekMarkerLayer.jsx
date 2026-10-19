import React, { useMemo } from 'react';
import { Marker, Tooltip, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { useGisUIStore } from '../../../../../store/useGisUIStore';

// SVG Rumah Tinggal (House Icon)
const HOUSE_SVG = `
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 10.5L12 3l9 7.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 13 15 13 15 22"/>
</svg>
`;

// SVG Non Rumah Tinggal (Building / Gedung Komersil Icon)
const BUILDING_SVG = `
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
    <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
    <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
    <path d="M10 6h4"/>
    <path d="M10 10h4"/>
    <path d="M10 14h4"/>
    <path d="M10 18h4"/>
</svg>
`;

// Generator Ikon Marker Presisi Berbentuk Pin dengan Ikon Rumah / Gedung
const createObjekMarkerIcon = (kategori, hasUnpaid, isSelected) => {
    const isNonRumah = kategori === 'Non Rumah Tinggal' || String(kategori).toLowerCase().includes('non');

    // Hijau Zamrud untuk Rumah Tinggal, Biru Pekat untuk Non Rumah Tinggal
    const fillColor = isNonRumah ? '#2563eb' : '#059669';
    const strokeColor = isSelected ? '#fbbf24' : '#ffffff';
    const strokeWidth = isSelected ? '3' : '2.5';
    const scaleClass = isSelected ? 'scale-115 -translate-y-1' : 'hover:scale-110';
    const iconSvg = isNonRumah ? BUILDING_SVG : HOUSE_SVG;

    return L.divIcon({
        html: `
            <div style="position: relative; width: 38px; height: 48px; display: flex; align-items: center; justify-content: center; cursor: pointer;" class="${scaleClass} transition-transform duration-200">
                ${hasUnpaid ? `
                    <!-- Radar Alarm Penunggak EWS di Layer Belakang -->
                    <div style="position: absolute; left: 4px; top: 2px; width: 30px; height: 30px; border-radius: 9999px; background: rgba(225, 29, 72, 0.45); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; pointer-events: none;"></div>
                ` : ''}

                <!-- SVG Utama yang menyatukan Badan Pin, Icon Rumah/Gedung, dan Tanda Seru di dalamnya -->
                <svg width="44" height="44" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.6)); overflow: visible; position: relative; z-index: 1;">
                    
                    {/* 1. Badan Pin */}
                    <path d="M16 42 C11.5 33.5 2.5 23 2.5 15 A 13.5 13.5 0 1 1 29.5 15 C 29.5 23 20.5 33.5 16 42 Z" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linejoin="round"/>
                    
                    {/* 2. Icon Rumah/Gedung */}
                    <g transform="translate(7, 5)">
                        ${iconSvg}
                    </g>

                    ${hasUnpaid ? `
                        {/* 3. Badge Tanda Seru EWS DI LAYER PALING ATAS (Murni SVG) */}
                        <g transform="translate(18, -3)">
                            <circle cx="7" cy="7" r="7" fill="#e11d48" stroke="#ffffff" stroke-width="1.5"/>
                            <text x="7" y="10" fill="#ffffff" font-size="9" font-weight="900" font-family="sans-serif" text-anchor="middle">!</text>
                        </g>
                    ` : ''}

                    ${isSelected ? `
                        {/* 4. Badge Seleksi Aktif DI LAYER PALING ATAS */}
                        <g transform="translate(-2, -3)">
                            <circle cx="7" cy="7" r="7" fill="#f59e0b" stroke="#ffffff" stroke-width="1.5"/>
                            <text x="7" y="10" fill="#ffffff" font-size="8" font-weight="900" font-family="sans-serif" text-anchor="middle">✓</text>
                        </g>
                    ` : ''}
                </svg>
            </div>
        `,
        className: 'custom-objek-marker-pin bg-transparent border-none',
        iconSize: [32, 42],
        iconAnchor: [16, 42],
        popupAnchor: [0, -38],
    });
};

// Generator Custom Cluster Icon (Koleksi Angka)
const createClusterCustomIcon = (cluster) => {
    const count = cluster.getChildCount();
    let size = 'w-10 h-10';
    let color = 'bg-emerald-600';

    if (count > 50) {
        size = 'w-12 h-12 text-sm';
        color = 'bg-rose-600';
    } else if (count > 15) {
        size = 'w-11 h-11 text-xs';
        color = 'bg-amber-600';
    }

    return L.divIcon({
        html: `
            <div class="${size} ${color} text-white rounded-full flex items-center justify-center border-2 border-white shadow-2xl font-black text-xs select-none" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.5));">
                ${count}
            </div>
        `,
        className: 'custom-marker-cluster bg-transparent border-none',
        iconSize: L.point(40, 40, true),
        iconAnchor: [20, 20],
    });
};

export default function ObjekMarkerLayer({ objekList = [], currentZoom = 12 }) {
    const map = useMap();
    const {
        activeLayers,
        selectedObjectId,
        setSelectedObject,
        openPanel,
        closePanelsToTheRight,
        mapOpacity,
    } = useGisUIStore();

    // Olah data objek retribusi
    const processedObjects = useMemo(() => {
        return objekList
            .map((obj) => {
                const lat = parseFloat(obj.lat);
                const lng = parseFloat(obj.lng);

                if (isNaN(lat) || isNaN(lng)) return null;

                const isNonRumah = obj.kategori_objek === 'Non Rumah Tinggal' || String(obj.kategori_objek).toLowerCase().includes('non');
                const hasUnpaid = obj.Skrds?.some((s) => s.status?.toLowerCase() === 'unpaid');

                // Filter apakah layer aktif
                const isRumahActive = activeLayers.includes('layer-rumah');
                const isNonRumahActive = activeLayers.includes('layer-non-rumah');
                const isNunggakOnly = activeLayers.includes('layer-status-nunggak');

                if (isNonRumah && !isNonRumahActive) return null;
                if (!isNonRumah && !isRumahActive) return null;
                if (isNunggakOnly && !hasUnpaid) return null;

                return {
                    ...obj,
                    lat,
                    lng,
                    isNonRumah,
                    hasUnpaid,
                };
            })
            .filter(Boolean);
    }, [objekList, activeLayers]);

    const handleEntityClick = (obj, e) => {
        if (e && e.originalEvent) {
            e.originalEvent.stopPropagation();
        }

        map.flyTo([obj.lat, obj.lng], Math.max(currentZoom, 17), { duration: 1.5 });
        setSelectedObject(obj);

        closePanelsToTheRight(-1);
        openPanel('detil-objek', 'Detail Objek Retribusi', obj);
    };

    return (
        <MarkerClusterGroup
            chunkedLoading
            iconCreateFunction={createClusterCustomIcon}
            maxClusterRadius={55}
            disableClusteringAtZoom={17}
            spiderfyOnMaxZoom={true}
            showCoverageOnHover={false}
        >
            {processedObjects.map((obj) => {
                const isSelected = selectedObjectId === obj.id_objek;

                return (
                    <Marker
                        key={`marker-${obj.id_objek}`}
                        position={[obj.lat, obj.lng]}
                        icon={createObjekMarkerIcon(obj.kategori_objek, obj.hasUnpaid, isSelected)}
                        eventHandlers={{ click: (e) => handleEntityClick(obj, e) }}
                    >
                        <Tooltip direction="top" offset={[0, -42]} opacity={0.95}>
                            <div className="font-sans text-left text-xs font-bold leading-tight">
                                <div className="text-slate-800 uppercase">{obj.nama_objek}</div>
                                <div className="text-[10px] text-slate-500 font-semibold">{obj.kategori_objek} • {obj.npor_objek || '-'}</div>
                                {obj.hasUnpaid && (
                                    <div className="text-[10px] text-rose-600 font-bold mt-0.5">⚠️ Ada Tagihan SKRD Belum Lunas</div>
                                )}
                            </div>
                        </Tooltip>
                    </Marker>
                );
            })}
        </MarkerClusterGroup>
    );
}

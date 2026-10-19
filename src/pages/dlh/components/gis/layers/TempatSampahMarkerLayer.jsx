import React, { useEffect, useState, useMemo } from 'react';
import { Marker, Tooltip, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import api from '../../../../../api/axios';
import { useGisUIStore } from '../../../../../store/useGisUIStore';

// SVG Icons untuk berbagai jenis fasilitas
const RECYCLE_SVG = `
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
    <path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5"/>
    <path d="M11 19h8.2a1.8 1.8 0 0 0 1.716-1.254 1.84 1.84 0 0 0-.54-1.926L16.5 12"/>
    <path d="M11 5h2a2 2 0 0 1 2 2v1"/>
    <path d="m14 13-3-3 3-3"/>
    <path d="m2 16 3 3 3-3"/>
</svg>
`;

const TRASH_BIN_SVG = `
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 6h18"/>
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
    <line x1="10" x2="10" y1="11" y2="17"/>
    <line x1="14" x2="14" y1="11" y2="17"/>
</svg>
`;

const FACTORY_3R_SVG = `
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
    <path d="M17 18h1"/>
    <path d="M12 18h1"/>
    <path d="M7 18h1"/>
</svg>
`;

const TPA_LANDFILL_SVG = `
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <path d="m8 3 4 8 5-5 5 15H2L8 3z"/>
    <path d="M4.14 15.08c2.62-1.57 5.24-1.43 7.86.42 2.74 1.94 5.49 2 8.23.19"/>
</svg>
`;

// Generator Custom Marker Pin SVG Leaflet
const createTempatSampahPinIcon = (kategori, isPenuh, isSelected) => {
    let fillColor = '#0d9488'; // Default Teal (Bank Sampah)
    let badgeText = 'BS';
    let iconSvg = RECYCLE_SVG;
    let badgeBg = '#14b8a6';

    switch (kategori) {
        case 'BANK_SAMPAH':
            fillColor = '#0d9488'; // Teal
            badgeText = 'BS';
            iconSvg = RECYCLE_SVG;
            badgeBg = '#0f766e';
            break;
        case 'TPS':
            fillColor = '#d97706'; // Amber / Oranye
            badgeText = 'TPS';
            iconSvg = TRASH_BIN_SVG;
            badgeBg = '#b45309';
            break;
        case 'TPST':
            fillColor = '#4f46e5'; // Indigo
            badgeText = 'TPST';
            iconSvg = FACTORY_3R_SVG;
            badgeBg = '#3730a3';
            break;
        case 'TPA':
            fillColor = '#7c3aed'; // Purple
            iconSvg = TPA_LANDFILL_SVG;
            badgeText = 'TPA';
            badgeBg = '#5b21b6';
            break;
        default:
            fillColor = '#059669';
    }

    const strokeColor = isSelected ? '#fbbf24' : '#ffffff';
    const strokeWidth = isSelected ? '3.5' : '2.5';
    const scaleClass = isSelected ? 'scale-125 -translate-y-2' : 'hover:scale-115';

    return L.divIcon({
        html: `
            <div style="position: relative; width: 38px; height: 48px; display: flex; align-items: center; justify-content: center; cursor: pointer;" class="${scaleClass} transition-transform duration-200">
                
                <!-- SVG Pin Body & Icon SVG -->
                <svg width="44" height="44" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.6)); overflow: visible; position: relative; z-index: 1;">
                    <path d="M16 42 C11.5 33.5 2.5 23 2.5 15 A 13.5 13.5 0 1 1 29.5 15 C 29.5 23 20.5 33.5 16 42 Z" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linejoin="round"/>
                    <g transform="translate(7, 5)">
                        ${iconSvg}
                    </g>
                </svg>

                <!-- Badge Text MENIMPA Tepat di Atas Icon SVG sehingga tidak tertutup oleh icon SVG -->
                <div style="position: absolute; top: -10px; left: 75%; transform: translateX(-50%); z-index: 30; display: flex; align-items: center; justify-content: center; pointer-events: none;">
                    <span style="background: ${badgeBg}; color: #ffffff; padding: 1.5px 5px; border-radius: 4px; border: 1.5px solid #ffffff; font-size: ${badgeText.length > 3 ? '8.5px' : '9.5px'}; font-weight: 900; letter-spacing: 0.5px; box-shadow: 0 2px 4px rgba(0,0,0,0.6); white-space: nowrap; line-height: 1;">
                        ${badgeText}
                    </span>
                </div>

                ${isSelected ? `
                    <!-- Active Indicator -->
                    <div style="position: absolute; left: -2px; top: -10px; width: 14px; height: 14px; border-radius: 9999px; background: #fbbf24; border: 1.5px solid #ffffff; display: flex; align-items: center; justify-content: center; color: #78350f; font-size: 8px; font-weight: 900; box-shadow: 0 2px 4px rgba(0,0,0,0.4); z-index: 40;">
                        ★
                    </div>
                ` : ''}
            </div>
        `,
        className: 'custom-tempat-sampah-marker bg-transparent border-none',
        iconSize: [38, 48],
        iconAnchor: [19, 48],
        popupAnchor: [0, -44],
    });
};

// Generator Custom Cluster Icon untuk Tempat Penampungan Sampah (Koleksi Angka saat Zoom Out)
const createTempatSampahClusterIcon = (cluster) => {
    const count = cluster.getChildCount();
    let size = 'w-10 h-10';
    let color = 'bg-teal-700';

    if (count > 25) {
        size = 'w-12 h-12 text-sm';
        color = 'bg-teal-950';
    } else if (count > 8) {
        size = 'w-11 h-11 text-xs';
        color = 'bg-teal-800';
    }

    return L.divIcon({
        html: `
            <div class="${size} ${color} text-white rounded-full flex items-center justify-center border-2 border-white shadow-2xl font-black text-xs select-none" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.5));">
                ${count}
            </div>
        `,
        className: 'custom-ts-marker-cluster bg-transparent border-none',
        iconSize: L.point(40, 40, true),
        iconAnchor: [20, 20],
    });
};

export default function TempatSampahMarkerLayer() {
    const map = useMap();
    const [tempatList, setTempatList] = useState([]);
    const [loading, setLoading] = useState(false);

    const {
        activeLayers,
        selectedTempatSampahId,
        setSelectedTempatSampah,
        openPanel,
    } = useGisUIStore();

    // Fetch data tempat sampah dari backend
    useEffect(() => {
        let isMounted = true;
        const fetchTempatSampah = async () => {
            setLoading(true);
            try {
                const res = await api.get('/tempat-sampah');
                if ((res.data?.success || res.data?.status === 'success') && isMounted) {
                    setTempatList(res.data.data || []);
                }
            } catch (err) {
                console.error('Gagal mengambil data fasilitas sampah:', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchTempatSampah();
        return () => {
            isMounted = false;
        };
    }, []);

    // Filter berdasarkan toggle layer aktif di useGisUIStore
    const visibleTempatList = useMemo(() => {
        return tempatList.filter((item) => {
            if (item.kategori === 'BANK_SAMPAH' && !activeLayers.includes('layer-bank-sampah')) {
                return false;
            }
            if (item.kategori === 'TPS' && !activeLayers.includes('layer-tps')) {
                return false;
            }
            if (item.kategori === 'TPST' && !activeLayers.includes('layer-tpst')) {
                return false;
            }
            if (item.kategori === 'TPA' && !activeLayers.includes('layer-tpa')) {
                return false;
            }
            return true;
        });
    }, [tempatList, activeLayers]);

    const handleMarkerClick = (tempat) => {
        const lat = parseFloat(tempat.latitude);
        const lng = parseFloat(tempat.longitude);

        if (!isNaN(lat) && !isNaN(lng)) {
            map.flyTo([lat, lng], 16, { duration: 1.2 });
        }

        setSelectedTempatSampah(tempat);
        openPanel('detil-tempat-sampah', tempat.nama_tempat, tempat);
    };

    return (
        <MarkerClusterGroup
            chunkedLoading
            iconCreateFunction={createTempatSampahClusterIcon}
            maxClusterRadius={45}
            disableClusteringAtZoom={16}
            spiderfyOnMaxZoom={true}
            showCoverageOnHover={false}
        >
            {visibleTempatList.map((tempat) => {
                const lat = parseFloat(tempat.latitude);
                const lng = parseFloat(tempat.longitude);

                if (isNaN(lat) || !lat || isNaN(lng) || !lng) return null;

                const isSelected = selectedTempatSampahId === tempat.id_tempat_sampah;
                const isPenuh = tempat.status_operasional === 'PENUH';
                const icon = createTempatSampahPinIcon(tempat.kategori, isPenuh, isSelected);

                const kapasitasTotal = parseFloat(tempat.kapasitas_total) || 0;

                return (
                    <Marker
                        key={`ts-${tempat.id_tempat_sampah}`}
                        position={[lat, lng]}
                        icon={icon}
                        eventHandlers={{
                            click: () => handleMarkerClick(tempat),
                        }}
                    >
                        <Tooltip direction="top" offset={[0, -42]} opacity={0.95}>
                            <div className="font-sans text-xs p-1 select-none">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <span
                                        className={`px-1.5 py-0.5 text-[9px] font-bold text-white rounded ${tempat.kategori === 'BANK_SAMPAH'
                                            ? 'bg-teal-600'
                                            : tempat.kategori === 'TPS'
                                                ? 'bg-amber-600'
                                                : tempat.kategori === 'TPST'
                                                    ? 'bg-indigo-600'
                                                    : 'bg-purple-700'
                                            }`}
                                    >
                                        {tempat.kategori === 'BANK_SAMPAH' ? 'BANK SAMPAH' : tempat.kategori}
                                    </span>
                                    <span className="font-mono text-[9px] text-slate-500">
                                        Kec. {tempat.kecamatan}
                                    </span>
                                </div>
                                <h4 className="font-bold text-slate-900 leading-tight">
                                    {tempat.nama_tempat}
                                </h4>
                                {kapasitasTotal > 0 && (
                                    <div className="mt-1 flex items-center justify-between text-[10px] text-slate-600 gap-2 border-t border-slate-200 pt-1">
                                        <span>Kapasitas Tampung:</span>
                                        <span className="font-bold text-slate-800">
                                            {kapasitasTotal.toLocaleString('id-ID')} {tempat.satuan_kapasitas}
                                        </span>
                                    </div>
                                )}
                                {tempat.kategori === 'BANK_SAMPAH' && Array.isArray(tempat.jenis_sampah) && (
                                    <p className="mt-1 text-[9px] text-teal-700 italic">
                                        Menerima: {tempat.jenis_sampah.slice(0, 2).join(', ')}{tempat.jenis_sampah.length > 2 ? '...' : ''}
                                    </p>
                                )}
                            </div>
                        </Tooltip>
                    </Marker>
                );
            })}
        </MarkerClusterGroup>
    );
}

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    MapContainer,
    TileLayer,
    Polygon,
    Circle,
    Popup,
    GeoJSON,
    useMap,
    useMapEvents,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Loader2 } from 'lucide-react';
import api from '../../api/axios';
import { useGisUIStore } from '../../store/useGisUIStore';

// Modul Analitik & GeoJSON Wilayah Kabupaten Bogor
import {
    calculateObjectsPerKecamatan,
    createInvertedBogorMask,
} from '../../lib/spatialAnalytics';
import kecData from '../../assets/geojson/bogor-kecamatan.json';
import desaData from '../../assets/geojson/bogor-desa.json';

// Komponen GFW Command Center
import GisNavbar from './components/gis/GisNavbar';
import GisSidebar from './components/gis/GisSidebar';
import PanelOrchestrator from './components/gis/PanelOrchestrator';
import MapHUD from './components/gis/MapHUD';
import ObjekMarkerLayer from './components/gis/layers/ObjekMarkerLayer';
import TempatSampahMarkerLayer from './components/gis/layers/TempatSampahMarkerLayer';

// Modul Layer Kualitas Lingkungan & Bencana (Persis GEOLIMBAH)
import AqiSurfaceLayer from './components/gis/layers/AqiSurfaceLayer';
import WindFlowLayer from './components/gis/layers/WindFlowLayer';
import RiverLayer from './components/gis/layers/RiverLayer';
import WaterSampleMarkerLayer from './components/gis/layers/WaterSampleMarkerLayer';
import WildfireLayer from './components/gis/layers/WildfireLayer';
import VolcanicAshLayer from './components/gis/layers/VolcanicAshLayer';
import AqiHorizontalLegend from './components/gis/AqiHorizontalLegend';
import RiverHorizontalLegend from './components/gis/RiverHorizontalLegend';

// Controller Eksternal untuk Pemusatan Kamera Peta secara Reaktif
function ExternalMapController() {
    const map = useMap();
    const { mapCenter, mapZoom } = useGisUIStore();

    useEffect(() => {
        if (mapCenter && mapCenter.length === 2) {
            map.flyTo(mapCenter, mapZoom || 12, { duration: 1.5 });
        }
    }, [mapCenter, mapZoom, map]);

    return null;
}

// Handler Dekopel Event Navigasi Peta (Zoom & Reset)
function MapEventsHandler() {
    const map = useMap();

    useEffect(() => {
        const handleZoomIn = () => map.zoomIn();
        const handleZoomOut = () => map.zoomOut();
        const handleResetView = () => map.flyTo([-6.4816, 106.8560], 12, { duration: 1.5 });

        window.addEventListener('map-zoom-in', handleZoomIn);
        window.addEventListener('map-zoom-out', handleZoomOut);
        window.addEventListener('map-reset-view', handleResetView);

        return () => {
            window.removeEventListener('map-zoom-in', handleZoomIn);
            window.removeEventListener('map-zoom-out', handleZoomOut);
            window.removeEventListener('map-reset-view', handleResetView);
        };
    }, [map]);

    return null;
}

// Listener Perubahan Zoom Level Peta
function MapZoomListener({ onChange }) {
    const map = useMapEvents({
        zoomend: () => {
            onChange(map.getZoom());
        },
    });

    useEffect(() => {
        onChange(map.getZoom());
    }, [map, onChange]);

    return null;
}

export default function DlhGisMonitoring() {
    const [objekList, setObjekList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentZoom, setCurrentZoom] = useState(12);

    const {
        activeLayers,
        activeBaseMap,
        mapOpacity,
        maskOpacity,
        activeAdminBoundary,
        showImpactRadius,
        selectedObject,
    } = useGisUIStore();

    // Mengambil data objek spasial dari backend REKAS
    const fetchGisData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/objek/list-objek', { params: { limit: 2000 } });
            if (res.data.status === 'success') {
                setObjekList(res.data.data || []);
            }
        } catch (err) {
            console.error('Gagal mengambil data objek GIS:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGisData();
    }, [fetchGisData]);

    // Inverted Boundary Masking (Area Luar Kabupaten Bogor)
    const invertedBogorMask = useMemo(() => {
        return createInvertedBogorMask(kecData);
    }, []);

    // Agregasi Kepadatan Objek Per Kecamatan
    const objectsPerKecamatan = useMemo(() => {
        return calculateObjectsPerKecamatan(objekList, kecData);
    }, [objekList]);

    // Pewarnaan Tematik Choropleth Kepadatan Kecamatan
    const getKecamatanColor = useCallback(
        (kecName) => {
            const count = objectsPerKecamatan[kecName] || 0;
            return count > 50
                ? '#4338ca' // Indigo gelap
                : count > 20
                    ? '#4f46e5'
                    : count > 10
                        ? '#6366f1'
                        : count > 5
                            ? '#818cf8'
                            : count > 0
                                ? '#a5b4fc'
                                : '#e0e7ff';
        },
        [objectsPerKecamatan]
    );

    // Styling GeoJSON Kecamatan
    const geoJsonKecStyle = useCallback(
        (feature) => ({
            fillColor: getKecamatanColor(feature?.properties?.WADMKC),
            weight: 1.5,
            opacity: 0.9,
            color: '#312e81',
            dashArray: '3',
            fillOpacity: 0.5 * (mapOpacity / 100),
        }),
        [getKecamatanColor, mapOpacity]
    );

    // Styling GeoJSON Desa
    const geoJsonDesaStyle = useMemo(
        () => ({
            fillColor: '#3b82f6',
            weight: 1,
            opacity: 0.7,
            color: '#1d4ed8',
            dashArray: '2, 4',
            fillOpacity: 0.1 * (mapOpacity / 100),
        }),
        [mapOpacity]
    );

    // Pemilihan URL Tile Basemap
    const getTileUrl = () => {
        switch (activeBaseMap) {
            case 'dark':
                // Esri World Dark Gray Canvas: 100% Free, Official ArcGIS, No Key Required
                return 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';
            case 'satellite':
                return 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
            case 'street':
                return 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
            case 'osm':
                return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
            case 'esri':
            default:
                return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
        }
    };

    const impactCenter = useMemo(() => {
        if (!selectedObject) return null;
        const lat = parseFloat(selectedObject.lat);
        const lng = parseFloat(selectedObject.lng);
        return !isNaN(lat) && !isNaN(lng) ? [lat, lng] : null;
    }, [selectedObject]);

    return (
        <main className="relative h-screen w-screen overflow-hidden bg-slate-900 font-sans text-slate-800 selection:bg-emerald-200 selection:text-emerald-900 select-none">
            {/* =====================================================================
                LAYER 0: THE INFINITE CANVAS (PETA LEAFLET FULL-SCREEN)
            ====================================================================== */}
            <div className="absolute inset-0 z-0 h-full w-full">
                <MapContainer
                    center={[-6.4816, 106.8560]}
                    zoom={12}
                    zoomControl={false}
                    style={{ height: '100%', width: '100%' }}
                    maxZoom={19}
                >
                    <ExternalMapController />
                    <MapEventsHandler />
                    <MapZoomListener onChange={setCurrentZoom} />

                    {/* Tile Layer Sesuai Basemap Aktif */}
                    <TileLayer
                        key={activeBaseMap}
                        url={getTileUrl()}
                        attribution='&copy; Google Maps / OpenStreetMap'
                    />

                    {/* INVERTED BOUNDARY MASKING (Area Luar Kabupaten Bogor) */}
                    {invertedBogorMask && (
                        <Polygon
                            positions={invertedBogorMask}
                            pathOptions={{
                                color: '#0f172a',
                                fillColor: '#0f172a',
                                fillOpacity: maskOpacity / 100,
                                weight: 1.5,
                                opacity: 0.3,
                                interactive: false,
                            }}
                        />
                    )}

                    {/* BATAS ADMINISTRASI KECAMATAN */}
                    {activeAdminBoundary === 'kecamatan' && (
                        <GeoJSON
                            key={`kec-${mapOpacity}-${objekList.length}`}
                            data={kecData}
                            style={geoJsonKecStyle}
                            onEachFeature={(feature, layer) => {
                                const name = feature.properties?.WADMKC || 'Kecamatan';
                                const count = objectsPerKecamatan[name] || 0;
                                layer.bindTooltip(
                                    `<div class="font-sans text-xs"><strong>Kec. ${name}</strong><br/><span class="text-emerald-700 font-bold">${count} Objek Terdaftar</span></div>`,
                                    { sticky: true }
                                );
                            }}
                        />
                    )}

                    {/* BATAS ADMINISTRASI DESA */}
                    {activeAdminBoundary === 'desa' && (
                        <GeoJSON
                            key={`desa-${mapOpacity}`}
                            data={desaData}
                            style={geoJsonDesaStyle}
                            onEachFeature={(feature, layer) => {
                                const desa = feature.properties?.WADMKD || '';
                                const kec = feature.properties?.WADMKC || '';
                                layer.bindTooltip(
                                    `<div class="font-sans text-xs"><strong>Desa ${desa}</strong><br/><span class="text-slate-500">Kec. ${kec}</span></div>`,
                                    { sticky: true }
                                );
                            }}
                        />
                    )}

                    {/* RADIUS PELAYANAN OBJEK (3 KM) */}
                    {showImpactRadius && impactCenter && (
                        <Circle
                            center={impactCenter}
                            radius={3000}
                            pathOptions={{
                                color: '#ef4444',
                                fillColor: '#ef4444',
                                fillOpacity: 0.15,
                                weight: 2,
                                dashArray: '6, 6',
                            }}
                        >
                            <Popup>
                                <span className="text-xs font-bold text-rose-700">
                                    Radius Pelayanan 3 KM
                                </span>
                            </Popup>
                        </Circle>
                    )}

                    {/* LAYER KUALITAS AIR: ALIRAN SUNGAI & STASIUN SAMPEL AIR */}
                    <RiverLayer />
                    <WaterSampleMarkerLayer />

                    {/* LAYER KEBAKARAN HUTAN / TITIK API AKTIF (NASA GIBS & FIRMS) */}
                    <WildfireLayer />

                    {/* LAYER EMISI GAS SO2 & ABU VULKANIK (NASA GIBS) */}
                    <VolcanicAshLayer />

                    {/* LAYER KUALITAS UDARA: HEATMAP PERMUKAAN AQI & VEKTOR ANGIN */}
                    {activeLayers.includes('layer-aqi') && (
                        <>
                            <AqiSurfaceLayer objekList={objekList} mapOpacity={mapOpacity} />
                            <WindFlowLayer objekList={objekList} />
                        </>
                    )}

                    {/* LAYER OBJEK RETRIBUSI (LOD & CLUSTERING) */}
                    <ObjekMarkerLayer objekList={objekList} currentZoom={currentZoom} />

                    {/* LAYER FASILITAS TEMPAT SAMPAH (BANK SAMPAH, TPS, TPST, TPA) */}
                    <TempatSampahMarkerLayer />
                </MapContainer>
            </div>

            {/* =====================================================================
                LAYER 1: THE GLOBAL CONTEXT (NAVBAR ATAS FRAMELESS)
            ====================================================================== */}
            <GisNavbar onRefresh={fetchGisData} loading={loading} />

            {/* =====================================================================
                LAYER 2: THE SLIM ANCHOR (SIDEBAR KIRI 64px)
            ====================================================================== */}
            <GisSidebar />

            {/* =====================================================================
                LAYER 3: THE STACKING DRAWERS (PANEL ORCHESTRATOR)
            ====================================================================== */}
            <PanelOrchestrator objekList={objekList} />

            {/* =====================================================================
                LAYER 4: MAP HUD & CONTROLS (KANAN BAWAH)
            ====================================================================== */}
            <MapHUD />

            {/* =====================================================================
                LAYER 5: HORIZONTAL ENVIRONMENTAL LEGENDS (CENTER BOTTOM)
            ====================================================================== */}
            <AqiHorizontalLegend />
            <RiverHorizontalLegend />

            {/* =====================================================================
                LAYER 5: LOADING OVERLAY
            ====================================================================== */}
            {loading && (
                <div className="absolute inset-0 z-[2000] bg-slate-950/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                    <Loader2 className="animate-spin mb-4 text-emerald-500" size={48} />
                    <p className="text-xs font-bold uppercase tracking-[0.3em]">
                        Memuat Data Spasial Retribusi...
                    </p>
                </div>
            )}
        </main>
    );
}
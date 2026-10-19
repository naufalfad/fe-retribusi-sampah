import React, { useEffect, useState, useMemo } from 'react';
import { ImageOverlay } from 'react-leaflet';
import { spatialMath } from '../../../../../lib/spatialMath';
import kecData from '../../../../../assets/geojson/bogor-kecamatan.json';

import api from '../../../../../api/axios';

// Bounding Box Kabupaten Bogor
const BOGOR_BOUNDS = {
    latMin: -6.80,
    latMax: -6.30,
    lngMin: 106.40,
    lngMax: 107.23,
};

const LEAFLET_BOUNDS = [
    [BOGOR_BOUNDS.latMin, BOGOR_BOUNDS.lngMin],
    [BOGOR_BOUNDS.latMax, BOGOR_BOUNDS.lngMax],
];

const CANVAS_RESOLUTION = 75;

/**
 * AQI SURFACE LAYER (CANVAS BLENDING ENGINE W/ CLIPPING)
 * Menggunakan teknik Clipping Mask HTML5 Canvas agar bentuk gradasi
 * terpotong rapi mengikuti lekukan geografis Kabupaten Bogor.
 */
export default function AqiSurfaceLayer({ objekList = [], mapOpacity = 85 }) {
    const [canvasDataUrl, setCanvasDataUrl] = useState(null);
    const [batchAqiData, setBatchAqiData] = useState([]);
    const [wildfiresData, setWildfiresData] = useState([]);

    // Mengambil telemetri batch AQI & Hotspot riil dari model atmosfer Open-Meteo & NASA FIRMS
    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            try {
                const [aqiRes, fireRes] = await Promise.allSettled([
                    api.get('/analytics/batch-aqi'),
                    api.get('/analytics/wildfires')
                ]);
                if (isMounted) {
                    if (aqiRes.status === 'fulfilled' && aqiRes.value?.data?.success && Array.isArray(aqiRes.value.data.data)) {
                        setBatchAqiData(aqiRes.value.data.data);
                    }
                    if (fireRes.status === 'fulfilled' && fireRes.value?.data?.success && Array.isArray(fireRes.value.data.data)) {
                        setWildfiresData(fireRes.value.data.data);
                    }
                }
            } catch (err) {
                console.warn('[AqiSurfaceLayer] Menggunakan fallback sensor:', err.message);
            }
        };
        fetchData();
        return () => { isMounted = false; };
    }, []);

    // Ekstrak data sensor: data telemetri riil + titik objek retribusi + hotspot karhutla
    const { aqiSensors, baselineAqi } = useMemo(() => {
        const sensors = [];
        let totalClusterAqi = 0;
        let clusterCount = 0;

        // A. Klaster Atmosferik CAMS Open-Meteo
        if (batchAqiData && batchAqiData.length > 0) {
            batchAqiData.forEach((c) => {
                const aqiVal = c.telemetry?.aqi ?? 75;
                sensors.push({ lat: c.lat, lng: c.lng, aqi: aqiVal });
                totalClusterAqi += aqiVal;
                clusterCount++;
            });
        }

        const computedBaseline = clusterCount > 0 ? Math.round(totalClusterAqi / clusterCount) : 78;

        // B. Beban emisi lokal berdasarkan objek komersil / industri non-rumah
        objekList.forEach((obj) => {
            const lat = parseFloat(obj.lat);
            const lng = parseFloat(obj.lng);
            if (isNaN(lat) || isNaN(lng)) return;

            let emissionLoad = 35;
            if (obj.kategori === 'Non Rumah Tinggal' || obj.kategori_objek === 'Non Rumah Tinggal') {
                emissionLoad = 60;
            }

            const localAqi = Math.max(85, Math.min(260, computedBaseline + emissionLoad));
            sensors.push({ lat, lng, aqi: localAqi });
        });

        // C. Titik Api Karhutla (Hazardous Smoke Plume AQI 280-500) identik dengan GEOLIMBAH
        if (wildfiresData && wildfiresData.length > 0) {
            wildfiresData.forEach((spot) => {
                const fireAqi = Math.min(500, Math.round(280 + ((spot.frp || 15) * 2.5)));
                sensors.push({ lat: spot.latitude, lng: spot.longitude, aqi: fireAqi });
            });
        }

        // Fixed backup clusters jika backend offline (identik dengan klaster GEOLIMBAH)
        if (sensors.length === 0) {
            sensors.push(
                { lat: -6.4862, lng: 106.8835, aqi: 135 }, // Citeureup
                { lat: -6.4678, lng: 106.9403, aqi: 140 }, // Klapanunggal
                { lat: -6.3872, lng: 106.9034, aqi: 130 }, // Gunung Putri
                { lat: -6.4027, lng: 106.9582, aqi: 145 }, // Cileungsi
                { lat: -6.4816, lng: 106.8560, aqi: 110 }, // Cibinong
                { lat: -6.5786, lng: 106.8686, aqi: 95 },  // Sentul
                { lat: -6.7118, lng: 106.8302, aqi: 65 }   // Caringin
            );
        }

        return { aqiSensors: sensors, baselineAqi: computedBaseline };
    }, [objekList, batchAqiData]);

    // Render Canvas di Background Memory
    useEffect(() => {
        if (!kecData || !kecData.features) return;

        const canvas = document.createElement('canvas');
        canvas.width = CANVAS_RESOLUTION;
        canvas.height = CANVAS_RESOLUTION;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        const latStep = (BOGOR_BOUNDS.latMax - BOGOR_BOUNDS.latMin) / (CANVAS_RESOLUTION - 1);
        const lngStep = (BOGOR_BOUNDS.lngMax - BOGOR_BOUNDS.lngMin) / (CANVAS_RESOLUTION - 1);

        // A. Clipping Path Bogor
        const bogorPath = new Path2D();
        const getX = (lng) => ((lng - BOGOR_BOUNDS.lngMin) / (BOGOR_BOUNDS.lngMax - BOGOR_BOUNDS.lngMin)) * CANVAS_RESOLUTION;
        const getY = (lat) => ((BOGOR_BOUNDS.latMax - lat) / (BOGOR_BOUNDS.latMax - BOGOR_BOUNDS.latMin)) * CANVAS_RESOLUTION;

        kecData.features.forEach((feature) => {
            const geom = feature.geometry;
            if (!geom) return;

            if (geom.type === 'Polygon') {
                geom.coordinates.forEach((ring) => {
                    ring.forEach((coord, i) => {
                        const x = getX(coord[0]);
                        const y = getY(coord[1]);
                        if (i === 0) bogorPath.moveTo(x, y);
                        else bogorPath.lineTo(x, y);
                    });
                    bogorPath.closePath();
                });
            } else if (geom.type === 'MultiPolygon') {
                geom.coordinates.forEach((poly) => {
                    poly.forEach((ring) => {
                        ring.forEach((coord, i) => {
                            const x = getX(coord[0]);
                            const y = getY(coord[1]);
                            if (i === 0) bogorPath.moveTo(x, y);
                            else bogorPath.lineTo(x, y);
                        });
                        bogorPath.closePath();
                    });
                });
            }
        });

        ctx.save();
        ctx.clip(bogorPath);

        // B. Rendering Matriks Piksel
        for (let y = 0; y < CANVAS_RESOLUTION; y++) {
            for (let x = 0; x < CANVAS_RESOLUTION; x++) {
                if (!ctx.isPointInPath(bogorPath, x, y)) {
                    continue;
                }

                const currentLat = BOGOR_BOUNDS.latMax - (y * latStep);
                const currentLng = BOGOR_BOUNDS.lngMin + (x * lngStep);

                const interpolatedAqi = spatialMath.interpolateAqi(currentLat, currentLng, aqiSensors, baselineAqi);
                const [r, g, b] = spatialMath.interpolateColorRgb(interpolatedAqi);

                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(x, y, 1, 1);
            }
        }

        ctx.restore();
        setCanvasDataUrl(canvas.toDataURL('image/png'));
    }, [aqiSensors, baselineAqi]);

    if (!canvasDataUrl) return null;

    return (
        <ImageOverlay
            url={canvasDataUrl}
            bounds={LEAFLET_BOUNDS}
            opacity={(mapOpacity / 100) * 0.75}
            className="continuous-surface-map mix-blend-multiply blur-[20px] pointer-events-none"
            interactive={false}
            zIndex={200}
        />
    );
}

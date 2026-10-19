import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { spatialMath } from '../../../../../lib/spatialMath';
import kecData from '../../../../../assets/geojson/bogor-kecamatan.json';
import api from '../../../../../api/axios';

const BOGOR_BOUNDS = {
    latMin: -6.80,
    latMax: -6.30,
    lngMin: 106.40,
    lngMax: 107.23,
};

const RESOLUTION = 45;
const PARTICLE_COUNT = 550;
const PARTICLE_LIFESPAN = 300;
const VELOCITY_MULTIPLIER = 0.16;
const FADE_RATE = 0.04;

const FALLBACK_WIND_SENSORS = [
    { lat: -6.4816, lng: 106.8560, wd: 55, ws: 3.2 },  // Cibinong (Timur Laut)
    { lat: -6.6980, lng: 106.9400, wd: 180, ws: 4.8 }, // Puncak (Selatan - Gunung Gede)
    { lat: -6.4150, lng: 106.9600, wd: 70, ws: 3.8 },  // Cileungsi
    { lat: -6.5500, lng: 106.6300, wd: 40, ws: 2.6 },  // Leuwiliang
    { lat: -6.3800, lng: 106.7200, wd: 65, ws: 3.0 },  // Parung
];

/**
 * WIND FLOW LAYER (CANVAS FLUID PARTICLE ENGINE - CLIPPED)
 * Menampilkan animasi partikel aliran angin dinamis ala Windy/IQAir.
 */
export default function WindFlowLayer({ objekList = [] }) {
    const map = useMap();
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const clipPathRef = useRef(null);
    const [liveSensors, setLiveSensors] = useState(null);

    // Ambil data telemetri angin riil dari backend (Open-Meteo & IQAir batch)
    useEffect(() => {
        let isMounted = true;
        const fetchWind = async () => {
            try {
                const res = await api.get('/analytics/batch-aqi');
                if (isMounted && res.data && res.data.success && Array.isArray(res.data.data)) {
                    const extracted = res.data.data.map(c => ({
                        lat: c.lat,
                        lng: c.lng,
                        wd: c.telemetry?.weather?.windDirection ?? 60,
                        ws: c.telemetry?.weather?.windSpeed ?? 3.0
                    }));
                    if (extracted.length > 0) {
                        setLiveSensors(extracted);
                    }
                }
            } catch (err) {
                // Fallback default
            }
        };
        fetchWind();
        return () => { isMounted = false; };
    }, []);

    // Sensor angin terkalibrasi di Kabupaten Bogor (Live vs Fallback)
    const windSensors = useMemo(() => {
        return liveSensors && liveSensors.length > 0 ? liveSensors : FALLBACK_WIND_SENSORS;
    }, [liveSensors]);

    // Precompute Vector Field
    const vectorField = useMemo(() => {
        const grid = spatialMath.generateCanvasGrid(BOGOR_BOUNDS, RESOLUTION, RESOLUTION);
        return grid.map((pt) => {
            const wind = spatialMath.interpolateWind(pt.lat, pt.lng, windSensors);
            const rad = (wind.wd * Math.PI) / 180;
            const speed = wind.ws * VELOCITY_MULTIPLIER;
            return {
                u: Math.cos(rad) * speed,
                v: Math.sin(rad) * speed,
            };
        });
    }, [windSensors]);

    useEffect(() => {
        if (vectorField.length === 0) return;

        const canvas = document.createElement('canvas');
        canvas.className = 'leaflet-zoom-animated pointer-events-none mix-blend-screen';
        canvas.style.position = 'absolute';
        canvas.style.left = '0';
        canvas.style.top = '0';
        canvas.style.opacity = '0.75';
        canvas.style.transition = 'opacity 0.25s ease-in-out';
        canvas.style.zIndex = '210';

        map.getPanes().overlayPane.appendChild(canvas);
        canvasRef.current = canvas;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let particles = [];
        let isAnimating = true;

        const syncCanvas = () => {
            const size = map.getSize();
            canvas.width = size.x;
            canvas.height = size.y;

            const topLeft = map.containerPointToLayerPoint([0, 0]);
            L.DomUtil.setPosition(canvas, topLeft);

            // Generate Path2D untuk Clipping Mask Bogor
            const path = new Path2D();
            if (kecData && kecData.features) {
                kecData.features.forEach((feature) => {
                    const geometry = feature.geometry;
                    if (!geometry) return;

                    if (geometry.type === 'Polygon') {
                        geometry.coordinates.forEach((ring) => {
                            ring.forEach((coord, i) => {
                                const pt = map.latLngToContainerPoint([coord[1], coord[0]]);
                                if (i === 0) path.moveTo(pt.x, pt.y);
                                else path.lineTo(pt.x, pt.y);
                            });
                            path.closePath();
                        });
                    } else if (geometry.type === 'MultiPolygon') {
                        geometry.coordinates.forEach((polygon) => {
                            polygon.forEach((ring) => {
                                ring.forEach((coord, i) => {
                                    const pt = map.latLngToContainerPoint([coord[1], coord[0]]);
                                    if (i === 0) path.moveTo(pt.x, pt.y);
                                    else path.lineTo(pt.x, pt.y);
                                });
                                path.closePath();
                            });
                        });
                    }
                });
            }

            clipPathRef.current = path;

            particles = Array.from({ length: PARTICLE_COUNT }).map(() => ({
                x: Math.random() * size.x,
                y: Math.random() * size.y,
                age: Math.random() * PARTICLE_LIFESPAN,
            }));
        };

        const handleMoveStart = () => {
            isAnimating = false;
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
            }
            canvas.style.opacity = '0';
        };

        const handleMoveEnd = () => {
            syncCanvas();
            isAnimating = true;
            canvas.style.opacity = '0.75';
            render();
        };

        map.on('movestart zoomstart', handleMoveStart);
        map.on('moveend zoomend', handleMoveEnd);

        syncCanvas();

        const render = () => {
            if (!isAnimating || !canvasRef.current) return;

            const width = canvas.width;
            const height = canvas.height;

            ctx.save();
            if (clipPathRef.current) {
                ctx.clip(clipPathRef.current);
            }

            ctx.globalCompositeOperation = 'destination-out';
            ctx.fillStyle = `rgba(0, 0, 0, ${FADE_RATE})`;
            ctx.fillRect(0, 0, width, height);

            ctx.globalCompositeOperation = 'source-over';
            ctx.lineWidth = 1.2;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.lineCap = 'round';

            ctx.beginPath();

            particles.forEach((p) => {
                if (p.age > PARTICLE_LIFESPAN) {
                    p.x = Math.random() * width;
                    p.y = Math.random() * height;
                    p.age = 0;
                }

                const pLatLng = map.containerPointToLatLng([p.x, p.y]);

                const gridX = Math.floor(
                    ((pLatLng.lng - BOGOR_BOUNDS.lngMin) / (BOGOR_BOUNDS.lngMax - BOGOR_BOUNDS.lngMin)) * RESOLUTION
                );
                const gridY = Math.floor(
                    ((BOGOR_BOUNDS.latMax - pLatLng.lat) / (BOGOR_BOUNDS.latMax - BOGOR_BOUNDS.latMin)) * RESOLUTION
                );

                if (gridX < 0 || gridX >= RESOLUTION || gridY < 0 || gridY >= RESOLUTION) {
                    p.age = PARTICLE_LIFESPAN + 1;
                    return;
                }

                const index = gridY * RESOLUTION + gridX;
                const vector = vectorField[index];
                if (!vector) return;

                ctx.moveTo(p.x, p.y);
                p.x += vector.u + (Math.random() - 0.5) * 0.2;
                p.y += vector.v + (Math.random() - 0.5) * 0.2;
                p.age++;

                ctx.lineTo(p.x, p.y);
            });

            ctx.stroke();
            ctx.restore();

            animationRef.current = requestAnimationFrame(render);
        };

        render();

        return () => {
            isAnimating = false;
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            map.off('movestart zoomstart', handleMoveStart);
            map.off('moveend zoomend', handleMoveEnd);
            if (canvasRef.current && canvasRef.current.parentNode) {
                canvasRef.current.parentNode.removeChild(canvasRef.current);
            }
        };
    }, [vectorField, map]);

    return null;
}

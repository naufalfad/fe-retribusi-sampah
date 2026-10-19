import React, { useEffect, useMemo, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import * as turf from '@turf/turf';
import { useGisUIStore } from '../../../../../store/useGisUIStore';
import bogorSungaiLine from '../../../../../assets/geojson/bogor-sungai-line.json';

const PARTICLE_COUNT = 650;
const FADE_RATE = 0.04;

// Stasiun acuan baku mutu air sungai
export const WATER_STATIONS_DATA = [
    {
        id: 'WS-01',
        name: 'Stasiun Hulu Ciliwung (Tugu Selatan, Cisarua)',
        lat: -6.6986,
        lng: 106.9430,
        currentData: {
            bod: 1.8,
            cod: 12.5,
            do: 6.8,
            ph: 7.2,
            status: 'Memenuhi Syarat (Normal)',
            weather: 'Cerah Berawan'
        }
    },
    {
        id: 'WS-02',
        name: 'Stasiun Tengah Ciliwung (Katulampa)',
        lat: -6.6163,
        lng: 106.8325,
        currentData: {
            bod: 2.7,
            cod: 21.0,
            do: 5.4,
            ph: 6.8,
            status: 'Cemar Ringan (Waspada)',
            weather: 'Cerah Berawan'
        }
    },
    {
        id: 'WS-03',
        name: 'Stasiun Hilir Cileungsi (Klapanunggal)',
        lat: -6.3986,
        lng: 106.9680,
        currentData: {
            bod: 5.4,
            cod: 38.0,
            do: 2.8,
            ph: 5.5,
            status: 'Cemar Berat (Kritis)',
            weather: 'Cerah'
        }
    },
    {
        id: 'WS-04',
        name: 'Stasiun Aliran Citeureup (Mayor Oking)',
        lat: -6.4786,
        lng: 106.8530,
        currentData: {
            bod: 3.8,
            cod: 29.5,
            do: 3.7,
            ph: 6.4,
            status: 'Cemar Sedang',
            weather: 'Berawan'
        }
    }
];

/**
 * RIVER LAYER (WEATHER-REACTIVE CANVAS FLUID ENGINE - KAB. BOGOR)
 * Menggunakan prinsip Dual Canvas:
 * - Canvas 1 (Statis): Kerangka dasar garis sungai dengan rona status baku mutu.
 * - Canvas 2 (Dinamis): Komet partikel air 60FPS yang mengalir mengikuti belokan sungai.
 */
export default function RiverLayer() {
    const map = useMap();
    const { activeLayers, mapOpacity } = useGisUIStore();

    const staticCanvasRef = useRef(null);
    const dynamicCanvasRef = useRef(null);
    const animationRef = useRef(null);

    const isRiverActive = activeLayers.includes('layer-river');

    // Spatial join mengaitkan ruas sungai dengan stasiun kualitas air terdekat
    const processedGeoJson = useMemo(() => {
        if (!bogorSungaiLine || !bogorSungaiLine.features) return null;

        const geojson = JSON.parse(JSON.stringify(bogorSungaiLine));

        geojson.features.forEach((feature) => {
            const geom = feature.geometry;
            if (!geom) return;

            let coords = null;
            if (geom.type === 'LineString') {
                coords = geom.coordinates[0];
            } else if (geom.type === 'MultiLineString' && geom.coordinates[0]) {
                coords = geom.coordinates[0][0];
            }

            if (!coords) return;

            const riverPoint = turf.point([coords[0], coords[1]]);
            let closestStation = null;
            let minDistance = Infinity;

            WATER_STATIONS_DATA.forEach((station) => {
                const stationPoint = turf.point([station.lng, station.lat]);
                const distance = turf.distance(riverPoint, stationPoint, { units: 'kilometers' });
                if (distance < minDistance) {
                    minDistance = distance;
                    closestStation = station;
                }
            });

            feature.properties = {
                ...feature.properties,
                nearestStationId: closestStation?.id,
                stationBod: closestStation?.currentData?.bod || 2.0
            };
        });

        return geojson;
    }, []);

    useEffect(() => {
        if (!isRiverActive || !processedGeoJson) {
            if (staticCanvasRef.current?.parentNode) staticCanvasRef.current.parentNode.removeChild(staticCanvasRef.current);
            if (dynamicCanvasRef.current?.parentNode) dynamicCanvasRef.current.parentNode.removeChild(dynamicCanvasRef.current);
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            return;
        }

        const overlayPane = map.getPanes().overlayPane;

        const sCanvas = document.createElement('canvas');
        sCanvas.className = 'leaflet-zoom-animated pointer-events-none mix-blend-screen';
        sCanvas.style.position = 'absolute';
        sCanvas.style.left = '0';
        sCanvas.style.top = '0';
        sCanvas.style.opacity = String(mapOpacity / 100);
        sCanvas.style.transition = 'opacity 0.2s ease-in-out';
        sCanvas.style.zIndex = '220';

        const dCanvas = document.createElement('canvas');
        dCanvas.className = 'leaflet-zoom-animated pointer-events-none mix-blend-screen';
        dCanvas.style.position = 'absolute';
        dCanvas.style.left = '0';
        dCanvas.style.top = '0';
        dCanvas.style.opacity = String(mapOpacity / 100);
        dCanvas.style.transition = 'opacity 0.2s ease-in-out';
        dCanvas.style.zIndex = '225';

        overlayPane.appendChild(sCanvas);
        overlayPane.appendChild(dCanvas);
        staticCanvasRef.current = sCanvas;
        dynamicCanvasRef.current = dCanvas;

        const sCtx = sCanvas.getContext('2d');
        const dCtx = dCanvas.getContext('2d');
        if (!sCtx || !dCtx) return;

        let activeSegments = [];
        let particles = [];
        let isAnimating = true;

        const syncCanvasGeometry = () => {
            const size = map.getSize();
            sCanvas.width = size.x;
            sCanvas.height = size.y;
            dCanvas.width = size.x;
            dCanvas.height = size.y;

            const topLeft = map.containerPointToLayerPoint([0, 0]);
            L.DomUtil.setPosition(sCanvas, topLeft);
            L.DomUtil.setPosition(dCanvas, topLeft);

            const mapBounds = map.getBounds().pad(0.15);
            activeSegments = [];

            processedGeoJson.features.forEach((feature) => {
                const geom = feature.geometry;
                if (!geom) return;

                let isVisible = false;
                if (geom.type === 'LineString') {
                    isVisible = geom.coordinates.some((c) => mapBounds.contains([c[1], c[0]]));
                } else if (geom.type === 'MultiLineString') {
                    isVisible = geom.coordinates.some((line) => line.some((c) => mapBounds.contains([c[1], c[0]])));
                }

                if (!isVisible) return;

                const bod = feature.properties?.stationBod ?? 2.0;

                // Pewarnaan Baku Mutu PP 22/2021
                let color = '#22d3ee'; // Normal / Sehat (Cyan)
                let speed = 0.35;

                if (bod > 3.0) {
                    color = '#f43f5e'; // Kritis (Rose 500)
                    speed = 0.14;
                } else if (bod >= 2.0) {
                    color = '#fbbf24'; // Waspada (Amber 400)
                    speed = 0.24;
                }

                const processLine = (coords) => {
                    const points = coords.map((c) => map.latLngToContainerPoint([c[1], c[0]]));
                    activeSegments.push({ points, color, speed });
                };

                if (geom.type === 'LineString') processLine(geom.coordinates);
                else if (geom.type === 'MultiLineString') geom.coordinates.forEach(processLine);
            });

            // 1. Gambar Garis Sungai Statis (Tipis & Elegan)
            sCtx.clearRect(0, 0, sCanvas.width, sCanvas.height);
            sCtx.lineCap = 'round';
            sCtx.lineJoin = 'round';
            sCtx.lineWidth = 1.3;
            sCtx.globalAlpha = 0.35;

            activeSegments.forEach((seg) => {
                if (seg.points.length < 2) return;
                sCtx.beginPath();
                sCtx.moveTo(seg.points[0].x, seg.points[0].y);
                for (let i = 1; i < seg.points.length; i++) {
                    sCtx.lineTo(seg.points[i].x, seg.points[i].y);
                }
                sCtx.strokeStyle = seg.color;
                sCtx.stroke();
            });

            // 2. Taburkan Partikel Aliran
            particles = [];
            if (activeSegments.length === 0) return;

            for (let i = 0; i < PARTICLE_COUNT; i++) {
                const segIdx = Math.floor(Math.random() * activeSegments.length);
                const segment = activeSegments[segIdx];
                const ptIdx = Math.floor(Math.random() * (segment.points.length - 1));

                particles.push({
                    segmentIdx: segIdx,
                    ptIdx: ptIdx,
                    x: segment.points[ptIdx].x,
                    y: segment.points[ptIdx].y,
                    speed: segment.speed * (0.8 + Math.random() * 0.4),
                    color: segment.color,
                });
            }
        };

        const renderLoop = () => {
            if (!isAnimating || !dynamicCanvasRef.current) return;

            const w = dCanvas.width;
            const h = dCanvas.height;

            dCtx.globalCompositeOperation = 'destination-out';
            dCtx.fillStyle = `rgba(0, 0, 0, ${FADE_RATE})`;
            dCtx.fillRect(0, 0, w, h);

            dCtx.globalCompositeOperation = 'source-over';
            dCtx.lineWidth = 1.5;
            dCtx.lineCap = 'round';
            dCtx.globalAlpha = 0.65;

            particles.forEach((p) => {
                const segment = activeSegments[p.segmentIdx];
                if (!segment) return;

                const p1 = { x: p.x, y: p.y };
                const p2 = segment.points[p.ptIdx + 1];

                if (!p2) {
                    p.segmentIdx = Math.floor(Math.random() * activeSegments.length);
                    p.ptIdx = 0;
                    p.x = activeSegments[p.segmentIdx].points[0].x;
                    p.y = activeSegments[p.segmentIdx].points[0].y;
                    return;
                }

                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < p.speed) {
                    p.ptIdx++;
                    p.x = p2.x;
                    p.y = p2.y;
                } else {
                    p.x += (dx / dist) * p.speed;
                    p.y += (dy / dist) * p.speed;
                }

                dCtx.beginPath();
                dCtx.moveTo(p1.x, p1.y);
                dCtx.lineTo(p.x, p.y);
                dCtx.strokeStyle = p.color;
                dCtx.stroke();
            });

            animationRef.current = requestAnimationFrame(renderLoop);
        };

        const handleInteractionStart = () => {
            isAnimating = false;
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            sCanvas.style.opacity = '0';
            dCanvas.style.opacity = '0';
        };

        const handleInteractionEnd = () => {
            syncCanvasGeometry();
            isAnimating = true;
            sCanvas.style.opacity = String(mapOpacity / 100);
            dCanvas.style.opacity = String(mapOpacity / 100);
            renderLoop();
        };

        map.on('movestart zoomstart', handleInteractionStart);
        map.on('moveend zoomend', handleInteractionEnd);

        syncCanvasGeometry();
        renderLoop();

        return () => {
            isAnimating = false;
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            map.off('movestart zoomstart', handleInteractionStart);
            map.off('moveend zoomend', handleInteractionEnd);
            if (sCanvas.parentNode) sCanvas.parentNode.removeChild(sCanvas);
            if (dCanvas.parentNode) dCanvas.parentNode.removeChild(dCanvas);
        };
    }, [isRiverActive, processedGeoJson, map, mapOpacity]);

    return null;
}

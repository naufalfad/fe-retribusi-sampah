/**
 * ============================================================================
 * ENGINE MATEMATIKA SPASIAL (PURE FABRICATION)
 * Bertanggung jawab penuh atas kalkulasi interpolasi (IDW), jarak Euclidean,
 * trigonometri vektor angin, dan Gradasi Warna Kontinu (Continuous Color Ramp).
 * Bebas dari dependensi UI (React/Leaflet).
 * ============================================================================
 */

// --- VIRTUAL BASELINE NODES (ANCHOR MITIGATION) ---
// Menyesuaikan Bounding Box Bogor (-6.80 s/d -6.25 dan 106.35 s/d 107.25).
// Membentuk cincin 8-titik simetris agar tarikan IDW merata di wilayah perbatasan.
const BOGOR_VIRTUAL_NODES = [
    { lat: -6.25, lng: 106.35, aqi: 25 }, // Barat Laut ekstrem (Perbatasan Tangerang/Banten)
    { lat: -6.25, lng: 106.80, aqi: 25 }, // Utara Tengah (Perbatasan Depok/Bekasi)
    { lat: -6.25, lng: 107.25, aqi: 25 }, // Timur Laut ekstrem (Perbatasan Karawang)
    { lat: -6.525, lng: 106.35, aqi: 25 }, // Sayap Barat (Perbatasan Lebak)
    { lat: -6.525, lng: 107.25, aqi: 25 }, // Sayap Timur (Perbatasan Cianjur/Purwakarta)
    { lat: -6.80, lng: 106.35, aqi: 25 }, // Barat Daya ekstrem (Sukabumi barat)
    { lat: -6.80, lng: 106.80, aqi: 25 }, // Selatan Tengah (Perbatasan Sukabumi)
    { lat: -6.80, lng: 107.25, aqi: 25 }, // Tenggara ekstrem (Perbatasan Cianjur)
];

const IDW_POWER = 1.9;

const getDistanceSq = (lat1, lng1, lat2, lng2) => {
    const dLat = lat1 - lat2;
    const dLng = lng1 - lng2;
    return (dLat * dLat) + (dLng * dLng);
};

// --- STASIUN WARNA AQI (COLOR STOPS - US EPA) ---
const AQI_COLOR_STOPS = [
    { val: 0, rgb: [16, 185, 129] },     // Emerald 500 (Sangat Baik)
    { val: 50, rgb: [16, 185, 129] },    // Emerald 500 (Batas Baik)
    { val: 100, rgb: [250, 204, 21] },   // Yellow 400 (Sedang)
    { val: 150, rgb: [249, 115, 22] },   // Orange 500 (Sensitif)
    { val: 200, rgb: [239, 68, 68] },    // Red 500 (Tidak Sehat)
    { val: 300, rgb: [147, 51, 234] },   // Purple 600 (Sangat Tidak Sehat)
    { val: 400, rgb: [126, 0, 35] }      // Maroon (Berbahaya)
];

export const spatialMath = {
    /**
     * Interpolasi AQI menggunakan Inverse Distance Weighting (IDW)
     */
    interpolateAqi: (targetLat, targetLng, realSensors = [], baselineAqi = 85) => {
        const dynamicVirtualNodes = BOGOR_VIRTUAL_NODES.map(node => ({
            ...node,
            aqi: baselineAqi
        }));

        const allSensors = [...realSensors, ...dynamicVirtualNodes];
        if (allSensors.length === 0) return baselineAqi;

        let totalWeight = 0;
        let weightedSum = 0;

        for (const sensor of allSensors) {
            const distSq = getDistanceSq(targetLat, targetLng, sensor.lat, sensor.lng);

            if (distSq < 0.0000001) {
                return sensor.aqi;
            }

            const dist = Math.sqrt(distSq);
            const weight = 1 / Math.pow(dist, IDW_POWER);

            weightedSum += sensor.aqi * weight;
            totalWeight += weight;
        }

        return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : baselineAqi;
    },

    /**
     * Interpolasi Vektor Angin (Trigonometric IDW)
     */
    interpolateWind: (targetLat, targetLng, sensors = []) => {
        if (sensors.length === 0) return { wd: 45, ws: 2.5 };

        let totalWeight = 0;
        let weightedU = 0;
        let weightedV = 0;
        let weightedSpeed = 0;

        for (const sensor of sensors) {
            const distSq = getDistanceSq(targetLat, targetLng, sensor.lat, sensor.lng);
            const weight = distSq < 0.0000001 ? 1000000 : 1 / Math.pow(Math.sqrt(distSq), 2);

            const rad = (sensor.wd * Math.PI) / 180;
            const u = Math.cos(rad) * sensor.ws;
            const v = Math.sin(rad) * sensor.ws;

            weightedU += u * weight;
            weightedV += v * weight;
            weightedSpeed += sensor.ws * weight;
            totalWeight += weight;
        }

        if (totalWeight === 0) return { wd: 45, ws: 2.5 };

        const avgU = weightedU / totalWeight;
        const avgV = weightedV / totalWeight;
        const avgSpeed = weightedSpeed / totalWeight;

        let avgWd = (Math.atan2(avgV, avgU) * 180) / Math.PI;
        if (avgWd < 0) avgWd += 360;

        return {
            wd: Math.round(avgWd),
            ws: parseFloat(avgSpeed.toFixed(1))
        };
    },

    /**
     * Generator Matriks Grid Kanvas
     */
    generateCanvasGrid: (bounds, resolutionX, resolutionY) => {
        const points = [];
        const latStep = (bounds.latMax - bounds.latMin) / (resolutionY - 1);
        const lngStep = (bounds.lngMax - bounds.lngMin) / (resolutionX - 1);

        for (let y = 0; y < resolutionY; y++) {
            for (let x = 0; x < resolutionX; x++) {
                points.push({
                    x,
                    y,
                    lat: bounds.latMin + (y * latStep),
                    lng: bounds.lngMin + (x * lngStep)
                });
            }
        }

        return points;
    },

    /**
     * Gradasi Warna Kontinu RGB Berdasarkan Nilai AQI
     */
    interpolateColorRgb: (aqi) => {
        if (aqi <= 0) return [16, 185, 129];
        if (aqi >= 400) return [126, 0, 35];

        let lowerLimit = AQI_COLOR_STOPS[0];
        let upperLimit = AQI_COLOR_STOPS[AQI_COLOR_STOPS.length - 1];

        for (let i = 0; i < AQI_COLOR_STOPS.length - 1; i++) {
            if (aqi >= AQI_COLOR_STOPS[i].val && aqi <= AQI_COLOR_STOPS[i + 1].val) {
                lowerLimit = AQI_COLOR_STOPS[i];
                upperLimit = AQI_COLOR_STOPS[i + 1];
                break;
            }
        }

        const range = upperLimit.val - lowerLimit.val;
        if (range === 0) return lowerLimit.rgb;

        const ratio = (aqi - lowerLimit.val) / range;
        const r = Math.round(lowerLimit.rgb[0] + ratio * (upperLimit.rgb[0] - lowerLimit.rgb[0]));
        const g = Math.round(lowerLimit.rgb[1] + ratio * (upperLimit.rgb[1] - lowerLimit.rgb[1]));
        const b = Math.round(lowerLimit.rgb[2] + ratio * (upperLimit.rgb[2] - lowerLimit.rgb[2]));

        return [r, g, b];
    }
};

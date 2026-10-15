import * as turf from '@turf/turf';

/**
 * 1. MENGHITUNG KEPADATAN OBJEK RETRIBUSI PER KECAMATAN (Choropleth Aggregation)
 * Menggunakan algoritma Point-in-Polygon (PIP) untuk agregasi spasial objek retribusi.
 * 
 * @param {Array} objects - Array data objek retribusi dari backend (lat & lng)
 * @param {Object} geojsonKecamatan - FeatureCollection GeoJSON dari Kecamatan Kabupaten Bogor
 * @returns {Record<string, number>} Object berisi { "Nama Kecamatan": JumlahObjek }
 */
export const calculateObjectsPerKecamatan = (objects, geojsonKecamatan) => {
    const counts = {};

    if (!geojsonKecamatan || !geojsonKecamatan.features) return counts;

    geojsonKecamatan.features.forEach((feature) => {
        const kecName = feature.properties?.WADMKC;
        if (!kecName) return;

        counts[kecName] = 0;

        objects.forEach((obj) => {
            const lat = parseFloat(obj.lat);
            const lng = parseFloat(obj.lng);

            if (isNaN(lat) || isNaN(lng)) return;

            // Turf.js menggunakan format [Longitude, Latitude]
            const pt = turf.point([lng, lat]);

            try {
                if (turf.booleanPointInPolygon(pt, feature)) {
                    counts[kecName] += 1;
                }
            } catch (error) {
                // Ignore turf precision errors
            }
        });
    });

    return counts;
};

/**
 * 2. MENGHITUNG RADIUS CAKUPAN / JANGKAUAN (Buffer Intersection)
 * Mendeteksi kelurahan/desa mana saja yang masuk dalam radius objek.
 * 
 * @param {number} lat - Latitude pusat
 * @param {number} lng - Longitude pusat
 * @param {number} radiusKm - Radius jangkauan dalam KM (misal: 3 atau 5)
 * @param {Object} geojsonDesa - GeoJSON desa Kabupaten Bogor
 * @returns {Array<{ desa: string, kecamatan: string }>}
 */
export const getAffectedVillages = (lat, lng, radiusKm, geojsonDesa) => {
    const affected = [];

    if (!geojsonDesa || !geojsonDesa.features || isNaN(lat) || isNaN(lng)) {
        return affected;
    }

    try {
        const center = turf.point([lng, lat]);
        const impactBuffer = turf.circle(center, radiusKm, { units: 'kilometers' });

        geojsonDesa.features.forEach((feature) => {
            const desaName = feature.properties?.WADMKD;
            const kecName = feature.properties?.WADMKC;

            if (!desaName) return;

            if (turf.booleanIntersects(impactBuffer, feature)) {
                affected.push({
                    desa: desaName,
                    kecamatan: kecName || 'Tidak Diketahui',
                });
            }
        });
    } catch (error) {
        console.error('Gagal menghitung radius dampak spasial:', error);
    }

    return affected;
};

/**
 * 3. GENERATOR INVERTED BOGOR MASK
 * Menghasilkan polygon cutout untuk meredupkan wilayah di luar Kabupaten Bogor.
 */
export const createInvertedBogorMask = (kecGeoJson) => {
    if (!kecGeoJson || !kecGeoJson.features) return null;

    const worldOuterBounds = [
        [-90, -180],
        [90, -180],
        [90, 180],
        [-90, 180],
        [-90, -180],
    ];
    const innerHoles = [];

    kecGeoJson.features.forEach((feature) => {
        const geometry = feature.geometry;
        if (!geometry) return;

        if (geometry.type === 'Polygon') {
            geometry.coordinates.forEach((ring) => {
                const latLngRing = ring.map((coord) => [coord[1], coord[0]]);
                innerHoles.push(latLngRing);
            });
        } else if (geometry.type === 'MultiPolygon') {
            geometry.coordinates.forEach((polygon) => {
                polygon.forEach((ring) => {
                    const latLngRing = ring.map((coord) => [coord[1], coord[0]]);
                    innerHoles.push(latLngRing);
                });
            });
        }
    });

    return [worldOuterBounds, ...innerHoles];
};

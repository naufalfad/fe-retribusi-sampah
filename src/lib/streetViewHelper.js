/**
 * Helper Cerdas untuk Navigasi Google Maps & Google Street View
 */

/**
 * Membuka Google Street View dengan algoritma Auto-Snap ke jalan terdekat.
 * Jika koordinat berada di dalam lahan/gang (>15m dari jalan yang dapat dilalui),
 * sistem secara otomatis mencari titik badan jalan terdekat agar Google Street View
 * tidak menampilkan layar hitam / pesan 'tidak ada gambar'.
 *
 * @param {number} lat - Latitude titik fasilitas
 * @param {number} lng - Longitude titik fasilitas
 */
export async function openSmartStreetView(lat, lng) {
    const numLat = parseFloat(lat);
    const numLng = parseFloat(lng);

    if (isNaN(numLat) || isNaN(numLng)) {
        alert('Koordinat fasilitas tidak valid.');
        return;
    }

    try {
        // Query titik jalan terdekat (OSRM Nearest Driving API)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        const response = await fetch(
            `https://router.project-osrm.org/nearest/v1/driving/${numLng},${numLat}`,
            { signal: controller.signal }
        );
        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            if (data.code === 'Ok' && data.waypoints && data.waypoints.length > 0) {
                const nearest = data.waypoints[0];
                const snappedLng = nearest.location[0];
                const snappedLat = nearest.location[1];
                const distanceM = Math.round(nearest.distance);

                // Jika titik berada lebih dari 12 meter dari jalan, gunakan titik jalan terdekat
                if (distanceM > 12) {
                    console.log(`[StreetView Auto-Snap] Menemukan jalan terdekat berjarak ${distanceM}m: [${snappedLat}, ${snappedLng}]`);
                    window.open(
                        `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${snappedLat},${snappedLng}`,
                        '_blank'
                    );
                    return;
                }
            }
        }
    } catch (err) {
        console.warn('[StreetView] Gagal mencari jalan terdekat, menggunakan titik koordinat asli:', err.message);
    }

    // Fallback langsung ke koordinat titik asli
    window.open(
        `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${numLat},${numLng}`,
        '_blank'
    );
}

/**
 * Membuka Google Maps dengan PIN MARKER MERAH yang DIJAMIN 100% selalu tampil.
 * Tidak akan pernah memicu layar hitam / error Street View.
 *
 * @param {number} lat - Latitude titik fasilitas
 * @param {number} lng - Longitude titik fasilitas
 */
export function openGoogleMapsPin(lat, lng) {
    const numLat = parseFloat(lat);
    const numLng = parseFloat(lng);

    if (isNaN(numLat) || isNaN(numLng)) return;
    window.open(`https://www.google.com/maps/search/?api=1&query=${numLat},${numLng}`, '_blank');
}

/**
 * Membuka Petunjuk Arah / Navigasi Rute Turn-by-Turn menuju lokasi titik fasilitas.
 *
 * @param {number} lat - Latitude tujuan
 * @param {number} lng - Longitude tujuan
 */
export function openGoogleMapsDirections(lat, lng) {
    const numLat = parseFloat(lat);
    const numLng = parseFloat(lng);

    if (isNaN(numLat) || isNaN(numLng)) return;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${numLat},${numLng}`, '_blank');
}

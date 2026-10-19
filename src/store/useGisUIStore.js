import { create } from 'zustand';

/**
 * useGisUIStore - State Management GIS REKAS (GFW Paradigm)
 * Mengelola tumpukan laci (Stacking Panels) dan konteks kanvas peta secara reaktif.
 */
export const useGisUIStore = create((set) => ({
    // ==========================================
    // 1. STATE: Manajemen Panel (UI Layout)
    // ==========================================
    activePanels: [],

    // ==========================================
    // 2. STATE: Konteks Eksplorasi Spasial (Peta)
    // ==========================================
    activeLayers: [
        'layer-rumah',
        'layer-non-rumah',
        'layer-bank-sampah',
        'layer-tps',
        'layer-tpst',
        'layer-tpa',
    ],
    mapOpacity: 85,                   // 0 - 100
    maskOpacity: 55,                  // 0 - 100 (Inverted Mask Luar Bogor)
    activeBaseMap: 'dark',          // 'street', 'satellite', 'esri', 'osm', 'dark'
    selectedObjectId: null,
    selectedObject: null,
    selectedTempatSampahId: null,
    selectedTempatSampah: null,

    mapCenter: [-6.4816, 106.8560],   // Cibinong / Kab. Bogor
    mapZoom: 12,

    activeAdminBoundary: 'none',      // 'none' | 'kecamatan' | 'desa'
    showImpactRadius: false,

    // Filter & Search Spasial
    searchQuery: '',
    selectedCategory: 'ALL',          // 'ALL', 'Rumah Tinggal', 'Non Rumah Tinggal'
    selectedSubdistrict: 'ALL',       // 'ALL' atau nama Kecamatan (misal: 'Cibinong')
    selectedStatus: 'ALL',            // 'ALL', 'LUNAS', 'NUNGGAK'

    // ==========================================
    // ACTIONS: Manajemen Panel (Stacking Drawers)
    // ==========================================
    openPanel: (type, title, data = null) =>
        set((state) => {
            const isFloating = type === 'detil-objek' || type === 'detil-tempat-sampah';
            let nextPanels = [...state.activePanels];

            const isLeftMenu =
                type === 'layers' ||
                type === 'katalog-objek' ||
                type === 'basemap-gallery' ||
                type === 'statistik' ||
                type === 'tentang';

            if (isLeftMenu) {
                // Bersihkan floating detail lama jika beralih menu kiri utama
                nextPanels = nextPanels.filter((p) => p.type !== 'detil-objek' && p.type !== 'detil-tempat-sampah');
                // Hapus panel tipe sama jika sudah ada di menu
                nextPanels = nextPanels.filter((p) => p.type !== type);
            } else if (isFloating) {
                // Singleton untuk floating detail panel (tutup floating lain agar fokus)
                nextPanels = nextPanels.filter((p) => p.type !== 'detil-objek' && p.type !== 'detil-tempat-sampah');
            }

            const newPanel = {
                id: `${type}-${Date.now()}`,
                type,
                title,
                isVisible: true,
                data,
            };

            nextPanels.push(newPanel);
            return { activePanels: nextPanels };
        }),

    closePanel: (id) =>
        set((state) => {
            const closedPanel = state.activePanels.find((p) => p.id === id);
            if (!closedPanel) return {};

            const filteredPanels = state.activePanels.filter((p) => p.id !== id);
            const isDetailObjek = closedPanel.type === 'detil-objek';
            const isDetailTempat = closedPanel.type === 'detil-tempat-sampah';

            return {
                activePanels: filteredPanels,
                ...(isDetailObjek && {
                    selectedObjectId: null,
                    selectedObject: null,
                    showImpactRadius: false,
                }),
                ...(isDetailTempat && {
                    selectedTempatSampahId: null,
                    selectedTempatSampah: null,
                }),
            };
        }),

    closePanelsToTheRight: (index) =>
        set((state) => {
            const slicedPanels = state.activePanels.slice(0, index + 1);
            const isDetailStillOpen = slicedPanels.some((p) => p.type === 'detil-objek');
            const isTempatStillOpen = slicedPanels.some((p) => p.type === 'detil-tempat-sampah');

            return {
                activePanels: slicedPanels,
                ...(!isDetailStillOpen && {
                    selectedObjectId: null,
                    selectedObject: null,
                    showImpactRadius: false,
                }),
                ...(!isTempatStillOpen && {
                    selectedTempatSampahId: null,
                    selectedTempatSampah: null,
                }),
            };
        }),

    clearPanels: () =>
        set({
            activePanels: [],
            selectedObjectId: null,
            selectedObject: null,
            selectedTempatSampahId: null,
            selectedTempatSampah: null,
            showImpactRadius: false,
        }),

    // ==========================================
    // ACTIONS: Konteks Eksplorasi Spasial
    // ==========================================
    toggleLayer: (layerId) =>
        set((state) => {
            const isExists = state.activeLayers.includes(layerId);
            let nextLayers = [...state.activeLayers];

            if (isExists) {
                nextLayers = nextLayers.filter((id) => id !== layerId);
            } else {
                nextLayers.push(layerId);
            }

            return { activeLayers: nextLayers };
        }),

    setMapOpacity: (opacity) => set({ mapOpacity: opacity }),
    setMaskOpacity: (opacity) => set({ maskOpacity: opacity }),
    setActiveBaseMap: (baseMapId) => set({ activeBaseMap: baseMapId }),

    setSelectedObjectId: (id) => set({ selectedObjectId: id }),
    setSelectedObject: (obj) => set({ selectedObject: obj, selectedObjectId: obj?.id_objek || null }),

    setSelectedTempatSampahId: (id) => set({ selectedTempatSampahId: id }),
    setSelectedTempatSampah: (tempat) =>
        set({
            selectedTempatSampah: tempat,
            selectedTempatSampahId: tempat?.id_tempat_sampah || null,
        }),

    setMapCenter: (center) => set({ mapCenter: center }),
    setMapZoom: (zoom) => set({ mapZoom: zoom }),

    setActiveAdminBoundary: (boundary) => set({ activeAdminBoundary: boundary }),
    setShowImpactRadius: (show) => set({ showImpactRadius: show }),

    setSearchQuery: (query) => set({ searchQuery: query }),
    setSelectedCategory: (cat) => set({ selectedCategory: cat }),
    setSelectedSubdistrict: (kec) => set({ selectedSubdistrict: kec }),
    setSelectedStatus: (status) => set({ selectedStatus: status }),

    resetMapContext: () =>
        set({
            activeLayers: [
                'layer-rumah',
                'layer-non-rumah',
                'layer-bank-sampah',
                'layer-tps',
                'layer-tpst',
                'layer-tpa',
            ],
            selectedObjectId: null,
            selectedObject: null,
            selectedTempatSampahId: null,
            selectedTempatSampah: null,
            activePanels: [],
            activeAdminBoundary: 'none',
            showImpactRadius: false,
            mapOpacity: 85,
            maskOpacity: 55,
            activeBaseMap: 'dark',
            mapCenter: [-6.4816, 106.8560],
            mapZoom: 12,
            searchQuery: '',
            selectedCategory: 'ALL',
            selectedSubdistrict: 'ALL',
            selectedStatus: 'ALL',
        }),
}));

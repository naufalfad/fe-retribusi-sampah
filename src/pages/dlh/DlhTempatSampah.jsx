import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Recycle,
    Trash2,
    Factory,
    Truck,
    Plus,
    Search,
    MapPin,
    Layers,
    Filter,
    Edit2,
    Trash,
    ExternalLink,
    Clock,
    Phone,
    User,
    CheckCircle2,
    AlertTriangle,
    X,
    Sparkles,
    Check,
    Loader2,
    RefreshCw,
    Info,
    ChevronRight,
    ChevronDown,
    Map as MapIcon,
    Eye,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../../api/axios';
import { useGisUIStore } from '../../store/useGisUIStore';

// Custom Marker untuk Mini Map Picker
const pickerIcon = L.divIcon({
    html: `
        <div style="position: relative; width: 32px; height: 42px; display: flex; align-items: center; justify-content: center;">
            <svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 3px 6px rgba(0,0,0,0.5));">
                <path d="M16 42 C11.5 33.5 2.5 23 2.5 15 A 13.5 13.5 0 1 1 29.5 15 C 29.5 23 20.5 33.5 16 42 Z" fill="#0d9488" stroke="#ffffff" stroke-width="2.5" stroke-linejoin="round"/>
                <circle cx="16" cy="15" r="5" fill="#ffffff" />
            </svg>
        </div>
    `,
    className: 'custom-picker-pin bg-transparent border-none',
    iconSize: [32, 42],
    iconAnchor: [16, 42],
});

// Komponen penangkap klik di peta mini
function LocationPickerEvents({ onPick }) {
    useMapEvents({
        click(e) {
            onPick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

// Controller untuk auto-center & perbaikan render tiling Leaflet di dalam modal tanpa getar/jitter
function MiniMapController({ lat, lng }) {
    const map = useMap();
    const lastMovedCoords = React.useRef({ lat: null, lng: null });

    useEffect(() => {
        const numLat = parseFloat(lat);
        const numLng = parseFloat(lng);
        if (isNaN(numLat) || isNaN(numLng)) return;

        // Cek apakah koordinat benar-benar berubah secara signifikan dari posisi sebelumnya
        const last = lastMovedCoords.current;
        const hasChanged =
            last.lat === null ||
            Math.abs(last.lat - numLat) > 0.0001 ||
            Math.abs(last.lng - numLng) > 0.0001;

        if (hasChanged) {
            lastMovedCoords.current = { lat: numLat, lng: numLng };
            // Gunakan setView langsung yang stabil tanpa animasi flyTo yang membuat peta bergetar saat mengetik
            map.setView([numLat, numLng], Math.max(map.getZoom(), 14));
        }
    }, [lat, lng, map]);

    // Hanya panggil invalidateSize sekali saat modal / map pertama kali ter-mount
    useEffect(() => {
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 300);
        return () => clearTimeout(timer);
    }, [map]);

    return null;
}

// Rekomendasi Jenis Sampah Spesifik
const REKOMENDASI_BANK_SAMPAH = [
    'Semua Jenis Sampah',
    'Botol Plastik Bersih (PET)',
    'Gelas Plastik Minuman',
    'Kardus & Karton Tebal',
    'Kertas Arsip / HVS',
    'Kaleng & Seng Bekas',
    'Besi & Logam Scrap',
    'Aluminium & Tembaga',
    'Minyak Jelantah (UCO)',
    'Barang Elektronik Rusak (E-Waste)',
    'Botol & Kaca Bening',
];

const REKOMENDASI_TPS_TPST = [
    'Semua Jenis Sampah',
    'Sampah Domestik Rumah Tangga',
    'Sampah Organik Sisa Makanan',
    'Sampah Pasar Tradisional',
    'Ranting & Dedaunan',
    'Residu Anorganik Campuran',
    'Sampah Komersial Pertokoan',
];

export default function DlhTempatSampah() {
    const navigate = useNavigate();
    const { setSelectedTempatSampah, openPanel, setMapCenter, setMapZoom } = useGisUIStore();

    const [dataList, setDataList] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [filterKategori, setFilterKategori] = useState('ALL');
    const [filterKecamatan, setFilterKecamatan] = useState('ALL');
    const [filterStatus, setFilterStatus] = useState('ALL');

    // Modal Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
    const [submitting, setSubmitting] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    // Delete Confirmation Modal
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Form inputs
    const [formData, setFormData] = useState({
        nama_tempat: '',
        kategori: 'BANK_SAMPAH',
        alamat: '',
        kecamatan: '',
        kelurahan_desa: '',
        latitude: -6.4816,
        longitude: 106.8560,
        kapasitas_total: '',
        satuan_kapasitas: 'Ton/Hari',
        volume_saat_ini: '0',
        status_operasional: 'Aktif',
        jenis_sampah: [],
        jam_operasional: 'Senin - Sabtu (08:00 - 16:00 WIB)',
        pengelola: '',
        kontak: '',
        keterangan: '',
    });

    const [customTagInput, setCustomTagInput] = useState('');

    // State untuk Smart Select Kelurahan / Desa (Auto-Fill Kecamatan & Koordinat)
    const [allKelurahan, setAllKelurahan] = useState([]);
    const [filteredKelurahan, setFilteredKelurahan] = useState([]);
    const [isKelurahanDropdownOpen, setIsKelurahanDropdownOpen] = useState(false);
    const [kelurahanSearchLabel, setKelurahanSearchLabel] = useState('');

    // 1. Ambil data master kelurahan dari API wilayah
    useEffect(() => {
        const fetchInitialKelurahan = async () => {
            try {
                const res = await api.get('/wilayah/search-kelurahan?q=');
                if (res.data?.success && Array.isArray(res.data.data)) {
                    setAllKelurahan(res.data.data);
                    setFilteredKelurahan(res.data.data);
                }
            } catch (err) {
                console.error('Gagal mengambil data kelurahan:', err);
            }
        };
        fetchInitialKelurahan();
    }, []);

    // 2. Logic filter saat pengguna mengetik nama Kelurahan / Desa
    const handleSearchKelurahan = async (e) => {
        const val = e.target.value;
        setKelurahanSearchLabel(val);
        setIsKelurahanDropdownOpen(true);

        try {
            const res = await api.get(`/wilayah/search-kelurahan?q=${encodeURIComponent(val)}`);
            if (res.data?.success && Array.isArray(res.data.data)) {
                setFilteredKelurahan(res.data.data);
                setAllKelurahan((prev) => {
                    const map = new Map();
                    prev.forEach((item) => map.set(String(item.id), item));
                    res.data.data.forEach((item) => map.set(String(item.id), item));
                    return Array.from(map.values());
                });
            }
        } catch (err) {
            console.error('Gagal mencari kelurahan:', err);
        }
    };

    // 3. Logic saat Kelurahan / Desa dipilih -> AUTO-FILL Kecamatan & Koordinat!
    const handleSelectKelurahan = (kel) => {
        const kecName = kel.RefKecamatan?.name || '';
        const kelName = kel.name || '';
        setKelurahanSearchLabel(`${kelName} (Kec. ${kecName})`);

        let latVal = formData.latitude;
        let lngVal = formData.longitude;

        if (kel.lokasi?.coordinates && kel.lokasi.coordinates.length === 2) {
            const [lng, lat] = kel.lokasi.coordinates;
            if (!isNaN(lat) && !isNaN(lng)) {
                latVal = Number(Number(lat).toFixed(6));
                lngVal = Number(Number(lng).toFixed(6));
            }
        }

        setFormData((prev) => ({
            ...prev,
            kelurahan_desa: kelName,
            kecamatan: kecName || prev.kecamatan,
            latitude: latVal,
            longitude: lngVal,
        }));

        setIsKelurahanDropdownOpen(false);
    };

    // Mengambil data tempat sampah
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (filterKategori !== 'ALL') params.kategori = filterKategori;
            if (filterKecamatan !== 'ALL') params.kecamatan = filterKecamatan;
            if (filterStatus !== 'ALL') params.status = filterStatus;
            if (searchQuery.trim()) params.search = searchQuery.trim();

            const res = await api.get('/tempat-sampah', { params });
            if (res.data?.success || res.data?.status === 'success') {
                setDataList(res.data.data || []);
            }
        } catch (err) {
            console.error('Gagal memuat data tempat sampah:', err);
        } finally {
            setLoading(false);
        }
    }, [filterKategori, filterKecamatan, filterStatus, searchQuery]);

    // Mengambil agregasi statistik
    const fetchStats = useCallback(async () => {
        setStatsLoading(true);
        try {
            const res = await api.get('/tempat-sampah/stats');
            if (res.data?.success || res.data?.status === 'success') {
                setStats(res.data.data);
            }
        } catch (err) {
            console.error('Gagal memuat statistik tempat sampah:', err);
        } finally {
            setStatsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    // List unik kecamatan untuk filter dropdown
    const kecamatanOptions = useMemo(() => {
        const unique = new Set();
        dataList.forEach((d) => {
            if (d.kecamatan) unique.add(d.kecamatan);
        });
        return Array.from(unique).sort();
    }, [dataList]);

    // Buka Modal Tambah
    const handleOpenCreate = () => {
        setModalMode('create');
        setSelectedItem(null);
        setFormData({
            nama_tempat: '',
            kategori: 'BANK_SAMPAH',
            alamat: '',
            kecamatan: 'Cibinong',
            kelurahan_desa: 'Tengah',
            latitude: -6.4816,
            longitude: 106.8560,
            kapasitas_total: '10',
            satuan_kapasitas: 'Ton/Hari',
            volume_saat_ini: '0',
            status_operasional: 'Aktif',
            jenis_sampah: ['Botol Plastik Bersih (PET)', 'Kardus & Karton Tebal'],
            jam_operasional: 'Senin - Sabtu (08:00 - 15:00 WIB)',
            pengelola: 'KSM Bank Sampah Mandiri',
            kontak: '0812-3456-7890',
            keterangan: '',
        });
        setKelurahanSearchLabel('Tengah (Kec. Cibinong)');
        setCustomTagInput('');
        setIsKelurahanDropdownOpen(false);
        setIsModalOpen(true);
    };

    // Buka Modal Edit
    const handleOpenEdit = (item) => {
        setModalMode('edit');
        setSelectedItem(item);

        const normStatus = (item.status_operasional === 'AKTIF' || item.status_operasional === 'Aktif')
            ? 'Aktif'
            : item.status_operasional || 'Aktif';

        setFormData({
            nama_tempat: item.nama_tempat || '',
            kategori: item.kategori || 'BANK_SAMPAH',
            alamat: item.alamat || '',
            kecamatan: item.kecamatan || '',
            kelurahan_desa: item.kelurahan_desa || '',
            latitude: parseFloat(item.latitude) || -6.4816,
            longitude: parseFloat(item.longitude) || 106.8560,
            kapasitas_total: item.kapasitas_total || '',
            satuan_kapasitas: item.satuan_kapasitas || 'Ton/Hari',
            volume_saat_ini: item.volume_saat_ini || '0',
            status_operasional: normStatus,
            jenis_sampah: Array.isArray(item.jenis_sampah)
                ? item.jenis_sampah
                : typeof item.jenis_sampah === 'string'
                    ? JSON.parse(item.jenis_sampah || '[]')
                    : [],
            jam_operasional: item.jam_operasional || '',
            pengelola: item.pengelola || '',
            kontak: item.kontak || '',
            keterangan: item.keterangan || '',
        });
        setKelurahanSearchLabel(
            item.kelurahan_desa
                ? `${item.kelurahan_desa}${item.kecamatan ? ` (Kec. ${item.kecamatan})` : ''}`
                : item.kecamatan
                    ? `Kec. ${item.kecamatan}`
                    : ''
        );
        setCustomTagInput('');
        setIsKelurahanDropdownOpen(false);
        setIsModalOpen(true);
    };

    // Toggle Tag Jenis Sampah
    const handleToggleJenisSampah = (tag) => {
        setFormData((prev) => {
            const exists = prev.jenis_sampah.includes(tag);
            return {
                ...prev,
                jenis_sampah: exists
                    ? prev.jenis_sampah.filter((t) => t !== tag)
                    : [...prev.jenis_sampah, tag],
            };
        });
    };

    // Tambah tag custom
    const handleAddCustomTag = (e) => {
        e.preventDefault();
        const trimmed = customTagInput.trim();
        if (trimmed && !formData.jenis_sampah.includes(trimmed)) {
            setFormData((prev) => ({
                ...prev,
                jenis_sampah: [...prev.jenis_sampah, trimmed],
            }));
            setCustomTagInput('');
        }
    };

    // Simpan Form (Create / Edit)
    const handleSubmitForm = async (e) => {
        e.preventDefault();
        if (!formData.nama_tempat || !formData.kategori || !formData.kecamatan) {
            alert('Harap isi Nama Fasilitas, Kategori, dan Kecamatan.');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                latitude: parseFloat(formData.latitude),
                longitude: parseFloat(formData.longitude),
                kapasitas_total: parseFloat(formData.kapasitas_total) || 0,
                volume_saat_ini: parseFloat(formData.volume_saat_ini) || 0,
            };

            if (modalMode === 'create') {
                const res = await api.post('/tempat-sampah', payload);
                if (res.data?.success || res.data?.status === 'success') {
                    setIsModalOpen(false);
                    fetchData();
                    fetchStats();
                }
            } else {
                const res = await api.put(`/tempat-sampah/${selectedItem.id_tempat_sampah}`, payload);
                if (res.data?.success || res.data?.status === 'success') {
                    setIsModalOpen(false);
                    fetchData();
                    fetchStats();
                }
            }
        } catch (err) {
            console.error('Gagal menyimpan fasilitas sampah:', err);
            alert(err.response?.data?.message || 'Terjadi kesalahan saat menyimpan data.');
        } finally {
            setSubmitting(false);
        }
    };

    // Hapus Fasilitas
    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        setDeleting(true);
        try {
            const res = await api.delete(`/tempat-sampah/${itemToDelete.id_tempat_sampah}`);
            if (res.data?.success || res.data?.status === 'success') {
                setDeleteModalOpen(false);
                setItemToDelete(null);
                fetchData();
                fetchStats();
            }
        } catch (err) {
            console.error('Gagal menghapus tempat sampah:', err);
            alert(err.response?.data?.message || 'Gagal menghapus fasilitas tempat sampah.');
        } finally {
            setDeleting(false);
        }
    };

    // Lihat Langsung di Peta GIS
    const handleViewOnGis = (item) => {
        const lat = parseFloat(item.latitude);
        const lng = parseFloat(item.longitude);
        if (!isNaN(lat) && !isNaN(lng)) {
            setMapCenter([lat, lng]);
            setMapZoom(16);
        }
        setSelectedTempatSampah(item);
        openPanel('detil-tempat-sampah', item.nama_tempat, item);
        navigate('/dlh/peta-monitoring');
    };

    const getKategoriBadge = (kat) => {
        switch (kat) {
            case 'BANK_SAMPAH':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold rounded bg-teal-50 text-teal-700 border border-teal-200">
                        <Recycle size={11} /> Bank Sampah
                    </span>
                );
            case 'TPS':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold rounded bg-amber-50 text-amber-700 border border-amber-200">
                        <Trash2 size={11} /> TPS
                    </span>
                );
            case 'TPST':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                        <Factory size={11} /> TPST (3R)
                    </span>
                );
            case 'TPA':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold rounded bg-purple-50 text-purple-700 border border-purple-200">
                        <Truck size={11} /> TPA
                    </span>
                );
            default:
                return <span className="text-xs text-slate-700">{kat}</span>;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
            {/* TOP HEADER */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
                                <span>Dinas Lingkungan Hidup</span>
                                <ChevronRight size={12} />
                                <span className="text-emerald-700 font-semibold">Fasilitas Persampahan</span>
                            </div>
                            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
                                <Recycle className="text-emerald-700" size={26} />
                                Fasilitas Tempat Penampungan & Pengolahan Sampah
                            </h1>
                            <p className="text-xs text-slate-500 mt-1">
                                Kelola direktori Bank Sampah (pemilahan bernilai ekonomis), TPS, TPST (3R), dan TPA Kabupaten Bogor.
                            </p>
                        </div>

                        <div className="flex items-center gap-2.5">
                            <button
                                onClick={() => navigate('/dlh/peta-monitoring')}
                                className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                                <MapIcon size={14} className="text-emerald-700" />
                                Buka di Peta GIS
                            </button>

                            <button
                                onClick={handleOpenCreate}
                                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                                <Plus size={15} />
                                Tambah Fasilitas Baru
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                {/* 1. STATISTIC CARDS */}
                <section className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
                    <div className="bg-white p-4 border border-slate-200 rounded shadow-2xs">
                        <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">
                            Total Fasilitas
                        </span>
                        <div className="mt-2 flex items-baseline justify-between">
                            <span className="text-2xl font-extrabold text-slate-900">
                                {statsLoading ? '...' : stats?.total || dataList.length}
                            </span>
                            <Layers size={18} className="text-slate-400" />
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1 block">Kabupaten Bogor</span>
                    </div>

                    <div className="bg-white p-4 border border-teal-200/80 rounded shadow-2xs relative overflow-hidden">
                        <span className="text-[11px] font-bold text-teal-700 block uppercase tracking-wider">
                            Bank Sampah
                        </span>
                        <div className="mt-2 flex items-baseline justify-between">
                            <span className="text-2xl font-extrabold text-teal-800">
                                {statsLoading ? '...' : stats?.bank_sampah ?? stats?.byCategory?.BANK_SAMPAH ?? 0}
                            </span>
                            <Recycle size={18} className="text-teal-600" />
                        </div>
                        <span className="text-[10px] text-teal-700/80 mt-1 block">Pemilahan bernilai jual</span>
                    </div>

                    <div className="bg-white p-4 border border-amber-200/80 rounded shadow-2xs relative overflow-hidden">
                        <span className="text-[11px] font-bold text-amber-700 block uppercase tracking-wider">
                            TPS Sementara
                        </span>
                        <div className="mt-2 flex items-baseline justify-between">
                            <span className="text-2xl font-extrabold text-amber-800">
                                {statsLoading ? '...' : stats?.tps ?? stats?.byCategory?.TPS ?? 0}
                            </span>
                            <Trash2 size={18} className="text-amber-600" />
                        </div>
                        <span className="text-[10px] text-amber-700/80 mt-1 block">Transit lingkungan</span>
                    </div>

                    <div className="bg-white p-4 border border-indigo-200/80 rounded shadow-2xs relative overflow-hidden">
                        <span className="text-[11px] font-bold text-indigo-700 block uppercase tracking-wider">
                            TPST (3R)
                        </span>
                        <div className="mt-2 flex items-baseline justify-between">
                            <span className="text-2xl font-extrabold text-indigo-800">
                                {statsLoading ? '...' : stats?.tpst ?? stats?.byCategory?.TPST ?? 0}
                            </span>
                            <Factory size={18} className="text-indigo-600" />
                        </div>
                        <span className="text-[10px] text-indigo-700/80 mt-1 block">Pusat olah terpadu</span>
                    </div>

                    <div className="bg-white p-4 border border-purple-200/80 rounded shadow-2xs relative overflow-hidden">
                        <span className="text-[11px] font-bold text-purple-700 block uppercase tracking-wider">
                            TPA Galuga
                        </span>
                        <div className="mt-2 flex items-baseline justify-between">
                            <span className="text-2xl font-extrabold text-purple-800">
                                {statsLoading ? '...' : stats?.tpa ?? stats?.byCategory?.TPA ?? 0}
                            </span>
                            <Truck size={18} className="text-purple-600" />
                        </div>
                        <span className="text-[10px] text-purple-700/80 mt-1 block">Pemrosesan akhir</span>
                    </div>
                </section>

                {/* 2. FILTER & SEARCH CONTROL */}
                <section className="bg-white p-4 border border-slate-200 rounded shadow-2xs space-y-3">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        <div className="relative flex-1">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari fasilitas, alamat, atau pengelola..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 transition-all"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Filter Kategori */}
                            <select
                                value={filterKategori}
                                onChange={(e) => setFilterKategori(e.target.value)}
                                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer"
                            >
                                <option value="ALL">Semua Kategori</option>
                                <option value="BANK_SAMPAH">Bank Sampah</option>
                                <option value="TPS">TPS (Sementara)</option>
                                <option value="TPST">TPST (3R)</option>
                                <option value="TPA">TPA (Akhir)</option>
                            </select>

                            {/* Filter Kecamatan */}
                            <select
                                value={filterKecamatan}
                                onChange={(e) => setFilterKecamatan(e.target.value)}
                                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer"
                            >
                                <option value="ALL">Semua Kecamatan</option>
                                {kecamatanOptions.map((kec) => (
                                    <option key={kec} value={kec}>
                                        Kec. {kec}
                                    </option>
                                ))}
                            </select>

                            {/* Filter Status */}
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer"
                            >
                                <option value="ALL">Semua Status</option>
                                <option value="Aktif">Aktif</option>
                                <option value="Penuh">Penuh</option>
                                <option value="Pemeliharaan">Pemeliharaan</option>
                                <option value="Non-Aktif">Non-Aktif</option>
                            </select>

                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setFilterKategori('ALL');
                                    setFilterKecamatan('ALL');
                                    setFilterStatus('ALL');
                                }}
                                title="Reset Filter"
                                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                            >
                                <RefreshCw size={14} />
                            </button>
                        </div>
                    </div>
                </section>

                {/* 3. TABEL DATA FASILITAS PERSAMPAHAN */}
                <section className="bg-white border border-slate-200 rounded shadow-2xs overflow-hidden">
                    <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">
                            Daftar Fasilitas ({dataList.length} Lokasi Ditemukan)
                        </span>
                        <span className="text-[11px] text-slate-500">
                            Data sinkron dengan peta GIS Kabupaten Bogor
                        </span>
                    </div>

                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                            <Loader2 className="animate-spin text-emerald-600 mb-2" size={32} />
                            <p className="text-xs font-medium">Memuat data fasilitas persampahan...</p>
                        </div>
                    ) : dataList.length === 0 ? (
                        <div className="py-20 text-center text-slate-400 space-y-2">
                            <Recycle size={36} className="mx-auto text-slate-300" />
                            <p className="text-sm font-semibold text-slate-700">Tidak ada fasilitas ditemukan</p>
                            <p className="text-xs text-slate-400">
                                Coba ubah kata kunci pencarian atau reset filter di atas.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                                        <th className="py-3 px-4">Nama Fasilitas</th>
                                        <th className="py-3 px-4">Kategori</th>
                                        <th className="py-3 px-4">Lokasi Wilayah</th>
                                        <th className="py-3 px-4">Kapasitas Penampungan</th>
                                        <th className="py-3 px-4">Jenis Sampah Diterima</th>
                                        <th className="py-3 px-4">Status</th>
                                        <th className="py-3 px-4 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {dataList.map((item) => {
                                        const total = parseFloat(item.kapasitas_total) || 0;
                                        const jenisList = Array.isArray(item.jenis_sampah)
                                            ? item.jenis_sampah
                                            : typeof item.jenis_sampah === 'string'
                                                ? JSON.parse(item.jenis_sampah || '[]')
                                                : [];

                                        return (
                                            <tr key={item.id_tempat_sampah} className="hover:bg-slate-50/70 transition-colors">
                                                {/* Nama & Pengelola */}
                                                <td className="py-3 px-4">
                                                    <div className="font-bold text-slate-900 leading-snug">
                                                        {item.nama_tempat}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                                        <User size={10} />
                                                        {item.pengelola || 'DLH Kab. Bogor'}
                                                    </div>
                                                </td>

                                                {/* Kategori */}
                                                <td className="py-3 px-4">
                                                    {getKategoriBadge(item.kategori)}
                                                </td>

                                                {/* Lokasi */}
                                                <td className="py-3 px-4 max-w-[200px]">
                                                    <div className="font-semibold text-slate-800 truncate">
                                                        Kec. {item.kecamatan}
                                                    </div>
                                                    <div className="text-[10px] text-slate-500 truncate mt-0.5">
                                                        {item.alamat}
                                                    </div>
                                                </td>

                                                {/* Kapasitas Penampungan */}
                                                <td className="py-3 px-4 whitespace-nowrap">
                                                    <div className="font-bold text-slate-800">
                                                        {total.toLocaleString('id-ID')} {item.satuan_kapasitas}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400">
                                                        Daya Tampung Resmi
                                                    </div>
                                                </td>

                                                {/* Jenis Sampah Spesifik */}
                                                <td className="py-3 px-4 max-w-[220px]">
                                                    {jenisList.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {jenisList.includes('Semua Jenis Sampah') ? (
                                                                <span className="px-1.5 py-0.5 text-[9px] rounded font-bold bg-teal-100 text-teal-800 border border-teal-300">
                                                                    ⭐ Semua Jenis Sampah
                                                                </span>
                                                            ) : (
                                                                jenisList.slice(0, 2).map((tag, idx) => (
                                                                    <span
                                                                        key={idx}
                                                                        className={`px-1.5 py-0.5 text-[9px] rounded font-medium ${item.kategori === 'BANK_SAMPAH'
                                                                            ? 'bg-teal-50 text-teal-800 border border-teal-200'
                                                                            : 'bg-slate-100 text-slate-600'
                                                                            }`}
                                                                    >
                                                                        {tag}
                                                                    </span>
                                                                ))
                                                            )}
                                                            {!jenisList.includes('Semua Jenis Sampah') && jenisList.length > 2 && (
                                                                <span className="px-1 py-0.5 text-[9px] text-slate-400 font-mono">
                                                                    +{jenisList.length - 2} lagi
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] text-slate-400 italic">Umum</span>
                                                    )}
                                                </td>

                                                {/* Status */}
                                                <td className="py-3 px-4">
                                                    {(() => {
                                                        const st = String(item.status_operasional || '').toUpperCase();
                                                        const isAktif = st === 'AKTIF';
                                                        const isPenuh = st === 'PENUH';

                                                        return (
                                                            <span
                                                                className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded ${isAktif
                                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                                    : isPenuh
                                                                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                                                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                                                                    }`}
                                                            >
                                                                {item.status_operasional}
                                                            </span>
                                                        );
                                                    })()}
                                                </td>

                                                {/* Aksi */}
                                                <td className="py-3 px-4 text-center">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <button
                                                            onClick={() => handleViewOnGis(item)}
                                                            title="Tampilkan di Peta GIS"
                                                            className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                                                        >
                                                            <MapIcon size={14} />
                                                        </button>
                                                        {item.latitude && item.longitude && (
                                                            <a
                                                                href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${item.latitude},${item.longitude}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                title="Buka Google Street View 360°"
                                                                className="p-1.5 text-sky-600 hover:bg-sky-50 rounded transition-colors inline-flex items-center justify-center"
                                                            >
                                                                <Eye size={14} />
                                                            </a>
                                                        )}
                                                        <button
                                                            onClick={() => handleOpenEdit(item)}
                                                            title="Edit Fasilitas"
                                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                        >
                                                            <Edit2 size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setItemToDelete(item);
                                                                setDeleteModalOpen(true);
                                                            }}
                                                            title="Hapus Fasilitas"
                                                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                                        >
                                                            <Trash size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </main>

            {/* ========================================================
                MODAL FORM TAMBAH / EDIT FASILITAS TEMPAT SAMPAH
            ======================================================== */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
                        {/* Modal Header */}
                        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Recycle className="text-emerald-400" size={20} />
                                <h3 className="text-sm font-bold tracking-tight">
                                    {modalMode === 'create'
                                        ? 'Tambah Fasilitas Tempat Sampah Baru'
                                        : 'Edit Data Fasilitas Tempat Sampah'}
                                </h3>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmitForm} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
                            {/* Kategori & Nama */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                        Kategori Fasilitas <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={formData.kategori}
                                        onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                                    >
                                        <option value="BANK_SAMPAH">Bank Sampah (Pemilahan Bernilai Jual)</option>
                                        <option value="TPS">TPS (Tempat Penampungan Sementara)</option>
                                        <option value="TPST">TPST (Pengolahan Sampah Terpadu 3R)</option>
                                        <option value="TPA">TPA (Tempat Pemrosesan Akhir)</option>
                                    </select>
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                        Nama Fasilitas <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Contoh: Bank Sampah Berkah Mandiri / TPS Pakansari"
                                        value={formData.nama_tempat}
                                        onChange={(e) => setFormData({ ...formData, nama_tempat: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                                    />
                                </div>
                            </div>

                            {/* Alamat, Kecamatan, Desa */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 relative z-30">
                                {/* SMART SELECT KELURAHAN / DESA (AUTO-FILL KECAMATAN & KOORDINAT) */}
                                <div className="relative z-30">
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-[11px] font-bold text-slate-700 block">
                                            Kelurahan / Desa <span className="text-rose-500">*</span>
                                        </label>
                                        <span className="text-[9px] text-emerald-700 font-bold flex items-center gap-0.5">
                                            <Sparkles size={10} /> Auto-fill
                                        </span>
                                    </div>

                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600">
                                            <MapPin size={14} />
                                        </div>

                                        <input
                                            type="text"
                                            required
                                            placeholder="Cari Kelurahan / Desa..."
                                            value={kelurahanSearchLabel}
                                            onChange={handleSearchKelurahan}
                                            onFocus={() => setIsKelurahanDropdownOpen(true)}
                                            className="w-full pl-8 pr-7 py-2 bg-slate-50 border border-slate-300 rounded text-xs text-slate-800 font-semibold focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 transition-all"
                                        />

                                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                            <ChevronDown size={14} className={`transition-transform duration-200 ${isKelurahanDropdownOpen ? 'rotate-180' : ''}`} />
                                        </div>

                                        {/* DROPDOWN MENU KELURAHAN */}
                                        {isKelurahanDropdownOpen && (
                                            <>
                                                <div
                                                    className="fixed inset-0 z-[1000]"
                                                    onClick={() => setIsKelurahanDropdownOpen(false)}
                                                />
                                                <div className="absolute z-[1001] left-0 right-0 mt-1 bg-white border border-slate-200 shadow-2xl rounded-lg max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-150">
                                                    {filteredKelurahan.length > 0 ? (
                                                        filteredKelurahan.map((kel) => (
                                                            <div
                                                                key={kel.id}
                                                                onClick={() => handleSelectKelurahan(kel)}
                                                                className="px-3.5 py-2.5 hover:bg-emerald-50 cursor-pointer border-b border-slate-100 last:border-0 transition-colors"
                                                            >
                                                                <div className="flex justify-between items-center">
                                                                    <div>
                                                                        <p className="text-xs font-bold text-slate-800 uppercase">
                                                                            {kel.name}
                                                                        </p>
                                                                        <p className="text-[10px] text-slate-500 font-medium">
                                                                            Kec. {kel.RefKecamatan?.name || '-'} • Kab. {kel.RefKecamatan?.RefKabupaten?.name || '-'}
                                                                        </p>
                                                                    </div>
                                                                    {kel.kode_pos && (
                                                                        <span className="text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                                                            {kel.kode_pos}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="p-3 text-center text-xs text-slate-400">
                                                            Kelurahan / Desa tidak ditemukan
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Kecamatan (Auto-filled) */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-[11px] font-bold text-slate-700 block">
                                            Kecamatan <span className="text-rose-500">*</span>
                                        </label>
                                        <span className="text-[9px] text-slate-400">
                                            (Auto-terisi)
                                        </span>
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        readOnly
                                        placeholder="Terisi otomatis dari Kelurahan"
                                        value={formData.kecamatan}
                                        className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded text-xs font-semibold text-slate-700 cursor-not-allowed"
                                    />
                                </div>

                                <div>
                                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                        Alamat Lengkap / Patokan
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Contoh: Jl. Raya Pemda No. 12 RT 02/03"
                                        value={formData.alamat}
                                        onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                                    />
                                </div>
                            </div>

                            {/* PICKER KOORDINAT PETA (MINI MAP DENGAN AUTO-PAN) */}
                            <div className="space-y-2 border border-slate-200 rounded p-3 bg-slate-50 relative z-10">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                        <MapPin size={13} className="text-emerald-700" />
                                        Titik Koordinat Spasial (Otomatis terpusat pada Kelurahan yang dipilih)
                                    </span>
                                    <span className="text-[10px] font-mono text-slate-500">
                                        {Number(formData.latitude).toFixed(6)}, {Number(formData.longitude).toFixed(6)}
                                    </span>
                                </div>

                                <div className="h-44 w-full rounded border border-slate-300 overflow-hidden relative">
                                    <MapContainer
                                        center={[formData.latitude || -6.4816, formData.longitude || 106.8560]}
                                        zoom={14}
                                        style={{ height: '100%', width: '100%' }}
                                    >
                                        <MiniMapController lat={formData.latitude} lng={formData.longitude} />
                                        <TileLayer
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            attribution="&copy; OpenStreetMap"
                                        />
                                        <Marker
                                            position={[formData.latitude || -6.4816, formData.longitude || 106.8560]}
                                            icon={pickerIcon}
                                        />
                                        <LocationPickerEvents
                                            onPick={(lat, lng) => {
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    latitude: Number(lat.toFixed(6)),
                                                    longitude: Number(lng.toFixed(6)),
                                                }));
                                            }}
                                        />
                                    </MapContainer>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-1">
                                    <div>
                                        <label className="text-[10px] font-medium text-slate-500 block">Latitude</label>
                                        <input
                                            type="number"
                                            step="any"
                                            value={formData.latitude}
                                            onChange={(e) =>
                                                setFormData({ ...formData, latitude: parseFloat(e.target.value) })
                                            }
                                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-medium text-slate-500 block">Longitude</label>
                                        <input
                                            type="number"
                                            step="any"
                                            value={formData.longitude}
                                            onChange={(e) =>
                                                setFormData({ ...formData, longitude: parseFloat(e.target.value) })
                                            }
                                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-mono"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Kapasitas, Satuan, Status Operasional */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                        Kapasitas Daya Tampung
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="Contoh: 20"
                                        value={formData.kapasitas_total}
                                        onChange={(e) => setFormData({ ...formData, kapasitas_total: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                                    />
                                </div>

                                <div>
                                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                        Satuan Kapasitas
                                    </label>
                                    <select
                                        value={formData.satuan_kapasitas}
                                        onChange={(e) => setFormData({ ...formData, satuan_kapasitas: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                                    >
                                        <option value="Ton/Hari">Ton/Hari</option>
                                        <option value="m³">m³ (Meter Kubik)</option>
                                        <option value="kg/hari">kg/hari</option>
                                        <option value="Kontainer">Kontainer</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                        Status Operasional <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={formData.status_operasional}
                                        onChange={(e) => setFormData({ ...formData, status_operasional: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-xs font-semibold focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                                    >
                                        <option value="Aktif">Aktif</option>
                                        <option value="Penuh">Penuh</option>
                                        <option value="Pemeliharaan">Pemeliharaan</option>
                                        <option value="Non-Aktif">Non-Aktif</option>
                                    </select>
                                </div>
                            </div>

                            {/* FITUR SPESIFIK: JENIS SAMPAH YANG DITERIMA */}
                            <div className="space-y-3 border border-slate-200 rounded p-3.5 bg-slate-50/60">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                        <Sparkles size={13} className="text-teal-600" />
                                        Jenis Sampah yang Ditampung / Diterima
                                    </label>
                                    <span className="text-[10px] text-slate-500 font-mono">
                                        {formData.jenis_sampah.length} dipilih
                                    </span>
                                </div>

                                {/* OPSI KHUSUS: MENAMPUNG SEMUA JENIS SAMPAH */}
                                <div
                                    onClick={() => handleToggleJenisSampah('Semua Jenis Sampah')}
                                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all flex items-center justify-between ${formData.jenis_sampah.includes('Semua Jenis Sampah')
                                        ? 'bg-teal-50 border-teal-600 text-teal-900 shadow-xs'
                                        : 'bg-white border-dashed border-slate-300 hover:border-teal-400 text-slate-700'
                                        }`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${formData.jenis_sampah.includes('Semua Jenis Sampah')
                                            ? 'bg-teal-600 text-white'
                                            : 'bg-slate-100 text-slate-500'
                                            }`}>
                                            <Sparkles size={16} />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold flex items-center gap-1.5">
                                                Menampung Semua Jenis Sampah
                                                {formData.jenis_sampah.includes('Semua Jenis Sampah') && (
                                                    <span className="bg-teal-600 text-white text-[9px] px-1.5 py-0.2 rounded font-black tracking-wider">
                                                        AKTIF
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-[10px] text-slate-500">
                                                Fasilitas ini dapat menerima dan melayani semua jenis sampah (organik, anorganik, dan residu).
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${formData.jenis_sampah.includes('Semua Jenis Sampah')
                                        ? 'bg-teal-600 border-teal-600 text-white'
                                        : 'border-slate-300 bg-white'
                                        }`}>
                                        {formData.jenis_sampah.includes('Semua Jenis Sampah') && <Check size={13} strokeWidth={3} />}
                                    </div>
                                </div>

                                <p className="text-[10px] text-slate-500 leading-relaxed">
                                    Atau tentukan komoditas sampah spesifik yang dilayani (klik tombol rekomendasi di bawah):
                                </p>

                                {/* Quick Recommendation Chips */}
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                    {(formData.kategori === 'BANK_SAMPAH' ? REKOMENDASI_BANK_SAMPAH : REKOMENDASI_TPS_TPST).map(
                                        (rec) => {
                                            const isSelected = formData.jenis_sampah.includes(rec);
                                            const isSemua = rec === 'Semua Jenis Sampah';
                                            return (
                                                <button
                                                    type="button"
                                                    key={rec}
                                                    onClick={() => handleToggleJenisSampah(rec)}
                                                    className={`px-2.5 py-1 text-[11px] rounded transition-all cursor-pointer flex items-center gap-1.5 ${isSelected
                                                        ? isSemua
                                                            ? 'bg-teal-800 text-white font-bold shadow-xs'
                                                            : 'bg-teal-700 text-white font-semibold shadow-2xs'
                                                        : isSemua
                                                            ? 'bg-teal-50 text-teal-800 border border-teal-300 font-bold hover:bg-teal-100'
                                                            : 'bg-white text-slate-700 border border-slate-300 hover:border-teal-500'
                                                        }`}
                                                >
                                                    {isSelected && <Check size={11} strokeWidth={3} />}
                                                    {isSemua ? `⭐ ${rec}` : rec}
                                                </button>
                                            );
                                        }
                                    )}
                                </div>

                                {/* Custom Tag Input */}
                                <div className="flex items-center gap-2 pt-2">
                                    <input
                                        type="text"
                                        placeholder="Tambah jenis sampah kustom lainnya..."
                                        value={customTagInput}
                                        onChange={(e) => setCustomTagInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleAddCustomTag(e);
                                            }
                                        }}
                                        className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddCustomTag}
                                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded"
                                    >
                                        + Tambah
                                    </button>
                                </div>

                                {/* Tag Aktif List */}
                                {formData.jenis_sampah.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-200">
                                        {formData.jenis_sampah.map((tag) => (
                                            <span
                                                key={tag}
                                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 rounded text-[11px] font-medium"
                                            >
                                                {tag}
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleJenisSampah(tag)}
                                                    className="text-teal-600 hover:text-rose-600"
                                                >
                                                    <X size={11} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Jam Operasional, Pengelola, Kontak */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                        Jam Operasional
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Senin - Sabtu (08:00 - 15:00 WIB)"
                                        value={formData.jam_operasional}
                                        onChange={(e) => setFormData({ ...formData, jam_operasional: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                                    />
                                </div>

                                <div>
                                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                        Pengelola / KSM
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="DLH Kab. Bogor / KSM Warga"
                                        value={formData.pengelola}
                                        onChange={(e) => setFormData({ ...formData, pengelola: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                                    />
                                </div>

                                <div>
                                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                        Kontak / WhatsApp
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="0812-3456-7890"
                                        value={formData.kontak}
                                        onChange={(e) => setFormData({ ...formData, kontak: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                                    />
                                </div>
                            </div>

                            {/* Keterangan */}
                            <div>
                                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                    Keterangan / Catatan Tambahan
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="Contoh: Jadwal penimbangan sampah warga setiap hari Minggu pagi..."
                                    value={formData.keterangan}
                                    onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                                />
                            </div>

                            {/* Modal Footer */}
                            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold rounded transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 size={13} className="animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        'Simpan Fasilitas'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================
                MODAL KONFIRMASI HAPUS
            ======================================================== */}
            {deleteModalOpen && itemToDelete && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 text-center space-y-3">
                            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                                <AlertTriangle size={24} />
                            </div>
                            <h3 className="text-sm font-bold text-slate-900">
                                Konfirmasi Hapus Fasilitas
                            </h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Apakah Anda yakin ingin menghapus fasilitas persampahan{' '}
                                <strong className="text-slate-800">{itemToDelete.nama_tempat}</strong>? Data yang dihapus tidak dapat dipulihkan.
                            </p>
                        </div>

                        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
                            <button
                                type="button"
                                onClick={() => setDeleteModalOpen(false)}
                                className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold rounded transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                disabled={deleting}
                                onClick={handleConfirmDelete}
                                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
                            >
                                {deleting ? 'Menghapus...' : 'Ya, Hapus'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

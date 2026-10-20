import React, { useState, useMemo, useEffect } from 'react';
import {
    MapPin,
    Recycle,
    Trash2,
    Factory,
    Truck,
    Clock,
    Phone,
    User,
    CheckCircle2,
    AlertTriangle,
    Navigation,
    ExternalLink,
    Layers,
    Info,
    Sparkles,
    ShieldCheck,
    Eye,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Camera,
    Maximize2,
    X,
} from 'lucide-react';
import { useGisUIStore } from '../../../../../store/useGisUIStore';
import {
    openSmartStreetView,
    openGoogleMapsPin,
    openGoogleMapsDirections,
} from '../../../../../lib/streetViewHelper';

export default function TempatSampahDetailPanel({ data }) {
    const { setMapCenter, setMapZoom } = useGisUIStore();
    const [isSnapping, setIsSnapping] = useState(false);
    const [activePhotoIdx, setActivePhotoIdx] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    if (!data) {
        return (
            <div className="p-8 text-center text-xs text-slate-400 font-medium">
                Pilih fasilitas tempat sampah pada peta untuk melihat detail spesifikasi.
            </div>
        );
    }

    const {
        id_tempat_sampah,
        nama_tempat,
        kategori,
        alamat,
        kecamatan,
        kelurahan_desa,
        latitude,
        longitude,
        kapasitas_total,
        satuan_kapasitas,
        volume_saat_ini,
        status_operasional,
        jenis_sampah,
        jam_operasional,
        pengelola,
        kontak,
        keterangan,
        foto,
        foto_url,
    } = data;

    // Normalisasi daftar foto (maksimal 4 foto)
    const photoList = useMemo(() => {
        if (!data) return [];
        let list = [];
        if (Array.isArray(foto)) {
            list = foto;
        } else if (typeof foto === 'string' && foto.trim() !== '') {
            try {
                const parsed = JSON.parse(foto);
                if (Array.isArray(parsed)) list = parsed;
                else list = [foto.trim()];
            } catch {
                list = [foto.trim()];
            }
        }
        if (list.length === 0 && foto_url) {
            if (typeof foto_url === 'string' && foto_url.trim() !== '') {
                try {
                    const parsed = JSON.parse(foto_url);
                    if (Array.isArray(parsed)) list = parsed;
                    else list = [foto_url.trim()];
                } catch {
                    list = [foto_url.trim()];
                }
            } else if (Array.isArray(foto_url)) {
                list = foto_url;
            }
        }
        return list.filter(Boolean).slice(0, 4);
    }, [data, foto, foto_url]);

    // Reset slide foto saat fasilitas tempat sampah berubah
    useEffect(() => {
        setActivePhotoIdx(0);
    }, [id_tempat_sampah]);

    const handlePrevPhoto = (e) => {
        if (e) e.stopPropagation();
        if (photoList.length <= 1) return;
        setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : photoList.length - 1));
    };

    const handleNextPhoto = (e) => {
        if (e) e.stopPropagation();
        if (photoList.length <= 1) return;
        setActivePhotoIdx((prev) => (prev < photoList.length - 1 ? prev + 1 : 0));
    };

    const getPhotoSrc = (url) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
            return url;
        }
        const clean = url.startsWith('/') ? url : `/${url}`;
        const baseUrl = import.meta.env.VITE_APP_BASE_URL || 'http://localhost:3000';
        return `${baseUrl}${clean}`;
    };

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const total = parseFloat(kapasitas_total) || 0;

    // Kategori Styling & Badge
    const getCategoryConfig = (kat) => {
        switch (kat) {
            case 'BANK_SAMPAH':
                return {
                    label: 'Bank Sampah Mandiri',
                    icon: Recycle,
                    color: 'bg-teal-600',
                    lightBg: 'bg-teal-50',
                    border: 'border-teal-200',
                    text: 'text-teal-700',
                    badge: 'bg-teal-600 text-white',
                    deskripsiSingkat: 'Warga memilah mandiri & menyetor sampah bernilai jual langsung.',
                };
            case 'TPS':
                return {
                    label: 'TPS (Penampungan Sementara)',
                    icon: Trash2,
                    color: 'bg-amber-600',
                    lightBg: 'bg-amber-50',
                    border: 'border-amber-200',
                    text: 'text-amber-800',
                    badge: 'bg-amber-600 text-white',
                    deskripsiSingkat: 'Tempat penampungan sementara sebelum diangkut petugas kebersihan ke TPST/TPA.',
                };
            case 'TPST':
                return {
                    label: 'TPST (Pengolahan Terpadu 3R)',
                    icon: Factory,
                    color: 'bg-indigo-600',
                    lightBg: 'bg-indigo-50',
                    border: 'border-indigo-200',
                    text: 'text-indigo-800',
                    badge: 'bg-indigo-600 text-white',
                    deskripsiSingkat: 'Fasilitas pengolahan sampah terpadu skala kawasan dengan sistem 3R.',
                };
            case 'TPA':
                return {
                    label: 'TPA (Pemrosesan Akhir)',
                    icon: Truck,
                    color: 'bg-purple-700',
                    lightBg: 'bg-purple-50',
                    border: 'border-purple-200',
                    text: 'text-purple-800',
                    badge: 'bg-purple-700 text-white',
                    deskripsiSingkat: 'Pusat pemrosesan akhir residu sampah Kabupaten Bogor.',
                };
            default:
                return {
                    label: kat,
                    icon: Trash2,
                    color: 'bg-slate-700',
                    lightBg: 'bg-slate-50',
                    border: 'border-slate-200',
                    text: 'text-slate-800',
                    badge: 'bg-slate-700 text-white',
                    deskripsiSingkat: 'Fasilitas kebersihan.',
                };
        }
    };

    const catConfig = getCategoryConfig(kategori);
    const CatIcon = catConfig.icon;

    const handleFocusMap = () => {
        if (!isNaN(lat) && !isNaN(lng)) {
            setMapCenter([lat, lng]);
            setMapZoom(16);
        }
    };

    const handleOpenStreet = async () => {
        setIsSnapping(true);
        await openSmartStreetView(lat, lng);
        setIsSnapping(false);
    };

    const handleOpenMaps = () => {
        openGoogleMapsPin(lat, lng);
    };

    const handleOpenDirections = () => {
        openGoogleMapsDirections(lat, lng);
    };

    // Bersihkan nomor kontak untuk direct WA link
    const cleanPhone = kontak ? kontak.replace(/[^0-9]/g, '') : null;
    const waUrl = cleanPhone
        ? `https://wa.me/${cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone}`
        : null;

    const jenisSampahList = Array.isArray(jenis_sampah)
        ? jenis_sampah
        : typeof jenis_sampah === 'string'
        ? JSON.parse(jenis_sampah || '[]')
        : [];

    return (
        <div className="flex flex-col h-full bg-white font-sans text-left pb-12 select-none overflow-y-auto custom-scrollbar">
            {/* GOOGLE MAPS STYLE PHOTO CAROUSEL (MAKSIMAL 4 FOTO) */}
            <div className="relative w-full h-48 sm:h-52 bg-slate-950 overflow-hidden group select-none shrink-0 border-b border-slate-800">
                {photoList.length > 0 ? (
                    <>
                        {/* Gambar Fasilitas dengan Efek Transisi */}
                        <img
                            key={photoList[activePhotoIdx]}
                            src={getPhotoSrc(photoList[activePhotoIdx])}
                            alt={`${nama_tempat} - Foto ${activePhotoIdx + 1}`}
                            onClick={() => setIsLightboxOpen(true)}
                            className="w-full h-full object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
                            title="Klik untuk memperbesar foto"
                        />

                        {/* Shadow Gradient Atas & Bawah agar tombol & teks tetap kontras */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/60 pointer-events-none" />

                        {/* Arrow Navigasi Kiri */}
                        {photoList.length > 1 && (
                            <button
                                type="button"
                                onClick={handlePrevPhoto}
                                aria-label="Foto Sebelumnya"
                                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950/70 hover:bg-slate-900 text-white flex items-center justify-center transition-all shadow-md backdrop-blur-xs border border-white/20 active:scale-90 cursor-pointer z-20"
                            >
                                <ChevronLeft size={18} strokeWidth={2.5} />
                            </button>
                        )}

                        {/* Arrow Navigasi Kanan */}
                        {photoList.length > 1 && (
                            <button
                                type="button"
                                onClick={handleNextPhoto}
                                aria-label="Foto Selanjutnya"
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950/70 hover:bg-slate-900 text-white flex items-center justify-center transition-all shadow-md backdrop-blur-xs border border-white/20 active:scale-90 cursor-pointer z-20"
                            >
                                <ChevronRight size={18} strokeWidth={2.5} />
                            </button>
                        )}

                        {/* Counter Foto Google Maps Style (Contoh: "1 / 4") & Tombol Zoom */}
                        <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5">
                            <span className="text-[10px] font-bold font-mono tracking-wider bg-slate-950/80 text-white px-2 py-0.5 rounded-full border border-white/10 backdrop-blur-xs flex items-center gap-1 shadow-sm">
                                <Camera size={11} className="text-emerald-400" />
                                {activePhotoIdx + 1} / {photoList.length}
                            </span>
                            <button
                                type="button"
                                onClick={() => setIsLightboxOpen(true)}
                                title="Perbesar Foto"
                                className="w-6 h-6 rounded-full bg-slate-950/80 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-xs border border-white/10 transition-colors cursor-pointer"
                            >
                                <Maximize2 size={11} />
                            </button>
                        </div>

                        {/* Indikator Titik (Dots) Slide di Bagian Bawah */}
                        {photoList.length > 1 && (
                            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-slate-950/60 px-2 py-1 rounded-full backdrop-blur-xs border border-white/10">
                                {photoList.map((_, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActivePhotoIdx(idx);
                                        }}
                                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                                            idx === activePhotoIdx
                                                ? 'w-4 bg-emerald-400 shadow-xs'
                                                : 'w-1.5 bg-white/50 hover:bg-white/80'
                                        }`}
                                        aria-label={`Slide ke foto ${idx + 1}`}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    /* Fallback Apabila Belum Ada Foto Fasilitas Diunggah */
                    <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-slate-400 relative">
                        <div className="w-12 h-12 rounded-full bg-slate-800/90 border border-slate-700/80 flex items-center justify-center text-slate-400 mb-2 shadow-inner">
                            <Camera size={22} className="text-slate-400" />
                        </div>
                        <p className="text-xs font-semibold text-slate-200">Foto Fasilitas Belum Tersedia</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 max-w-[240px] leading-tight">
                            Unggah foto fisik tempat sampah melalui menu Manajemen Fasilitas Tempat Sampah.
                        </p>
                    </div>
                )}
            </div>

            {/* HERO BANNER INFO FASILITAS */}
            <div className="p-4 bg-slate-900 text-white flex flex-col gap-2 relative">
                <div className="flex items-center justify-between">
                    <span
                        className={`text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider flex items-center gap-1.5 ${catConfig.badge}`}
                    >
                        <CatIcon size={11} />
                        {catConfig.label}
                    </span>

                    <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                            status_operasional === 'AKTIF' || status_operasional === 'Aktif'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                    >
                        {status_operasional === 'AKTIF' || status_operasional === 'Aktif' ? (
                            <CheckCircle2 size={10} />
                        ) : (
                            <AlertTriangle size={10} />
                        )}
                        {status_operasional}
                    </span>
                </div>

                <h3 className="text-sm font-bold text-white tracking-tight leading-snug break-words mt-1">
                    {nama_tempat}
                </h3>

                <p className="text-[11px] text-slate-300 leading-relaxed flex items-start gap-1.5">
                    <MapPin size={12} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                        {alamat || 'Alamat belum diisi'}, Kec. {kecamatan}
                        {kelurahan_desa ? `, Desa/Kel. ${kelurahan_desa}` : ''}
                    </span>
                </p>

                {/* Sub-deskripsi Kategori */}
                <div className="mt-1 p-2 bg-slate-800/80 rounded border border-slate-700/60 text-[10px] text-slate-300 flex items-start gap-2">
                    <Info size={13} className="text-sky-400 shrink-0 mt-0.5" />
                    <span className="leading-tight">{catConfig.deskripsiSingkat}</span>
                </div>
            </div>

            {/* BODY KONTEN */}
            <div className="p-5 space-y-5">
                {/* 1. INFORMASI KAPASITAS PENAMPUNGAN RESMI */}
                <div className="bg-slate-50 border border-slate-200 rounded-none p-3.5 space-y-1.5">
                    <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        <Layers size={13} className="text-slate-600" />
                        Kapasitas Daya Tampung
                    </span>
                    <div className="flex items-baseline justify-between pt-1">
                        <span className="text-lg font-black text-slate-900 tracking-tight">
                            {total.toLocaleString('id-ID')}{' '}
                            <span className="text-xs font-semibold text-slate-500">{satuan_kapasitas}</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                            Daya Tampung Maksimal
                        </span>
                    </div>
                </div>

                {/* 2. SPESIFIKASI JENIS SAMPAH YANG DITERIMA (FITUR SPESIFIK USER) */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <Sparkles size={13} className={kategori === 'BANK_SAMPAH' ? 'text-teal-600' : 'text-slate-600'} />
                            {kategori === 'BANK_SAMPAH'
                                ? 'Komoditas Sampah yang Diterima (Bernilai Jual)'
                                : 'Jenis Sampah yang Dilayani'}
                        </h4>
                        <span className="text-[10px] font-mono text-slate-400">
                            {jenisSampahList.length} Jenis
                        </span>
                    </div>

                    {kategori === 'BANK_SAMPAH' && (
                        <p className="text-[10px] text-teal-800 bg-teal-50/70 p-2 border-l-2 border-teal-600 rounded-r text-left leading-relaxed">
                            💡 <strong>Catatan Warga:</strong> Bank Sampah ini hanya menerima jenis sampah tertentu yang telah terpilah mandiri dari rumah tangga dan memiliki nilai ekonomis di bawah ini.
                        </p>
                    )}

                    {jenisSampahList.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                            {jenisSampahList.map((item, idx) => (
                                <span
                                    key={idx}
                                    className={`px-2.5 py-1 text-[11px] font-medium rounded-none border flex items-center gap-1.5 ${
                                        kategori === 'BANK_SAMPAH'
                                            ? 'bg-teal-50 text-teal-900 border-teal-200 shadow-2xs'
                                            : 'bg-slate-100 text-slate-700 border-slate-200'
                                    }`}
                                >
                                    <CheckCircle2
                                        size={11}
                                        className={kategori === 'BANK_SAMPAH' ? 'text-teal-600' : 'text-slate-500'}
                                    />
                                    {item}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-slate-400 italic">
                            Belum ada rincian spesifik jenis sampah yang diinput.
                        </p>
                    )}
                </div>

                {/* 3. OPERASIONAL & MANAJEMEN */}
                <div className="space-y-2 border-t border-slate-100 pt-3">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Clock size={13} className="text-slate-600" />
                        Jadwal & Pengelola
                    </h4>

                    <div className="grid grid-cols-1 gap-2 text-xs">
                        {/* Jam Buka */}
                        <div className="p-2.5 bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                            <Clock size={13} className="text-emerald-700 mt-0.5 shrink-0" />
                            <div>
                                <span className="text-[10px] text-slate-400 block font-medium">Jam Pelayanan:</span>
                                <span className="font-semibold text-slate-800">
                                    {jam_operasional || 'Setiap Hari Kerja (08:00 - 16:00 WIB)'}
                                </span>
                            </div>
                        </div>

                        {/* Pengelola */}
                        <div className="p-2.5 bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                            <User size={13} className="text-emerald-700 mt-0.5 shrink-0" />
                            <div>
                                <span className="text-[10px] text-slate-400 block font-medium">Pengelola:</span>
                                <span className="font-semibold text-slate-800">
                                    {pengelola || 'Dinas Lingkungan Hidup Kab. Bogor'}
                                </span>
                            </div>
                        </div>

                        {/* Kontak */}
                        {kontak && (
                            <div className="p-2.5 bg-slate-50 border border-slate-100 flex items-start justify-between gap-2.5">
                                <div className="flex items-start gap-2.5">
                                    <Phone size={13} className="text-emerald-700 mt-0.5 shrink-0" />
                                    <div>
                                        <span className="text-[10px] text-slate-400 block font-medium">Kontak / Call Center:</span>
                                        <span className="font-semibold text-slate-800 font-mono">
                                            {kontak}
                                        </span>
                                    </div>
                                </div>

                                {waUrl && (
                                    <a
                                        href={waUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded border border-emerald-200 transition-colors"
                                    >
                                        Hubungi WA
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. KETERANGAN TAMBAHAN */}
                {keterangan && (
                    <div className="p-3 bg-amber-50/50 border border-amber-200/60 text-slate-700 text-xs space-y-1">
                        <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                            Catatan Khusus:
                        </span>
                        <p className="text-[11px] text-slate-600 leading-relaxed">{keterangan}</p>
                    </div>
                )}

                {/* 5. AKSI NAVIGASI & TITIK KOORDINAT */}
                <div className="border-t border-slate-100 pt-3 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono bg-slate-50 p-2 border border-slate-200">
                        <span>Koordinat:</span>
                        <span>{lat.toFixed(6)}, {lng.toFixed(6)}</span>
                    </div>

                    <div className="flex flex-col gap-2">
                        <button
                            onClick={handleFocusMap}
                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer outline-none shadow-xs"
                        >
                            <Navigation size={12} />
                            Fokus Peta Internal
                        </button>

                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={handleOpenStreet}
                                disabled={isSnapping || isNaN(lat) || isNaN(lng)}
                                className="w-full py-2 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white border border-sky-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors text-center shadow-xs cursor-pointer"
                                title="Buka Street View 360° (Otomatis mencari foto di badan jalan terdekat)"
                            >
                                {isSnapping ? (
                                    <>
                                        <Loader2 size={13} className="animate-spin" />
                                        <span>Cari Jalan...</span>
                                    </>
                                ) : (
                                    <>
                                        <Eye size={13} />
                                        <span>Google Street</span>
                                    </>
                                )}
                            </button>

                            <button
                                onClick={handleOpenMaps}
                                disabled={isNaN(lat) || isNaN(lng)}
                                className="w-full py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors text-center cursor-pointer shadow-xs"
                                title="Buka Google Maps (Dijamin 100% selalu menampilkan PIN merah di titik asli)"
                            >
                                <MapPin size={12} className="text-rose-600" />
                                <span>Peta & Pin Asli</span>
                            </button>
                        </div>

                        {/* Opsi Petunjuk Arah / Navigasi Armada */}
                        <button
                            onClick={handleOpenDirections}
                            disabled={isNaN(lat) || isNaN(lng)}
                            className="w-full py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            title="Buka petunjuk arah mengemudi armada ke titik fasilitas ini"
                        >
                            <ExternalLink size={11} className="text-slate-500" />
                            <span>Rute Navigasi Armada (Directions)</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* FULLSCREEN LIGHTBOX MODAL */}
            {isLightboxOpen && photoList.length > 0 && (
                <div
                    className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-4 animate-in fade-in duration-200 select-none"
                    onClick={() => setIsLightboxOpen(false)}
                >
                    {/* Header Lightbox */}
                    <div className="w-full max-w-4xl flex items-center justify-between text-white py-2 z-10" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                            <Camera size={16} className="text-emerald-400" />
                            <span className="text-xs font-bold">{nama_tempat}</span>
                            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono ml-2">
                                {activePhotoIdx + 1} dari {photoList.length}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsLightboxOpen(false)}
                            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Kontainer Gambar Utama & Arrow Navigasi */}
                    <div className="relative flex-1 w-full max-w-4xl flex items-center justify-center p-2" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={getPhotoSrc(photoList[activePhotoIdx])}
                            alt={`${nama_tempat} - Foto ${activePhotoIdx + 1}`}
                            className="max-h-[80vh] max-w-full object-contain rounded-lg shadow-2xl transition-all duration-300"
                        />

                        {photoList.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={handlePrevPhoto}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all border border-white/20 active:scale-95 cursor-pointer shadow-xl"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <button
                                    type="button"
                                    onClick={handleNextPhoto}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all border border-white/20 active:scale-95 cursor-pointer shadow-xl"
                                >
                                    <ChevronRight size={24} />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Footer Thumbnails Lightbox */}
                    {photoList.length > 1 && (
                        <div className="flex items-center gap-2 py-2 overflow-x-auto max-w-full z-10" onClick={(e) => e.stopPropagation()}>
                            {photoList.map((photo, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setActivePhotoIdx(idx)}
                                    className={`w-14 h-14 rounded-md overflow-hidden border-2 transition-all cursor-pointer ${
                                        idx === activePhotoIdx
                                            ? 'border-emerald-500 scale-105 shadow-lg shadow-emerald-500/20'
                                            : 'border-white/20 opacity-60 hover:opacity-100'
                                    }`}
                                >
                                    <img
                                        src={getPhotoSrc(photo)}
                                        alt={`Thumbnail ${idx + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

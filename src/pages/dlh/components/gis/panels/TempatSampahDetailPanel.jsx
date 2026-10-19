import React from 'react';
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
} from 'lucide-react';
import { useGisUIStore } from '../../../../../store/useGisUIStore';

export default function TempatSampahDetailPanel({ data }) {
    const { setMapCenter, setMapZoom } = useGisUIStore();

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
        foto_url,
    } = data;

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

    const googleMapsUrl = !isNaN(lat) && !isNaN(lng)
        ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
        : null;

    const googleStreetViewUrl = !isNaN(lat) && !isNaN(lng)
        ? `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`
        : null;

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
            {/* HERO BANNER */}
            <div className="p-5 bg-slate-900 text-white flex flex-col gap-2 relative">
                <div className="flex items-center justify-between">
                    <span
                        className={`text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider flex items-center gap-1.5 ${catConfig.badge}`}
                    >
                        <CatIcon size={11} />
                        {catConfig.label}
                    </span>

                    <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                            status_operasional === 'AKTIF'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                    >
                        {status_operasional === 'AKTIF' ? (
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
                        {alamat}, Kec. {kecamatan}
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
                            {googleStreetViewUrl && (
                                <a
                                    href={googleStreetViewUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white border border-sky-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors text-center shadow-xs"
                                    title="Buka Panorama 360° Google Street View"
                                >
                                    <Eye size={13} />
                                    Google Street
                                </a>
                            )}

                            {googleMapsUrl && (
                                <a
                                    href={googleMapsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors text-center"
                                    title="Buka Peta Standar Google Maps"
                                >
                                    <ExternalLink size={12} />
                                    Google Maps
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

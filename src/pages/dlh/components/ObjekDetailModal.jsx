import React, { useState, useEffect } from 'react';
import { X, SendHorizontal, MapPin, User, Building2, FileText, Info, Calculator, CheckCircle2, Home, Ruler, Zap, Fingerprint, CalendarDays, Loader2 } from 'lucide-react';
import api, { BASE_URL } from '../../../api/axios'; // Import instance API Anda

const ObjekDetailModal = ({ data, onClose, onSuccess }) => {
    const [volume, setVolume] = useState();
    const [numMonths, setNumMonths] = useState(1);
    const [startMonth, setStartMonth] = useState(new Date().toISOString().slice(0, 7)); // Default bulan ini
    const [totalRetribusi, setTotalRetribusi] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [kelasDetail, setKelasDetail] = useState(null);
    const [selectedPelayanan, setSelectedPelayanan] = useState([]);
    const isRumahTinggal = !!kelasDetail?.tarif_kelas;
    const hasSelectedPelayanan = selectedPelayanan.length > 0;


    const togglePelayanan = (id) => {
        setSelectedPelayanan(prev =>
            prev.includes(id)
                ? prev.filter(p => p !== id)
                : [...prev, id]
        );
    };

    const getFileUrl = (path) => {
        if (!path) return "";
        // 1. Ubah backslash \ jadi slash / (untuk Windows compatibility)
        const cleanPath = path.replace(/\\/g, '/');
        // 2. Gabungkan BASE_URL dengan path file
        return `${BASE_URL}/${cleanPath}`;
    };

    // 1. Ambil detail tarif berdasarkan id_kelas yang ada di data objek
    useEffect(() => {
        const fetchKelasDetail = async () => {
            if (!data?.id_kelas) return;
            try {
                const response = await api.get('/objek/all-kelas');
                const listKelas = response.data.data;
                const detail = listKelas.find(k => k.id_kelas === data.id_kelas);
                setKelasDetail(detail);
            } catch (error) {
                console.error("Gagal mengambil detail kelas:", error);
            }
        };
        fetchKelasDetail();
    }, [data]);

    // 2. Kalkulasi Otomatis Berdasarkan Volume & Kelas dari Database
    useEffect(() => {
        if (!kelasDetail) return;

        const volNum = hasSelectedPelayanan ? parseFloat(volume) || 0 : 0;
        const months = isRumahTinggal ? parseInt(numMonths) || 1 : 1;

        // Tarif flat hanya untuk Rumah Tinggal
        const tarifFlat = isRumahTinggal
            ? parseFloat(kelasDetail.tarif_kelas) || 0
            : 0;

        // Total pelayanan terpilih
        const totalPelayanan = (kelasDetail.pelayanan || [])
            .filter(p => selectedPelayanan.includes(p.id_pelayanan))
            .reduce((sum, p) => {
                return sum + (parseFloat(p.tarif_pelayanan) || 0) * volNum;
            }, 0);

        const totalPerBulan = tarifFlat + totalPelayanan;
        const totalAkhir = totalPerBulan * months;

        setMonthlyAmount(totalPerBulan);
        setTotalRetribusi(totalAkhir);

    }, [
        volume,
        numMonths,
        kelasDetail,
        selectedPelayanan,
        isRumahTinggal,
        hasSelectedPelayanan
    ]);


    if (!data) return null;

    // Mapping tipe untuk UI
    const isPribadi = data.kategori_objek === 'Rumah Tinggal';

    const handleTerbitkanSKRD = async () => {
        setIsSubmitting(true);
        try {
            const [year, month] = startMonth.split('-');
            const payload = {
                id_objek: data.id_objek,
                volume_sampah_objek: parseFloat(volume),
                periode_bulan: month,
                periode_tahun: year,
                masa: parseInt(numMonths)
            };

            const response = await api.post('/skrd/penetapan-skrd', payload);
            const noSkrd = response.data?.data_skrd?.no_skrd || "Tanpa Nomor";

            alert("Penetapan SKRD Berhasil! Nomor: " + noSkrd);

            // Pastikan onSuccess adalah fungsi sebelum dipanggil
            if (typeof onSuccess === 'function') {
                onSuccess();
            }

            onClose();

        } catch (error) {
            // Tampilkan error asli di console untuk debug
            console.error("Detail Error:", error);

            // Jika error berasal dari server (status 400, 500, dll)
            if (error.response) {
                alert(error.response.data?.message || "Terjadi kesalahan pada server.");
            }
            // Jika error terjadi di kodingan frontend (misal: Typo nama variabel)
            else {
                alert("Error Frontend: " + error.message);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const LabelValue = ({ label, value, icon: Icon, isUnique = false }) => (
        <div className={`py-2 border-b border-gray-50 last:border-0 group ${isUnique ? 'bg-green-50/30 -mx-2 px-2 rounded-lg' : ''}`}>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5 flex items-center gap-1.5">
                {Icon && <Icon size={10} className={isUnique ? 'text-green-600' : 'text-gray-300'} />} {label}
            </p>
            <p className={`text-xs font-bold transition-colors truncate ${isUnique ? 'text-green-700 font-mono tracking-tighter' : 'text-gray-700 group-hover:text-green-700'}`}>
                {value || '-'}
            </p>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-white w-full max-w-6xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20">

                {/* --- HEADER --- */}
                <div className="bg-gray-950 px-8 py-5 text-white flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="bg-green-600 p-2.5 rounded-xl">
                            {isPribadi ? <Home size={20} /> : <Building2 size={20} />}
                        </div>
                        <div>
                            <h3 className="text-lg font-black tracking-tight uppercase leading-none">Penetapan Tarif & SKRD</h3>
                            <div className="flex items-center gap-3 mt-1">
                                <p className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">NPOR: <span className="text-green-400 font-black">{data.npor_objek || 'BELUM TERBIT'}</span></p>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all text-gray-400"><X size={24} /></button>
                </div>

                <div className="flex flex-col lg:flex-row h-[78vh]">
                    {/* PANEL KIRI: KALKULASI */}
                    <div className="lg:w-[40%] bg-gray-50 border-r border-gray-100 p-8 overflow-y-auto">
                        <div className="space-y-5">
                            {/* Info Kelas dari DB */}
                            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Klasifikasi & Deskripsi</p>
                                <h4 className="text-sm font-black text-gray-800 leading-tight">
                                    {kelasDetail ? kelasDetail.nama_kelas : <Loader2 className="animate-spin" size={12} />}
                                </h4>
                                <p className="text-[10px] text-gray-500 italic mt-1 leading-relaxed">
                                    {kelasDetail?.deskripsi_kelas}
                                </p>

                                {/* TARIF FLAT KHUSUS RUMAH TINGGAL */}
                                {isPribadi && kelasDetail?.tarif_kelas && (
                                    <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-100 flex justify-between items-center">
                                        <span className="text-[10px] font-black text-green-700 uppercase">Tarif Tetap (Flat)</span>
                                        <span className="text-sm font-black text-green-700">
                                            Rp {Number(kelasDetail.tarif_kelas).toLocaleString()}<small className="text-[9px] font-normal">/Bln</small>
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Masa Retribusi */}
                            {isRumahTinggal && (
                                <div className="bg-white p-5 rounded-2xl border border-gray-200">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <CalendarDays size={14} className="text-blue-600" /> Masa Retribusi
                                    </label>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[9px] font-bold text-gray-400 mb-1">
                                                Bulan Mulai
                                            </p>
                                            <input
                                                type="month"
                                                value={startMonth}
                                                onChange={(e) => setStartMonth(e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs font-bold outline-none"
                                            />
                                        </div>

                                        <div>
                                            <p className="text-[9px] font-bold text-gray-400 mb-1">
                                                Durasi
                                            </p>
                                            <select
                                                value={numMonths}
                                                onChange={(e) => setNumMonths(e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs font-bold outline-none"
                                            >
                                                {[1, 2, 3, 6, 12].map(m => (
                                                    <option key={m} value={m}>
                                                        {m} Bulan
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Pilih Pelayanan */}
                            <div className="bg-white p-5 rounded-2xl border border-gray-200">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Calculator size={14} className="text-blue-600" /> Pilihan Komponen Pelayanan
                                </p>
                                <div className="bg-white p-5 rounded-2xl border border-gray-200">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Calculator size={14} className="text-blue-600" /> Pilihan Komponen Pelayanan
                                    </p>

                                    <div className="space-y-3">
                                        {kelasDetail?.pelayanan?.length > 0 ? (
                                            kelasDetail.pelayanan.map(item => (
                                                <label
                                                    key={item.id_pelayanan}
                                                    className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedPelayanan.includes(item.id_pelayanan)}
                                                        onChange={() => togglePelayanan(item.id_pelayanan)}
                                                        className="mt-1 accent-green-600"
                                                    />

                                                    <div className="flex-1">
                                                        <p className="text-[10px] font-bold text-gray-700 uppercase leading-tight">
                                                            {item.nama_pelayanan}
                                                        </p>
                                                        <p className="text-[11px] font-black text-green-700 mt-1">
                                                            Rp {Number(item.tarif_pelayanan).toLocaleString()}
                                                            <small className="text-[9px] font-normal"> / m³</small>
                                                        </p>
                                                    </div>
                                                </label>
                                            ))
                                        ) : (
                                            <p className="text-[10px] text-gray-400 italic text-center">
                                                Tidak ada komponen pelayanan
                                            </p>
                                        )}
                                    </div>
                                </div>

                            </div>

                            {/* Input Volume */}
                            {hasSelectedPelayanan && (
                                <div className="bg-white p-5 rounded-2xl border-2 border-green-100">
                                    <label className="text-[10px] font-black text-green-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Ruler size={14} /> Survey Volume Sampah (m³)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={volume}
                                            onChange={(e) => setVolume(e.target.value)}
                                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl py-3 px-4 text-xl font-black outline-none focus:border-green-600"
                                            placeholder="0.00"
                                            min="0"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-gray-300">
                                            m³
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Total Box */}
                            <div className="bg-green-700 p-6 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
                                <div className="relative z-10">
                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">Total Nilai SKRD</p>
                                    <h2 className="text-3xl font-black tracking-tighter">Rp {totalRetribusi.toLocaleString('id-ID')}</h2>
                                    <p className="text-[10px] mt-2 opacity-70 italic font-medium">Estimasi tagihan untuk {numMonths} bulan</p>
                                </div>
                                <Calculator className="absolute -right-4 -bottom-4 opacity-10" size={100} />
                            </div>
                        </div>
                    </div>

                    {/* PANEL KANAN: DETAIL DATA */}
                    <div className="lg:w-[60%] p-8 overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-6 text-left">
                                <h4 className="text-[11px] font-black text-green-700 uppercase tracking-widest border-b-2 border-green-500 w-fit pb-1 mb-4">Informasi Objek</h4>
                                <div className="space-y-1">
                                    <LabelValue label="NPOR Objek" value={data.npor_objek} icon={Fingerprint} isUnique={true} />
                                    <LabelValue label="Nama Objek" value={data.nama_objek} icon={isPribadi ? Home : Building2} />
                                    <LabelValue label="Pemilik (Subjek)" value={data.Subjek?.nama_subjek} icon={User} />
                                    <LabelValue label="Telepon" value={data.telepon_objek} />
                                </div>

                                <h4 className="text-[11px] font-black text-blue-700 uppercase tracking-widest border-b-2 border-blue-500 w-fit pb-1 mb-4 mt-8">Lokasi</h4>
                                <div className="space-y-1">
                                    <LabelValue label="Alamat Jalan" value={data.alamat_objek} icon={MapPin} />
                                    <LabelValue label="Kecamatan" value={data.kecamatan_objek} />
                                    <LabelValue label="Desa/Kelurahan" value={data.kelurahan_objek} />
                                    <LabelValue label="RT / RW" value={data.rt_rw_objek} />
                                </div>
                            </div>

                            <div className="space-y-6 text-left">
                                <h4 className="text-[11px] font-black text-orange-700 uppercase tracking-widest border-b-2 border-orange-500 w-fit pb-1 mb-4">
                                    Lampiran Survey / Dokumen
                                </h4>
                                <div className="space-y-2">
                                    {data.DokumenObjeks && data.DokumenObjeks.length > 0 ? (
                                        data.DokumenObjeks.map((doc, i) => (
                                            <div key={i} className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between group hover:border-orange-500 transition-all">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <FileText size={14} className="text-orange-500 shrink-0" />
                                                    <span className="text-[10px] font-bold text-gray-500 uppercase truncate">
                                                        {doc.file_path.split('\\').pop()}
                                                    </span>
                                                </div>
                                                <a
                                                    href={getFileUrl(doc.file_path)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[10px] font-black text-blue-600 hover:text-black bg-white px-3 py-1 rounded-lg border border-gray-100 shadow-sm"
                                                >
                                                    LIHAT
                                                </a>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center">
                                            <FileText className="mx-auto text-gray-300 mb-2" size={24} />
                                            <p className="text-[9px] font-bold text-gray-400 uppercase italic">Tidak ada lampiran dokumen</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="p-8 bg-gray-950 flex justify-end gap-4">
                    <button onClick={onClose} className="px-8 py-4 text-[10px] font-black uppercase text-gray-500 hover:text-white transition-all">Batal</button>
                    <button
                        onClick={handleTerbitkanSKRD}
                        className="py-4 px-12 rounded-2xl flex items-center gap-3 font-black
               bg-green-600 hover:bg-green-500 text-white
               transition-all active:scale-95 shadow-xl"
                    >
                        {isSubmitting ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : (
                            <SendHorizontal size={20} />
                        )}
                        <span className="uppercase tracking-[0.2em] text-[11px]">
                            Terbitkan SKRD
                        </span>
                    </button>

                </div>
            </div>
        </div>
    );
};

export default ObjekDetailModal;
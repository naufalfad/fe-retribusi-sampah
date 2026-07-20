import React, { useState, useEffect } from 'react';
import {
    X, SendHorizontal, MapPin, User, Building2, FileText,
    Calculator, Home, Ruler, CalendarDays, Loader2, Fingerprint, Award
} from 'lucide-react';
import api, { BASE_URL } from '../../../api/axios';

const ObjekDetailModal = ({ data, onClose, onSuccess }) => {
    const [volume, setVolume] = useState("");
    const [numMonths, setNumMonths] = useState(1);
    const [startMonth, setStartMonth] = useState(new Date().toISOString().slice(0, 7));
    const [totalRetribusi, setTotalRetribusi] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [kelasDetail, setKelasDetail] = useState(null);
    const [selectedPelayanan, setSelectedPelayanan] = useState([]);

    const isPribadi = data?.kategori_objek === 'Rumah Tinggal';
    const hasSelectedPelayanan = selectedPelayanan.length > 0;

    // 1. Fetch Detail Kelas & Pelayanan
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

    // 2. Kalkulasi Otomatis (Sinkron dengan logika BE)
    useEffect(() => {
        if (!kelasDetail) return;

        const volNum = parseFloat(volume) || 0;
        // Non-Pribadi dipaksa 1 bulan sesuai logika BE
        const months = isPribadi ? (parseInt(numMonths) || 1) : 1;

        const tarifFlat = isPribadi ? (parseFloat(kelasDetail.tarif_kelas) || 0) : 0;

        const totalTarifPelayananSelected = (kelasDetail.pelayanan || [])
            .filter(p => selectedPelayanan.includes(p.id_pelayanan))
            .reduce((sum, p) => sum + (parseFloat(p.tarif_pelayanan) || 0), 0);

        const totalPelayananPerBulan = totalTarifPelayananSelected * volNum;
        const totalPerBulan = tarifFlat + totalPelayananPerBulan;

        setTotalRetribusi(totalPerBulan * months);
    }, [volume, numMonths, kelasDetail, selectedPelayanan, isPribadi]);

    const togglePelayanan = (id) => {
        setSelectedPelayanan(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const getFileUrl = (path) => {
        if (!path) return "";
        const cleanPath = path.replace(/\\/g, '/');
        return `${BASE_URL}/${cleanPath}`;
    };

    const handleTerbitkanSKRD = async () => {
        // Validasi khusus Non-Rumah Tinggal (Wajib pilih pelayanan)
        if (!isPribadi && selectedPelayanan.length === 0) {
            alert("Minimal pilih 1 jenis pelayanan untuk objek Non-Rumah Tinggal");
            return;
        }

        if (totalRetribusi <= 0) {
            alert("Total retribusi Rp 0. Periksa pilihan pelayanan/volume.");
            return;
        }

        setIsSubmitting(true);
        try {
            const [year, month] = startMonth.split('-');
            const payload = {
                id_objek: data.id_objek,
                pelayanan_ids: selectedPelayanan, // INTEGRASI: Kirim array ID pelayanan
                volume_sampah_objek: parseFloat(volume) || 0,
                periode_bulan: month,
                periode_tahun: year,
                masa: isPribadi ? parseInt(numMonths) : 1 // Kirim 1 jika non-pribadi
            };

            const response = await api.post('/skrd/penetapan-skrd', payload);
            alert("Penetapan SKRD Berhasil!");
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Gagal menerbitkan SKRD");
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

    if (!data) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-white w-full max-w-6xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20">

                {/* HEADER */}
                <div className="bg-gray-950 px-8 py-5 text-white flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="bg-green-600 p-2.5 rounded-xl">
                            {isPribadi ? <Home size={20} /> : <Building2 size={20} />}
                        </div>
                        <div>
                            <h3 className="text-lg font-black tracking-tight uppercase leading-none">Penetapan SKRD</h3>
                            <p className="text-[10px] text-gray-400 font-mono mt-1 uppercase">Kategori: {data.kategori_objek}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400"><X size={24} /></button>
                </div>

                <div className="flex flex-col lg:flex-row h-[78vh]">
                    {/* PANEL KIRI: KALKULASI */}
                    <div className="lg:w-[42%] bg-gray-50 border-r border-gray-100 p-8 overflow-y-auto">
                        <div className="space-y-5">

                            {/* Klasifikasi & Tarif Tetap */}
                            <div className="bg-white p-5 rounded-2xl border border-gray-200">
                                <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Klasifikasi</p>
                                <h4 className="text-sm font-black text-gray-800">{kelasDetail?.nama_kelas || 'Loading...'}</h4>

                                {isPribadi && (
                                    <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-100 flex justify-between items-center">
                                        <span className="text-[10px] font-black text-green-700 uppercase">Tarif Tetap (Flat)</span>
                                        <span className="text-sm font-black text-green-700">Rp {Number(kelasDetail?.tarif_kelas || 0).toLocaleString()}</span>
                                    </div>
                                )}
                            </div>

                            {/* Masa Retribusi (Hanya muncul/bisa diubah jika Rumah Tinggal) */}
                            <div className="bg-white p-5 rounded-2xl border border-gray-200">
                                <p className="text-[10px] font-black text-gray-400 uppercase mb-4 flex items-center gap-2">
                                    <CalendarDays size={14} className="text-blue-600" /> Periode Tagihan
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[9px] font-bold text-gray-400 mb-1">Bulan Mulai</p>
                                        <input type="month" value={startMonth} onChange={(e) => setStartMonth(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs font-bold" />
                                    </div>
                                    {isPribadi && (
                                        <div>
                                            <p className="text-[9px] font-bold text-gray-400 mb-1">Durasi (Masa)</p>
                                            <select value={numMonths} onChange={(e) => setNumMonths(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs font-bold">
                                                {[1, 2, 3, 6, 12].map(m => <option key={m} value={m}>{m} Bulan</option>)}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Pilih Pelayanan */}
                            <div className="bg-white p-5 rounded-2xl border border-gray-200">
                                <p className="text-[10px] font-black text-gray-400 uppercase mb-4 flex items-center gap-2">
                                    <Calculator size={14} className="text-blue-600" /> Komponen Pelayanan
                                </p>
                                <div className="space-y-2">
                                    {kelasDetail?.pelayanan?.map(item => (
                                        <label key={item.id_pelayanan} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer">
                                            <input type="checkbox" checked={selectedPelayanan.includes(item.id_pelayanan)} onChange={() => togglePelayanan(item.id_pelayanan)} className="mt-1 accent-green-600" />
                                            <div className="flex-1">
                                                <p className="text-[10px] font-bold text-gray-700 uppercase">{item.nama_pelayanan}</p>
                                                <p className="text-[11px] font-black text-green-700">Rp {Number(item.tarif_pelayanan).toLocaleString()} <small className="font-normal text-gray-400">/m³</small></p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Input Volume (Muncul jika ada pelayanan dipilih) */}
                            {hasSelectedPelayanan && (
                                <div className="bg-white p-5 rounded-2xl border-2 border-green-100 animate-in fade-in zoom-in-95">
                                    <label className="text-[10px] font-black text-green-700 uppercase mb-3 flex items-center gap-2">
                                        <Ruler size={14} /> Volume Sampah per Bulan
                                    </label>
                                    <div className="relative">
                                        <input type="number" value={volume} onChange={(e) => setVolume(e.target.value)} onWheel={(e) => e.target.blur()} className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl py-3 px-4 text-xl font-black outline-none focus:border-green-600" placeholder="0.00" />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-gray-300">m³</span>
                                    </div>
                                </div>
                            )}

                            {/* Total Box */}
                            <div className={`p-6 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden transition-all ${totalRetribusi > 0 ? 'bg-green-700' : 'bg-gray-400'}`}>
                                <div className="relative z-10">
                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">Total Ketetapan (SKRD)</p>
                                    <h2 className="text-3xl font-black tracking-tighter">Rp {totalRetribusi.toLocaleString('id-ID')}</h2>
                                    <p className="text-[10px] mt-2 opacity-70  font-medium">Tagihan untuk {isPribadi ? numMonths : 1} bulan</p>
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
                                            <p className="text-[9px] font-bold text-gray-400 uppercase ">Tidak ada lampiran dokumen</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        {/* Status Kepatuhan Pilah & Saldo Poin - FITUR POIN DINONAKTIFKAN */}
                        {false && (
                            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[2rem] flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white rounded-2xl shadow-sm">
                                        <Award className="text-emerald-600" size={24} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest leading-none mb-1">Status Kepatuhan Pilah</p>
                                        <h4 className="text-lg font-black text-slate-800 uppercase ">Eco-Friendly Member</h4>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-slate-400 uppercase">Saldo Poin Aktif</p>
                                    <p className="text-2xl font-black text-emerald-700 leading-none">
                                        {data.PoinObjek?.saldo_poin || 0} <small className="text-xs">PTS</small>
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* FOOTER */}
                <div className="p-8 bg-gray-950 flex justify-end gap-4">
                    <button onClick={onClose} className="px-8 py-4 text-[10px] font-black uppercase text-gray-500 hover:text-white transition-all">Batal</button>
                    <button
                        onClick={handleTerbitkanSKRD}
                        disabled={isSubmitting || totalRetribusi <= 0}
                        className={`py-4 px-12 rounded-2xl flex items-center gap-3 font-black transition-all active:scale-95 shadow-xl
                        ${totalRetribusi > 0 ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <SendHorizontal size={20} />}
                        <span className="uppercase tracking-[0.2em] text-[11px]">Terbitkan SKRD</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ObjekDetailModal;
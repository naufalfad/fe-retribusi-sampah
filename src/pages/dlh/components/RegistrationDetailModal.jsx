import React, { useState, useEffect } from 'react';
import { X, SendHorizontal, MapPin, User, Building2, FileText, Info, Calculator, CheckCircle2, Home, Ruler, Zap, Fingerprint, CalendarDays } from 'lucide-react';

const RegistrationDetailModal = ({ data, onClose, onForward }) => {
    const [volume, setVolume] = useState(0);
    const [numMonths, setNumMonths] = useState(1); // Default 1 bulan
    const [startMonth, setStartMonth] = useState("2026-01"); // Contoh default bulan berjalan
    const [totalRetribusi, setTotalRetribusi] = useState(0);
    const [monthlyAmount, setMonthlyAmount] = useState(0);

    if (!data) return null;

    // Kalkulasi Otomatis Berdasarkan Volume & Jumlah Bulan
    useEffect(() => {
        let monthly = 0;
        const volNum = parseFloat(volume) || 0;
        const months = parseInt(numMonths) || 1;

        if (data.tipe_wp === 'PRIBADI') {
            const tarifFlat = data.tarif_flat || 0;
            const tarifInclusion = data.inclusions?.[0]?.price || 0;
            monthly = tarifFlat + (volNum * tarifInclusion);
        } else {
            const totalRatePerM3 = data.inclusions?.reduce((acc, curr) => acc + curr.price, 0) || 0;
            monthly = volNum * totalRatePerM3;
        }

        setMonthlyAmount(monthly);
        setTotalRetribusi(monthly * months);
    }, [volume, numMonths, data]);

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
            <div className="bg-white w-full max-w-6xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">

                {/* --- HEADER --- */}
                <div className="bg-gray-950 px-8 py-5 text-white flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="bg-green-600 p-2.5 rounded-xl shadow-lg">
                            {data.tipe_wp === 'PRIBADI' ? <Home size={20} /> : <Building2 size={20} />}
                        </div>
                        <div>
                            <h3 className="text-lg font-black tracking-tight uppercase leading-none">Validasi & Penetapan NPOR</h3>
                            <div className="flex items-center gap-3 mt-1">
                                <p className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">NPOR: <span className="text-green-400 font-black">{data.npor}</span></p>
                                <span className="text-gray-600 text-[10px]">•</span>
                                <p className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">NPWRD: {data.npwrd}</p>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all text-gray-400"><X size={24} /></button>
                </div>

                <div className="flex flex-col lg:flex-row h-[78vh]">

                    {/* --- PANEL KIRI: PENETAPAN TARIF & MASA (40%) --- */}
                    <div className="lg:w-[40%] bg-gray-50 border-r border-gray-100 p-8 overflow-y-auto custom-scrollbar">
                        <div className="space-y-5">

                            {/* 1. Klasifikasi Objek */}
                            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Klasifikasi Kelas</p>
                                <h4 className="text-sm font-black text-gray-800 leading-tight">{data.kelas_retribusi_label}</h4>
                                <p className="text-[9px] text-gray-500 italic mt-0.5">{data.deskripsi_kelas}</p>
                            </div>

                            {/* 2. Input Hasil Survey Volume */}
                            <div className="bg-white p-5 rounded-2xl border-2 border-green-100">
                                <label className="text-[10px] font-black text-green-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Ruler size={14} /> Survey Volume Sampah (m³)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number" value={volume} onChange={(e) => setVolume(e.target.value)}
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl py-3 px-4 text-xl font-black outline-none focus:border-green-600 transition-all"
                                        placeholder="0.00"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-gray-300">m³</span>
                                </div>
                            </div>

                            {/* 3. PEMILIHAN MASA RETRIBUSI (NEW) */}
                            <div className="bg-white p-5 rounded-2xl border border-gray-200">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <CalendarDays size={14} className="text-blue-600" /> Penetapan Masa Retribusi
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[9px] font-bold text-gray-400 mb-1">Bulan Mulai</p>
                                        <input
                                            type="month" value={startMonth} onChange={(e) => setStartMonth(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-gray-400 mb-1">Durasi (Bulan)</p>
                                        <select
                                            value={numMonths} onChange={(e) => setNumMonths(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs font-bold outline-none"
                                        >
                                            {[1, 2, 3, 4, 5, 6, 12].map(m => <option key={m} value={m}>{m} Bulan</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* 4. TOTAL KALKULASI SKRD */}
                            <div className="bg-green-700 p-6 rounded-[2.5rem] text-white shadow-xl shadow-green-900/20 relative overflow-hidden">
                                <div className="relative z-10">
                                    <div className="flex justify-between items-center mb-4 opacity-70">
                                        <p className="text-[10px] font-black uppercase tracking-widest italic">Ringkasan Ketetapan</p>
                                        <Zap size={16} />
                                    </div>

                                    <div className="space-y-1 mb-4">
                                        <div className="flex justify-between text-xs font-medium opacity-80">
                                            <span>Tarif per Bulan:</span>
                                            <span>Rp {monthlyAmount.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-xs font-medium opacity-80">
                                            <span>Masa Berlaku:</span>
                                            <span>{numMonths} Bulan</span>
                                        </div>
                                    </div>

                                    <div className="border-t border-white/20 pt-4">
                                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1 text-green-200">Total Nilai SKRD Terbit</p>
                                        <h2 className="text-3xl font-black tracking-tighter">Rp {totalRetribusi.toLocaleString('id-ID')}</h2>
                                    </div>
                                </div>
                                {/* Dekorasi */}
                                <div className="absolute -right-4 -bottom-4 opacity-10"><Calculator size={120} /></div>
                            </div>
                        </div>
                    </div>

                    {/* --- PANEL KANAN: DETAIL DATA & DOKUMEN (60%) --- */}
                    <div className="lg:w-[60%] p-8 overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-[11px] font-black text-green-700 uppercase tracking-widest border-b-2 border-green-500 w-fit pb-1 mb-4">Profil Objek NPOR</h4>
                                    <div className="space-y-1">
                                        <LabelValue label="NPOR (Unique ID)" value={data.npor} icon={Fingerprint} isUnique={true} />
                                        {data.tipe_wp === 'BADAN' ?
                                            <LabelValue label="Nama Badan / Usaha" value={data.nama_badan} icon={Building2} /> :
                                            <LabelValue label="Nama Lengkap" value={data.nama_lengkap} icon={User} />
                                        }
                                        <LabelValue label="NPWRD Pemilik" value={data.npwrd} />
                                        <LabelValue label="No. Telepon" value={data.telepon} />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-[11px] font-black text-blue-700 uppercase tracking-widest border-b-2 border-blue-500 w-fit pb-1 mb-4">Lokasi Obyek</h4>
                                    <div className="space-y-1">
                                        <LabelValue label="Alamat Jalan" value={data.alamat_objek.jalan} icon={MapPin} />
                                        <div className="grid grid-cols-2 gap-4">
                                            <LabelValue label="Kecamatan" value={data.alamat_objek.kecamatan} />
                                            <LabelValue label="RT / RW" value={data.alamat_objek.rt_rw} />
                                        </div>
                                        <LabelValue label="Kelurahan" value={data.alamat_objek.kelurahan} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-[11px] font-black text-orange-700 uppercase tracking-widest border-b-2 border-orange-500 w-fit pb-1 mb-4">Lampiran Survey</h4>
                                    <div className="space-y-2">
                                        {["Foto Objek", "Berita Acara Survey", "Dokumen IMB"].map((doc, i) => (
                                            <div key={i} className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <FileText size={14} className="text-orange-500" />
                                                    <span className="text-[10px] font-bold text-gray-500 uppercase">{doc}</span>
                                                </div>
                                                <button className="text-[10px] font-black text-blue-600">LIHAT</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-5 bg-amber-50 rounded-[2rem] border border-amber-100">
                                    <div className="flex items-center gap-2 mb-2"><Info size={14} className="text-amber-600" /><p className="text-[10px] font-black text-amber-700 uppercase">Perhatian</p></div>
                                    <p className="text-[9px] text-amber-800 leading-relaxed italic">Penetapan masa retribusi lebih dari 1 bulan akan menjumlahkan total tagihan dalam satu nomor SKRD yang sama.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- FOOTER --- */}
                <div className="p-8 bg-gray-950 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full border border-dashed border-green-500 flex items-center justify-center text-green-500"><Fingerprint size={24} /></div>
                        <div>
                            <p className="text-xs font-black text-green-500 uppercase tracking-widest mb-1 leading-none">Generasi SKRD untuk NPOR: {data.npor}</p>
                            <p className="text-[10px] text-gray-500 italic">Masa: {startMonth} (Durasi: {numMonths} Bln)</p>
                        </div>
                    </div>

                    <div className="flex gap-4 w-full md:w-auto">
                        <button onClick={onClose} className="px-8 py-4 text-[10px] font-black uppercase text-gray-500 hover:text-white transition-all">Batal</button>
                        <button
                            disabled={volume <= 0}
                            onClick={() => onForward(data.id, { volume, numMonths, startMonth, totalRetribusi })}
                            className={`flex-1 md:flex-none py-4 px-12 rounded-2xl flex items-center justify-center gap-3 font-black transition-all active:scale-95 shadow-xl ${volume > 0 ? 'bg-green-600 hover:bg-green-500 text-white shadow-green-900/40' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}
                        >
                            <SendHorizontal size={20} /><span className="uppercase tracking-[0.2em] text-[11px]">Terbitkan SKRD</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegistrationDetailModal;
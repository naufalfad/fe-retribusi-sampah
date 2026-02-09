import React, { useState } from 'react';
import {
    AlertCircle, Home, Users, CheckCircle2,
    ChevronRight, Map as MapIcon, Target,
    ArrowUpRight, BarChart3, Navigation
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PenagihWilayah = () => {
    const navigate = useNavigate();

    // Data Dummy Wilayah yang Ditugaskan ke Penagih ini
    const [assignedAreas] = useState([
        {
            id: 1,
            kelurahan: 'PAKANSARI',
            total_wr: 450,
            terbayar: 310,
            tunggakan: 140,
            target_rp: 22500000,
            realisasi_rp: 15500000,
            rw_list: ['RW 01', 'RW 02', 'RW 03', 'RW 04', 'RW 05']
        },
        {
            id: 2,
            kelurahan: 'SUKAHATI',
            total_wr: 380,
            terbayar: 120,
            tunggakan: 260,
            target_rp: 19000000,
            realisasi_rp: 6000000,
            rw_list: ['RW 01', 'RW 02', 'RW 07']
        },
    ]);

    return (
        <div className="space-y-8 pb-24 animate-in fade-in duration-500 font-sans px-2">

            {/* --- HEADER: TOTAL TERRITORY --- */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic leading-none">
                    Wilayah Tugas
                </h1>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">
                    Zona Penagihan: UPT Wilayah Cibinong
                </p>
            </div>

            {/* --- CORE METRICS --- */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900 p-6 rounded-[2rem] text-white shadow-xl shadow-slate-200 flex flex-col justify-between h-40">
                    <Target className="text-green-400" size={24} />
                    <div>
                        <p className="text-[10px] font-black uppercase opacity-60">Total Target</p>
                        <p className="text-xl font-black tracking-tighter italic">Rp 41.5 M</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between h-40">
                    <MapIcon className="text-blue-600" size={24} />
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase">Cakupan</p>
                        <p className="text-xl font-black text-slate-800 italic">{assignedAreas.length} Kelurahan</p>
                    </div>
                </div>
            </div>

            {/* --- LIST KELURAHAN (CARDS) --- */}
            <div className="space-y-6">
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] px-2">Data Per Kelurahan</h3>

                {assignedAreas.map((area) => {
                    const percentage = Math.round((area.terbayar / area.total_wr) * 100);

                    return (
                        <div key={area.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col group">
                            <div className="p-8 space-y-6">
                                {/* Row 1: Judul & Progress Badge */}
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-green-50 text-green-700 rounded-2xl">
                                            <Navigation size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black text-gray-800 uppercase tracking-tighter">{area.kelurahan}</h4>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase italic">Kecamatan Cibinong</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-green-600 uppercase mb-1">Pencapaian</p>
                                        <p className="text-2xl font-black text-slate-800 italic">{percentage}%</p>
                                    </div>
                                </div>

                                {/* Row 2: Progress Bar */}
                                <div className="space-y-2">
                                    <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-50">
                                        <div
                                            className={`h-full transition-all duration-1000 ${percentage > 50 ? 'bg-green-600' : 'bg-orange-500'}`}
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400 italic">
                                        <span>{area.terbayar} Lunas</span>
                                        <span>{area.total_wr} Total WR</span>
                                    </div>
                                </div>

                                {/* Row 3: Stats Small Grid */}
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center"><Home size={16} /></div>
                                        <div>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase">Jumlah RW</p>
                                            <p className="text-xs font-black text-slate-700">{area.rw_list.length} Area</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center"><BarChart3 size={16} /></div>
                                        <div>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase">Realisasi</p>
                                            <p className="text-xs font-black text-slate-700">Rp {area.realisasi_rp.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Row 4: Aksi - Masuk ke Rute Kelurahan */}
                            <button
                                onClick={() => navigate('/penagih/dashboard')} // Kembali ke list penagihan yang difilter
                                className="w-full bg-slate-50 p-5 flex items-center justify-center gap-3 hover:bg-green-700 hover:text-white transition-all group"
                            >
                                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Buka Rute Penagihan</span>
                                <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* --- FOOTER INFO --- */}
            <div className="bg-amber-50 border border-amber-100 p-6 rounded-[2rem] flex items-start gap-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm text-amber-600 shrink-0">
                    <AlertCircle size={24} />
                </div>
                <div>
                    <h5 className="text-[11px] font-black text-amber-800 uppercase tracking-widest mb-1 leading-none">Petunjuk Lapangan</h5>
                    <p className="text-[10px] text-amber-700 leading-relaxed font-medium italic">
                        Wilayah dengan warna progress bar <span className="text-orange-600 font-black">Orange</span> menunjukkan tingkat tunggakan tinggi. Prioritaskan penagihan pada area tersebut hari ini.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PenagihWilayah;
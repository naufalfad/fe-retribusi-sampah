import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Clock, AlertCircle, FileEdit, LogOut,
    ShieldAlert, CheckCircle2, ChevronRight, Info
} from 'lucide-react';

const StatusPendaftaranSubjek = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('subjek'));

    const status = user?.status_subjek;
    const isPending = status === 'Pending';
    const isRejected = status === 'Non-Aktif';

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
            <div className="max-w-xl w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100">

                {/* --- HEADER STATUS --- */}
                <div className={`p-10 text-center ${isPending ? 'bg-amber-500' : 'bg-red-600'} text-white relative overflow-hidden`}>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="bg-white/20 p-4 rounded-full backdrop-blur-md mb-4 shadow-xl">
                            {isPending ? <Clock size={48} className="animate-pulse" /> : <ShieldAlert size={48} />}
                        </div>
                        <h1 className="text-2xl font-black uppercase tracking-tight">
                            {isPending ? 'Pendaftaran Diproses' : 'Perlu Perbaikan Data'}
                        </h1>
                        <p className="text-sm opacity-80 font-medium mt-1 uppercase tracking-widest">
                            NPWRD: {user?.npwrd_subjek || 'ID: PENDING'}
                        </p>
                    </div>
                    {/* Background Icon Decor */}
                    <CheckCircle2 size={200} className="absolute -right-10 -bottom-10 opacity-10" />
                </div>

                {/* --- KONTEN DETAIL --- */}
                <div className="p-10 space-y-8">
                    {isPending ? (
                        <div className="space-y-4 text-center">
                            <h3 className="text-lg font-black text-slate-800 uppercase italic leading-tight">Mohon Menunggu Verifikasi Petugas</h3>
                            <p className="text-sm text-slate-500 leading-relaxed font-medium">
                                Saat ini berkas pendaftaran Anda sedang dalam tahap peninjauan oleh petugas <span className="text-slate-900 font-bold">UPT Wilayah</span> dan <span className="text-slate-900 font-bold">Dinas Lingkungan Hidup</span>.
                            </p>
                            <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100 flex gap-4 text-left">
                                <Info className="text-amber-600 shrink-0" size={20} />
                                <p className="text-[10px] text-amber-800 font-bold uppercase leading-relaxed tracking-tight italic">
                                    Proses verifikasi biasanya memakan waktu 1-3 hari kerja. Anda akan mendapatkan notifikasi jika akun sudah diaktifkan.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="text-center">
                                <h3 className="text-lg font-black text-slate-800 uppercase italic">Pendaftaran Anda Ditangguhkan</h3>
                                <p className="text-sm text-slate-500 font-medium mt-1">Ditemukan ketidaksesuaian pada data yang Anda kirimkan.</p>
                            </div>

                            {/* PESAN PENOLAKAN DARI DINAS */}
                            <div className="bg-red-50 p-8 rounded-[2.5rem] border-2 border-dashed border-red-100">
                                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2">Alasan Penolakan / Catatan Petugas:</p>
                                <p className="text-sm font-bold text-red-800 leading-relaxed italic">
                                    "{user?.catatan_dinas || 'Dokumen KTP tidak terbaca jelas atau alamat tidak sesuai dengan titik koordinat peta. Harap lampirkan ulang dokumen yang valid.'}"
                                </p>
                            </div>

                            {/* TOMBOL PERBAIKAN */}
                            <button
                                onClick={() => navigate('/signUp', { state: { editMode: true, data: user } })}
                                className="w-full bg-slate-900 hover:bg-red-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95"
                            >
                                <FileEdit size={18} /> Lakukan Perbaikan Data
                            </button>
                        </div>
                    )}

                    {/* --- ACTIONS --- */}
                    <div className="pt-6 border-t border-gray-50 flex flex-col gap-3">
                        <button
                            onClick={() => window.location.reload()}
                            className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline flex items-center justify-center gap-2"
                        >
                            Cek Status Terbaru <ChevronRight size={12} />
                        </button>
                        <button
                            onClick={handleLogout}
                            className="w-full py-4 text-slate-400 hover:text-red-500 font-black uppercase text-[10px] tracking-[0.2em] transition-colors flex items-center justify-center gap-2"
                        >
                            <LogOut size={16} /> Keluar dari Sistem
                        </button>
                    </div>
                </div>

                <div className="p-6 bg-gray-50 text-center">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest italic leading-none">
                        REKAS Digital System &copy; 2026 DLH Kabupaten Bogor
                    </p>
                </div>
            </div>
        </div>
    );
};

export default StatusPendaftaranSubjek;
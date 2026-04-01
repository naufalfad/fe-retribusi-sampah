import React, { useState, useEffect } from 'react';
import {
    History, ArrowLeft, Loader2,
    RefreshCw, Clock, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const PengangkutRiwayat = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await api.get('/logs/riwayat-pengangkut');
            if (res.data.success) {
                setHistory(res.data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
            <Loader2 className="animate-spin text-emerald-600 mb-3" size={40} />
            <p className="text-xs font-bold text-slate-400 uppercase">
                Memuat Riwayat...
            </p>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 space-y-6 pb-32 px-4">

            {/* HEADER */}
            <div className="flex items-center justify-between pt-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-3 bg-white rounded-2xl shadow-sm"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-black uppercase">
                            Log <span className="text-emerald-700">Pengangkutan</span>
                        </h1>
                        <p className="text-[10px] text-slate-400 uppercase">
                            Aktivitas Lapangan
                        </p>
                    </div>
                </div>

                <button
                    onClick={fetchHistory}
                    className="p-3 bg-white rounded-2xl shadow-sm"
                >
                    <RefreshCw size={18} />
                </button>
            </div>

            {/* LIST */}
            <div className="space-y-4">

                {history.length === 0 ? (
                    <div className="text-center py-20 opacity-30">
                        <History size={40} className="mx-auto mb-3" />
                        <p className="text-xs font-bold uppercase">
                            Belum Ada Aktivitas
                        </p>
                    </div>
                ) : history.map((log) => (
                    <div
                        key={log.id || log.id_log} // 🔥 FIX KEY ERROR
                        className="bg-white p-5 rounded-2xl shadow-sm border"
                    >
                        <div className="flex justify-between items-start">

                            {/* LEFT */}
                            <div>
                                <p className="text-[10px] text-slate-400 uppercase font-bold">
                                    {new Date(log.createdAt).toLocaleDateString('id-ID')} •{' '}
                                    {new Date(log.createdAt).toLocaleTimeString('id-ID')}
                                </p>

                                <h4 className="text-sm font-black text-slate-800 uppercase mt-1">
                                    {log.aksi}
                                </h4>

                                <p className="text-xs text-slate-500 mt-2">
                                    {log.deskripsi || '-'}
                                </p>
                            </div>

                            {/* RIGHT */}
                            <div className="text-[10px] font-bold text-emerald-600 uppercase">
                                {log.role}
                            </div>
                        </div>
                    </div>
                ))}

            </div>

            {/* FOOTER */}
            <div className="bg-white border p-5 rounded-2xl flex gap-3">
                <AlertCircle size={20} className="text-blue-500" />
                <p className="text-xs text-slate-500">
                    Riwayat ini mencatat setiap aktivitas pengangkutan yang dilakukan oleh petugas.
                </p>
            </div>

        </div>
    );
};

export default PengangkutRiwayat;
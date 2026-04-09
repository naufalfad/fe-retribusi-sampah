import React, { useState, useEffect, useCallback } from 'react';
import {
    Search, Filter, Eye, CheckCircle2, XCircle,
    Clock, FileText, MapPin, Building2, Home,
    ArrowRight, Loader2, ChevronLeft, Upload,
    AlertCircle, Info, ExternalLink, Map as MapIcon
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import api, { BASE_URL } from '../../api/axios';
import StatusBadge from '../../components/common/StatusBadge';

const DlhLayananMonitoring = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('Pending');
    const [pagination, setPagination] = useState({ total_pages: 1, current_page: 1 });

    const [selectedReq, setSelectedReq] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [catatanDinas, setCatatanDinas] = useState('');

    // --- 1. FETCH DATA ---
    const fetchRequests = useCallback(async (page = 1, search = '', status = 'Pending') => {
        setLoading(true);
        try {
            const res = await api.get('/layanan/list-all', {
                params: { page, limit: 10, search, status }
            });
            if (res.data.success) {
                setRequests(res.data.data);
                setPagination(res.data.pagination);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests(pagination.current_page, searchTerm, filterStatus);
    }, [pagination.current_page, searchTerm, filterStatus, fetchRequests]);

    // --- 2. HANDLER PROSES (APPROVE/REJECT) ---
    const handleAction = async (action) => {
        if (!catatanDinas && action === 'Ditolak') return alert("Berikan alasan penolakan!");

        setIsProcessing(true);
        try {
            await api.put(`/layanan/proses/${selectedReq.id_pengajuan}`, {
                status: action,
                catatan_dinas: catatanDinas
            });
            alert(`Pengajuan berhasil ${action}`);
            setShowDetail(false);
            fetchRequests(pagination.current_page, searchTerm, filterStatus);
        } catch (err) {
            alert("Gagal memproses pengajuan");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-8 pb-24 animate-in fade-in duration-500 font-sans text-left">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic leading-none">
                        Monitoring <span className="text-blue-600">Layanan</span> Mandiri
                    </h1>
                    <p className="text-slate-500 font-medium text-sm mt-2 uppercase tracking-widest leading-none">
                        Validasi Perubahan Data & Penonaktifan Objek
                    </p>
                </div>
            </div>

            {/* TOOLBAR */}
            <div className="bg-white p-4 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                    <input
                        type="text"
                        placeholder="Cari No. Pengajuan atau Nama Objek..."
                        className="w-full pl-14 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 font-bold text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                    {['Pending', 'Disetujui', 'Ditolak'].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilterStatus(s)}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === s ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-950 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-800">
                            <tr>
                                <th className="p-8">No. Pengajuan</th>
                                <th className="p-8">Wajib Retribusi</th>
                                <th className="p-8">Jenis Layanan</th>
                                <th className="p-8">Tgl Masuk</th>
                                <th className="p-8 text-center">Tindakan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan="5" className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" /></td></tr>
                            ) : requests.map((req) => (
                                <tr key={req.id_pengajuan} className="hover:bg-blue-50/30 transition-all group">
                                    <td className="p-8 font-mono text-xs font-bold text-slate-500 italic">#{req.id_pengajuan}</td>
                                    <td className="p-8">
                                        <h4 className="font-black text-slate-800 text-sm uppercase leading-tight">{req.data_lama?.nama_objek}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Pemilik: {req.Subjek?.nama_subjek}</p>
                                    </td>
                                    <td className="p-8">
                                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${req.jenis_pengajuan === 'Perubahan Data' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                            {req.jenis_pengajuan}
                                        </span>
                                    </td>
                                    <td className="p-8 text-xs font-bold text-slate-400 uppercase">
                                        {new Date(req.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="p-8 text-center">
                                        <button
                                            onClick={() => { setSelectedReq(req); setShowDetail(true); }}
                                            className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-blue-600 transition-all shadow-lg active:scale-90"
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- MODAL DETAIL: COMPARISON VIEW --- */}
            {showDetail && selectedReq && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-6xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">

                        {/* Modal Header */}
                        <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-2xl ${selectedReq.jenis_pengajuan === 'Perubahan Data' ? 'bg-emerald-600' : 'bg-red-600'}`}>
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h3 className="font-black uppercase tracking-widest text-sm leading-none italic">Audit Comparison Workspace</h3>
                                    <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase">Pengajuan ID: #{selectedReq.id_pengajuan}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowDetail(false)} className="p-2 hover:bg-white/10 rounded-full text-slate-500"><X size={28} /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-10 bg-gray-50/50">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                                {/* KOLOM KIRI & TENGAH: DATA LAMA VS BARU */}
                                <div className="lg:col-span-8 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                                        {/* Panah Indikator Perubahan di Tengah */}
                                        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-white p-2 rounded-full border border-slate-200 shadow-md">
                                            <ArrowRight size={20} className="text-blue-600" />
                                        </div>

                                        {/* DATA LAMA */}
                                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">Kondisi Saat Ini (Database)</h4>
                                            <CompareField label="Nama Objek" value={selectedReq.data_lama.nama_objek} />
                                            <CompareField label="Alamat" value={selectedReq.data_lama.alamat_objek} />
                                            <CompareField label="Kelurahan" value={selectedReq.data_lama.kelurahan_objek} />
                                            <CompareField label="Kategori" value={selectedReq.data_lama.kategori_objek} />
                                            <CompareField label="Telepon" value={selectedReq.data_lama.telepon_objek} />
                                        </div>

                                        {/* DATA BARU (Jika Perubahan Data) */}
                                        <div className="bg-blue-50/50 p-8 rounded-[2.5rem] border-2 border-blue-100 shadow-inner space-y-4">
                                            <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest border-b border-blue-100 pb-2">Permintaan Perubahan (User)</h4>
                                            {selectedReq.jenis_pengajuan === 'Perubahan Data' ? (
                                                <>
                                                    <CompareField label="Nama Objek" value={selectedReq.data_baru.nama_objek} isNew />
                                                    <CompareField label="Alamat" value={selectedReq.data_baru.alamat_objek} isNew />
                                                    <CompareField label="Kelurahan" value={selectedReq.data_baru.kelurahan_objek} isNew />
                                                    <CompareField label="Kategori" value={selectedReq.data_baru.kategori_objek} isNew />
                                                    <CompareField label="Telepon" value={selectedReq.data_baru.telepon_objek} isNew />
                                                </>
                                            ) : (
                                                <div className="h-full flex flex-col items-center justify-center text-center py-10">
                                                    <AlertCircle size={48} className="text-red-500 mb-4" />
                                                    <p className="text-sm font-black text-red-700 uppercase italic">Objek Akan Dinonaktifkan Secara Permanen</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* ALASAN & JUSTIFIKASI */}
                                    <div className="bg-amber-50 p-8 rounded-[2.5rem] border border-amber-100">
                                        <h4 className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <Info size={14} /> Alasan Pengajuan Wajib Retribusi
                                        </h4>
                                        <p className="text-sm font-bold text-amber-900 leading-relaxed italic">"{selectedReq.alasan}"</p>
                                    </div>
                                </div>

                                {/* KOLOM KANAN: MAP & DOKUMEN (4 COLS) */}
                                <div className="lg:col-span-4 space-y-6">
                                    {/* Map Comparison (Titik Baru) */}
                                    {selectedReq.jenis_pengajuan === 'Perubahan Data' && (
                                        <div className="bg-white p-4 rounded-[2.5rem] border border-slate-100 shadow-sm">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2 flex items-center gap-2">
                                                <MapIcon size={14} /> Lokasi Baru
                                            </h4>
                                            <div className="h-48 w-full rounded-2xl overflow-hidden border-2 border-slate-50 z-0">
                                                <MapContainer
                                                    center={[parseFloat(selectedReq.data_baru.latitude), parseFloat(selectedReq.data_baru.longitude)]}
                                                    zoom={15}
                                                    style={{ height: '100%', width: '100%' }}
                                                >
                                                    <TileLayer url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" />
                                                    <Marker position={[parseFloat(selectedReq.data_baru.latitude), parseFloat(selectedReq.data_baru.longitude)]} />
                                                </MapContainer>
                                            </div>
                                        </div>
                                    )}

                                    {/* Lampiran Dokumen */}
                                    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2 flex items-center gap-2">
                                            <Upload size={14} /> Berkas Pendukung
                                        </h4>
                                        {selectedReq.file_pendukung ? (
                                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                                                <div className="flex items-center gap-3">
                                                    <FileText size={20} className="text-blue-500" />
                                                    <span className="text-[10px] font-black text-slate-500 uppercase truncate max-w-[100px]">Dokumen_Sah.pdf</span>
                                                </div>
                                                <button
                                                    onClick={() => window.open(`${BASE_URL}/${selectedReq.file_pendukung}`, '_blank')}
                                                    className="p-2 bg-white rounded-lg shadow-sm text-blue-600 hover:bg-blue-600 hover:text-white transition-all"
                                                >
                                                    <ExternalLink size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <p className="text-[10px] text-slate-400 italic">Tidak ada lampiran.</p>
                                        )}
                                    </div>

                                    {/* INPUT TINDAKAN DINAS */}
                                    {selectedReq.status === 'Pending' && (
                                        <div className="space-y-4 pt-4 border-t border-slate-100">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Tanggapan/Catatan Dinas</label>
                                            <textarea
                                                className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl outline-none focus:border-blue-600 text-xs font-bold"
                                                placeholder="Berikan instruksi atau alasan jika ditolak..."
                                                rows="3"
                                                onChange={(e) => setCatatanDinas(e.target.value)}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* FOOTER MODAL: ACTIONS */}
                        <div className="p-8 border-t bg-gray-50 flex gap-4 px-10">
                            {selectedReq.status === 'Pending' ? (
                                <>
                                    <button
                                        disabled={isProcessing}
                                        onClick={() => handleAction('Ditolak')}
                                        className="flex-1 py-5 bg-white border-2 border-red-100 text-red-600 rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                                    >
                                        <XCircle size={18} /> Tolak Pengajuan
                                    </button>
                                    <button
                                        disabled={isProcessing}
                                        onClick={() => handleAction('Disetujui')}
                                        className="flex-[2] py-5 bg-green-700 text-white rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95"
                                    >
                                        {isProcessing ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={18} />}
                                        Setujui & Perbarui Data
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => setShowDetail(false)} className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black uppercase text-xs tracking-widest">Tutup Pratinjau</button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Internal Helper for fields
const CompareField = ({ label, value, isNew = false }) => (
    <div className="py-2 border-b border-gray-50 last:border-0">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className={`text-xs font-black uppercase tracking-tight ${isNew ? 'text-blue-700 italic' : 'text-slate-800'}`}>
            {value || '-'}
        </p>
    </div>
);

const X = ({ size, className }) => <XCircle size={size} className={className} />;

export default DlhLayananMonitoring;
import { useState, useEffect } from 'react';
import {
    Printer, Download, Calendar,
    MapPin, Users, BarChart3
} from 'lucide-react';
import api from '../../api/axios';

const DlhReporting = () => {
    const [reportType, setReportType] = useState('bulanan');
    const [reportData, setReportData] = useState([]);
    const [summary, setSummary] = useState({ realisasi: 0, wajib_retribusi: 0, kepatuhan: '0%' });
    const [loading, setLoading] = useState(false);

    const fetchSummary = async () => {
        try {
            const res = await api.get('/report/summary-report');
            if (res.data.success) setSummary(res.data.data);
        } catch (err) { console.error(err); }
    };

    const fetchReportData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/report/detail-report', {
                params: { type: reportType, year: '2026' }
            });
            if (res.data.success) setReportData(res.data.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchSummary();
        fetchReportData();
    }, [reportType]);

    return (
        <div className="space-y-8 pb-24 animate-in fade-in duration-500 font-sans">

            {/* --- 1. HEADER & GLOBAL ACTIONS --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none italic">
                        Reporting <span className="text-green-700">Dinas</span>
                    </h1>
                    <p className="text-gray-500 font-medium text-sm mt-1 uppercase tracking-widest italic leading-none">
                        Pusat Data & Analisis Retribusi REKAS
                    </p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border-2 border-slate-100 p-3 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:bg-slate-900 hover:text-white transition-all">
                        <Printer size={16} /> Cetak Laporan
                    </button>
                    {/* <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-700 text-white p-3 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-green-900/20">
                        <Download size={16} /> Export Excel
                    </button> */}
                </div>
            </div>

            {/* --- KPI CARDS (Dinamis) --- */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card label="Realisasi Tahun Ini" val={`Rp ${summary.realisasi.toLocaleString()}`} color="text-green-700" />
                <Card label="WR Aktif" val={summary.wajib_retribusi} color="text-blue-700" />
                <Card label="Kepatuhan" val={summary.kepatuhan} color="text-purple-700" />
                <Card label="Target PAD" val="Rp 120.5 M" color="text-slate-700" />
            </div>

            {/* --- 3. CETAK LAPORAN (FILTER CONTROLS) --- */}
            <div className="bg-slate-900 p-8 rounded-[3rem] shadow-2xl shadow-slate-900/20 text-white">
                <div className="flex flex-col lg:flex-row gap-8 items-end">

                    {/* Pemilihan Jenis Laporan */}
                    <div className="flex-1 space-y-3 w-full">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Pilih Jenis Laporan</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {[
                                { id: 'tahunan', label: 'Tahunan', icon: BarChart3 },
                                { id: 'bulanan', label: 'Bulanan', icon: Calendar },
                                { id: 'wilayah', label: 'Wilayah', icon: MapPin },
                                { id: 'wr_aktif', label: 'WR Aktif', icon: Users },
                            ].map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => setReportType(type.id)}
                                    className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${reportType === type.id ? 'border-green-500 bg-green-500/10 text-green-400' : 'border-white/5 bg-white/5 text-slate-400 opacity-60'}`}
                                >
                                    <type.icon size={20} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">{type.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Parameter Tambahan */}
                    <div className="flex-[1.5] w-full grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tahun Pajak</label>
                            <select className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-green-500 font-bold text-xs uppercase text-white appearance-none">
                                <option className="bg-slate-900">2026</option>
                                <option className="bg-slate-900">2025</option>
                            </select>
                        </div>
                        {reportType !== 'tahunan' && reportType !== 'wr_aktif' && (
                            <div className="space-y-1.5 animate-in fade-in zoom-in-95">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Masa/Bulan</label>
                                <select className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-green-500 font-bold text-xs uppercase text-white appearance-none">
                                    <option className="bg-slate-900">Januari</option>
                                    <option className="bg-slate-900">Februari</option>
                                </select>
                            </div>
                        )}
                        {reportType === 'wilayah' && (
                            <div className="space-y-1.5 animate-in fade-in zoom-in-95">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kecamatan / UPT</label>
                                <select className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-green-500 font-bold text-xs uppercase text-white appearance-none">
                                    <option className="bg-slate-900">Cibinong</option>
                                    <option className="bg-slate-900">Ciawi</option>
                                </select>
                            </div>
                        )}
                        <div className="flex items-end">
                            <button onClick={fetchReportData} className="bg-green-600 px-8 py-3 rounded-xl font-bold">
                                Generate
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- DATA TABLE (Dinamis) --- */}
            <div className="bg-white rounded-[3rem] overflow-hidden border border-gray-100">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-[9px] font-black uppercase tracking-widest">
                        <tr>
                            <th>Periode</th>
                            <th>No. SKRD</th>
                            <th>Kategori</th>
                            <th>Nominal (Rp)</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="text-center py-10">Memproses Data...</td></tr>
                        ) : reportData.map((item) => (
                            <tr key={item.id_skrd} className="text-xs font-bold border-b border-gray-50">
                                <td className="p-6">{new Date(item.createdAt).toLocaleDateString()}</td>
                                <td className="p-6">{item.no_skrd}</td>
                                <td className="p-6">
                                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-[8px]">
                                        {item.Objek?.Subjek?.kategori_subjek || 'N/A'}
                                    </span>
                                </td>
                                <td className="p-6 font-black text-slate-800">
                                    Rp {Number(item.total_bayar).toLocaleString()}
                                </td>
                                <td className="p-6 text-green-600">SINKRON BJB</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const Card = ({ label, val, color }) => (
    <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
        <h3 className={`text-2xl font-black italic tracking-tighter ${color}`}>{val}</h3>
    </div>
);

export default DlhReporting;
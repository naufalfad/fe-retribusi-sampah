import { useState, useEffect } from 'react';
import {
    Printer, Download, Calendar,
    MapPin, Users, BarChart3
} from 'lucide-react';
import api from '../../api/axios';

const DlhReporting = () => {
    const [reportType, setReportType] = useState('bulanan');
    const [reportData, setReportData] = useState([]);
    const [summary, setSummary] = useState({ realisasi: 0, kepatuhan: '0%' });
    const [loading, setLoading] = useState(false);

    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
    const [selectedKecamatan, setSelectedKecamatan] = useState('');
    const [kecamatanList, setKecamatanList] = useState([]);

    const daftarBulan = [
        { val: '1', label: 'Januari' }, { val: '2', label: 'Februari' },
        { val: '3', label: 'Maret' }, { val: '4', label: 'April' },
        { val: '5', label: 'Mei' }, { val: '6', label: 'Juni' },
        { val: '7', label: 'Juli' }, { val: '8', label: 'Agustus' },
        { val: '9', label: 'September' }, { val: '10', label: 'Oktober' },
        { val: '11', label: 'November' }, { val: '12', label: 'Desember' }
    ];

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
                params: {
                    type: reportType,
                    year: selectedYear,
                    month: selectedMonth,
                    kecamatan: selectedKecamatan
                }
            });
            if (res.data.success) setReportData(res.data.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const fetchKecamatan = async () => {
        try {
            const res = await api.get('/wilayah/kecamatan/1.1');
            if (res.data.success) {
                setKecamatanList(res.data.data);
            }
        } catch (err) {
            console.error('Gagal ambil kecamatan:', err);
        }
    };

    useEffect(() => {
        fetchSummary();
        fetchReportData();
        fetchKecamatan();
    }, [reportType]);

    const handleDownloadPdf = async () => {
        try {

            const response = await api.get('/report/cetak-penerimaan', {
                params: {
                    type: reportType,
                    year: selectedYear,
                    month: selectedMonth
                },
                responseType: 'blob'
            });

            const file = new Blob([response.data], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            window.open(fileURL, '_blank');
        } catch (err) {
            console.error(err);
            alert("Gagal mengunduh laporan");
        }
    };

    return (
        <div className="space-y-8 pb-24 animate-in fade-in duration-500 font-sans">

            {/* --- 1. HEADER & GLOBAL ACTIONS --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none ">
                        Reporting <span className="text-green-700">Dinas</span>
                    </h1>
                    <p className="text-gray-500 font-medium text-sm mt-1 uppercase tracking-widest leading-none">
                        Pusat Data & Analisis Retribusi REKAS
                    </p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border-2 border-slate-100 p-3 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:bg-slate-900 hover:text-white transition-all">
                        <Printer size={16} /> Cetak Laporan
                    </button>
                    <button onClick={handleDownloadPdf} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-700 text-white p-3 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-green-900/20">
                        <Download size={16} /> Export Excel
                    </button>
                </div>
            </div>

            {/* --- KPI CARDS (Dinamis) --- */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card label="Realisasi Tahun Ini" val={`Rp ${summary.realisasi.toLocaleString()}`} color="text-green-700" />
                <Card label="Kepatuhan" val={summary.kepatuhan} color="text-purple-700" />
                <Card label="Target PAD" val="Rp 120.5 M" color="text-slate-700" />
            </div>

            {/* --- 3. CETAK LAPORAN (FILTER CONTROLS) --- */}
            <div className="bg-slate-900 p-8 rounded-[3rem] shadow-2xl shadow-slate-900/20 text-white">
                <div className="flex flex-col lg:flex-row gap-8 items-end">

                    {/* Pemilihan Jenis Laporan */}
                    <div className="flex-1 space-y-3 w-full">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Pilih Jenis Laporan</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {[
                                { id: 'tahunan', label: 'Tahunan', icon: BarChart3 },
                                { id: 'bulanan', label: 'Bulanan', icon: Calendar },
                                { id: 'wilayah', label: 'Wilayah', icon: MapPin },
                            ].map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => setReportType(type.id)}
                                    className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${reportType === type.id ? 'border-green-500 bg-green-500/10 text-green-400' : 'border-white/5 bg-white/5 text-slate-400 opacity-60'}`}
                                >
                                    <type.icon size={20} />
                                    <span className="text-[9px] font-black uppercase">{type.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Parameter Dinamis */}
                    <div className="flex-[1.5] w-full grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Pilih Tahun */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tahun</label>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold text-white outline-none focus:border-green-500 appearance-none"
                            >
                                <option className="bg-slate-900" value="2026">2026</option>
                                <option className="bg-slate-900" value="2025">2025</option>
                            </select>
                        </div>

                        {/* Pilih Bulan (Hanya muncul jika bulanan/wilayah) */}
                        {['bulanan', 'wilayah'].includes(reportType) && (
                            <div className="space-y-1.5 animate-in fade-in">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Masa/Bulan</label>
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold text-white outline-none focus:border-green-500 appearance-none"
                                >
                                    {daftarBulan.map(b => (
                                        <option key={b.val} className="bg-slate-900" value={b.val}>{b.label}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Pilih Wilayah (Hanya muncul jika tipe wilayah) */}
                        {reportType === 'wilayah' && (
                            <div className="space-y-1.5 animate-in fade-in">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kecamatan</label>
                                <select
                                    value={selectedKecamatan}
                                    onChange={(e) => setSelectedKecamatan(e.target.value)}
                                    className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold text-white outline-none focus:border-green-500 appearance-none"
                                >
                                    <option className="bg-slate-900" value="">Semua Kecamatan</option>

                                    {kecamatanList.map((kec) => (
                                        <option
                                            key={kec.id_kecamatan}
                                            className="bg-slate-900"
                                            value={kec.name}
                                        >
                                            {kec.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Tombol Generate */}
                        <div className="flex items-end">
                            <button
                                onClick={fetchReportData}
                                className="w-full bg-green-600 hover:bg-green-500 text-white p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-green-600/20"
                            >
                                Generate Report
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- DATA TABLE (Dinamis) --- */}
            <div className="bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-sm">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">Periode</th>
                            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">No. SKRD</th>
                            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">Kategori</th>
                            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500 text-right">Nominal (Rp)</th>
                            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                        <span className="text-sm font-medium text-gray-400">Memproses Data...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : reportData.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-gray-400 text-sm">Tidak ada data tersedia</td>
                            </tr>
                        ) : (
                            reportData.map((item) => (
                                <tr
                                    key={item.id_skrd}
                                    className="hover:bg-blue-50/30 transition-colors duration-200 group"
                                >
                                    <td className="px-6 py-5">
                                        <div className="text-xs font-semibold text-gray-600">
                                            {new Date(item.createdAt).toLocaleDateString('id-ID', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                                            {item.no_skrd}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="inline-flex items-center bg-blue-50 text-blue-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-blue-100 uppercase">
                                            {item.Objek?.Subjek?.kategori_subjek || 'Umum'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="text-sm font-black text-slate-800">
                                            {Number(item.Ssrd?.amount_paid || 0).toLocaleString('id-ID')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-3 py-1.5 rounded-full border border-emerald-100 uppercase">
                                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse "></span>
                                            {item.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
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
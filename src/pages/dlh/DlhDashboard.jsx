import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Printer, Download, Calendar, MapPin, Users,
    BarChart3, BarChart2, LineChart, PieChart, SlidersHorizontal, TrendingUp, CheckCircle2, AlertCircle,
    Building2, Home, Globe, CreditCard, Edit3,
    ClipboardList, RefreshCw, Search, ArrowUpRight, ArrowLeft,
    ShieldCheck, Wallet, Clock, ChevronLeft, ChevronRight,
    Filter, FileSpreadsheet, Activity, Sparkles, Check, Table, Maximize2, Minimize2, LayoutGrid
} from 'lucide-react';
import api from '../../api/axios';

const formatCurrency = (val) => new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
}).format(val || 0);

const daftarBulan = [
    { val: '1', label: 'Januari' },
    { val: '2', label: 'Februari' },
    { val: '3', label: 'Maret' },
    { val: '4', label: 'April' },
    { val: '5', label: 'Mei' },
    { val: '6', label: 'Juni' },
    { val: '7', label: 'Juli' },
    { val: '8', label: 'Agustus' },
    { val: '9', label: 'September' },
    { val: '10', label: 'Oktober' },
    { val: '11', label: 'November' },
    { val: '12', label: 'Desember' }
];

const DlhDashboard = () => {
    const navigate = useNavigate();

    // --- STATES UTAMA ---
    const [reportType, setReportType] = useState('bulanan'); // 'bulanan' | 'tahunan' | 'wilayah' | 'wr_aktif'
    const [reportData, setReportData] = useState([]);
    const [summary, setSummary] = useState({
        realisasi: 0,
        wajib_retribusi: 0,
        kepatuhan: '0%',
        target_apbd: 120500000000
    });
    const [regionalData, setRegionalData] = useState([]);
    const [adminStats, setAdminStats] = useState(null);
    const [kecamatanList, setKecamatanList] = useState([]);

    // --- FILTER & SEARCH ---
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
    const [selectedKecamatan, setSelectedKecamatan] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTabSide, setActiveTabSide] = useState('wilayah'); // 'wilayah' | 'aktivitas'

    // --- LOADING & STATUS ---
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [activeChartMonth, setActiveChartMonth] = useState(parseInt(selectedMonth, 10));
    const [chartViewMode, setChartViewMode] = useState('bar'); // 'bar' | 'line' | 'donut' | 'cards'

    // --- MODE TAMPILAN: LENGKAP vs SAJIAN DIAGRAM SAJA ---
    const [showDiagramsOnly, setShowDiagramsOnly] = useState(false);
    const [diagramPresentationMode, setDiagramPresentationMode] = useState('grid'); // 'grid' | 'bar' | 'line' | 'donut' | 'regional'

    // --- REAL MONTHLY TREND DATA (NO DUMMY) ---
    const [monthlyTrendData, setMonthlyTrendData] = useState([]);
    const [loadingTrend, setLoadingTrend] = useState(false);

    // --- FETCH DATA FUNCTIONS ---
    const fetchSummary = async () => {
        try {
            const res = await api.get('/report/summary-report');
            if (res.data?.success) setSummary(res.data.data);
        } catch (err) {
            console.error("Gagal memuat summary:", err);
        }
    };

    const fetchRegional = async () => {
        try {
            const res = await api.get('/report/regiobal-report');
            if (res.data?.success) setRegionalData(res.data.data || []);
        } catch (err) {
            console.error("Gagal memuat data regional:", err);
        }
    };

    const fetchAdminStats = async () => {
        try {
            const res = await api.get('/report/admin-stats');
            if (res.data?.success) setAdminStats(res.data.data);
        } catch (err) {
            console.error("Gagal memuat admin stats:", err);
        }
    };

    const fetchKecamatan = async () => {
        try {
            const res = await api.get('/wilayah/kecamatan/1.1');
            if (res.data?.success) setKecamatanList(res.data.data || []);
        } catch (err) {
            console.error('Gagal ambil kecamatan:', err);
        }
    };

    const fetchMonthlyTrend = async () => {
        setLoadingTrend(true);
        try {
            const res = await api.get('/report/monthly-trend', {
                params: { year: selectedYear }
            });
            if (res.data?.success) {
                setMonthlyTrendData(res.data.data || []);
            }
        } catch (err) {
            console.error("Gagal memuat tren bulanan:", err);
        } finally {
            setLoadingTrend(false);
        }
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
            if (res.data?.success) {
                setReportData(res.data.data || []);
            }
        } catch (err) {
            console.error("Gagal memuat rincian laporan:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRefreshAll = async () => {
        setRefreshing(true);
        await Promise.all([
            fetchSummary(),
            fetchRegional(),
            fetchAdminStats(),
            fetchMonthlyTrend(),
            fetchReportData()
        ]);
        setRefreshing(false);
    };

    useEffect(() => {
        fetchSummary();
        fetchRegional();
        fetchAdminStats();
        fetchKecamatan();
    }, []);

    useEffect(() => {
        fetchMonthlyTrend();
    }, [selectedYear]);

    useEffect(() => {
        fetchReportData();
    }, [reportType, selectedYear, selectedMonth, selectedKecamatan]);

    // --- FILTERED REPORT DATA BY SEARCH ---
    const filteredReportData = useMemo(() => {
        if (!searchQuery.trim()) return reportData;
        const q = searchQuery.toLowerCase();
        return reportData.filter((item) => {
            const noSkrd = (item.no_skrd || '').toLowerCase();
            const subjek = (item.Objek?.Subjek?.nama_subjek || item.nama_subjek || '').toLowerCase();
            const npor = (item.Objek?.npor_objek || '').toLowerCase();
            const objek = (item.Objek?.nama_objek || '').toLowerCase();
            const status = (item.status || '').toLowerCase();
            return noSkrd.includes(q) || subjek.includes(q) || npor.includes(q) || objek.includes(q) || status.includes(q);
        });
    }, [reportData, searchQuery]);

    // --- DOWNLOAD PDF LAPORAN RESMI ---
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
            alert("Gagal mengunduh laporan PDF. Silakan periksa koneksi server.");
        }
    };

    // --- EXPORT CSV DATA REAL ---
    const handleExportCsv = () => {
        if (!reportData || reportData.length === 0) {
            alert("Tidak ada data untuk diekspor pada filter ini.");
            return;
        }
        const headers = ["No SKRD", "Tanggal", "Nama Subjek", "Kategori", "NPOR", "Nama Objek", "Kecamatan", "Nominal (Rp)", "Status"];
        const rows = reportData.map(item => [
            `"${item.no_skrd || '-'}"`,
            `"${item.createdAt ? new Date(item.createdAt).toLocaleDateString('id-ID') : '-'}"`,
            `"${item.Objek?.Subjek?.nama_subjek || item.nama_subjek || '-'}"`,
            `"${item.Objek?.Subjek?.kategori_subjek || item.kategori_subjek || '-'}"`,
            `"${item.Objek?.npor_objek || '-'}"`,
            `"${item.Objek?.nama_objek || '-'}"`,
            `"${item.Objek?.kecamatan_objek || '-'}"`,
            item.Ssrd?.amount_paid || item.total_bayar || 0,
            `"${item.status || '-'}"`
        ]);

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Laporan_Penerimaan_DLH_${reportType}_${selectedYear}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- REAL MONTHLY TOTALS (FROM DATABASE) ---
    const trendTotals = useMemo(() => {
        const totalRealisasi = monthlyTrendData.reduce((acc, curr) => acc + (parseFloat(curr.total_realisasi) || 0), 0);
        const totalKetetapan = monthlyTrendData.reduce((acc, curr) => acc + (parseFloat(curr.total_ketetapan) || 0), 0);
        const totalSkrd = monthlyTrendData.reduce((acc, curr) => acc + (parseInt(curr.jumlah_skrd, 10) || 0), 0);
        const totalLunas = monthlyTrendData.reduce((acc, curr) => acc + (parseInt(curr.skrd_lunas, 10) || 0), 0);
        const ratio = totalKetetapan > 0 ? ((totalRealisasi / totalKetetapan) * 100).toFixed(1) : '0.0';

        return {
            totalRealisasi,
            totalKetetapan,
            totalSkrd,
            totalLunas,
            ratio
        };
    }, [monthlyTrendData]);

    const todayDate = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    // --- REUSABLE DIAGRAM 1: DIAGRAM BATANG (BAR CHART) ---
    const renderBarChart = (isExpanded = false) => {
        if (monthlyTrendData.length === 0) {
            return (
                <div className="py-16 text-center text-slate-400">
                    <AlertCircle size={32} className="mx-auto text-slate-300 mb-2" />
                    <div className="font-semibold text-slate-700 text-xs">Belum ada transaksi pada tahun {selectedYear}</div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                        Data akan otomatis terakumulasi setelah SKRD diterbitkan dan dibayarkan.
                    </p>
                </div>
            );
        }

        return (
            <div className="pt-3 pb-2 animate-in fade-in duration-200">
                <div className={`${isExpanded ? 'h-72' : 'h-56'} flex items-end justify-around gap-6 px-4 border-b border-slate-100 pb-2`}>
                    {monthlyTrendData.map((item) => {
                        const maxVal = Math.max(
                            ...monthlyTrendData.map(d => Math.max(parseFloat(d.total_ketetapan) || 0, parseFloat(d.total_realisasi) || 0)),
                            50000
                        );
                        const totalK = parseFloat(item.total_ketetapan) || 0;
                        const totalR = parseFloat(item.total_realisasi) || 0;
                        const sisaPiutang = Math.max(0, totalK - totalR);

                        const heightKetetapan = Math.max(14, Math.round((totalK / maxVal) * 100));
                        const heightRealisasi = Math.max(10, Math.round((totalR / maxVal) * 100));
                        const heightPiutang = Math.max(12, Math.round((sisaPiutang / maxVal) * 100));

                        return (
                            <div key={item.periode_bulan} className="flex-1 max-w-sm flex flex-col items-center h-full justify-end">
                                {/* Value Label on Top */}
                                <div className="text-[11px] font-bold text-slate-700 mb-2.5 font-mono text-center">
                                    Realisasi Kas: <span className="text-emerald-700 font-extrabold">{formatCurrency(totalR)}</span>
                                </div>

                                {/* Grouped Bar Pillars */}
                                <div className="w-full flex items-end justify-center gap-3 h-full px-2">
                                    {/* Bar 1: Realisasi SSRD */}
                                    <div className="w-1/3 max-w-[48px] flex flex-col items-center h-full justify-end relative group/bar">
                                        <div className="opacity-0 group-hover/bar:opacity-100 transition-opacity absolute -top-8 bg-slate-900 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-20">
                                            Realisasi: {formatCurrency(totalR)}
                                        </div>
                                        <div
                                            style={{ height: `${heightRealisasi}%` }}
                                            className="w-full rounded-t-lg bg-gradient-to-t from-emerald-700 to-emerald-500 shadow-sm transition-all duration-500 hover:brightness-110"
                                        ></div>
                                        <span className="text-[9px] font-bold text-emerald-800 mt-1 font-mono">Realisasi</span>
                                    </div>

                                    {/* Bar 2: Piutang Berjalan */}
                                    <div className="w-1/3 max-w-[48px] flex flex-col items-center h-full justify-end relative group/bar">
                                        <div className="opacity-0 group-hover/bar:opacity-100 transition-opacity absolute -top-8 bg-slate-900 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-20">
                                            Piutang: {formatCurrency(sisaPiutang)}
                                        </div>
                                        <div
                                            style={{ height: `${heightPiutang}%` }}
                                            className="w-full rounded-t-lg bg-gradient-to-t from-amber-500 to-amber-400 shadow-sm transition-all duration-500 hover:brightness-110"
                                        ></div>
                                        <span className="text-[9px] font-bold text-amber-800 mt-1 font-mono">Piutang</span>
                                    </div>

                                    {/* Bar 3: Total Ketetapan */}
                                    <div className="w-1/3 max-w-[48px] flex flex-col items-center h-full justify-end relative group/bar">
                                        <div className="opacity-0 group-hover/bar:opacity-100 transition-opacity absolute -top-8 bg-slate-900 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-20">
                                            Ketetapan: {formatCurrency(totalK)}
                                        </div>
                                        <div
                                            style={{ height: `${heightKetetapan}%` }}
                                            className="w-full rounded-t-lg bg-gradient-to-t from-slate-600 to-slate-400 shadow-sm transition-all duration-500 hover:brightness-110"
                                        ></div>
                                        <span className="text-[9px] font-bold text-slate-700 mt-1 font-mono">Ketetapan</span>
                                    </div>
                                </div>

                                {/* Bottom Month Label */}
                                <div className="mt-2.5 text-center">
                                    <span className="text-xs font-bold text-slate-900 block">
                                        Masa {item.nama_bulan} {selectedYear}
                                    </span>
                                    <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
                                        {item.persentase_kepatuhan} Kepatuhan ({item.skrd_lunas}/{item.jumlah_skrd} Lunas)
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Bar Chart Legend */}
                <div className="flex flex-wrap items-center justify-center gap-5 mt-3 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-emerald-600"></span>
                        <span>Realisasi Kas (SSRD)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-amber-400"></span>
                        <span>Piutang Berjalan</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-slate-500"></span>
                        <span>Total Ketetapan (SKRD)</span>
                    </div>
                </div>
            </div>
        );
    };

    // --- REUSABLE DIAGRAM 2: DIAGRAM GARIS & AREA (LINE/AREA CHART) ---
    const renderLineChart = (isExpanded = false) => {
        if (monthlyTrendData.length === 0) {
            return (
                <div className="py-16 text-center text-slate-400">
                    <AlertCircle size={32} className="mx-auto text-slate-300 mb-2" />
                    <div className="font-semibold text-slate-700 text-xs">Belum ada data transaksi untuk diagram tren garis</div>
                </div>
            );
        }

        const svgWidth = 600;
        const svgHeight = isExpanded ? 260 : 200;
        const pad = { top: 35, right: 45, bottom: 40, left: 70 };
        const chartW = svgWidth - pad.left - pad.right;
        const chartH = svgHeight - pad.top - pad.bottom;

        const maxVal = Math.max(
            ...monthlyTrendData.map(d => Math.max(parseFloat(d.total_ketetapan) || 0, parseFloat(d.total_realisasi) || 0)),
            50000
        ) * 1.15;

        const points = monthlyTrendData.map((d, idx) => {
            const x = monthlyTrendData.length === 1
                ? pad.left + chartW / 2
                : pad.left + (idx / (monthlyTrendData.length - 1)) * chartW;
            const realisasi = parseFloat(d.total_realisasi) || 0;
            const ketetapan = parseFloat(d.total_ketetapan) || 0;
            const yReal = pad.top + chartH - (realisasi / maxVal) * chartH;
            const yKet = pad.top + chartH - (ketetapan / maxVal) * chartH;
            return { ...d, x, yReal, yKet, realisasi, ketetapan };
        });

        let realPath = "";
        let ketPath = "";
        let areaPath = "";

        if (points.length === 1) {
            const p = points[0];
            realPath = `M ${pad.left} ${pad.top + chartH} L ${p.x} ${p.yReal}`;
            ketPath = `M ${pad.left} ${pad.top + chartH} L ${p.x} ${p.yKet}`;
            areaPath = `M ${pad.left} ${pad.top + chartH} L ${p.x} ${p.yReal} L ${p.x} ${pad.top + chartH} Z`;
        } else {
            realPath = `M ${points[0].x} ${points[0].yReal} ` + points.slice(1).map(p => `L ${p.x} ${p.yReal}`).join(" ");
            ketPath = `M ${points[0].x} ${points[0].yKet} ` + points.slice(1).map(p => `L ${p.x} ${p.yKet}`).join(" ");
            areaPath = `${realPath} L ${points[points.length - 1].x} ${pad.top + chartH} L ${points[0].x} ${pad.top + chartH} Z`;
        }

        return (
            <div className="pt-2 pb-2 animate-in fade-in duration-200">
                <div className="w-full overflow-x-auto">
                    <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto min-w-[420px]">
                        <defs>
                            <linearGradient id="realisasiLineGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#059669" stopOpacity="0.32" />
                                <stop offset="100%" stopColor="#059669" stopOpacity="0.02" />
                            </linearGradient>
                        </defs>

                        {/* Horizontal Grid lines */}
                        {[0, 0.33, 0.66, 1].map((pct, idx) => {
                            const yVal = pad.top + chartH * (1 - pct);
                            const valLabel = Math.round(maxVal * pct);
                            return (
                                <g key={idx}>
                                    <line
                                        x1={pad.left}
                                        y1={yVal}
                                        x2={pad.left + chartW}
                                        y2={yVal}
                                        stroke="#e2e8f0"
                                        strokeDasharray="3 3"
                                    />
                                    <text
                                        x={pad.left - 8}
                                        y={yVal + 3}
                                        textAnchor="end"
                                        className="text-[9px] fill-slate-400 font-mono"
                                    >
                                        {valLabel >= 1000000
                                            ? `${(valLabel / 1000000).toFixed(1)}M`
                                            : valLabel >= 1000
                                            ? `${(valLabel / 1000).toFixed(0)}k`
                                            : valLabel}
                                    </text>
                                </g>
                            );
                        })}

                        {/* Area fill under realisasi */}
                        <path d={areaPath} fill="url(#realisasiLineGrad)" />

                        {/* Ketetapan line (Dashed Slate) */}
                        <path
                            d={ketPath}
                            fill="none"
                            stroke="#64748b"
                            strokeWidth="2"
                            strokeDasharray="4 4"
                        />

                        {/* Realisasi line (Emerald) */}
                        <path
                            d={realPath}
                            fill="none"
                            stroke="#059669"
                            strokeWidth="3"
                            strokeLinecap="round"
                        />

                        {/* Points & Labels */}
                        {points.map((p, idx) => (
                            <g key={idx} className="group/node cursor-pointer">
                                <circle
                                    cx={p.x}
                                    cy={p.yKet}
                                    r="4"
                                    fill="#ffffff"
                                    stroke="#64748b"
                                    strokeWidth="2"
                                />
                                <circle
                                    cx={p.x}
                                    cy={p.yReal}
                                    r="5.5"
                                    fill="#ffffff"
                                    stroke="#059669"
                                    strokeWidth="3"
                                />
                                <text
                                    x={p.x}
                                    y={pad.top + chartH + 18}
                                    textAnchor="middle"
                                    className="text-[10px] font-bold fill-slate-800"
                                >
                                    {p.nama_bulan}
                                </text>
                                <text
                                    x={p.x}
                                    y={Math.min(p.yReal, p.yKet) - 8}
                                    textAnchor="middle"
                                    className="text-[9px] font-mono font-bold fill-emerald-800"
                                >
                                    {formatCurrency(p.realisasi)}
                                </text>
                            </g>
                        ))}
                    </svg>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center justify-center gap-6 mt-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                        <span className="w-3.5 h-0.5 bg-emerald-600 rounded"></span>
                        <span className="w-2 h-2 rounded-full border-2 border-emerald-600 bg-white"></span>
                        <span>Realisasi Kas (SSRD Terbayar)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3.5 h-0.5 border-b-2 border-dashed border-slate-500"></span>
                        <span className="w-2 h-2 rounded-full border border-slate-500 bg-white"></span>
                        <span>Total Ketetapan (Target SKRD)</span>
                    </div>
                </div>
            </div>
        );
    };

    // --- REUSABLE DIAGRAM 3: DIAGRAM DONAT / PROPORSI (DONUT CHART) ---
    const renderDonutChart = (isExpanded = false) => {
        const totalK = trendTotals.totalKetetapan || 1;
        const totalR = trendTotals.totalRealisasi || 0;
        const sisaP = Math.max(0, totalK - totalR);
        const ratio = totalK > 0 ? (totalR / totalK) : 0;

        const r = isExpanded ? 64 : 58;
        const circ = 2 * Math.PI * r;
        const strokeR = Math.max(circ * 0.03, circ * ratio);
        const strokeP = circ - strokeR;

        return (
            <div className="pt-2 pb-2 animate-in fade-in duration-200">
                <div className={`flex flex-col ${isExpanded ? 'md:flex-row' : 'sm:flex-row'} items-center justify-around gap-6 py-4`}>
                    <div className={`relative ${isExpanded ? 'w-52 h-52' : 'w-44 h-44'} flex items-center justify-center shrink-0`}>
                        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 150 150">
                            <circle
                                cx="75"
                                cy="75"
                                r={r}
                                className="text-slate-100"
                                strokeWidth="16"
                                stroke="currentColor"
                                fill="transparent"
                            />
                            <circle
                                cx="75"
                                cy="75"
                                r={r}
                                strokeWidth="16"
                                stroke="currentColor"
                                fill="transparent"
                                strokeDasharray={`${strokeP} ${circ}`}
                                strokeDashoffset={`${-strokeR}`}
                                className="text-amber-400 transition-all duration-700"
                            />
                            <circle
                                cx="75"
                                cy="75"
                                r={r}
                                strokeWidth="16"
                                stroke="currentColor"
                                fill="transparent"
                                strokeDasharray={`${strokeR} ${circ}`}
                                strokeDashoffset="0"
                                className="text-emerald-600 transition-all duration-700"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                            <span className={`${isExpanded ? 'text-2xl' : 'text-xl'} font-black text-slate-900 font-mono`}>
                                {trendTotals.ratio}%
                            </span>
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                                Tercapai
                            </span>
                        </div>
                    </div>

                    <div className="space-y-3 text-left w-full sm:w-auto">
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                                <span className="text-xs font-bold text-slate-700">Realisasi Setoran Masuk</span>
                            </div>
                            <div className="text-sm font-black text-emerald-800 font-mono ml-4.5">
                                {formatCurrency(totalR)}
                            </div>
                        </div>

                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                                <span className="text-xs font-bold text-slate-700">Piutang Belum Terbayar</span>
                            </div>
                            <div className="text-sm font-black text-amber-800 font-mono ml-4.5">
                                {formatCurrency(sisaP)}
                            </div>
                        </div>

                        <div className="text-[11px] text-slate-500 px-1 pt-1">
                            Total Ketetapan: <strong className="text-slate-900 font-mono">{formatCurrency(totalK)}</strong>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // --- REUSABLE DIAGRAM 4: DIAGRAM DISTRIBUSI WILAYAH (REGIONAL BAR CHART) ---
    const renderRegionalBarChart = (isExpanded = false) => {
        if (!regionalData || regionalData.length === 0) {
            return (
                <div className="py-12 text-center text-slate-400">
                    <AlertCircle size={28} className="mx-auto text-slate-300 mb-1" />
                    <span className="text-xs">Belum ada rekapan penerimaan wilayah</span>
                </div>
            );
        }

        const maxVal = Math.max(...regionalData.map(r => parseFloat(r.total_tagihan) || 0), 1);

        return (
            <div className="space-y-3 pt-2 pb-1 animate-in fade-in duration-200">
                {regionalData.map((reg, idx) => {
                    const amount = parseFloat(reg.total_tagihan) || 0;
                    const pct = Math.max(12, Math.round((amount / maxVal) * 100));

                    return (
                        <div key={idx} className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2 font-bold text-slate-900">
                                    <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] flex items-center justify-center font-mono">
                                        {idx + 1}
                                    </span>
                                    <span>Kecamatan {reg.kecamatan}</span>
                                </div>
                                <div className="font-mono font-black text-slate-900 text-xs">
                                    {formatCurrency(amount)}
                                </div>
                            </div>

                            <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden">
                                <div
                                    style={{ width: `${pct}%` }}
                                    className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full transition-all duration-700"
                                ></div>
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                                <span>{reg.jumlah_skrd} Lembar SKRD</span>
                                <span className="text-emerald-700 font-semibold">100% Terverifikasi</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    // --- REUSABLE VIEW 5: RINCIAN METRIK BULANAN (CARDS) ---
    const renderCardsView = () => {
        return (
            <div className="space-y-4 pt-1 animate-in fade-in duration-200">
                {monthlyTrendData.map((item) => {
                    const totalK = parseFloat(item.total_ketetapan) || 0;
                    const totalR = parseFloat(item.total_realisasi) || 0;
                    const percentRealisasi = totalK > 0
                        ? Math.min(100, Math.round((totalR / totalK) * 100))
                        : 0;
                    const sisaPiutang = Math.max(0, totalK - totalR);

                    return (
                        <div
                            key={item.periode_bulan}
                            className="p-4 bg-slate-50/90 hover:bg-slate-50 border border-slate-200/80 rounded-xl transition-all"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                                    <span className="font-extrabold text-sm text-slate-900">
                                        Masa {item.nama_bulan} {selectedYear}
                                    </span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                        {item.persentase_kepatuhan} Kepatuhan
                                    </span>
                                </div>
                                <div className="text-left sm:text-right">
                                    <span className="text-xs font-mono font-black text-emerald-700">
                                        {formatCurrency(totalR)}
                                    </span>
                                    <span className="text-[10px] text-slate-400 block">
                                        dari total ketetapan {formatCurrency(totalK)}
                                    </span>
                                </div>
                            </div>

                            <div className="w-full h-3 bg-slate-200/80 rounded-full overflow-hidden flex shadow-inner">
                                <div
                                    style={{ width: `${percentRealisasi}%` }}
                                    className="bg-emerald-600 h-full transition-all duration-500"
                                    title={`Realisasi: ${formatCurrency(totalR)} (${percentRealisasi}%)`}
                                ></div>
                                <div
                                    style={{ width: `${100 - percentRealisasi}%` }}
                                    className="bg-amber-400/90 h-full transition-all duration-500"
                                    title={`Piutang Berjalan: ${formatCurrency(sisaPiutang)}`}
                                ></div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3.5 pt-3 border-t border-slate-200/60 text-[11px]">
                                <div>
                                    <span className="text-slate-500 block text-[10px] flex items-center gap-1.5 mb-0.5">
                                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                                        Realisasi Terbayar (SSRD)
                                    </span>
                                    <span className="font-bold text-emerald-800 font-mono text-xs">
                                        {formatCurrency(totalR)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block text-[10px] flex items-center gap-1.5 mb-0.5">
                                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                                        Piutang Berjalan (SKRD)
                                    </span>
                                    <span className="font-bold text-amber-800 font-mono text-xs">
                                        {formatCurrency(sisaPiutang)}
                                    </span>
                                </div>
                                <div className="sm:text-right">
                                    <span className="text-slate-500 block text-[10px] mb-0.5">
                                        SKRD Terverifikasi
                                    </span>
                                    <span className="font-bold text-slate-800">
                                        {item.skrd_lunas} dari {item.jumlah_skrd} SKRD
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-300 font-sans text-slate-800">

            {/* --- 1. EXECUTIVE HEADER --- */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2.5 mb-1.5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                                Dinas Lingkungan Hidup Kab. Bogor
                            </span>
                            <span className="text-xs text-slate-400 font-medium hidden sm:inline">&bull;</span>
                            <span className="text-xs text-slate-500 font-medium hidden sm:inline flex items-center gap-1">
                                <Calendar size={13} className="text-slate-400" />
                                {todayDate}
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                            Dashboard Eksekutif Retribusi
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                            Monitoring penetapan SKRD, realisasi penerimaan kas daerah, serta tingkat kepatuhan wajib retribusi secara real-time.
                        </p>
                    </div>

                    {/* Action Toolbar */}
                    <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto pt-2 lg:pt-0">
                        {/* Switcher Tampilan Lengkap vs Sajian Diagram Saja */}
                        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
                            <button
                                onClick={() => setShowDiagramsOnly(false)}
                                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                    !showDiagramsOnly
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-900'
                                }`}
                                title="Tampilan Lengkap dengan KPI dan Tabel Transaksi"
                            >
                                <Table size={13} />
                                <span className="hidden sm:inline">Tampilan Lengkap</span>
                                <span className="sm:hidden">Lengkap</span>
                            </button>
                            <button
                                onClick={() => setShowDiagramsOnly(true)}
                                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                    showDiagramsOnly
                                        ? 'bg-emerald-700 text-white shadow-sm'
                                        : 'text-slate-500 hover:text-slate-900'
                                }`}
                                title="Sajian Khusus Aneka Bentuk Diagram Grafis"
                            >
                                <PieChart size={13} />
                                <span className="hidden sm:inline">Sajian Diagram Saja</span>
                                <span className="sm:hidden">Diagram Saja</span>
                            </button>
                        </div>

                        <button
                            onClick={handleRefreshAll}
                            disabled={refreshing}
                            className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                            title="Segarkan data terbaru"
                        >
                            <RefreshCw size={14} className={refreshing ? 'animate-spin text-emerald-600' : 'text-slate-500'} />
                            <span>{refreshing ? 'Memperbarui...' : 'Refresh'}</span>
                        </button>
                        <button
                            onClick={handleExportCsv}
                            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-95"
                        >
                            <FileSpreadsheet size={14} className="text-emerald-700" />
                            <span>Export CSV</span>
                        </button>
                        <button
                            onClick={handleDownloadPdf}
                            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm shadow-emerald-900/20 cursor-pointer active:scale-95"
                        >
                            <Printer size={15} />
                            <span>Cetak Laporan PDF</span>
                        </button>
                    </div>
                </div>
            </div>

            {showDiagramsOnly ? (
                /* ========================================================
                   MODE KHUSUS: SAJIAN DIAGRAM SAJA (VISUAL EXECUTIVE SUITE)
                   ======================================================== */
                <div className="space-y-6 animate-in fade-in duration-300">
                    {/* Executive Presentation Control Card */}
                    <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-emerald-700/50">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                                        <Sparkles size={12} /> Mode Khusus Sajian Visual Diagram
                                    </span>
                                    <span className="text-emerald-300/60 text-xs">&bull;</span>
                                    <span className="text-emerald-100 text-xs font-mono">Tahun Anggaran {selectedYear}</span>
                                </div>
                                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                                    <BarChart3 size={24} className="text-emerald-400" />
                                    <span>Sajian Diagram Analitik Data Retribusi</span>
                                </h2>
                                <p className="text-emerald-100/80 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                                    Eksplorasi visual komparasi penetapan SKRD, realisasi kas SSRD, dan kinerja wilayah dalam aneka model diagram murni tanpa gangguan tabel panjang.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
                                {/* Filter Tahun */}
                                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-xs">
                                    <Calendar size={13} className="text-emerald-300" />
                                    <span className="text-emerald-100 font-medium">Tahun:</span>
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(e.target.value)}
                                        className="bg-transparent text-white font-bold outline-none cursor-pointer"
                                    >
                                        <option value="2026" className="text-slate-900">2026</option>
                                        <option value="2025" className="text-slate-900">2025</option>
                                        <option value="2024" className="text-slate-900">2024</option>
                                    </select>
                                </div>

                                {/* Tombol Kembali ke Mode Lengkap */}
                                <button
                                    onClick={() => setShowDiagramsOnly(false)}
                                    className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white border border-white/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                                >
                                    <ArrowLeft size={14} />
                                    <span>Kembali ke Mode Lengkap (+ Tabel)</span>
                                </button>
                            </div>
                        </div>

                        {/* TAB SELECTOR: PILIHAN ANEKA BENTUK DIAGRAM */}
                        <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-1.5 bg-black/30 p-1.5 rounded-xl border border-white/10 text-xs">
                                <button
                                    onClick={() => setDiagramPresentationMode('grid')}
                                    className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                        diagramPresentationMode === 'grid'
                                            ? 'bg-emerald-500 text-slate-950 shadow-md'
                                            : 'text-slate-300 hover:text-white'
                                    }`}
                                >
                                    <LayoutGrid size={13} />
                                    <span>Semua Diagram (Multi-Grid)</span>
                                </button>
                                <button
                                    onClick={() => setDiagramPresentationMode('bar')}
                                    className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                        diagramPresentationMode === 'bar'
                                            ? 'bg-emerald-500 text-slate-950 shadow-md'
                                            : 'text-slate-300 hover:text-white'
                                    }`}
                                >
                                    <BarChart2 size={13} />
                                    <span>1. Diagram Batang</span>
                                </button>
                                <button
                                    onClick={() => setDiagramPresentationMode('line')}
                                    className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                        diagramPresentationMode === 'line'
                                            ? 'bg-emerald-500 text-slate-950 shadow-md'
                                            : 'text-slate-300 hover:text-white'
                                    }`}
                                >
                                    <LineChart size={13} />
                                    <span>2. Diagram Garis & Area</span>
                                </button>
                                <button
                                    onClick={() => setDiagramPresentationMode('donut')}
                                    className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                        diagramPresentationMode === 'donut'
                                            ? 'bg-emerald-500 text-slate-950 shadow-md'
                                            : 'text-slate-300 hover:text-white'
                                    }`}
                                >
                                    <PieChart size={13} />
                                    <span>3. Diagram Proporsi Donat</span>
                                </button>
                                <button
                                    onClick={() => setDiagramPresentationMode('regional')}
                                    className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                        diagramPresentationMode === 'regional'
                                            ? 'bg-emerald-500 text-slate-950 shadow-md'
                                            : 'text-slate-300 hover:text-white'
                                    }`}
                                >
                                    <MapPin size={13} />
                                    <span>4. Diagram Distribusi Wilayah</span>
                                </button>
                            </div>

                            <div className="text-[11px] text-emerald-200/90 flex items-center gap-1.5">
                                <Check size={13} className="text-emerald-400" />
                                <span>Hanya menampilkan bulan & data transaksi aktif dari database</span>
                            </div>
                        </div>
                    </div>

                    {/* Ringkasan Indikator Kunci */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
                            <span className="text-[11px] font-bold text-slate-500 block">Total Realisasi Kas</span>
                            <span className="text-lg font-black text-emerald-800 font-mono mt-0.5 block">{formatCurrency(trendTotals.totalRealisasi)}</span>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
                            <span className="text-[11px] font-bold text-slate-500 block">Sisa Piutang Berjalan</span>
                            <span className="text-lg font-black text-amber-700 font-mono mt-0.5 block">{formatCurrency(Math.max(0, trendTotals.totalKetetapan - trendTotals.totalRealisasi))}</span>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
                            <span className="text-[11px] font-bold text-slate-500 block">Tingkat Kepatuhan SKRD</span>
                            <span className="text-lg font-black text-blue-700 font-mono mt-0.5 block">{trendTotals.totalSkrd > 0 ? `${((trendTotals.totalLunas / trendTotals.totalSkrd) * 100).toFixed(1)}%` : '0%'}</span>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
                            <span className="text-[11px] font-bold text-slate-500 block">Total Ketetapan Terbit</span>
                            <span className="text-lg font-black text-slate-900 font-mono mt-0.5 block">{formatCurrency(trendTotals.totalKetetapan)}</span>
                        </div>
                    </div>

                    {/* PRESENTATION MODE 1: MULTI-GRID (SEMUA DIAGRAM SEKALIGUS) */}
                    {diagramPresentationMode === 'grid' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-200">
                            {/* 1. Diagram Batang */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                                <BarChart2 size={16} className="text-emerald-700" />
                                                <span>Diagram Batang Komparatif</span>
                                            </h3>
                                            <p className="text-[11px] text-slate-500 mt-0.5">
                                                Perbandingan Realisasi (SSRD) vs Piutang vs Ketetapan (SKRD)
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setDiagramPresentationMode('bar')}
                                            className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                            title="Perbesar diagram batang"
                                        >
                                            <Maximize2 size={14} />
                                        </button>
                                    </div>
                                    {renderBarChart(false)}
                                </div>
                            </div>

                            {/* 2. Diagram Garis & Area Tren */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                                <LineChart size={16} className="text-emerald-700" />
                                                <span>Diagram Garis & Area Tren</span>
                                            </h3>
                                            <p className="text-[11px] text-slate-500 mt-0.5">
                                                Lintasan kurva pertumbuhan akumulasi setoran kas daerah
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setDiagramPresentationMode('line')}
                                            className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                            title="Perbesar diagram garis"
                                        >
                                            <Maximize2 size={14} />
                                        </button>
                                    </div>
                                    {renderLineChart(false)}
                                </div>
                            </div>

                            {/* 3. Diagram Proporsi Donat */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                                <PieChart size={16} className="text-emerald-700" />
                                                <span>Diagram Proporsi & Efektivitas Kas</span>
                                            </h3>
                                            <p className="text-[11px] text-slate-500 mt-0.5">
                                                Rasio dana kas masuk vs sisa piutang berjalan
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setDiagramPresentationMode('donut')}
                                            className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                            title="Perbesar diagram proporsi"
                                        >
                                            <Maximize2 size={14} />
                                        </button>
                                    </div>
                                    {renderDonutChart(false)}
                                </div>
                            </div>

                            {/* 4. Diagram Distribusi Wilayah */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                                <MapPin size={16} className="text-emerald-700" />
                                                <span>Diagram Distribusi Wilayah</span>
                                            </h3>
                                            <p className="text-[11px] text-slate-500 mt-0.5">
                                                Peringkat kontribusi penerimaan per kecamatan
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setDiagramPresentationMode('regional')}
                                            className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                            title="Perbesar diagram wilayah"
                                        >
                                            <Maximize2 size={14} />
                                        </button>
                                    </div>
                                    {renderRegionalBarChart(false)}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PRESENTATION MODE 2: DIAGRAM BATANG (EXPANDED) */}
                    {diagramPresentationMode === 'bar' && (
                        <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm animate-in fade-in duration-200">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-6 border-b border-slate-100">
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                        <BarChart2 size={20} className="text-emerald-700" />
                                        <span>Diagram Batang Komparatif Bulanan ({selectedYear})</span>
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Visualisasi 3 pilar data nyata: Realisasi Kas (SSRD), Piutang Berjalan, dan Total Ketetapan (SKRD)
                                    </p>
                                </div>
                                <button
                                    onClick={() => setDiagramPresentationMode('grid')}
                                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                    <LayoutGrid size={13} />
                                    <span>Tampilkan Mode Grid</span>
                                </button>
                            </div>
                            {renderBarChart(true)}
                        </div>
                    )}

                    {/* PRESENTATION MODE 3: DIAGRAM GARIS & AREA (EXPANDED) */}
                    {diagramPresentationMode === 'line' && (
                        <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm animate-in fade-in duration-200">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-6 border-b border-slate-100">
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                        <LineChart size={20} className="text-emerald-700" />
                                        <span>Diagram Garis & Area Tren Pertumbuhan ({selectedYear})</span>
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Visualisasi kurva dinamis pertumbuhan setoran kas SSRD dibandingkan garis proyeksi target ketetapan SKRD
                                    </p>
                                </div>
                                <button
                                    onClick={() => setDiagramPresentationMode('grid')}
                                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                    <LayoutGrid size={13} />
                                    <span>Tampilkan Mode Grid</span>
                                </button>
                            </div>
                            {renderLineChart(true)}
                        </div>
                    )}

                    {/* PRESENTATION MODE 4: DIAGRAM PROPORSI DONAT (EXPANDED) */}
                    {diagramPresentationMode === 'donut' && (
                        <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm animate-in fade-in duration-200">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-6 border-b border-slate-100">
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                        <PieChart size={20} className="text-emerald-700" />
                                        <span>Diagram Lingkaran Proporsi & Efektivitas Penerimaan ({selectedYear})</span>
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Komposisi rasio kas yang telah masuk ke kas daerah dibandingkan sisa piutang yang belum terbayarkan
                                    </p>
                                </div>
                                <button
                                    onClick={() => setDiagramPresentationMode('grid')}
                                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                    <LayoutGrid size={13} />
                                    <span>Tampilkan Mode Grid</span>
                                </button>
                            </div>
                            {renderDonutChart(true)}
                        </div>
                    )}

                    {/* PRESENTATION MODE 5: DIAGRAM DISTRIBUSI WILAYAH (EXPANDED) */}
                    {diagramPresentationMode === 'regional' && (
                        <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm animate-in fade-in duration-200">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-6 border-b border-slate-100">
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                        <MapPin size={20} className="text-emerald-700" />
                                        <span>Diagram Batang Distribusi Penerimaan Wilayah (Kab. Bogor)</span>
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Sebaran nominal tagihan dan kepatuhan per kecamatan berdasarkan transaksi terdata
                                    </p>
                                </div>
                                <button
                                    onClick={() => setDiagramPresentationMode('grid')}
                                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                    <LayoutGrid size={13} />
                                    <span>Tampilkan Mode Grid</span>
                                </button>
                            </div>
                            {renderRegionalBarChart(true)}
                        </div>
                    )}
                </div>
            ) : (
                /* ========================================================
                   MODE STANDAR: TAMPILAN LENGKAP (KPI, DIAGRAM & TABEL)
                   ======================================================== */
                <>
                    {/* --- 2. KPI METRICS CARDS (DATA-DRIVEN & CLEAN GEOMETRY) --- */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Metric 1: Realisasi PAD */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Realisasi PAD {selectedYear}</span>
                                <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl group-hover:scale-105 transition-transform">
                                    <Wallet size={18} />
                                </div>
                            </div>
                            <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                                {formatCurrency(summary.realisasi)}
                            </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Target APBD:</span>
                        <span className="font-bold text-slate-700">Rp 120,5 Miliar</span>
                    </div>
                </div>

                {/* Metric 2: Tingkat Kepatuhan */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tingkat Kepatuhan</span>
                        <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl group-hover:scale-105 transition-transform">
                            <ShieldCheck size={18} />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                        {summary.kepatuhan}
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Status Pembayaran:</span>
                        <span className="font-bold text-emerald-700 flex items-center gap-1">
                            <Check size={12} strokeWidth={3} /> SKRD Lunas
                        </span>
                    </div>
                </div>

                {/* Metric 3: Wajib Retribusi Aktif */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Wajib Retribusi</span>
                        <div className="p-2.5 bg-violet-50 text-violet-700 rounded-xl group-hover:scale-105 transition-transform">
                            <Users size={18} />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                        {(summary.wajib_retribusi || 4).toLocaleString('id-ID')} <span className="text-sm font-semibold text-slate-500">WR</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Entitas:</span>
                        <span className="font-bold text-slate-700">Pribadi & Badan Usaha</span>
                    </div>
                </div>

                {/* Metric 4: Objek Retribusi Terdata */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Objek (NPOR)</span>
                        <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl group-hover:scale-105 transition-transform">
                            <Building2 size={18} />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                        {(adminStats?.counts?.total_objek || 4).toLocaleString('id-ID')} <span className="text-sm font-semibold text-slate-500">Objek</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Cakupan Wilayah:</span>
                        <span className="font-bold text-emerald-700">40 Kecamatan</span>
                    </div>
                </div>
            </div>

            {/* --- 3. QUICK OPERATIONAL SHORTCUTS --- */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                    onClick={() => navigate('/dlh/peta-monitoring')}
                    className="p-3.5 bg-white hover:bg-emerald-50/50 border border-slate-200/80 hover:border-emerald-300 rounded-xl flex items-center gap-3 transition-all text-left shadow-sm group cursor-pointer"
                >
                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 group-hover:scale-110 transition-transform">
                        <Globe size={18} />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-800 transition-colors">Peta GIS Spasial</div>
                        <div className="text-[10px] text-slate-400">Monitoring sebaran objek</div>
                    </div>
                </button>

                <button
                    onClick={() => navigate('/dlh/validasi-bayar')}
                    className="p-3.5 bg-white hover:bg-blue-50/50 border border-slate-200/80 hover:border-blue-300 rounded-xl flex items-center gap-3 transition-all text-left shadow-sm group cursor-pointer"
                >
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-800 group-hover:scale-110 transition-transform">
                        <CreditCard size={18} />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-slate-800 group-hover:text-blue-800 transition-colors">Validasi Bayar</div>
                        <div className="text-[10px] text-slate-400">Verifikasi setor bank</div>
                    </div>
                </button>

                <button
                    onClick={() => navigate('/dlh/manajemen-objek')}
                    className="p-3.5 bg-white hover:bg-amber-50/50 border border-slate-200/80 hover:border-amber-300 rounded-xl flex items-center gap-3 transition-all text-left shadow-sm group cursor-pointer"
                >
                    <div className="p-2 rounded-lg bg-amber-100 text-amber-800 group-hover:scale-110 transition-transform">
                        <Edit3 size={18} />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-slate-800 group-hover:text-amber-800 transition-colors">Manajemen Objek</div>
                        <div className="text-[10px] text-slate-400">Pembaruan data tarif</div>
                    </div>
                </button>

                <button
                    onClick={() => navigate('/dlh/layanan-monitoring')}
                    className="p-3.5 bg-white hover:bg-purple-50/50 border border-slate-200/80 hover:border-purple-300 rounded-xl flex items-center gap-3 transition-all text-left shadow-sm group cursor-pointer"
                >
                    <div className="p-2 rounded-lg bg-purple-100 text-purple-800 group-hover:scale-110 transition-transform">
                        <ClipboardList size={18} />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-slate-800 group-hover:text-purple-800 transition-colors">Pengajuan Layanan</div>
                        <div className="text-[10px] text-slate-400">Permohonan khusus warga</div>
                    </div>
                </button>
            </div>

            {/* --- 4. ANALYTICS GRID: CHART BULANAN & WILAYAH / LOGS --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Kolom Kiri: Tren Realisasi Penerimaan Berjalan (Data Nyata Database) */}
                <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                    <BarChart3 size={18} className="text-emerald-700" />
                                    <span>Tren Realisasi Penerimaan Berjalan ({selectedYear})</span>
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Data nyata ketetapan SKRD vs setoran kas SSRD yang terverifikasi
                                </p>
                            </div>

                            {/* OPSI PILIHAN BENTUK DIAGRAM */}
                            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
                                <button
                                    onClick={() => setChartViewMode('bar')}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                        chartViewMode === 'bar'
                                            ? 'bg-white text-emerald-800 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-900'
                                    }`}
                                    title="Diagram Batang Komparasi"
                                >
                                    <BarChart2 size={13} />
                                    <span>Batang</span>
                                </button>
                                <button
                                    onClick={() => setChartViewMode('line')}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                        chartViewMode === 'line'
                                            ? 'bg-white text-emerald-800 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-900'
                                    }`}
                                    title="Diagram Garis & Area Tren"
                                >
                                    <LineChart size={13} />
                                    <span>Garis</span>
                                </button>
                                <button
                                    onClick={() => setChartViewMode('donut')}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                        chartViewMode === 'donut'
                                            ? 'bg-white text-emerald-800 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-900'
                                    }`}
                                    title="Diagram Lingkaran / Donat Proporsi"
                                >
                                    <PieChart size={13} />
                                    <span>Proporsi</span>
                                </button>
                                <button
                                    onClick={() => setChartViewMode('cards')}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                        chartViewMode === 'cards'
                                            ? 'bg-white text-emerald-800 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-900'
                                    }`}
                                    title="Rincian Metrik & Progres"
                                >
                                    <SlidersHorizontal size={13} />
                                    <span>Rincian</span>
                                </button>
                                <button
                                    onClick={() => setShowDiagramsOnly(true)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer ml-0.5"
                                    title="Buka Mode Sajian Diagram Saja (Layar Penuh)"
                                >
                                    <Maximize2 size={13} />
                                </button>
                            </div>
                        </div>

                        {loadingTrend ? (
                            <div className="py-20 text-center">
                                <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                <span className="text-xs font-medium text-slate-500">Memuat data realisasi nyata...</span>
                            </div>
                        ) : monthlyTrendData.length === 0 ? (
                            <div className="py-20 text-center text-slate-400">
                                <AlertCircle size={32} className="mx-auto text-slate-300 mb-2" />
                                <div className="font-semibold text-slate-700 text-xs">Belum ada transaksi pada tahun {selectedYear}</div>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                    Data akan otomatis terakumulasi setelah SKRD diterbitkan dan dibayarkan.
                                </p>
                            </div>
                        ) : (
                            <>
                                {chartViewMode === 'bar' && renderBarChart(false)}
                                {chartViewMode === 'line' && renderLineChart(false)}
                                {chartViewMode === 'donut' && renderDonutChart(false)}
                                {chartViewMode === 'cards' && renderCardsView()}
                            </>
                        )}
                    </div>

                    {/* Chart Footer Information */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold text-[11px]">
                                <Check size={13} strokeWidth={2.5} /> Data Nyata Teragregasi Database
                            </span>
                        </div>
                        <div className="text-[11px] font-medium text-slate-600">
                            Total Realisasi: <strong className="text-emerald-800 font-mono">{formatCurrency(trendTotals.totalRealisasi)}</strong>
                        </div>
                    </div>
                </div>

                {/* Kolom Kanan: Kinerja Wilayah & Log Operasional (Tabbed Side Card) */}
                <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                    <div>
                        {/* Segmented Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                                <button
                                    onClick={() => setActiveTabSide('wilayah')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                        activeTabSide === 'wilayah'
                                            ? 'bg-white text-slate-900 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-900'
                                    }`}
                                >
                                    Kinerja Wilayah
                                </button>
                                <button
                                    onClick={() => setActiveTabSide('aktivitas')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                        activeTabSide === 'aktivitas'
                                            ? 'bg-white text-slate-900 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-900'
                                    }`}
                                >
                                    Log Aktivitas
                                </button>
                            </div>
                            <span className="text-[11px] font-semibold text-slate-400">Kabupaten Bogor</span>
                        </div>

                        {activeTabSide === 'wilayah' ? (
                            /* Sub-tab 1: Wilayah Teraktif */
                            <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                                {regionalData.length > 0 ? (
                                    regionalData.map((reg, idx) => (
                                        <div key={idx} className="p-3 bg-slate-50/80 hover:bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between transition-colors">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center font-mono">
                                                    {idx + 1}
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-slate-900">Kec. {reg.kecamatan}</div>
                                                    <div className="text-[10px] text-slate-500">{reg.jumlah_skrd} SKRD Terbit</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs font-black text-slate-900 font-mono">
                                                    {formatCurrency(reg.total_tagihan)}
                                                </div>
                                                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-bold">
                                                    Lunas
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-8 text-center text-xs text-slate-400">
                                        Belum ada rekapan penerimaan wilayah
                                    </div>
                                )}

                                {/* Default active areas reference */}
                                <div className="p-3 bg-slate-50/40 border border-slate-100 rounded-xl flex items-center justify-between text-slate-400 text-xs">
                                    <div className="flex items-center gap-2">
                                        <MapPin size={14} className="text-slate-400" />
                                        <span>UPT Cibinong & Sekitarnya</span>
                                    </div>
                                    <span className="text-[10px] font-medium">Monitoring Spasial Aktif</span>
                                </div>
                            </div>
                        ) : (
                            /* Sub-tab 2: Log Aktivitas Terkini */
                            <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                                {adminStats?.recentLogs && adminStats.recentLogs.length > 0 ? (
                                    adminStats.recentLogs.map((log) => (
                                        <div key={log.id_log} className="p-2.5 bg-slate-50/80 border border-slate-100 rounded-xl text-left">
                                            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                                                <span className="font-bold text-emerald-800 uppercase bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                                                    {log.role}
                                                </span>
                                                <span>
                                                    {log.createdAt ? new Date(log.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                                                </span>
                                            </div>
                                            <div className="text-[11px] text-slate-700 font-medium leading-relaxed">
                                                {log.deskripsi}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-8 text-center text-xs text-slate-400">
                                        Belum ada riwayat aktivitas log
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                        <span>Database: <strong className="text-emerald-700 font-mono">PostGIS Aktif</strong></span>
                        <button
                            onClick={() => navigate('/dlh/peta-monitoring')}
                            className="font-bold text-emerald-700 hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                            Buka Peta Wilayah &rarr;
                        </button>
                    </div>
                </div>

            </div>

            {/* --- 5. DATA TABLE & FILTER TOOLBAR (CLEAN, NATURAL & ERGONOMIC) --- */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                {/* Header Bagian Tabel */}
                <div className="p-6 border-b border-slate-100">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                <FileSpreadsheet size={19} className="text-emerald-700" />
                                <span>Rincian Lembar Ketetapan & Transaksi SKRD</span>
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Pantau lembar tagihan terbit, pembayaran terverifikasi, dan kepatuhan wajib retribusi
                            </p>
                        </div>

                        {/* Segmented Tab Pilihan Jenis Laporan */}
                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
                            {[
                                { id: 'bulanan', label: 'Bulanan' },
                                { id: 'tahunan', label: 'Tahunan' },
                                { id: 'wilayah', label: 'Per Wilayah' },
                                { id: 'wr_aktif', label: 'WR Aktif' }
                            ].map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => setReportType(type.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                                        reportType === type.id
                                            ? 'bg-white text-emerald-800 shadow-sm'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Filter & Live Search Toolbar */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 pt-1">
                        {/* Dropdown Tahun */}
                        <div className="lg:col-span-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                Tahun
                            </label>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-emerald-600 focus:bg-white transition-all cursor-pointer"
                            >
                                <option value="2026">Tahun 2026</option>
                                <option value="2025">Tahun 2025</option>
                            </select>
                        </div>

                        {/* Dropdown Bulan (jika bulanan/wilayah) */}
                        {['bulanan', 'wilayah'].includes(reportType) && (
                            <div className="lg:col-span-3">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                    Bulan / Masa
                                </label>
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-emerald-600 focus:bg-white transition-all cursor-pointer"
                                >
                                    {daftarBulan.map(b => (
                                        <option key={b.val} value={b.val}>{b.label}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Dropdown Kecamatan (jika per wilayah) */}
                        {reportType === 'wilayah' && (
                            <div className="lg:col-span-3">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                    Kecamatan
                                </label>
                                <select
                                    value={selectedKecamatan}
                                    onChange={(e) => setSelectedKecamatan(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-emerald-600 focus:bg-white transition-all cursor-pointer"
                                >
                                    <option value="">Semua Kecamatan (40)</option>
                                    {kecamatanList.map((kec) => (
                                        <option key={kec.id_kecamatan} value={kec.name}>
                                            Kec. {kec.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Live Search Input */}
                        <div className={['bulanan', 'wilayah'].includes(reportType) ? 'lg:col-span-4' : 'lg:col-span-10'}>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                Pencarian Data
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Cari No. SKRD, Nama Subjek, NPOR..."
                                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:border-emerald-600 focus:bg-white transition-all"
                                />
                                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Data Render */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                <th className="px-6 py-3.5">Periode & No. SKRD</th>
                                <th className="px-6 py-3.5">Wajib Retribusi</th>
                                <th className="px-6 py-3.5">Objek & Wilayah</th>
                                <th className="px-6 py-3.5 text-right">Nominal (Rp)</th>
                                <th className="px-6 py-3.5 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-xs font-medium text-slate-500">Memuat data transaksi...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredReportData.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                                        <div className="max-w-xs mx-auto space-y-1">
                                            <AlertCircle size={28} className="mx-auto text-slate-300 mb-2" />
                                            <div className="font-semibold text-slate-600">Tidak ada data ditemukan</div>
                                            <p className="text-[11px] text-slate-400">
                                                Coba sesuaikan filter tahun, bulan, atau kata kunci pencarian Anda.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredReportData.map((item) => (
                                    <tr
                                        key={item.id_skrd}
                                        className="hover:bg-slate-50/80 transition-colors"
                                    >
                                        {/* Periode & No SKRD */}
                                        <td className="px-6 py-4">
                                            <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                                                {item.no_skrd}
                                            </span>
                                            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                                                <Calendar size={11} className="text-slate-400" />
                                                <span>
                                                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString('id-ID', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    }) : '-'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Wajib Retribusi */}
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-900">
                                                {item.Objek?.Subjek?.nama_subjek || item.nama_subjek || 'Wajib Retribusi'}
                                            </div>
                                            <span className="inline-block mt-0.5 text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                                {item.Objek?.Subjek?.kategori_subjek || item.kategori_subjek || 'Pribadi'}
                                            </span>
                                        </td>

                                        {/* Objek & Wilayah */}
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-800">
                                                {item.Objek?.nama_objek || '-'}
                                            </div>
                                            <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                                                <MapPin size={11} className="text-emerald-600 shrink-0" />
                                                <span>{item.Objek?.kecamatan_objek ? `Kec. ${item.Objek.kecamatan_objek}` : '-'}</span>
                                                <span className="text-slate-400">({item.Objek?.npor_objek || '-'})</span>
                                            </div>
                                        </td>

                                        {/* Nominal */}
                                        <td className="px-6 py-4 text-right">
                                            <div className="font-bold font-mono text-slate-900">
                                                {formatCurrency(item.Ssrd?.amount_paid || item.total_bayar || 0)}
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4 text-center">
                                            {item.status?.toLowerCase() === 'paid' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                                    LUNAS
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                                    BELUM LUNAS
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Table Footer */}
                <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
                    <div>
                        Menampilkan <strong className="text-slate-800">{filteredReportData.length}</strong> data transaksi
                    </div>
                    <div className="text-[11px] text-slate-400">
                        Pembaruan otomatis sesuai transaksi SSRD dan verifikasi perbankan
                    </div>
                </div>
            </div>
            </>
        )}

        </div>
    );
};

export default DlhDashboard;
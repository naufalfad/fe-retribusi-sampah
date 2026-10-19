import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronRight, ChevronDown, ShieldCheck, Leaf,
    Smartphone, BarChart3, MapPin, ArrowRight,
    CheckCircle2, Menu, X, Users, Globe, BookOpen,
    FileText, Search, CreditCard, ExternalLink,
    HelpCircle, Scale, Building2, Home, Landmark,
    QrCode, Lock, Clock, Sparkles, AlertCircle,
    Loader2, RefreshCw, Eye, ShieldAlert, ArrowUpRight,
    Receipt, Check
} from 'lucide-react';
import api from '../api/axios';

const formatCurrency = (val) => new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0
}).format(val || 0);

const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    } catch {
        return dateStr;
    }
};

const getNamaBulan = (bulan) => {
    const list = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    return list[parseInt(bulan, 10) - 1] || `Bulan ${bulan}`;
};

const LandingPage = () => {
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isStaffDropdownOpen, setIsStaffDropdownOpen] = useState(false);

    // State untuk Widget Cek Cepat Tagihan SKRD
    const [quickQuery, setQuickQuery] = useState('');
    const [quickSearchError, setQuickSearchError] = useState('');
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [searchResult, setSearchResult] = useState(null);

    // State Accordion FAQ
    const [activeFaq, setActiveFaq] = useState(null);

    // Efek scroll untuk Navbar
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 40);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Beranda', href: '#home' },
        { name: 'Cek Tagihan', href: '#cek-tagihan' },
        { name: 'Keunggulan', href: '#features' },
        { name: 'Alur Layanan', href: '#workflow' },
        { name: 'Kanal Bayar', href: '#payment-methods' },
        { name: 'Dasar Hukum', href: '#regulasi' },
        { name: 'FAQ', href: '#faq' },
    ];

    const handleQuickSearch = async (e) => {
        if (e) e.preventDefault();
        const query = quickQuery.trim();
        if (!query) {
            setQuickSearchError('Silakan masukkan nomor NPOR objek atau NPWRD Anda.');
            return;
        }
        setQuickSearchError('');
        setLoadingSearch(true);
        setSearchResult(null);

        try {
            const res = await api.get(`/skrd/public-check?query=${encodeURIComponent(query)}`);
            if (res.data?.status === 'success') {
                if (res.data.data && res.data.data.length > 0) {
                    setSearchResult(res.data);
                } else {
                    setQuickSearchError('Objek terdaftar, namun belum ada lembar tagihan SKRD yang diterbitkan.');
                }
            } else {
                setQuickSearchError(res.data?.message || 'Data tagihan tidak ditemukan.');
            }
        } catch (err) {
            setQuickSearchError(
                err.response?.data?.message ||
                'Data tagihan tidak ditemukan. Pastikan nomor NPOR atau NPWRD sudah benar dan terdaftar resmi di DLH Kabupaten Bogor.'
            );
        } finally {
            setLoadingSearch(false);
        }
    };

    const handleGoToPay = (item) => {
        const isNpwrdQuery = !quickQuery.trim().toUpperCase().startsWith('NPOR');
        navigate('/login', {
            state: {
                redirectTo: '/pembayaran',
                passState: { skrdId: item.id_skrd },
                prefillNpwrd: isNpwrdQuery ? quickQuery.trim() : '',
                billNotice: {
                    no_skrd: item.no_skrd,
                    total_bayar: item.total_bayar
                }
            }
        });
    };


    const toggleFaq = (index) => {
        setActiveFaq(activeFaq === index ? null : index);
    };

    const faqs = [
        {
            q: "Siapa saja yang wajib mendaftarkan diri pada sistem REKAS?",
            a: "Seluruh warga masyarakat, pemilik rumah tinggal, pelaku usaha mikro hingga makro, pengelola perkantoran, dan industri di wilayah Kabupaten Bogor yang menikmati pelayanan pengangkutan dan pengelolaan sampah oleh Dinas Lingkungan Hidup (DLH)."
        },
        {
            q: "Bagaimana cara mendaftarkan bangunan/objek baru saya?",
            a: "Anda cukup membuat akun Wajib Retribusi melalui tombol 'Daftar Sekarang', lalu masuk ke menu 'Tambah Objek'. Tandai titik koordinat bangunan Anda secara presisi melalui peta layar penuh (fullscreen GIS) agar tarif dan zona layanan terdata akurat."
        },
        {
            q: "Apakah bukti pembayaran SSRD dari REKAS sah diakui oleh dinas?",
            a: "Ya, 100% sah dan berkekuatan hukum. Surat Setoran Retribusi Daerah (SSRD) diterbitkan dengan kode transaksi resmi dan QR code verifikasi yang diakui langsung oleh Bapenda dan Dinas Lingkungan Hidup Kabupaten Bogor."
        },
        {
            q: "Kapan tagihan SKRD terbit dan bagaimana cara membayarnya?",
            a: "Surat Ketetapan Retribusi Daerah (SKRD) terbit otomatis setiap awal bulan. Pembayaran dapat dilakukan 24/7 menggunakan QRIS (semua e-wallet & m-banking), Virtual Account BCA, Mandiri, BNI, BRI, Bank BJB, maupun gerai retail."
        },
        {
            q: "Bagaimana jika sampah di lingkungan saya belum terangkut sesuai jadwal?",
            a: "Anda dapat mengajukan permohonan layanan khusus atau pengaduan secara langsung melalui menu 'Layanan' di dashboard akun Wajib Retribusi Anda, atau menghubungi Call Center UPT Kebersihan terdekat."
        }
    ];

    const paymentChannels = [
        { name: 'QRIS', tag: 'Instant Semua E-Wallet & M-Banking', color: 'from-rose-500 to-red-600' },
        { name: 'Bank Mandiri', tag: 'Virtual Account Otomatis', color: 'from-blue-600 to-indigo-800' },
        { name: 'BCA', tag: 'Virtual Account Otomatis', color: 'from-blue-500 to-blue-700' },
        { name: 'BNI', tag: 'Virtual Account Otomatis', color: 'from-teal-600 to-emerald-700' },
        { name: 'BRI', tag: 'Virtual Account Otomatis', color: 'from-sky-600 to-blue-700' },
        { name: 'Bank BJB', tag: 'Kas Daerah Jabar', color: 'from-amber-600 to-yellow-600' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 scroll-smooth selection:bg-emerald-200 selection:text-emerald-900">

            {/* --- TOP NAVBAR --- */}
            <nav className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-md py-3.5 border-b border-slate-200/80' : 'bg-transparent py-5'
                }`}>
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">

                    {/* DUAL LOGO: PEMDA BOGOR + REKAS */}
                    <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <img
                            src="/kab-bogor.png"
                            alt="Logo Kabupaten Bogor"
                            className="h-10 w-auto object-contain filter drop-shadow-sm"
                        />
                        <div className="h-7 w-[1px] bg-slate-300/60 hidden sm:block"></div>
                        <div className="flex items-center gap-2.5">
                            <div className="bg-emerald-700 p-2 rounded-xl shadow-lg shadow-emerald-900/20 text-white">
                                <Leaf size={18} strokeWidth={2.5} />
                            </div>
                            <div className="flex flex-col text-left">
                                <span className={`font-black text-xl tracking-tight leading-none ${isScrolled ? 'text-slate-900' : 'text-slate-900 md:text-white'}`}>
                                    REKAS
                                </span>
                                <span className={`text-[9px] font-extrabold uppercase tracking-widest leading-tight mt-0.5 ${isScrolled ? 'text-emerald-700' : 'text-emerald-600 md:text-emerald-400'}`}>
                                    DLH Kab. Bogor
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Navigation Links */}
                    <div className="hidden lg:flex items-center gap-7">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className={`text-xs font-bold tracking-wide transition-colors ${isScrolled ? 'text-slate-600 hover:text-emerald-700' : 'text-slate-200 hover:text-white'
                                    }`}
                            >
                                {link.name}
                            </a>
                        ))}
                    </div>

                    {/* Action Buttons: Wajib Retribusi Primer + Dropdown Petugas */}
                    <div className="hidden md:flex items-center gap-3">
                        {/* Dropdown Akses Petugas */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setIsStaffDropdownOpen(!isStaffDropdownOpen)}
                                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${isScrolled
                                    ? 'text-slate-700 hover:bg-slate-100 border border-slate-200'
                                    : 'text-white/90 hover:bg-white/10 border border-white/20'
                                    }`}
                            >
                                <Users size={14} />
                                <span>Akses Petugas</span>
                                <ChevronDown size={14} className={`transition-transform ${isStaffDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isStaffDropdownOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsStaffDropdownOpen(false)}></div>
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 text-left animate-in fade-in slide-in-from-top-2">
                                        <div className="px-4 py-2 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400">
                                            Portal Petugas Daerah
                                        </div>
                                        <button
                                            onClick={() => { setIsStaffDropdownOpen(false); navigate('/staff'); }}
                                            className="w-full px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                                        >
                                            <Landmark size={15} className="text-emerald-700" />
                                            <span>Staff Internal (UPT / DLH)</span>
                                        </button>
                                        <button
                                            onClick={() => { setIsStaffDropdownOpen(false); navigate('/petugas-lapangan'); }}
                                            className="w-full px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                                        >
                                            <Smartphone size={15} className="text-blue-600" />
                                            <span>Petugas Lapangan (Penagih)</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Tombol Utama: Masuk Wajib Retribusi */}
                        <button
                            onClick={() => navigate('/login')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-emerald-900/20 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                        >
                            <span>Masuk Akun</span>
                            <ArrowRight size={14} />
                        </button>
                    </div>

                    {/* Mobile Hamburger Toggle */}
                    <button
                        className={`lg:hidden p-2 rounded-xl transition-colors ${isScrolled ? 'text-slate-800 hover:bg-slate-100' : 'text-white hover:bg-white/10'}`}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle Menu"
                    >
                        {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
                    </button>
                </div>

                {/* Mobile Menu Dropdown Drawer */}
                {isMenuOpen && (
                    <div className="lg:hidden bg-white/98 backdrop-blur-xl absolute top-full left-0 right-0 p-6 shadow-2xl border-t border-slate-100 animate-in slide-in-from-top-4">
                        <div className="flex flex-col gap-4 text-left">
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Navigasi Halaman</div>
                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    className="text-sm font-bold text-slate-700 hover:text-emerald-700 py-1"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {link.name}
                                </a>
                            ))}
                            <hr className="border-slate-100 my-1" />
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Portal Layanan</div>
                            <button
                                onClick={() => { setIsMenuOpen(false); navigate('/login'); }}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2"
                            >
                                <span>Masuk Wajib Retribusi</span>
                                <ArrowRight size={15} />
                            </button>
                            <button
                                onClick={() => { setIsMenuOpen(false); navigate('/signUp'); }}
                                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 py-3 rounded-xl font-bold text-xs uppercase tracking-wider"
                            >
                                Daftar Wajib Retribusi Baru
                            </button>
                            <div className="grid grid-cols-2 gap-2 pt-1">
                                <button
                                    onClick={() => { setIsMenuOpen(false); navigate('/staff'); }}
                                    className="py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 text-center"
                                >
                                    Portal Staff DLH
                                </button>
                                <button
                                    onClick={() => { setIsMenuOpen(false); navigate('/petugas-lapangan'); }}
                                    className="py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 text-center"
                                >
                                    Portal Lapangan
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* --- HERO SECTION --- */}
            <section id="home" className="relative pt-36 pb-24 md:pt-48 md:pb-36 overflow-hidden">
                {/* Latar Belakang Foto Gunung Kencana dengan Cinematic Multi-layer Gradient */}
                <div className="absolute inset-0 z-0 h-full w-full">
                    <img
                        src="/gunung-kencana.jpg"
                        className="w-full h-full object-cover object-center filter brightness-95"
                        alt="Lanskap Alam Kabupaten Bogor"
                    />
                    {/* Dark gradient overlay untuk menjamin keterbacaan teks (WCAG AAA) */}
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950/75 via-slate-950/65 to-slate-900/40" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/25" />
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center text-left">

                        {/* Kolom Kiri: Headline & Value Proposition */}
                        <div className="lg:col-span-7 space-y-6">
                            {/* GovTech Official Badge */}

                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.1]">
                                Transformasi Digital <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-green-300">
                                    Retribusi Persampahan
                                </span> <br />
                                yang Transparan & Akurat.
                            </h1>

                            <p className="text-base sm:text-lg text-slate-300 max-w-xl font-normal leading-relaxed">
                                REKAS mengintegrasikan penetapan SKRD berbasis koordinat peta spasial (PostGIS), pembayaran online instan, serta penerbitan bukti setor resmi (SSRD) demi mewujudkan Kabupaten Bogor yang bersih dan lestari.
                            </p>

                            {/* Tombol Aksi Utama */}
                            <div className="flex flex-col sm:flex-row gap-3.5 pt-2">
                                <button
                                    onClick={() => navigate('/signUp')}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-wider shadow-xl shadow-emerald-900/30 transition-all active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer"
                                >
                                    <span>Daftar Akun Baru</span>
                                    <ArrowRight size={16} />
                                </button>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-wider backdrop-blur-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <span>Masuk ke Akun Anda</span>
                                </button>
                            </div>

                            {/* Trust Proof Mini */}
                            <div className="pt-4 flex items-center gap-6 text-xs text-slate-400">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 size={16} className="text-emerald-400" />
                                    <span>Bukti SSRD Sah</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 size={16} className="text-emerald-400" />
                                    <span>QRIS & Virtual Account</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 size={16} className="text-emerald-400" />
                                    <span>GIS Koordinat Presisi</span>
                                </div>
                            </div>
                        </div>

                        {/* Kolom Kanan: Instant Utility Widget (Cek Cepat Tagihan SKRD) */}
                        <div id="cek-tagihan" className="lg:col-span-5">
                            <div className="bg-white/95 backdrop-blur-xl p-7 sm:p-8 rounded-3xl shadow-2xl border border-white/40 text-left relative overflow-hidden transition-all duration-300">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

                                {!searchResult ? (
                                    <>
                                        <div className="flex items-center gap-2.5 mb-2">
                                            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                                                <Search size={18} />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-black text-slate-900 tracking-tight">Cek Tagihan SKRD Cepat</h3>
                                                <p className="text-[11px] text-slate-500">Periksa status tagihan bulanan objek retribusi Anda</p>
                                            </div>
                                        </div>

                                        <form onSubmit={handleQuickSearch} className="space-y-4 mt-5">
                                            <div>
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                                                        Nomor Objek (NPOR) / NPWRD
                                                    </label>
                                                    <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
                                                        <Lock size={10} /> Proteksi UU PDP
                                                    </span>
                                                </div>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={quickQuery}
                                                        onChange={(e) => { setQuickQuery(e.target.value); setQuickSearchError(''); }}
                                                        placeholder="Contoh: NPOR-2026-000001 atau 1020262203"
                                                        className="w-full pl-4 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder:text-slate-400 outline-none focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-50 transition-all font-mono"
                                                        disabled={loadingSearch}
                                                    />
                                                    <FileText size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                                </div>
                                                {quickSearchError && (
                                                    <p className="text-[11px] text-rose-600 font-semibold mt-2 flex items-start gap-1.5 bg-rose-50 p-2.5 rounded-xl border border-rose-100">
                                                        <AlertCircle size={14} className="shrink-0 mt-0.5" />
                                                        <span>{quickSearchError}</span>
                                                    </p>
                                                )}
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={loadingSearch}
                                                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-900/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                            >
                                                {loadingSearch ? (
                                                    <>
                                                        <Loader2 size={16} className="animate-spin" />
                                                        <span>Memverifikasi Database DLH...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Search size={15} />
                                                        <span>Periksa Tagihan Sekarang</span>
                                                    </>
                                                )}
                                            </button>
                                        </form>

                                        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px]">
                                            <span className="text-slate-500">Belum terdaftar sebagai wajib retribusi?</span>
                                            <button
                                                onClick={() => navigate('/signUp')}
                                                className="font-bold text-emerald-700 hover:underline cursor-pointer"
                                            >
                                                Daftar Akun Baru &rarr;
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    /* --- HASIL PENGECEKAN DENGAN DATA MASKING & TOMBOL BAYAR TEROTENTIKASI --- */
                                    <div className="space-y-4 animate-in fade-in duration-300">
                                        {/* Header Hasil Pencarian */}
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
                                                    <CheckCircle2 size={16} />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-black text-slate-900 leading-tight">Data Tagihan Ditemukan</h3>
                                                    <p className="text-[10px] text-slate-500 font-medium">Hasil verifikasi resmi server DLH Kab. Bogor</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => { setSearchResult(null); setQuickQuery(''); setQuickSearchError(''); }}
                                                className="text-[11px] font-bold text-slate-500 hover:text-emerald-700 flex items-center gap-1 cursor-pointer transition-colors"
                                                title="Periksa nomor lain"
                                            >
                                                <RefreshCw size={12} />
                                                <span>Cari Ulang</span>
                                            </button>
                                        </div>

                                        {/* Subjek & Objek Identitas Tersamar (UU PDP Compliant) */}
                                        <div className="p-3.5 bg-slate-50/90 border border-slate-200/80 rounded-2xl space-y-2 text-xs">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Users size={14} className="text-slate-400" />
                                                    <span className="font-bold text-slate-800">{searchResult.data[0]?.nama_subjek_masked}</span>
                                                </div>
                                                <span className="text-[10px] font-mono font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                                                    NPWRD: {searchResult.data[0]?.npwrd_masked}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-slate-200/50">
                                                <div className="flex items-center gap-1.5">
                                                    <Home size={13} className="text-emerald-600" />
                                                    <span className="font-mono">{searchResult.data[0]?.npor_objek}</span>
                                                    <span className="text-slate-400">({searchResult.data[0]?.kategori_objek})</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-slate-500">
                                                    <MapPin size={11} className="text-slate-400" />
                                                    <span>{searchResult.data[0]?.wilayah}</span>
                                                </div>
                                            </div>

                                            {/* UU PDP Security Notice */}
                                            <div className="pt-1.5 flex items-center gap-1.5 text-[10px] text-emerald-800 bg-emerald-50/80 px-2.5 py-1 rounded-lg border border-emerald-100">
                                                <Lock size={11} className="text-emerald-700 shrink-0" />
                                                <span>Data identitas disamarkan demi keamanan data pribadi (UU No. 27/2022).</span>
                                            </div>
                                        </div>

                                        {/* Daftar Lembar SKRD */}
                                        <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                                            {searchResult.data.map((item) => (
                                                <div
                                                    key={item.id_skrd}
                                                    className={`p-3.5 rounded-2xl border transition-all ${
                                                        item.is_unpaid
                                                            ? 'bg-rose-50/40 border-rose-200/90 hover:border-rose-300'
                                                            : 'bg-emerald-50/40 border-emerald-200/90'
                                                    }`}
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div>
                                                            <span className="text-[10px] font-mono font-extrabold text-slate-600 uppercase tracking-wider block">
                                                                {item.no_skrd}
                                                            </span>
                                                            <div className="text-xs font-black text-slate-900 mt-0.5">
                                                                Periode: {getNamaBulan(item.periode_bulan)} {item.periode_tahun}
                                                            </div>
                                                            <div className="text-[10px] text-slate-500 mt-0.5">
                                                                Jatuh Tempo: {formatDate(item.jatuh_tempo)}
                                                            </div>
                                                        </div>
                                                        <div className="text-right shrink-0">
                                                            <span
                                                                className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                                                    item.is_unpaid
                                                                        ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                                                        : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                                                }`}
                                                            >
                                                                {item.is_unpaid ? 'Belum Lunas' : 'Lunas'}
                                                            </span>
                                                            <div className="text-sm font-black text-slate-900 mt-1 font-mono">
                                                                {formatCurrency(item.total_bayar)}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Tombol Aksi Sesuai Status Pembayaran */}
                                                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between gap-2">
                                                        {item.is_unpaid ? (
                                                            <button
                                                                onClick={() => handleGoToPay(item)}
                                                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-3 rounded-xl font-bold text-[11px] uppercase tracking-wider shadow-md shadow-emerald-900/20 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                                            >
                                                                <Lock size={13} />
                                                                <span>Masuk untuk Membayar</span>
                                                                <ArrowRight size={13} />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => navigate('/login', { state: { redirectTo: '/ssrd' } })}
                                                                className="w-full bg-white hover:bg-slate-50 text-emerald-700 border border-emerald-300 py-2.5 px-3 rounded-xl font-bold text-[11px] uppercase tracking-wider active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                                            >
                                                                <CheckCircle2 size={13} className="text-emerald-600" />
                                                                <span>Masuk untuk Unduh SSRD</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Footer Keterangan Keamanan Transaksi */}
                                        <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between">
                                            <span className="flex items-center gap-1">
                                                <ShieldCheck size={13} className="text-emerald-600" /> Kredensial transaksi tersimpan aman di akun Anda
                                            </span>
                                            <button
                                                onClick={() => { setSearchResult(null); setQuickQuery(''); setQuickSearchError(''); }}
                                                className="font-bold text-slate-600 hover:text-emerald-700 cursor-pointer"
                                            >
                                                Tutup
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* --- LIVE METRICS STRIP --- */}
            <section className="bg-slate-900 text-white py-10 border-y border-slate-800">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center md:text-left">
                        <div className="border-l-2 border-emerald-500 pl-4">
                            <span className="text-3xl md:text-4xl font-black font-mono tracking-tight text-white block">40</span>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1 block">Kecamatan Terintegrasi</span>
                            <span className="text-[10px] text-slate-500 block mt-0.5">Seluruh wilayah Kabupaten Bogor</span>
                        </div>
                        <div className="border-l-2 border-teal-500 pl-4">
                            <span className="text-3xl md:text-4xl font-black font-mono tracking-tight text-white block">100%</span>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1 block">Pembayaran Digital</span>
                            <span className="text-[10px] text-slate-500 block mt-0.5">Integrasi QRIS & Virtual Account</span>
                        </div>
                        <div className="border-l-2 border-blue-500 pl-4">
                            <span className="text-3xl md:text-4xl font-black font-mono tracking-tight text-white block">PostGIS</span>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1 block">Presisi Spasial</span>
                            <span className="text-[10px] text-slate-500 block mt-0.5">Verifikasi titik bangunan akurat</span>
                        </div>
                        <div className="border-l-2 border-amber-500 pl-4">
                            <span className="text-3xl md:text-4xl font-black font-mono tracking-tight text-white block">24/7</span>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1 block">Akses Layanan Mandiri</span>
                            <span className="text-[10px] text-slate-500 block mt-0.5">Unduh SKRD & SSRD kapan saja</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- BENTO GRID: FITUR UNGGULAN SISTEM --- */}
            <section id="features" className="py-24 bg-white relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-[11px] font-black text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-100">
                            Fitur & Keunggulan
                        </span>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mt-3">
                            Teknologi Mutakhir Pelayanan Publik Berstandar Modern
                        </h2>
                        <p className="text-slate-500 text-sm mt-3 leading-relaxed">
                            Dirancang untuk menjamin transparansi perhitungan tarif, kepastian hukum, serta mempermudah masyarakat dalam memenuhi kewajiban retribusi lingkungan.
                        </p>
                    </div>

                    {/* Bento Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">

                        {/* Bento Card 1: GIS Spasial PostGIS (Besar, Span 2 Cols di Tablet/Desktop) */}
                        <div className="md:col-span-2 p-8 md:p-10 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 text-white relative overflow-hidden flex flex-col justify-between group border border-slate-800">
                            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

                            <div>
                                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/30">
                                    <MapPin size={24} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">PostGIS Spatial Mapping</span>
                                <h3 className="text-2xl font-black text-white tracking-tight mt-1 mb-3">
                                    Pemetaan Koordinat Bangunan yang Presisi
                                </h3>
                                <p className="text-slate-400 text-xs md:text-sm leading-relaxed max-w-xl">
                                    Setiap objek retribusi ditandai langsung di atas peta satelit menggunakan sistem koordinat spasial. Membedakan kategori Rumah Tinggal dan Gedung Usaha/Komersil secara visual tanpa risiko tumpang tindih zonasi.
                                </p>
                            </div>

                            {/* Mini UI Simulation Map Widget */}
                            <div className="mt-8 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                                        <Home size={16} />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-white">Sektor Domestik</div>
                                        <div className="text-[10px] text-slate-400">Rumah Tinggal & Pemukiman</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800">
                                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                                        <Building2 size={16} />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-white">Sektor Non-Domestik</div>
                                        <div className="text-[10px] text-slate-400">Komersil, Industri & Instansi</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bento Card 2: E-SKRD Otomatis */}
                        <div className="p-8 md:p-10 rounded-3xl bg-slate-50 border border-slate-200/80 hover:shadow-xl hover:border-emerald-300 transition-all flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center mb-6">
                                    <FileText size={24} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-700">Digital Billing</span>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight mt-1 mb-2">
                                    SKRD Digital Bulanan
                                </h3>
                                <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                                    Surat Ketetapan Retribusi Daerah (SKRD) terbit otomatis setiap bulan dengan rincian tarif pokok dan volume sampah yang jelas tanpa perlu kurir fisik.
                                </p>
                            </div>
                            <div className="mt-6 pt-4 border-t border-slate-200 flex items-center gap-2 text-xs font-bold text-blue-700">
                                <CheckCircle2 size={15} />
                                <span>Verifikasi Berbasis Barcode</span>
                            </div>
                        </div>

                        {/* Bento Card 3: Multi-Kanal Pembayaran Instan */}
                        <div className="p-8 md:p-10 rounded-3xl bg-slate-50 border border-slate-200/80 hover:shadow-xl hover:border-emerald-300 transition-all flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mb-6">
                                    <CreditCard size={24} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Payment Rails</span>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight mt-1 mb-2">
                                    Pembayaran Online 24/7
                                </h3>
                                <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                                    Dukungan payment gateway resmi (Midtrans) menghadirkan QRIS nasional dan Virtual Account bank utama dengan konfirmasi lunas instan detik itu juga.
                                </p>
                            </div>
                            <div className="mt-6 pt-4 border-t border-slate-200 flex items-center gap-2 text-xs font-bold text-emerald-700">
                                <QrCode size={15} />
                                <span>Integrasi QRIS Nasional</span>
                            </div>
                        </div>

                        {/* Bento Card 4: SSRD Elektronik & Rekap Transparan */}
                        <div className="md:col-span-2 p-8 md:p-10 rounded-3xl bg-slate-50 border border-slate-200/80 hover:shadow-xl hover:border-emerald-300 transition-all flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center mb-6">
                                    <BarChart3 size={24} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-purple-700">Compliance & Audit</span>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-1 mb-2">
                                    Bukti Setor Resmi (SSRD) Berkekuatan Hukum
                                </h3>
                                <p className="text-slate-600 text-xs md:text-sm leading-relaxed max-w-xl">
                                    Setiap pembayaran yang berhasil langsung menerbitkan Surat Setoran Retribusi Daerah (SSRD) elektronik berformat resmi yang dapat diunduh, dicetak, dan dijadikan bukti kepatuhan retribusi yang sah.
                                </p>
                            </div>
                            <div className="mt-6 pt-4 border-t border-slate-200 flex items-center gap-4 text-xs font-bold text-slate-700">
                                <div className="flex items-center gap-1.5 text-emerald-700"><CheckCircle2 size={15} /> Nomor Ketetapan Unik</div>
                                <div className="flex items-center gap-1.5 text-blue-700"><CheckCircle2 size={15} /> Riwayat Tersimpan Selamanya</div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* --- WORKFLOW: ALUR LAYANAN 3 LANGKAH (MOCKUP REALISTIS CSS) --- */}
            <section id="workflow" className="py-24 bg-slate-900 text-white rounded-[3rem] mx-4 md:mx-8 overflow-hidden relative border border-slate-800">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center text-left">

                        {/* Kiri: Deskripsi 3 Tahap */}
                        <div className="lg:col-span-6 space-y-8">
                            <div>
                                <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-950/80 border border-emerald-500/30 px-3.5 py-1.5 rounded-full">
                                    Alur Pelayanan
                                </span>
                                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mt-4">
                                    Tiga Langkah Mudah Menuju Kepatuhan Retribusi
                                </h2>
                                <p className="text-slate-400 text-xs md:text-sm mt-2">
                                    Seluruh proses dilakukan secara digital, transparan, dan tanpa perantara pungutan liar.
                                </p>
                            </div>

                            <div className="space-y-6">
                                {[
                                    {
                                        step: '01',
                                        title: 'Pendaftaran Subjek & Objek di Peta',
                                        desc: 'Daftarkan identitas Anda (Pribadi/Badan) lalu tentukan titik koordinat bangunan secara presisi di peta GIS fullscreen.'
                                    },
                                    {
                                        step: '02',
                                        title: 'Penerbitan SKRD Digital Bulanan',
                                        desc: 'Sistem otomatis menetapkan Surat Ketetapan Retribusi Daerah (SKRD) berdasarkan klasifikasi tarif resmi DLH.'
                                    },
                                    {
                                        step: '03',
                                        title: 'Pembayaran Online & Bukti SSRD Sah',
                                        desc: 'Lakukan pembayaran melalui QRIS atau Virtual Account bank, dan unduh bukti setor resmi (SSRD) seketika.'
                                    }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 hover:bg-slate-800 transition-colors">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 font-mono font-black text-sm flex items-center justify-center shrink-0">
                                            {item.step}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-white">{item.title}</h4>
                                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Kanan: Glassmorphism Dashboard / Digital SKRD Receipt Mockup */}
                        <div className="lg:col-span-6 relative">
                            <div className="bg-slate-950 p-6 md:p-8 rounded-3xl border border-slate-700/80 shadow-2xl relative">

                                {/* Mockup Header */}
                                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                        <span className="text-xs font-mono font-bold text-slate-400 ml-2">portal-rekas.bogorkab.go.id</span>
                                    </div>
                                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                                        Sistem Aktif
                                    </span>
                                </div>

                                {/* Simulated SKRD Document Card */}
                                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-left space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">SURAT KETETAPAN RETRIBUSI DAERAH</span>
                                            <h4 className="text-base font-bold text-white mt-0.5">No. SKRD-2026-004812</h4>
                                            <p className="text-xs text-slate-400">Periode: Oktober 2026</p>
                                        </div>
                                        <div className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-black uppercase tracking-wider">
                                            LUNAS (PAID)
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-800 text-xs">
                                        <div>
                                            <span className="text-[10px] text-slate-500 uppercase block">Wajib Retribusi</span>
                                            <span className="font-bold text-slate-200">PT. Sentul Komersil Mandiri</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-slate-500 uppercase block">Kategori Objek</span>
                                            <span className="font-bold text-slate-200">Non Rumah Tinggal (Komersil)</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-slate-500 uppercase block">Kecamatan / Desa</span>
                                            <span className="font-bold text-slate-200">Babakan Madang, Sentul</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-slate-500 uppercase block">Metode Pembayaran</span>
                                            <span className="font-bold text-emerald-400">QRIS Midtrans Instant</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center pt-2">
                                        <div>
                                            <span className="text-[10px] text-slate-500 uppercase block">Total Setoran Retribusi</span>
                                            <span className="text-xl font-bold font-mono text-white">Rp 120.000</span>
                                        </div>
                                        <button
                                            onClick={() => navigate('/login')}
                                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <CheckCircle2 size={14} />
                                            <span>Unduh SSRD</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Floating Live Badge */}
                                <div className="mt-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2 text-emerald-300">
                                        <Lock size={14} />
                                        <span>Terverifikasi Bapenda & DLH Kabupaten Bogor</span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-mono">ID Transaksi: #TRX-998201</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* --- KANAL PEMBAYARAN RESMI (FINANCIAL RAILS) --- */}
            <section id="payment-methods" className="py-20 bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                        Infrastruktur Pembayaran Daerah
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-3">
                        Kanal Pembayaran Resmi yang Didukung
                    </h3>
                    <p className="text-slate-500 text-xs md:text-sm max-w-xl mx-auto mb-10 leading-relaxed">
                        Seluruh transaksi retribusi diproses langsung melalui gerbang pembayaran resmi (*Payment Gateway*) dengan standar perbankan nasional.
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        {paymentChannels.map((p, idx) => (
                            <div
                                key={idx}
                                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col items-center justify-center text-center group"
                            >
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p.color} text-white flex items-center justify-center font-bold text-xs shadow-sm mb-2 group-hover:scale-105 transition-transform`}>
                                    <CreditCard size={18} />
                                </div>
                                <span className="text-xs font-black text-slate-800 block">{p.name}</span>
                                <span className="text-[9px] text-slate-500 leading-tight mt-0.5 block">{p.tag}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
                        <ShieldCheck size={16} className="text-emerald-600" />
                        <span>Sertifikasi Standar Keamanan Pembayaran PCI-DSS & Bank Indonesia</span>
                    </div>
                </div>
            </section>

            {/* --- DASAR HUKUM & REGULASI --- */}
            <section id="regulasi" className="py-24 bg-slate-50 border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-14">
                        <span className="text-[11px] font-black text-emerald-700 uppercase tracking-widest bg-emerald-100/60 px-3.5 py-1.5 rounded-full border border-emerald-200">
                            Landasan Hukum
                        </span>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-3">
                            Transparansi Kebijakan & Regulasi Retribusi
                        </h2>
                        <p className="text-slate-500 text-sm mt-2">
                            Penyelenggaraan pelayanan dan pemungutan retribusi mengacu penuh pada ketentuan perundang-undangan Republik Indonesia.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                                <Scale size={20} />
                            </div>
                            <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase">Undang-Undang Republik Indonesia</span>
                            <h4 className="text-sm font-bold text-slate-900 leading-snug">
                                UU No. 1 Tahun 2022 tentang HKPD
                            </h4>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Landasan Hubungan Keuangan antara Pemerintah Pusat dan Pemerintahan Daerah dalam pemungutan retribusi jasa umum.
                            </p>
                        </div>

                        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                                <Landmark size={20} />
                            </div>
                            <span className="text-[10px] font-mono text-blue-700 font-bold uppercase">Peraturan Daerah Kab. Bogor</span>
                            <h4 className="text-sm font-bold text-slate-900 leading-snug">
                                Perda Pajak & Retribusi Daerah
                            </h4>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Ketentuan tarif pelayanan persampahan, tata cara pemungutan, serta pengawasan kebersihan di lingkungan Kabupaten Bogor.
                            </p>
                        </div>

                        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
                            <div>
                                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-3">
                                    <BookOpen size={20} />
                                </div>
                                <span className="text-[10px] font-mono text-purple-700 font-bold uppercase">Pusat Arsip Regulasi</span>
                                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                                    Akses Dokumen Peraturan Resmi
                                </h4>
                                <p className="text-xs text-slate-500 leading-relaxed mt-1">
                                    Unduh dan baca salinan lengkap seluruh peraturan daerah serta pedoman pelayanan retribusi persampahan.
                                </p>
                            </div>
                            <button
                                onClick={() => navigate('/peraturan')}
                                className="mt-4 w-full py-2.5 px-4 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <span>Buka Halaman Peraturan</span>
                                <ExternalLink size={13} />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FAQ INTERAKTIF (ACCORDION) --- */}
            <section id="faq" className="py-24 bg-white">
                <div className="max-w-4xl mx-auto px-6 text-left">
                    <div className="text-center mb-16">
                        <span className="text-[11px] font-black text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-100">
                            Pusat Bantuan
                        </span>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-3">
                            Pertanyaan yang Sering Diajukan (FAQ)
                        </h2>
                        <p className="text-slate-500 text-sm mt-2">
                            Jawaban atas pertanyaan umum seputar kewajiban retribusi, pembayaran, dan penetapan objek.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, idx) => {
                            const isOpen = activeFaq === idx;
                            return (
                                <div
                                    key={idx}
                                    className={`rounded-2xl border transition-all overflow-hidden ${isOpen ? 'border-emerald-300 bg-emerald-50/20 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'
                                        }`}
                                >
                                    <button
                                        type="button"
                                        onClick={() => toggleFaq(idx)}
                                        className="w-full p-5 text-left flex justify-between items-center gap-4 cursor-pointer outline-none"
                                    >
                                        <span className="text-sm font-bold text-slate-800">{faq.q}</span>
                                        <ChevronDown
                                            size={18}
                                            className={`text-slate-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-emerald-700' : ''}`}
                                        />
                                    </button>
                                    {isOpen && (
                                        <div className="px-5 pb-5 text-xs md:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 animate-in fade-in">
                                            {faq.a}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* --- CALL TO ACTION (CTA) SECTION --- */}
            <section className="py-24 bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900 text-white relative overflow-hidden text-center">
                <div className="max-w-4xl mx-auto px-6 relative z-10 space-y-6">
                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-200 bg-white/10 px-4 py-1.5 rounded-full border border-white/20">
                        Ayo Bersama Jaga Kebersihan Bogor
                    </span>
                    <h3 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                        Wujudkan Kabupaten Bogor yang Bersih, Asri, dan Berkelanjutan
                    </h3>
                    <p className="text-emerald-100 text-sm md:text-base max-w-2xl mx-auto font-normal leading-relaxed">
                        Mulai kelola kewajiban retribusi pelayanan sampah secara digital, transparan, dan akurat dari mana saja.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
                        <button
                            onClick={() => navigate('/signUp')}
                            className="w-full sm:w-auto bg-white text-emerald-800 hover:bg-slate-100 px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-wider shadow-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                        >
                            <span>Daftar Wajib Retribusi Baru</span>
                            <ArrowRight size={15} />
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full sm:w-auto bg-emerald-950/40 hover:bg-emerald-950/60 text-white border border-white/30 px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-wider backdrop-blur-md transition-all cursor-pointer"
                        >
                            <span>Masuk ke Akun Anda</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* --- FOOTER STANDAR PEMERINTAHAN --- */}
            <footer className="bg-slate-950 text-slate-300 py-16 border-t border-slate-800 text-left text-xs">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-10">

                    {/* Brand & Kantor */}
                    <div className="md:col-span-5 space-y-4">
                        <div className="flex items-center gap-3">
                            <img src="/kab-bogor.png" alt="Logo Pemda" className="h-10 w-auto" />
                            <div className="flex items-center gap-2">
                                <div className="bg-emerald-700 p-1.5 rounded-lg text-white">
                                    <Leaf size={18} />
                                </div>
                                <span className="font-black text-xl text-white tracking-tight">REKAS</span>
                            </div>
                        </div>
                        <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
                            <b>Sistem Elektronik Retribusi Pelayanan Persampahan / Kebersihan</b><br />
                            Dinas Lingkungan Hidup Pemerintah Kabupaten Bogor.
                        </p>
                        <div className="text-slate-400 text-xs leading-relaxed">
                            <p className="font-bold text-slate-300">Kantor Dinas Lingkungan Hidup:</p>
                            <p>Jl. Tegar Beriman, Komplek Perkantoran Pemkab Bogor, Cibinong, Jawa Barat 16914</p>
                            <p className="mt-1 font-mono text-emerald-400">Email: dlh@bogorkab.go.id</p>
                        </div>
                    </div>

                    {/* Navigasi Cepat */}
                    <div className="md:col-span-3 space-y-3">
                        <h5 className="font-bold uppercase tracking-wider text-white text-xs">Navigasi Publik</h5>
                        <ul className="space-y-2 text-slate-400">
                            <li><a href="#home" className="hover:text-emerald-400 transition-colors">Beranda</a></li>
                            <li><a href="#cek-tagihan" className="hover:text-emerald-400 transition-colors">Cek Tagihan SKRD</a></li>
                            <li><a href="#features" className="hover:text-emerald-400 transition-colors">Keunggulan Spasial GIS</a></li>
                            <li><a href="#payment-methods" className="hover:text-emerald-400 transition-colors">Kanal Pembayaran</a></li>
                            <li><span onClick={() => navigate('/peraturan')} className="hover:text-emerald-400 transition-colors cursor-pointer">Dokumen Peraturan Daerah</span></li>
                            <li><a href="#faq" className="hover:text-emerald-400 transition-colors">Pertanyaan Umum (FAQ)</a></li>
                        </ul>
                    </div>

                    {/* Akses Portal Layanan */}
                    <div className="md:col-span-4 space-y-3">
                        <h5 className="font-bold uppercase tracking-wider text-white text-xs">Akses Portal Sistem</h5>
                        <div className="space-y-2">
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full text-left px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850 text-slate-300 flex items-center justify-between transition-colors cursor-pointer"
                            >
                                <span>Portal Wajib Retribusi</span>
                                <ArrowRight size={13} className="text-emerald-400" />
                            </button>
                            <button
                                onClick={() => navigate('/staff')}
                                className="w-full text-left px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850 text-slate-300 flex items-center justify-between transition-colors cursor-pointer"
                            >
                                <span>Portal Internal (UPT & DLH)</span>
                                <ArrowRight size={13} className="text-emerald-400" />
                            </button>
                            <button
                                onClick={() => navigate('/petugas-lapangan')}
                                className="w-full text-left px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850 text-slate-300 flex items-center justify-between transition-colors cursor-pointer"
                            >
                                <span>Portal Petugas Lapangan</span>
                                <ArrowRight size={13} className="text-emerald-400" />
                            </button>
                        </div>
                    </div>

                </div>

                {/* Bottom Copyright & Security Certificate */}
                <div className="max-w-7xl mx-auto px-6 mt-14 pt-8 border-t border-slate-800/80 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-[11px]">
                    <p>&copy; 2026 Pemerintah Kabupaten Bogor • Dinas Lingkungan Hidup. Hak Cipta Dilindungi Undang-Undang.</p>
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                            <ShieldCheck size={14} /> Terenkripsi & Terverifikasi
                        </span>
                    </div>
                </div>
            </footer>

        </div>
    );
};

export default LandingPage;
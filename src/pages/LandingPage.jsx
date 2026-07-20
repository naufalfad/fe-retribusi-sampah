import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronRight, ShieldCheck, Leaf,
    Smartphone, BarChart3, MapPin,
    ArrowRight, CheckCircle2, Menu, X,
    Users, Globe, MousePointer2, FileText
} from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Efek scroll untuk Navbar
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Beranda', href: '#home' },
        { name: 'Fitur', href: '#features' },
        { name: 'Alur Layanan', href: '#workflow' },
        { name: 'Dasar Hukum', href: '#' },
    ];

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 scroll-smooth">

            {/* --- TOP BAR / NAVBAR --- */}
            <nav className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-5'
                }`}>
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
                        <div className="bg-green-700 p-1.5 rounded-lg shadow-green-900/20 shadow-lg">
                            <Leaf className="text-white" size={20} />
                        </div>
                        <span className={`font-black text-xl tracking-tighter uppercase ${isScrolled ? 'text-slate-900' : 'text-slate-900 md:text-white'}`}>REKAS</span>
                    </div>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className={`text-xs font-black uppercase tracking-widest hover:text-green-600 transition-colors ${isScrolled ? 'text-slate-600' : 'text-slate-600 md:text-white/80'}`}
                            >
                                {link.name}
                            </a>
                        ))}
                    </div>

                    {/* Auth Buttons - DISKEMBUNYIKAN PADA MOBILE/TABLET */}
                    <div className="hidden md:flex items-center gap-3">
                        <button
                            onClick={() => navigate('/petugas-lapangan')}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isScrolled ? 'text-slate-900 hover:bg-slate-100' : 'text-white hover:bg-white/10'}`}
                        >
                            Portal Petugas Lapangan
                        </button>
                        <button
                            onClick={() => navigate('/staff')}
                            className="bg-green-700 hover:bg-black text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-green-900/20 transition-all active:scale-95"
                        >
                            Portal Petugas Internal
                        </button>
                    </div>

                    {/* Mobile Toggle */}
                    <button className="md:hidden text-slate-900" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden bg-white absolute top-full left-0 right-0 p-6 shadow-2xl border-t animate-in slide-in-from-top-5">
                        <div className="flex flex-col gap-6">
                            {navLinks.map((link) => (
                                <a key={link.name} href={link.href} className="text-sm font-black uppercase tracking-widest text-slate-600" onClick={() => setIsMenuOpen(false)}>
                                    {link.name}
                                </a>
                            ))}
                            <hr />
                            <button onClick={() => navigate('/login')} className="w-full bg-slate-100 py-4 rounded-2xl font-black uppercase text-xs">Login Wajib Retribusi</button>
                        </div>
                    </div>
                )}
            </nav>

            {/* --- HERO SECTION --- */}
            <section id="home" className="relative pt-32 pb-20 md:pt-48 md:pb-40 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/40 to-white z-10"></div>
                    <img
                        src="/kebun-raya.png"
                        className="w-full h-full object-cover scale-110 blur-[2px]"
                        alt="Background"
                    />
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-20 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 bg-green-500/20 backdrop-blur-md border border-green-500/30 px-4 py-1.5 rounded-full text-green-300 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                        <ShieldCheck size={14} /> Kantor DLH Kabupaten Bogor
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] uppercase  mb-8">
                        Mewujudkan <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">Bogor Bersih</span> <br />
                        & Terkelola.
                    </h1>
                    <p className="text-lg md:text-xl text-white/80 max-w-2xl font-medium leading-relaxed mb-10">
                        REKAS adalah sistem integrasi retribusi pelayanan persampahan yang transparan, akurat, dan memudahkan masyarakat dalam berkontribusi menjaga kebersihan daerah.
                    </p>

                    {/* CONTAINER TOMBOL UTAMA */}
                    <div className="flex flex-col sm:grid sm:grid-cols-2 md:flex md:flex-row gap-4 justify-center md:justify-start">
                        {/* Tombol Panduan (Selalu Ada) */}
                        <button
                            onClick={() => navigate('/login')}
                            className="bg-green-600 hover:bg-white hover:text-green-700 text-white px-10 py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-2xl shadow-green-900/40 transition-all flex items-center justify-center gap-3 active:scale-95"
                        >
                            Portal Wajib Retribusi <ArrowRight size={18} />
                        </button>
                        <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-10 py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                            Panduan Layanan
                        </button>

                        {/* TOMBOL PORTAL (Hanya muncul di Ponsel & Tab / md:hidden) */}
                        <button
                            onClick={() => navigate('/penagih')}
                            className="flex md:hidden bg-white/10 backdrop-blur-md border border-white/20 text-white px-10 py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-white/20 transition-all items-center justify-center gap-2"
                        >
                            <Smartphone size={16} /> Portal Penagih
                        </button>

                        <button
                            onClick={() => navigate('/staff')}
                            className="flex md:hidden bg-green-700 text-white px-10 py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-xl shadow-green-900/40 transition-all active:scale-95 items-center justify-center gap-2"
                        >
                            <Users size={16} /> Portal Petugas
                        </button>

                        {/* Tombol Login WR (Hanya muncul di Mobile sebagai alternatif) */}
                        <button
                            onClick={() => navigate('/login')}
                            className="flex md:hidden bg-white text-slate-900 px-10 py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-slate-100 transition-all items-center justify-center gap-2"
                        >
                            Login Wajib Retribusi
                        </button>
                    </div>
                </div>
            </section>

            {/* --- FEATURES SECTION --- */}
            <section id="features" className="py-24 bg-white relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-[10px] font-black text-green-700 uppercase tracking-[0.4em] mb-4">Keunggulan Sistem</h2>
                        <h3 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Teknologi Untuk Lingkungan</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "GIS Integration",
                                desc: "Penetapan objek retribusi menggunakan koordinat PostGIS yang akurat dan presisi di peta wilayah.",
                                icon: MapPin, color: "bg-blue-50 text-blue-600"
                            },
                            {
                                title: "Digital Billing",
                                desc: "Penerbitan SKRD digital yang dapat diunduh kapan saja tanpa perlu menunggu kurir datang ke rumah.",
                                icon: FileText, color: "bg-emerald-50 text-emerald-600"
                            },
                            {
                                title: "Real-time Monitoring",
                                desc: "Pantau status pembayaran dan riwayat setoran (SSRD) secara langsung melalui dashboard personal.",
                                icon: BarChart3, color: "bg-purple-50 text-purple-600"
                            }
                        ].map((f, i) => (
                            <div key={i} className="p-10 rounded-[3rem] border border-slate-100 hover:shadow-2xl hover:border-green-200 transition-all group">
                                <div className={`w-16 h-16 ${f.color} rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                                    <f.icon size={32} />
                                </div>
                                <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-4">{f.title}</h4>
                                <p className="text-slate-500 font-medium leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- WORKFLOW SECTION --- */}
            <section id="workflow" className="py-24 bg-slate-900 text-white rounded-[4rem] mx-4 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-20 opacity-5">
                    <Globe size={400} />
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div>
                            <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-8">
                                3 Langkah Mudah <br /> <span className="text-green-500 ">Menuju Kepatuhan</span>
                            </h3>
                            <div className="space-y-10">
                                {[
                                    { t: "Daftar & Verifikasi", d: "Daftarkan diri atau badan usaha Anda. Petugas UPT akan memverifikasi lokasi dan klasifikasi tarif." },
                                    { t: "Terima Tagihan SKRD", d: "Sistem akan menerbitkan Surat Ketetapan Retribusi Daerah (SKRD) setiap bulan secara otomatis." },
                                    { t: "Bayar & Dapatkan SSRD", d: "Lakukan pembayaran melalui kanal resmi dan terima Surat Setoran Retribusi Daerah (SSRD) sebagai bukti sah." }
                                ].map((step, i) => (
                                    <div key={i} className="flex gap-6">
                                        <div className="h-12 w-12 rounded-full border-2 border-green-500 flex items-center justify-center shrink-0 font-black text-green-500">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <h5 className="text-xl font-bold mb-2">{step.t}</h5>
                                            <p className="text-slate-400 leading-relaxed font-medium">{step.d}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative">
                            <div className="bg-gradient-to-br from-green-600 to-emerald-800 p-2 rounded-[3.5rem] shadow-3xl shadow-green-500/20">
                                <div className="bg-slate-950 rounded-[3rem] p-4">
                                    <img src="/dashboard-preview.png" alt="App Preview" className="rounded-[2.5rem] shadow-2xl" />
                                </div>
                            </div>
                            {/* Floating Element */}
                            <div className="absolute -bottom-10 -left-10 bg-white p-6 rounded-3xl shadow-2xl animate-bounce duration-[3000ms]">
                                <div className="flex items-center gap-4">
                                    <div className="bg-green-100 p-3 rounded-2xl text-green-700">
                                        <CheckCircle2 size={24} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Status Pembayaran</p>
                                        <p className="text-sm font-black text-slate-900 uppercase">Selesai & Lunas</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- CALL TO ACTION --- */}
            <section className="py-32 text-center">
                <div className="max-w-4xl mx-auto px-6">
                    <h3 className="text-5xl font-black text-slate-900 uppercase tracking-tighter mb-8">
                        Sudah Siap Berkontribusi?
                    </h3>
                    <p className="text-slate-500 text-lg mb-12 font-medium">
                        Gabung bersama kami dalam menggunakan layanan digital REKAS untuk pengelolaan kebersihan yang lebih baik.
                    </p>
                    {/* <button
                        onClick={() => navigate('/signUp')}
                        className="bg-green-700 hover:bg-black text-white px-12 py-6 rounded-[2rem] font-black uppercase text-sm tracking-[0.2em] shadow-2xl shadow-green-900/20 transition-all active:scale-95"
                    >
                        Daftarkan NPWRD Anda Sekarang
                    </button> */}
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="bg-slate-50 py-20 border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 text-left">
                    <div className="col-span-2 space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="bg-green-700 p-1.5 rounded-lg">
                                <Leaf className="text-white" size={20} />
                            </div>
                            <span className="font-black text-xl tracking-tighter uppercase">REKAS</span>
                        </div>
                        <p className="text-slate-500 text-sm max-w-sm leading-relaxed font-medium ">
                            Sistem Elektronik Retribusi Pelayanan Persampahan / Kebersihan. <br />
                            Dinas Lingkungan Hidup Kabupaten Bogor.
                        </p>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center cursor-pointer hover:bg-green-700 hover:text-white transition-all shadow-sm"><Globe size={18} /></div>
                            <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center cursor-pointer hover:bg-green-700 hover:text-white transition-all shadow-sm"><Users size={18} /></div>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <h5 className="font-black uppercase text-[10px] tracking-widest text-slate-400">Navigasi Cepat</h5>
                        <ul className="space-y-3 text-sm font-bold text-slate-600 uppercase tracking-tight">
                            <li className="hover:text-green-700 cursor-pointer">Panduan Pengguna</li>
                            <li className="hover:text-green-700 cursor-pointer">Download Formulir</li>
                            <li className="hover:text-green-700 cursor-pointer">Hubungi Kami</li>
                            <li className="hover:text-green-700 cursor-pointer">FAQ</li>
                        </ul>
                    </div>
                    <div className="space-y-6">
                        <h5 className="font-black uppercase text-[10px] tracking-widest text-slate-400">Kontak Resmi</h5>
                        <p className="text-sm text-slate-600 font-bold leading-relaxed uppercase">
                            Jl. Tegar Beriman, Komplek Pemda <br />
                            Cibinong, Kabupaten Bogor <br />
                            Jawa Barat 16914
                        </p>
                        <p className="text-sm text-green-700 font-black ">support@rekas.id</p>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>&copy; 2026 DLH Kabupaten Bogor. All Rights Reserved.</span>
                    <span className="flex items-center gap-2"><ShieldCheck size={14} className="text-green-600" /> Data Aman & Terenkripsi</span>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
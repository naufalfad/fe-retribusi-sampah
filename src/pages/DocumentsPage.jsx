import React, { useState } from 'react';
import {
    FileText, Download, Eye, Search, Scale,
    ShieldCheck, ChevronRight, Filter, BookOpen
} from 'lucide-react';

const DocumentsPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('SEMUA');

    const categories = ['SEMUA', 'PERBUP', 'PERDA', 'SOP', 'UU', 'PERDIN'];

    const regulations = [
        { id: 1, title: 'Perbup No. 7 Tahun 2023', desc: 'Tata Cara Pemungutan Retribusi Pelayanan Persampahan.', category: 'PERBUP', year: '2023', fileName: 'perbup-7-2023.pdf' },
        { id: 2, title: 'Perda No. 11 Tahun 2012', desc: 'Retribusi Jasa Umum Pemerintah Kabupaten Bogor.', category: 'PERDA', year: '2012', fileName: 'perda-11-2012.pdf' },
        { id: 3, title: 'SOP Penonaktifan WR', desc: 'Prosedur resmi penghentian layanan retribusi.', category: 'SOP', year: '2024', fileName: 'sop-penonaktifan.pdf' },
        { id: 4, title: 'UU No. 18 Tahun 2008', desc: 'Tentang Pengelolaan Sampah Nasional.', category: 'UU', year: '2008', fileName: 'uu-18-2008.pdf' },
        { id: 5, title: 'Perdin Pelayanan', desc: 'Pedoman teknis petugas penagihan lapangan.', category: 'PERDIN', year: '2025', fileName: 'perdin-teknis.pdf' },
    ];

    const filteredRegs = regulations.filter(reg => {
        const matchSearch = reg.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchFilter = activeFilter === 'SEMUA' || reg.category === activeFilter;
        return matchSearch && matchFilter;
    });

    return (
        <div className="space-y-6 pb-24 animate-in fade-in duration-500 font-sans px-1">

            {/* --- HEADER COMPACT --- */}
            <div className="px-2">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-700 text-white rounded-xl shadow-lg shadow-green-900/20">
                        <Scale size={20} />
                    </div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic">
                        Regulasi <span className="text-green-700">REKAS</span>
                    </h1>
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                    Pedoman Hukum & Operasional Daerah
                </p>
            </div>

            {/* --- SEARCH BOX MOBILE OPTIMIZED --- */}
            <div className="sticky top-2 z-30 px-2">
                <div className="relative group shadow-xl shadow-green-900/5">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Cari peraturan..."
                        className="w-full pl-12 pr-4 py-4 bg-white border-2 border-white rounded-2xl outline-none focus:border-green-600 shadow-sm font-bold text-sm transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* --- CATEGORY CHIPS (Horizontal Scroll) --- */}
            <div className="flex overflow-x-auto gap-2 px-2 pb-2 no-scrollbar">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveFilter(cat)}
                        className={`px-5 py-2.5 rounded-full text-[10px] font-black tracking-widest whitespace-nowrap transition-all border-2
                            ${activeFilter === cat
                                ? 'bg-green-700 border-green-700 text-white shadow-md'
                                : 'bg-white border-white text-gray-400 shadow-sm'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* --- DOCUMENT LIST --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-2">
                {filteredRegs.map((reg) => (
                    <div
                        key={reg.id}
                        className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-5 flex flex-col gap-4 active:scale-[0.98] transition-all"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-slate-900 text-green-400 rounded-2xl">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <span className="text-[9px] font-black text-green-700 uppercase tracking-widest">{reg.category}</span>
                                    <h3 className="text-sm font-black text-slate-800 uppercase leading-tight tracking-tight">
                                        {reg.title}
                                    </h3>
                                </div>
                            </div>
                            <span className="text-[9px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100 uppercase">
                                {reg.year}
                            </span>
                        </div>

                        <p className="text-[11px] text-gray-500 font-medium leading-relaxed italic line-clamp-2 px-1">
                            "{reg.desc}"
                        </p>

                        <div className="flex gap-2 pt-2">
                            <button
                                onClick={() => window.open(`/documents/${reg.fileName}`, '_blank')}
                                className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-green-700 transition-all shadow-md"
                            >
                                <Eye size={14} /> Baca PDF
                            </button>
                            <a
                                href={`/documents/${reg.fileName}`}
                                download
                                className="p-3.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-green-50 hover:text-green-700 border border-gray-100 transition-all flex items-center justify-center"
                                title="Download File"
                            >
                                <Download size={16} />
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            {/* --- EMPTY STATE --- */}
            {filteredRegs.length === 0 && (
                <div className="py-20 text-center flex flex-col items-center opacity-30">
                    <div className="p-5 bg-gray-100 rounded-full mb-4">
                        <BookOpen size={40} className="text-gray-400" />
                    </div>
                    <p className="font-black uppercase tracking-widest text-xs">Peraturan tidak ditemukan</p>
                </div>
            )}

            {/* --- MOBILE FOOTER BANNER --- */}
            <div className="mx-2 bg-gradient-to-br from-green-800 to-green-950 p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 space-y-3">
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={18} className="text-green-400" />
                        <h4 className="text-xs font-black uppercase tracking-widest">Keaslian Dokumen</h4>
                    </div>
                    <p className="text-[10px] text-green-100/70 font-medium leading-relaxed">
                        Seluruh salinan adalah versi resmi yang diterbitkan oleh Pemerintah Daerah Kabupaten Bogor.
                    </p>
                    <button className="w-full mt-2 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] backdrop-blur-md transition-all flex items-center justify-center gap-2">
                        Hubungi Bagian Hukum <ChevronRight size={14} />
                    </button>
                </div>
                <Scale className="absolute -right-6 -bottom-6 text-white/5" size={120} />
            </div>
        </div>
    );
};

export default DocumentsPage;
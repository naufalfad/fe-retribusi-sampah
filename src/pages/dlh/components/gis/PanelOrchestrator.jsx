import React from 'react';
import { X, Search, Map, Check, Star, Navigation, MapPin, Home, Building2 } from 'lucide-react';

const PanelOrchestrator = ({
    activePanel,
    setActivePanel,
    objekList,
    filteredData,
    searchTerm,
    setSearchTerm,
    filterCategory,
    setFilterCategory,
    activeBasemap,
    setActiveBasemap,
    selectedObject,
    setSelectedObject,
    onFlyTo
}) => {
    if (!activePanel && !selectedObject) return null;

    // Hitung statistik untuk StatsPanel
    const totalCount = objekList.length;
    const rumahCount = objekList.filter(o => o.kategori_objek === 'Rumah Tinggal').length;
    const nonRumahCount = objekList.filter(o => o.kategori_objek === 'Non Rumah Tinggal').length;
    const totalPotential = objekList.reduce((acc, curr) => acc + (Number(curr.tarif_pokok_objek) || 0), 0);

    return (
        <div className="absolute top-16 bottom-0 left-16 z-[1000] flex items-start pointer-events-none select-none">
            {/* 1. MAIN DRAWER (Left Docked next to Sidebar) */}
            {activePanel && (
                <div className="w-80 h-full bg-white border-r border-gray-200 pointer-events-auto flex flex-col shadow-xl">
                    {/* Header Drawer */}
                    <div className="px-5 py-4 border-b border-gray-150 flex items-center justify-between bg-slate-50">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {activePanel === 'layers' && 'Konfigurasi Layer'}
                            {activePanel === 'objects' && 'Pencarian Objek'}
                            {activePanel === 'stats' && 'Statistik GIS'}
                            {activePanel === 'about' && 'Informasi Sistem'}
                        </span>
                        <button
                            onClick={() => setActivePanel(null)}
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Content Drawer */}
                    <div className="flex-1 overflow-y-auto p-5 custom-scrollbar text-slate-800">
                        {/* A. LAYER PANEL */}
                        {activePanel === 'layers' && (
                            <div className="flex flex-col gap-6 text-left">
                                <div className="flex flex-col gap-3">
                                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                                        Peta Dasar (Basemaps)
                                    </h3>
                                    <div className="grid grid-cols-2 gap-2.5">
                                        {[
                                            { id: 'google-street', name: 'Google Street', desc: 'Jalanan kota' },
                                            { id: 'google-satellite', name: 'Satelit', desc: 'Foto udara' },
                                            { id: 'osm', name: 'OpenStreetMap', desc: 'Peta publik' }
                                        ].map(bm => (
                                            <button
                                                key={bm.id}
                                                onClick={() => setActiveBasemap(bm.id)}
                                                className={`p-3 border text-left cursor-pointer flex flex-col justify-between transition-all h-20
                                                    ${activeBasemap === bm.id
                                                        ? 'border-green-600 bg-green-50/40'
                                                        : 'border-slate-200 hover:border-slate-400 bg-slate-50'
                                                    }`}
                                            >
                                                <span className="text-[10px] font-black uppercase text-slate-700 tracking-wider">
                                                    {bm.name}
                                                </span>
                                                <span className="text-[8px] font-bold text-slate-400 leading-none">
                                                    {bm.desc}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="h-px bg-slate-100" />

                                <div className="flex flex-col gap-3">
                                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                                        Filter Kategori Objek
                                    </h3>
                                    <div className="flex flex-col gap-2 bg-slate-50 p-2 border border-slate-150">
                                        {[
                                            { id: 'ALL', name: 'Tampilkan Semua Objek' },
                                            { id: 'Rumah Tinggal', name: 'Hanya Rumah Tinggal' },
                                            { id: 'Non Rumah Tinggal', name: 'Hanya Non Rumah Tinggal' }
                                        ].map(cat => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setFilterCategory(cat.id)}
                                                className={`w-full py-2.5 px-3 flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-left transition-all cursor-pointer border-none outline-none
                                                    ${filterCategory === cat.id
                                                        ? 'bg-slate-900 text-white shadow-md'
                                                        : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-800'
                                                    }`}
                                            >
                                                {cat.name}
                                                {filterCategory === cat.id && <Check size={12} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* B. OBJECT PANEL */}
                        {activePanel === 'objects' && (
                            <div className="flex flex-col gap-4 h-full text-left">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Cari NPOR atau Nama..."
                                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 outline-none font-bold text-xs focus:ring-1 focus:ring-green-600 focus:border-green-600 transition-all text-slate-800"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                <div className="flex-1 overflow-y-auto max-h-[calc(100vh-180px)] custom-scrollbar pr-1">
                                    <div className="flex flex-col gap-1.5">
                                        {filteredData.length === 0 ? (
                                            <p className="text-[10px] font-bold text-slate-400 text-center py-8">
                                                Objek tidak ditemukan.
                                            </p>
                                        ) : (
                                            filteredData.map(obj => (
                                                <button
                                                    key={obj.id_objek}
                                                    onClick={() => {
                                                        setSelectedObject(obj);
                                                        if (obj.lat && obj.lng) {
                                                            onFlyTo([parseFloat(obj.lat), parseFloat(obj.lng)], 17);
                                                        }
                                                    }}
                                                    className={`p-3 text-left border cursor-pointer flex flex-col gap-1 transition-all outline-none
                                                        ${selectedObject?.id_objek === obj.id_objek
                                                            ? 'border-green-600 bg-green-50/40 shadow-sm'
                                                            : 'border-slate-100 hover:bg-slate-50 hover:border-slate-300'
                                                        }`}
                                                >
                                                    <div className="flex justify-between items-start gap-2">
                                                        <span className="text-[10px] font-black text-slate-800 uppercase tracking-tight truncate flex-1">
                                                            {obj.nama_objek}
                                                        </span>
                                                        <span className={`text-[7px] font-black px-1.5 py-0.5 uppercase shrink-0 flex items-center gap-1
                                                            ${obj.kategori_objek === 'Non Rumah Tinggal'
                                                                ? 'bg-blue-50 text-blue-600 border border-blue-100'
                                                                : 'bg-green-50 text-green-600 border border-green-100'
                                                            }`}>
                                                            {obj.kategori_objek === 'Non Rumah Tinggal' ? <Building2 size={8} /> : <Home size={8} />}
                                                            {obj.kategori_objek === 'Non Rumah Tinggal' ? 'Bisnis' : 'Rumah'}
                                                        </span>
                                                    </div>
                                                    <span className="text-[8px] font-mono font-bold text-slate-400 tracking-wider">
                                                        NPOR: {obj.npor_objek}
                                                    </span>
                                                    <span className="text-[8px] font-bold text-slate-400 truncate leading-none">
                                                        {obj.alamat_objek}
                                                    </span>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* C. STATS PANEL */}
                        {activePanel === 'stats' && (
                            <div className="flex flex-col gap-5 text-left select-none">
                                <div className="p-4 bg-slate-900 text-white flex flex-col gap-1">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                                        Total Objek Spasial
                                    </span>
                                    <span className="text-3xl font-black font-mono leading-none tracking-tight">
                                        {totalCount}
                                    </span>
                                    <span className="text-[8px] font-bold text-slate-400 mt-1">
                                        Terdaftar dalam sistem database spasial
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2.5">
                                    <div className="p-3 bg-slate-50 border border-slate-200 flex flex-col gap-1">
                                        <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">
                                            Rumah Tinggal
                                        </span>
                                        <span className="text-xl font-black font-mono leading-none text-green-700">
                                            {rumahCount}
                                        </span>
                                    </div>

                                    <div className="p-3 bg-slate-50 border border-slate-200 flex flex-col gap-1">
                                        <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">
                                            Non Rumah
                                        </span>
                                        <span className="text-xl font-black font-mono leading-none text-blue-700">
                                            {nonRumahCount}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-50 border border-slate-200 flex flex-col gap-1">
                                    <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">
                                        Akumulasi Nilai Retribusi Pokok
                                    </span>
                                    <span className="text-lg font-black font-mono leading-none text-slate-700">
                                        Rp {totalPotential.toLocaleString()}
                                    </span>
                                    <span className="text-[8px] font-bold text-slate-400 mt-1">
                                        Estimasi total omzet retribusi per bulan
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* D. ABOUT PANEL */}
                        {activePanel === 'about' && (
                            <div className="flex flex-col gap-4 text-left leading-relaxed text-slate-600">
                                <div className="p-4 bg-slate-50 border border-slate-200">
                                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
                                        REKAS GIS Monitoring
                                    </h3>
                                    <p className="text-[11px] font-bold">
                                        Versi 1.0.0
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-1">
                                        Sistem monitoring spasial berbasis peta untuk pemetaan wajib retribusi pelayanan kebersihan (sampah) Kabupaten Bogor.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-2 text-[10px]">
                                    <span className="font-bold text-slate-800 uppercase tracking-wider">Fitur Utama</span>
                                    <ul className="list-disc pl-4 space-y-1.5 font-bold">
                                        <li>Marker Clustering untuk ribuan objek retribusi sekaligus.</li>
                                        <li>Filter spasial kategori Rumah vs Bisnis.</li>
                                        <li>Integrasi langsung ke database wajib retribusi riil.</li>
                                        <li>Antarmuka imersif modular tanpa scrollbar luar.</li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 2. FLOATING OBJECT DETAIL PANEL (Same height as sidebar/drawers) */}
            {selectedObject && (
                <div className="w-80 h-full bg-white border-r border-gray-200 pointer-events-auto flex flex-col shadow-xl relative animate-in fade-in duration-200">
                    {/* Top Header */}
                    <div className="px-5 py-4 bg-slate-900 border-b border-slate-800 text-left flex items-start justify-between">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">
                                Objek Retribusi Terpilih
                            </span>
                            <h2 className="text-xs font-black text-white uppercase tracking-tight truncate max-w-[240px]">
                                {selectedObject.nama_objek}
                            </h2>
                        </div>
                        <button
                            onClick={() => setSelectedObject(null)}
                            className="p-1 text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Content Detail */}
                    <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 text-left custom-scrollbar">
                        {/* NPOR & Category */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">
                                    Nomor NPOR
                                </span>
                                <span className="text-[11px] font-mono font-black text-slate-700 uppercase">
                                    {selectedObject.npor_objek}
                                </span>
                            </div>

                            <span className={`text-[8px] font-black px-2.5 py-1 uppercase tracking-wider flex items-center gap-1.5
                                ${selectedObject.kategori_objek === 'Non Rumah Tinggal'
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : 'bg-green-50 text-green-700 border border-green-200'
                                }`}>
                                {selectedObject.kategori_objek === 'Non Rumah Tinggal' ? <Building2 size={10} /> : <Home size={10} />}
                                {selectedObject.kategori_objek}
                            </span>
                        </div>

                        {/* Alamat */}
                        <div className="flex gap-2">
                            <MapPin size={16} className="text-red-500 shrink-0 mt-0.5" />
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider leading-none">
                                    Alamat Objek
                                </span>
                                <p className="text-[10px] font-bold text-slate-600 mt-1">
                                    {selectedObject.alamat_objek}
                                </p>
                            </div>
                        </div>

                        {/* Grid stats (FITUR POIN DINONAKTIFKAN: Hanya tampilkan Tarif Pokok) */}
                        <div className="bg-slate-50 p-4 border border-slate-150">
                            <div className="flex flex-col text-left">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider leading-none">
                                    Tarif Pokok
                                </span>
                                <span className="text-[11px] font-mono font-black text-slate-700 mt-1.5 ">
                                    Rp {(Number(selectedObject.tarif_pokok_objek) || 0).toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Button Direct Action */}
                        <button
                            onClick={() => window.open(`/dlh/list-objek?npor=${selectedObject.npor_objek}`, '_blank')}
                            className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] uppercase tracking-widest transition-colors flex items-center justify-center gap-2 cursor-pointer border-none shadow-md"
                        >
                            <Navigation size={12} /> Buka Manajemen Aset
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PanelOrchestrator;

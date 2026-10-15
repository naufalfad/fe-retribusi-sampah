import React, { useMemo } from 'react';
import { Search, Building2, Home, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useGisUIStore } from '../../../../../store/useGisUIStore';

export default function ObjekPanel({ objekList = [] }) {
    const {
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedSubdistrict,
        setSelectedSubdistrict,
        selectedObjectId,
        setSelectedObject,
        openPanel,
        closePanelsToTheRight,
        setMapCenter,
        setMapZoom,
    } = useGisUIStore();

    // Ekstraksi daftar kecamatan unik dari data objek
    const subdistricts = useMemo(() => {
        const setKec = new Set();
        objekList.forEach((o) => {
            if (o.kecamatan_objek) setKec.add(o.kecamatan_objek.trim());
        });
        return Array.from(setKec).sort();
    }, [objekList]);

    // Statistik Ringkas Kepatuhan
    const stats = useMemo(() => {
        let total = objekList.length;
        let unpaidCount = 0;
        let paidCount = 0;

        objekList.forEach((o) => {
            const hasUnpaid = o.Skrds?.some((s) => s.status?.toLowerCase() === 'unpaid');
            if (hasUnpaid) unpaidCount++;
            else paidCount++;
        });

        return { total, unpaidCount, paidCount };
    }, [objekList]);

    // Filtering
    const filteredList = useMemo(() => {
        return objekList.filter((obj) => {
            // Text Search
            const q = searchQuery.toLowerCase().trim();
            const matchQuery =
                !q ||
                obj.nama_objek?.toLowerCase().includes(q) ||
                obj.npor_objek?.toLowerCase().includes(q) ||
                obj.alamat_objek?.toLowerCase().includes(q) ||
                obj.Subjek?.nama_subjek?.toLowerCase().includes(q);

            // Filter Kategori
            const matchCategory =
                selectedCategory === 'ALL' || obj.kategori_objek === selectedCategory;

            // Filter Kecamatan
            const matchKec =
                selectedSubdistrict === 'ALL' ||
                obj.kecamatan_objek?.toLowerCase() === selectedSubdistrict.toLowerCase();

            return matchQuery && matchCategory && matchKec;
        });
    }, [objekList, searchQuery, selectedCategory, selectedSubdistrict]);

    const handleItemClick = (obj) => {
        setSelectedObject(obj);

        const lat = parseFloat(obj.lat);
        const lng = parseFloat(obj.lng);
        if (!isNaN(lat) && !isNaN(lng)) {
            setMapCenter([lat, lng]);
            setMapZoom(17);
        }

        closePanelsToTheRight(-1);
        openPanel('detil-objek', 'Detail Objek Retribusi', obj);
    };

    return (
        <div className="flex flex-col h-full bg-white font-sans text-left pb-10 select-none">
            {/* SEARCH & DUAL FILTER TOOLBAR */}
            <div className="px-5 py-3.5 border-b border-slate-100 bg-white sticky top-0 z-10 space-y-2.5">
                {/* Search Input */}
                <div className="relative group">
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-700 transition-colors"
                        size={14}
                    />
                    <input
                        type="text"
                        placeholder="Cari NPOR, nama objek, alamat..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 py-2 pl-9 pr-3 text-xs font-normal text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all rounded-none"
                    />
                </div>

                {/* Dropdowns */}
                <div className="grid grid-cols-2 gap-2">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="h-8 px-2 bg-slate-50 border border-slate-200 text-[11px] font-normal text-slate-700 focus:outline-none focus:border-emerald-600 transition-colors cursor-pointer rounded-none"
                    >
                        <option value="ALL">Semua Kategori</option>
                        <option value="Rumah Tinggal">Rumah Tinggal</option>
                        <option value="Non Rumah Tinggal">Non Rumah Tinggal</option>
                    </select>

                    <select
                        value={selectedSubdistrict}
                        onChange={(e) => setSelectedSubdistrict(e.target.value)}
                        className="h-8 px-2 bg-slate-50 border border-slate-200 text-[11px] font-normal text-slate-700 focus:outline-none focus:border-emerald-600 transition-colors cursor-pointer rounded-none"
                    >
                        <option value="ALL">Semua Kecamatan</option>
                        {subdistricts.map((kec) => (
                            <option key={kec} value={kec}>
                                {kec}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* STATUS SUMMARY BANNER */}
            <div className="px-5 py-3 bg-slate-50/70 border-b border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-slate-700">
                    <span className="text-xs font-bold">Ringkasan Objek Terdaftar</span>
                    <span className="text-[10px] text-slate-500 font-mono font-bold">
                        {filteredList.length} dari {stats.total}
                    </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-center font-normal">
                    <div className="bg-emerald-50 border border-emerald-200 py-1.5 px-2 text-emerald-800 flex items-center justify-center gap-1.5">
                        <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                        <span>{stats.paidCount} Tertib/Lunas</span>
                    </div>
                    <div className="bg-rose-50 border border-rose-200 py-1.5 px-2 text-rose-800 flex items-center justify-center gap-1.5">
                        <AlertCircle size={12} className="text-rose-600 shrink-0" />
                        <span>{stats.unpaidCount} Belum Lunas</span>
                    </div>
                </div>
            </div>

            {/* FLUSH OBJECT LIST */}
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col divide-y divide-slate-100">
                {filteredList.length > 0 ? (
                    filteredList.map((obj) => {
                        const isActive = selectedObjectId === obj.id_objek;
                        const isNonRumah = obj.kategori_objek === 'Non Rumah Tinggal';
                        const hasUnpaid = obj.Skrds?.some((s) => s.status?.toLowerCase() === 'unpaid');

                        return (
                            <button
                                key={obj.id_objek}
                                onClick={() => handleItemClick(obj)}
                                className={`w-full px-5 py-3 transition-colors text-left outline-none flex items-center justify-between gap-3 cursor-pointer ${
                                    isActive
                                        ? 'bg-emerald-50/30 border-l-[3px] border-l-emerald-600'
                                        : 'bg-white hover:bg-slate-50/70 border-l-[3px] border-l-transparent'
                                }`}
                            >
                                <div className="flex flex-col gap-1 min-w-0 flex-1 text-left">
                                    {/* Chips Kategori & Status */}
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`text-[8px] font-bold px-1.5 py-0.5 uppercase tracking-wider flex items-center gap-1 ${
                                                isNonRumah
                                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                            }`}
                                        >
                                            {isNonRumah ? <Building2 size={9} /> : <Home size={9} />}
                                            {obj.kategori_objek || 'Objek'}
                                        </span>

                                        {hasUnpaid ? (
                                            <span className="text-[8px] font-bold px-1.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 uppercase tracking-wider">
                                                Nunggak
                                            </span>
                                        ) : (
                                            <span className="text-[8px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wider">
                                                Lunas
                                            </span>
                                        )}
                                    </div>

                                    {/* Nama Objek */}
                                    <h4
                                        className={`text-xs leading-tight whitespace-normal break-words font-bold ${
                                            isActive ? 'text-emerald-950' : 'text-slate-800'
                                        }`}
                                    >
                                        {obj.nama_objek}
                                    </h4>

                                    {/* Sub-info: NPOR & Alamat */}
                                    <div className="flex flex-col text-[10px] text-slate-400 leading-tight">
                                        <span className="font-mono font-medium text-slate-500">
                                            NPOR: {obj.npor_objek}
                                        </span>
                                        <span className="truncate mt-0.5 text-slate-400">
                                            {obj.kecamatan_objek ? `Kec. ${obj.kecamatan_objek} • ` : ''}
                                            {obj.alamat_objek}
                                        </span>
                                    </div>
                                </div>

                                <ChevronRight
                                    size={15}
                                    className={`shrink-0 transition-transform ${
                                        isActive
                                            ? 'text-emerald-700 translate-x-0.5'
                                            : 'text-slate-300 group-hover:text-slate-500'
                                    }`}
                                />
                            </button>
                        );
                    })
                ) : (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center py-16 text-center space-y-2 px-5">
                        <div className="w-10 h-10 rounded-none bg-slate-50 flex items-center justify-center text-slate-300 border border-slate-200">
                            <Search size={16} />
                        </div>
                        <p className="text-xs font-medium text-slate-700">Tidak ada objek ditemukan</p>
                        <p className="text-[10px] text-slate-400">
                            Coba ubah kata kunci pencarian atau reset filter kecamatan.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

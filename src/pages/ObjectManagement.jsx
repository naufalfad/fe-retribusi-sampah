import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import {
    Search, Edit3, Trash2, MapPin, Building2,
    Phone, CheckCircle2, AlertCircle, FileText,
    X, ArrowRight, Save, Loader2, Navigation, User
} from 'lucide-react';

const ObjectManagement = () => {
    // --- STATES ---
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedObject, setSelectedObject] = useState(null);
    const [mode, setMode] = useState(null); // 'edit' | 'deactivate'
    const [isSaving, setIsSaving] = useState(false);

    // Data Dummy Wilayah
    const listKecamatan = ["Cibinong", "Babakan Madang", "Bojonggede"];
    const listKelurahan = ["Pakansari", "Cibinong", "Sukahati"];

    // --- EFFECT: LIVE SEARCH WITH DEBOUNCE ---
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm.length >= 3) {
                fetchObjects(searchTerm);
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    // --- API CALL: FETCH OBJECTS ---
    const fetchObjects = async (query) => {
        setIsLoading(true);
        try {
            const response = await api.get('/objek/list-objek', {
                params: { search: query, limit: 5 }
            });
            if (response.data.status === 'success') {
                setSearchResults(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching objects:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectObject = (obj) => {
        setSelectedObject(obj);
        setSearchTerm(''); // Bersihkan pencarian setelah pilih
        setSearchResults([]);
    };

    const handleSaveAction = async () => {
        setIsSaving(true);
        try {
            // Simulasi API Update/Delete
            await new Promise(resolve => setTimeout(resolve, 1500));
            alert(`Tindakan ${mode === 'edit' ? 'Perubahan Data' : 'Penonaktifan'} Berhasil!`);
            setSelectedObject(null);
            setMode(null);
        } catch (error) {
            alert("Gagal memproses data");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-500 font-sans">

            {/* --- HEADER --- */}
            <div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic leading-none">
                    Manajemen <span className="text-green-700">Objek</span>
                </h1>
                <p className="text-gray-500 font-medium text-sm mt-1 uppercase tracking-widest italic">Otoritas Perubahan & Penonaktifan Aset REKAS</p>
            </div>

            {/* --- LIVE SEARCH WORKSPACE --- */}
            <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl shadow-slate-900/20 text-white relative overflow-hidden">
                <div className="relative z-20 max-w-2xl mx-auto text-center space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold italic tracking-tight uppercase text-green-400">Identifikasi Aset</h2>
                        <p className="text-xs text-slate-400 uppercase tracking-widest">Ketik NPOR atau Nama Objek untuk Memulai</p>
                    </div>

                    <div className="relative">
                        <div className="relative flex items-center group">
                            <Search className="absolute left-6 text-slate-400 group-focus-within:text-green-400 transition-colors" size={24} />
                            <input
                                type="text"
                                placeholder="Cari NPOR / Nama Objek..."
                                className="w-full pl-16 pr-6 py-5 bg-white/10 border-2 border-white/10 rounded-[2rem] outline-none focus:border-green-500 focus:bg-white focus:text-slate-900 transition-all text-lg font-mono tracking-widest"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {isLoading && <Loader2 className="absolute right-6 animate-spin text-green-500" size={24} />}
                        </div>

                        {/* --- SEARCH RESULTS DROPDOWN --- */}
                        {searchResults.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-[2rem] shadow-2xl overflow-hidden z-50 border border-gray-100 animate-in slide-in-from-top-2">
                                <div className="p-2 divide-y divide-gray-50">
                                    {searchResults.map((obj) => (
                                        <button
                                            key={obj.id_objek}
                                            onClick={() => handleSelectObject(obj)}
                                            className="w-full p-5 flex items-center justify-between hover:bg-green-50 transition-all text-left group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-gray-100 rounded-2xl text-gray-400 group-hover:bg-green-100 group-hover:text-green-700 transition-colors">
                                                    <Building2 size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-green-700 font-mono tracking-tighter leading-none mb-1">{obj.npor_objek}</p>
                                                    <h4 className="text-sm font-bold text-slate-800 uppercase">{obj.nama_objek}</h4>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase italic">Pemilik: {obj.Subjek?.nama_subjek}</p>
                                                </div>
                                            </div>
                                            <ArrowRight size={18} className="text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <Building2 className="absolute -left-10 -bottom-10 text-white/5" size={250} />
            </div>

            {/* --- ACTION AREA --- */}
            {selectedObject && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-top-4">

                    {/* PANEL INFO (4 COLS) */}
                    <div className="lg:col-span-4 space-y-4">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
                            <p className="text-[10px] font-black text-green-700 uppercase tracking-widest mb-4">Aset Terpilih</p>
                            <h3 className="text-2xl font-black text-slate-800 leading-tight mb-1 uppercase tracking-tighter">{selectedObject.nama_objek}</h3>
                            <p className="text-xs font-bold text-slate-400 font-mono italic">{selectedObject.npor_objek}</p>

                            <div className="mt-8 space-y-4 pt-6 border-t border-slate-50">
                                <div className="flex items-start gap-3">
                                    <User className="text-slate-300 mt-0.5" size={16} />
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Nama Pemilik</p>
                                        <p className="text-xs font-black text-slate-700 uppercase">{selectedObject.Subjek?.nama_subjek}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <MapPin className="text-slate-300 mt-0.5" size={16} />
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Lokasi</p>
                                        <p className="text-xs font-medium text-slate-600 italic leading-relaxed">{selectedObject.alamat_objek}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button onClick={() => setMode('edit')} className={`p-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-between transition-all ${mode === 'edit' ? 'bg-green-700 text-white shadow-xl shadow-green-900/20' : 'bg-white text-slate-600 border border-gray-100 hover:border-green-500'}`}>
                                <div className="flex items-center gap-4"><Edit3 size={20} /> <span>Edit Data</span></div>
                                <ChevronRight size={18} />
                            </button>
                            <button onClick={() => setMode('deactivate')} className={`p-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-between transition-all ${mode === 'deactivate' ? 'bg-red-600 text-white shadow-xl shadow-red-900/20' : 'bg-white text-slate-600 border border-gray-100 hover:border-red-500'}`}>
                                <div className="flex items-center gap-4"><Trash2 size={20} /> <span>Nonaktifkan</span></div>
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>

                    {/* PANEL FORM (8 COLS) */}
                    <div className="lg:col-span-8">
                        {mode ? (
                            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                                <div className={`p-6 text-white flex justify-between items-center ${mode === 'edit' ? 'bg-green-700' : 'bg-red-600'}`}>
                                    <h3 className="font-black uppercase tracking-widest text-xs ml-4">Panel Eksekusi Operasional</h3>
                                    <button onClick={() => setMode(null)} className="p-2 hover:bg-white/10 rounded-full"><X size={24} /></button>
                                </div>

                                <div className="p-10 space-y-8">
                                    {mode === 'edit' ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="md:col-span-2 space-y-1.5">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Objek Baru</label>
                                                <input type="text" defaultValue={selectedObject.nama_objek} className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-green-600 font-bold text-sm" />
                                            </div>
                                            <div className="md:col-span-2 space-y-1.5">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alamat Lengkap</label>
                                                <textarea rows="2" defaultValue={selectedObject.alamat_objek} className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-green-600 font-bold text-sm"></textarea>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kecamatan</label>
                                                <select className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-green-600 font-black text-[10px] uppercase tracking-widest appearance-none">
                                                    {listKecamatan.map(k => <option key={k} selected={k === selectedObject.kecamatan_objek}>{k}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Desa / Kelurahan</label>
                                                <select className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-green-600 font-black text-[10px] uppercase tracking-widest appearance-none">
                                                    {listKelurahan.map(k => <option key={k} selected={k === selectedObject.kelurahan_objek}>{k}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="bg-red-50 p-6 rounded-3xl border border-red-100 flex gap-4">
                                                <AlertCircle className="text-red-600 shrink-0" size={24} />
                                                <p className="text-xs text-red-800 font-bold uppercase tracking-tight italic">Penonaktifan akan menghentikan seluruh tagihan REKAS untuk objek ini.</p>
                                            </div>
                                            <textarea placeholder="Alasan penonaktifan..." rows="4" className="w-full p-6 bg-gray-50 border-2 border-gray-100 rounded-[2rem] outline-none focus:border-red-600 font-bold text-sm"></textarea>
                                        </div>
                                    )}

                                    <div className="pt-6 border-t border-slate-100">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Lampiran Scan Berkas Fisik</label>
                                        <div className="border-4 border-dashed border-slate-50 bg-slate-50 rounded-3xl p-10 flex flex-col items-center justify-center group hover:bg-white hover:border-green-200 cursor-pointer transition-all">
                                            <UploadIcon size={24} className="text-slate-300 group-hover:text-green-600" />
                                            <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest">Pilih Berita Acara (PDF/JPG)</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleSaveAction}
                                        disabled={isSaving}
                                        className={`w-full py-5 rounded-[1.5rem] font-black text-white shadow-xl transition-all flex items-center justify-center gap-3 uppercase text-xs tracking-widest ${mode === 'edit' ? 'bg-green-700 hover:bg-black' : 'bg-red-600 hover:bg-black'}`}
                                    >
                                        {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                        {isSaving ? "Sinkronisasi..." : "Simpan Perubahan"}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full border-4 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center p-20 opacity-30">
                                <Navigation size={64} className="text-slate-300" />
                                <p className="font-black uppercase text-xs tracking-[0.3em] mt-4">Pilih Aksi</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const UploadIcon = ({ size, className }) => <FileText size={size} className={className} />;

export default ObjectManagement;
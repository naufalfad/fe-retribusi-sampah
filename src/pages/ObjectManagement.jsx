import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios'; // Pastikan path instance axios benar
import {
    Search, Edit3, Trash2, MapPin, Building2, ChevronRight,
    X, ArrowRight, Save, Loader2, Navigation, User, AlertCircle
} from 'lucide-react';

const ObjectManagement = () => {
    // --- STATES ---
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedObject, setSelectedObject] = useState(null);
    const [mode, setMode] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // State untuk Form Edit (Controlled Inputs)
    const [editForm, setEditForm] = useState({
        nama_objek: '',
        alamat_objek: '',
        kecamatan_objek: '',
        kelurahan_objek: ''
    });

    const searchRef = useRef(null);
    const listKecamatan = ["Cibinong", "Babakan Madang", "Bojonggede", "Ciawi", "Parung"];
    const listKelurahan = ["Pakansari", "Cibinong", "Sukahati", "Harapan Jaya"];

    // --- CLOSE SEARCH ON CLICK OUTSIDE ---
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setSearchResults([]);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // --- LIVE SEARCH LOGIC ---
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm.length >= 3) fetchObjects(searchTerm);
            else setSearchResults([]);
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const fetchObjects = async (query) => {
        setIsLoading(true);
        try {
            const response = await api.get('/objek/list-objek', { params: { search: query, limit: 5 } });
            if (response.data.status === 'success') setSearchResults(response.data.data);
        } catch (error) {
            console.error("Search Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectObject = (obj) => {
        setSelectedObject(obj);
        // Set form data awal dari objek yang dipilih
        setEditForm({
            nama_objek: obj.nama_objek,
            alamat_objek: obj.alamat_objek,
            kecamatan_objek: obj.kecamatan_objek,
            kelurahan_objek: obj.kelurahan_objek
        });
        setSearchTerm('');
        setSearchResults([]);
        setMode(null);
    };

    // --- API INTEGRATION: UPDATE & NONAKTIF ---
    const handleSaveAction = async () => {
        setIsSaving(true);
        try {
            if (mode === 'edit') {
                // INTEGRASI API UPDATE
                const response = await api.put('/objek/update-objek', {
                    id_objek: selectedObject.id_objek,
                    ...editForm
                });
                if (response.data.success) {
                    alert("Data objek berhasil diperbarui!");
                }
            } else if (mode === 'deactivate') {
                // INTEGRASI API NONAKTIFKAN (Toggle Status)
                const response = await api.put('/objek/nonAktif-objek', {
                    id_objek: selectedObject.id_objek
                });
                if (response.data.success) {
                    alert(response.data.message);
                }
            }
            // Reset Workspace setelah sukses
            setSelectedObject(null);
            setMode(null);
        } catch (error) {
            console.error("API Error:", error);
            alert(error.response?.data?.message || "Terjadi kesalahan pada server");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-500 font-sans">
            {/* HEADER */}
            <div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">
                    Manajemen <span className="text-green-700">Objek</span>
                </h1>
                <p className="text-gray-500 font-medium text-sm mt-1 uppercase tracking-widest italic">Otoritas Perubahan & Penonaktifan Aset REKAS</p>
            </div>

            {/* LIVE SEARCH BOX */}
            <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl relative">
                <div className="absolute inset-0 rounded-[3rem] overflow-hidden pointer-events-none">
                    <Building2 className="absolute -left-10 -bottom-10 text-white/5" size={250} />
                </div>

                <div className="relative z-20 max-w-2xl mx-auto text-center space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold italic tracking-tight uppercase text-green-400">Identifikasi Aset</h2>
                        <p className="text-xs text-slate-400 uppercase tracking-widest">Ketik NPOR atau Nama Objek untuk Memulai</p>
                    </div>

                    <div className="relative" ref={searchRef}>
                        <div className="relative flex items-center group">
                            <Search className="absolute left-6 text-slate-400" size={24} />
                            <input
                                type="text"
                                placeholder="Cari NPOR / Nama Objek..."
                                className="w-full pl-16 pr-14 py-5 bg-white/10 border-2 border-white/10 rounded-[2rem] outline-none focus:border-green-500 focus:bg-white focus:text-slate-900 transition-all text-lg font-mono tracking-widest"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {isLoading && <Loader2 className="absolute right-6 animate-spin text-green-500" size={24} />}
                        </div>

                        {/* SEARCH RESULTS DROPDOWN */}
                        {searchResults.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-[2rem] shadow-2xl overflow-hidden z-[100] border border-gray-100 animate-in slide-in-from-top-2">
                                <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-2">
                                    {searchResults.map((obj) => (
                                        <button
                                            key={obj.id_objek}
                                            onClick={() => handleSelectObject(obj)}
                                            className="w-full p-5 flex items-center justify-between hover:bg-green-50 rounded-2xl transition-all text-left group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-gray-100 rounded-2xl text-gray-400 group-hover:bg-green-600 group-hover:text-white transition-colors">
                                                    <Building2 size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-green-700 font-mono leading-none mb-1">{obj.npor_objek}</p>
                                                    <h4 className="text-sm font-bold text-slate-800 uppercase leading-none">{obj.nama_objek}</h4>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Pemilik: {obj.Subjek?.nama_subjek}</p>
                                                </div>
                                            </div>
                                            <ArrowRight size={18} className="text-slate-300 group-hover:translate-x-1 transition-all" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ACTION AREA */}
            {selectedObject && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-top-4 duration-500">
                    {/* PANEL INFO KIRI */}
                    <div className="lg:col-span-4 space-y-4">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                            <p className="text-[10px] font-black text-green-700 uppercase tracking-widest mb-4">Aset Terpilih</p>
                            <h3 className="text-2xl font-black text-slate-800 leading-tight mb-1 uppercase tracking-tighter">{selectedObject.nama_objek}</h3>
                            <p className="text-xs font-bold text-slate-400 font-mono italic">{selectedObject.npor_objek}</p>
                            <div className="mt-8 pt-6 border-t border-slate-50 space-y-4">
                                <div className="flex items-start gap-3">
                                    <User className="text-slate-300 mt-0.5" size={16} />
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Pemilik</p>
                                        <p className="text-xs font-black text-slate-700 uppercase">{selectedObject.Subjek?.nama_subjek}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <MapPin className="text-slate-300 mt-0.5" size={16} />
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Status Objek</p>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${selectedObject.status_objek === 'Aktif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {selectedObject.status_objek}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button onClick={() => setMode('edit')} className={`p-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-between transition-all ${mode === 'edit' ? 'bg-green-700 text-white shadow-xl' : 'bg-white text-slate-600 border border-gray-100'}`}>
                                <div className="flex items-center gap-4"><Edit3 size={20} /> <span>Edit Data</span></div>
                                <ChevronRight size={18} />
                            </button>
                            <button onClick={() => setMode('deactivate')} className={`p-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-between transition-all ${mode === 'deactivate' ? 'bg-red-600 text-white shadow-xl' : 'bg-white text-slate-600 border border-gray-100'}`}>
                                <div className="flex items-center gap-4"><Trash2 size={20} /> <span>{selectedObject.status_objek === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan Kembali'}</span></div>
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>

                    {/* PANEL FORM KANAN */}
                    <div className="lg:col-span-8">
                        {mode ? (
                            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                                <div className={`p-6 text-white flex justify-between items-center ${mode === 'edit' ? 'bg-green-700' : 'bg-red-600'}`}>
                                    <h3 className="font-black uppercase tracking-widest text-xs ml-4 tracking-[0.2em]">Otoritas Eksekusi Objek</h3>
                                    <button onClick={() => setMode(null)} className="p-2 hover:bg-white/10 rounded-full"><X size={24} /></button>
                                </div>

                                <div className="p-10 space-y-8">
                                    {mode === 'edit' ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="md:col-span-2 space-y-1.5">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Objek Baru</label>
                                                <input
                                                    type="text"
                                                    value={editForm.nama_objek}
                                                    onChange={(e) => setEditForm({ ...editForm, nama_objek: e.target.value })}
                                                    className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-green-600 font-bold text-sm"
                                                />
                                            </div>
                                            <div className="md:col-span-2 space-y-1.5">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alamat Lengkap</label>
                                                <textarea
                                                    rows="2"
                                                    value={editForm.alamat_objek}
                                                    onChange={(e) => setEditForm({ ...editForm, alamat_objek: e.target.value })}
                                                    className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-green-600 font-bold text-sm"
                                                ></textarea>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kecamatan</label>
                                                <select
                                                    className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-green-600 font-bold text-xs uppercase"
                                                    value={editForm.kecamatan_objek}
                                                    onChange={(e) => setEditForm({ ...editForm, kecamatan_objek: e.target.value })}
                                                >
                                                    {listKecamatan.map(k => <option key={k} value={k}>{k}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kelurahan / Desa</label>
                                                <select
                                                    className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-green-600 font-bold text-xs uppercase"
                                                    value={editForm.kelurahan_objek}
                                                    onChange={(e) => setEditForm({ ...editForm, kelurahan_objek: e.target.value })}
                                                >
                                                    {listKelurahan.map(k => <option key={k} value={k}>{k}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6 text-center py-10">
                                            <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <AlertCircle size={40} />
                                            </div>
                                            <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                                                Konfirmasi Perubahan Status
                                            </h4>
                                            <p className="text-sm text-slate-500 max-w-sm mx-auto">
                                                Anda akan mengubah status objek <strong>{selectedObject.nama_objek}</strong> menjadi
                                                <span className="text-red-600 font-bold"> {selectedObject.status_objek === 'Aktif' ? 'Non-Aktif' : 'Aktif'}</span>.
                                                Tindakan ini akan mempengaruhi proses penagihan di masa depan.
                                            </p>
                                        </div>
                                    )}

                                    <button
                                        onClick={handleSaveAction}
                                        disabled={isSaving}
                                        className={`w-full py-5 rounded-[1.5rem] font-black text-white shadow-xl transition-all flex items-center justify-center gap-3 uppercase text-xs tracking-widest ${mode === 'edit' ? 'bg-green-700 hover:bg-black' : 'bg-red-600 hover:bg-black'}`}
                                    >
                                        {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                        {isSaving ? "Mengirim Data..." : mode === 'edit' ? "Simpan Perubahan" : "Konfirmasi Status"}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full border-4 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center p-20 opacity-30 min-h-[400px]">
                                <Navigation size={64} className="text-slate-300" />
                                <p className="font-black uppercase text-xs tracking-[0.3em] mt-4 text-center">Pilih Tindakan Di Samping Kiri</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ObjectManagement;
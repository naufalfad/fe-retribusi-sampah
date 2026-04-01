import React, { useState, useEffect } from 'react';
import {
    Star, Coins, Leaf, Plus, Trash2,
    Edit3, Save, X, Info, Loader2,
    Zap, Calculator, Lock
} from 'lucide-react';
import api from '../../api/axios';

const AdminPoinSettings = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Global Config - Sekarang Statis (Informasi Saja)
    const [globalConfig] = useState({
        point_value_idr: 10,
        min_redeem: 1000
    });

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [formData, setFormData] = useState({
        nama_kategori: '',
        poin_per_m3: '',
        satuan: 'm³',
        deskripsi: ''
    });

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await api.get('/poin/categories');
            if (res.data.success) {
                setCategories(res.data.data);
            }
        } catch (err) {
            console.error("Gagal mengambil kategori poin:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const openModal = (cat = null) => {
        if (cat) {
            setSelectedCategory(cat);
            setFormData({
                nama_kategori: cat.nama_kategori,
                poin_per_m3: cat.poin_per_m3,
                satuan: cat.satuan,
                deskripsi: cat.deskripsi || ''
            });
        } else {
            setSelectedCategory(null);
            setFormData({ nama_kategori: '', poin_per_m3: '', satuan: 'm³', deskripsi: '' });
        }
        setShowModal(true);
    };

    const handleSaveCategory = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (selectedCategory) {
                await api.put(`/poin/categories/${selectedCategory.id_kategori}`, formData);
            } else {
                await api.post('/poin/categories', formData);
            }
            setShowModal(false);
            fetchCategories();
        } catch (err) {
            alert(err.response?.data?.message || "Gagal menyimpan data");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Hapus kategori "${name}"?`)) return;
        try {
            await api.delete(`/poin/categories/${id}`);
            fetchCategories();
        } catch (err) {
            alert("Gagal menghapus kategori");
        }
    };

    return (
        <div className="space-y-8 pb-24 animate-in fade-in duration-500 font-sans text-left">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">
                        Reward <span className="text-amber-500">Engine</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-sm mt-2 uppercase tracking-widest leading-none">
                        Konfigurasi Nilai Ekonomi Pemilahan Sampah
                    </p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-amber-500 transition-all shadow-xl active:scale-95"
                >
                    <Plus size={18} /> Tambah Kategori
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* --- LEFT: INFORMASI KURS (DISABLED INPUT) --- */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden group transition-all hover:border-indigo-100">
                        {/* Efek Background Dekoratif */}
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Coins size={120} />
                        </div>

                        <div className="relative z-10">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8 border-b pb-4 flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <Calculator size={16} className="text-indigo-600" /> Kurs Konversi
                                </span>
                                <Lock size={14} className="text-slate-300" />
                            </h3>

                            <div className="space-y-8">
                                <div className="text-left">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nilai Tukar Saat Ini</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-black text-slate-900 tracking-tighter">10</span>
                                        <span className="text-xl font-black text-indigo-600 italic">Rupiah / Poin</span>
                                    </div>
                                </div>

                                <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100/50">
                                    <div className="flex gap-3 text-indigo-700">
                                        <Info size={20} className="shrink-0" />
                                        <p className="text-[11px] font-bold leading-relaxed">
                                            Kurs konversi poin saat ini bersifat <span className="text-indigo-900 underline underline-offset-4">Tetap (Fixed)</span> sesuai kebijakan sistem pusat untuk menjaga stabilitas ekonomi reward.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- RIGHT: CATEGORY LIST --- */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {loading ? (
                            <div className="col-span-full py-20 text-center"><Loader2 className="animate-spin mx-auto text-amber-500" size={40} /></div>
                        ) : categories.map((cat) => (
                            <div key={cat.id_kategori} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                            <Leaf size={28} />
                                        </div>
                                        <div className="text-left">
                                            <h4 className="font-black text-slate-800 uppercase text-sm leading-none mb-1">{cat.nama_kategori}</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase italic">Per {cat.satuan}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 text-left">
                                        <button onClick={() => openModal(cat)} className="p-2 text-slate-300 hover:text-blue-600 transition-colors"><Edit3 size={16} /></button>
                                        <button onClick={() => handleDelete(cat.id_kategori, cat.nama_kategori)} className="p-2 text-slate-300 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                                    </div>
                                </div>

                                <div className="mt-8 flex items-end justify-between text-left">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Poin / {cat.satuan}</p>
                                        <p className="text-3xl font-black text-emerald-600 italic tracking-tighter">
                                            +{cat.poin_per_m3} <span className="text-[10px] not-italic uppercase opacity-40">Pts</span>
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 text-right">
                                        <p className="text-[8px] font-black text-gray-400 uppercase leading-none mb-1">Nilai Ekonomi</p>
                                        <p className="text-xs font-black text-slate-700 font-mono">Rp {(cat.poin_per_m3 * globalConfig.point_value_idr).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- MODAL EDITOR --- */}
            {showModal && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 bg-slate-950 text-white flex justify-between items-center">
                            <div className="flex items-center gap-4 text-left">
                                <div className="p-3 bg-amber-500 rounded-2xl"><Zap size={24} fill="currentColor" /></div>
                                <div>
                                    <h3 className="font-black uppercase tracking-widest text-sm leading-none">{selectedCategory ? 'Edit Kategori' : 'Kategori Baru'}</h3>
                                    <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase">Konfigurasi Parameter Poin</p>
                                </div>
                            </div>
                            <button onClick={() => setShowModal(false)}><X size={28} className="text-slate-500 hover:text-white" /></button>
                        </div>

                        <form onSubmit={handleSaveCategory} className="p-10 space-y-6 text-left">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Kategori Sampah</label>
                                <input
                                    required type="text"
                                    placeholder="Contoh: Plastik PET / Kertas Bersih"
                                    className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-amber-500 font-bold text-sm"
                                    value={formData.nama_kategori}
                                    onChange={(e) => setFormData({ ...formData, nama_kategori: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nilai Poin</label>
                                    <input
                                        required type="number"
                                        className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-black text-emerald-600 outline-none focus:border-emerald-500 text-xl"
                                        value={formData.poin_per_m3}
                                        onChange={(e) => setFormData({ ...formData, poin_per_m3: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Satuan Dasar</label>
                                    <input
                                        disabled
                                        className="w-full p-4 bg-gray-100 border-2 border-gray-200 rounded-2xl font-bold text-xs uppercase text-gray-400"
                                        value={formData.satuan}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSaving}
                                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 disabled:bg-slate-300"
                            >
                                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                Simpan Konfigurasi
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPoinSettings;
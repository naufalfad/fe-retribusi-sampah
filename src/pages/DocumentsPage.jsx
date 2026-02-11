import React, { useState, useEffect } from 'react';
import api, { BASE_URL } from '../../src/api/axios';
import {
    FileText, Download, Eye, Search, Scale,
    Plus, Trash2, X, Upload, CheckCircle2,
    Loader2, AlertCircle, ChevronDown
} from 'lucide-react';

const DocumentsPage = ({ isAdmin = false }) => {
    const [regulations, setRegulations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('SEMUA');
    const [showAddModal, setShowAddModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    const categories = ['SEMUA', 'PERBUP', 'PERDA', 'SOP', 'UU', 'PERDIN'];

    // --- 1. FETCH DATA DARI API ---
    const fetchPeraturan = async () => {
        setLoading(true);
        try {
            const response = await api.get('/peraturan/list-peraturan', {
                params: {
                    jenis: activeFilter,
                    search: searchTerm
                }
            });
            if (response.data.success) {
                setRegulations(response.data.data);
            }
        } catch (error) {
            console.error("Gagal load peraturan:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchPeraturan();
        }, 500);
        return () => clearTimeout(delayDebounce);
    }, [searchTerm, activeFilter]);

    // --- 2. ADD DATA (MULTIPART/FORM-DATA) ---
    const handleAddReg = async (e) => {
        e.preventDefault();
        if (!selectedFile) return alert("Pilih file PDF terlebih dahulu");

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('judul', e.target.judul.value);
        formData.append('jenis', e.target.jenis.value);
        formData.append('tahun', e.target.tahun.value);
        formData.append('deskripsi', e.target.deskripsi.value);
        formData.append('dokumen_peraturan', selectedFile); // Name harus sesuai req.file di backend

        try {
            const response = await api.post('/peraturan/tambah-peraturan', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (response.data.success) {
                alert("Peraturan berhasil dipublikasikan");
                setShowAddModal(false);
                setSelectedFile(null);
                fetchPeraturan();
            }
        } catch (error) {
            alert(error.response?.data?.message || "Gagal upload");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- 3. DELETE DATA ---
    const handleDelete = async (id, title) => {
        if (!window.confirm(`Hapus peraturan "${title}"?`)) return;

        try {
            const response = await api.delete(`/peraturan/hapus-peraturan/${id}`);
            if (response.data.success) {
                fetchPeraturan();
            }
        } catch (error) {
            alert("Gagal menghapus data");
        }
    };

    const getFullUrl = (path) => `${BASE_URL}/${path}`

    return (
        <div className="space-y-6 pb-24 animate-in fade-in duration-500 font-sans px-1">
            {/* Header */}
            <div className="flex justify-between items-end px-2">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-700 text-white rounded-xl shadow-lg">
                            <Scale size={20} />
                        </div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic">
                            Regulasi <span className="text-green-700">REKAS</span>
                        </h1>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Pedoman Hukum & Operasional</p>
                </div>
                {isAdmin && (
                    <button onClick={() => setShowAddModal(true)} className="bg-gray-900 text-white p-3 rounded-2xl shadow-xl hover:bg-green-700 transition-all active:scale-95 flex items-center gap-2">
                        <Plus size={20} />
                        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">Unggah Peraturan</span>
                    </button>
                )}
            </div>

            {/* Search & Filter */}
            <div className="sticky top-2 z-30 px-2 space-y-4">
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
                <div className="flex overflow-x-auto gap-2 no-scrollbar pb-2">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveFilter(cat)}
                            className={`px-5 py-2.5 rounded-full text-[10px] font-black tracking-widest whitespace-nowrap transition-all border-2
                                ${activeFilter === cat ? 'bg-green-700 border-green-700 text-white shadow-md' : 'bg-white border-white text-gray-400 shadow-sm'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Document List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-2">
                {loading ? (
                    <div className="col-span-full py-20 text-center">
                        <Loader2 className="animate-spin mx-auto text-green-700 mb-2" size={32} />
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sinkronisasi Data...</p>
                    </div>
                ) : regulations.map((reg) => (
                    <div key={reg.id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 flex flex-col gap-4 relative group transition-all hover:border-green-500">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-slate-900 text-green-400 rounded-2xl"><FileText size={20} /></div>
                                <div>
                                    <span className="text-[9px] font-black text-green-700 uppercase tracking-widest">{reg.jenis}</span>
                                    <h3 className="text-sm font-black text-slate-800 uppercase leading-tight tracking-tight">{reg.judul}</h3>
                                </div>
                            </div>
                            {isAdmin && (
                                <button onClick={() => handleDelete(reg.id, reg.judul)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>
                        <p className="text-[11px] text-gray-500 font-medium italic line-clamp-2 px-1">"{reg.deskripsi || 'Tidak ada deskripsi.'}"</p>
                        <div className="flex gap-2 pt-2">
                            <button
                                onClick={() => window.open(getFullUrl(reg.dokumen_peraturan), '_blank')}
                                className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-700 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-green-700 hover:text-white transition-all shadow-sm"
                            >
                                <Eye size={14} /> Baca PDF
                            </button>
                            <a href={getFullUrl(reg.dokumen_peraturan)} download className="p-3.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-green-100 hover:text-green-700 border border-gray-100 transition-all flex items-center justify-center">
                                <Download size={16} />
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Add (Hanya Admin) */}
            {showAddModal && (
                <div className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-10">
                        <div className="p-8 bg-gray-900 text-white flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-600 rounded-2xl"><Upload size={24} /></div>
                                <h3 className="font-black uppercase tracking-widest text-sm">Unggah Regulasi</h3>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/10 rounded-full"><X size={28} /></button>
                        </div>

                        <form onSubmit={handleAddReg} className="p-10 space-y-6">
                            <div className="space-y-4">
                                <input name="judul" required placeholder="Judul Peraturan" className="w-full p-4 bg-gray-50 border-2 rounded-2xl outline-none focus:border-green-600 font-bold text-sm" />
                                <div className="grid grid-cols-2 gap-4">
                                    <select name="jenis" className="w-full p-4 bg-gray-50 border-2 rounded-2xl outline-none focus:border-green-600 font-bold text-xs uppercase appearance-none">
                                        {categories.filter(c => c !== 'SEMUA').map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <input name="tahun" required type="number" placeholder="Tahun" className="w-full p-4 bg-gray-50 border-2 rounded-2xl outline-none focus:border-green-600 font-bold text-sm" />
                                </div>
                                <textarea name="deskripsi" required placeholder="Deskripsi Singkat" className="w-full p-4 bg-gray-50 border-2 rounded-2xl outline-none focus:border-green-600 font-bold text-sm"></textarea>

                                <label className="border-4 border-dashed border-gray-50 rounded-[2rem] p-8 flex flex-col items-center justify-center bg-gray-50 hover:border-green-200 cursor-pointer transition-all">
                                    <div className="bg-white p-3 rounded-xl shadow-sm mb-2">
                                        {selectedFile ? <CheckCircle2 className="text-green-600" /> : <Upload className="text-green-600" />}
                                    </div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase">
                                        {selectedFile ? selectedFile.name : 'Pilih File PDF'}
                                    </p>
                                    <input type="file" className="hidden" accept=".pdf" onChange={(e) => setSelectedFile(e.target.files[0])} />
                                </label>
                            </div>
                            <button
                                disabled={isSubmitting}
                                className="w-full py-5 bg-green-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" /> : 'Simpan & Publikasikan'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentsPage;
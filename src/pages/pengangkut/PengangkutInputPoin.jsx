import React, { useState, useEffect } from 'react';
import {
    Search, Leaf, Calculator, ArrowLeft,
    Loader2, Camera, Star, Save, Trash2, Plus
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/axios';

const PengangkutInputPoin = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // 🔥 Ambil objek dari halaman monitoring
    const selectedObjek = location.state?.selected;

    const [categories, setCategories] = useState([]);
    const [loadingKategori, setLoadingKategori] = useState(true);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [volumes, setVolumes] = useState({});

    useEffect(() => {
        if (!selectedObjek) {
            navigate('/pengangkut/monitoring');
        }
    }, [selectedObjek, navigate]);

    useEffect(() => {
        const fetchKategori = async () => {
            try {
                const res = await api.get('/poin/categories');
                if (res.data.success) {
                    setCategories(res.data.data);

                    // 🔥 init volumes otomatis
                    const initialVolumes = {};
                    res.data.data.forEach(cat => {
                        initialVolumes[cat.id_kategori] = 0;
                    });
                    setVolumes(initialVolumes);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingKategori(false);
            }
        };

        fetchKategori();
    }, []);

    const handleInputVolume = (key, val) => {
        setVolumes(prev => ({
            ...prev,
            [key]: parseFloat(val) || 0
        }));
    };

    const totalPoin = Object.entries(volumes).reduce((total, [id, vol]) => {
        const cat = categories.find(c => c.id_kategori == id);
        return total + (vol * (cat?.poin_per_m3 || 0));
    }, 0);

    const handleSubmitPengangkutan = async () => {
        if (!selectedObjek) return alert("Pilih objek dulu");

        const details = Object.entries(volumes)
            .filter(([_, vol]) => vol > 0)
            .map(([id_kategori, volume]) => ({
                id_kategori: parseInt(id_kategori),
                volume
            }));

        if (details.length === 0) {
            return alert("Minimal isi satu kategori");
        }

        try {
            const res = await api.post('/poin/pengangkutan', {
                id_objek: selectedObjek.id_objek,
                details
            });

            alert("Data pengangkutan berhasil disimpan!");
            setVolumes({});
            navigate('/pengangkut/monitoring');

        } catch (err) {
            console.error(err);

            alert(
                err.response?.data?.message ||
                err.message ||
                "Terjadi error"
            );
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 space-y-6 pb-32 font-sans animate-in fade-in duration-700 text-left px-4">

            {/* Navigasi */}
            <div className="flex items-center gap-4 pt-6">
                <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 active:scale-90 transition-all">
                    <ArrowLeft size={20} className="text-slate-600" />
                </button>
                <h1 className="text-xl font-black text-slate-800 uppercase  leading-none">
                    Input <span className="text-emerald-700">Volume Pengangkutan</span>
                </h1>
            </div>
            <div className="space-y-6 animate-in slide-in-from-bottom-5">
                {/* Header Objek Terpilih */}
                <div className="bg-slate-900 p-6 rounded-[2.5rem] text-white flex justify-between items-center">
                    <div className="text-left">
                        <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Melayani Objek:</p>
                        <h3 className="text-lg font-black uppercase tracking-tight">{selectedObjek.nama_objek}</h3>
                        <p className="text-[10px] font-bold text-slate-400">{selectedObjek.npor_objek}</p>
                    </div>
                    <button
                        onClick={() => navigate('/pengangkut/monitoring')}
                        className="p-3 bg-white/10 rounded-2xl text-red-400 hover:bg-red-500 hover:text-white"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>

                {/* Form Input Kategori */}
                <div className="grid grid-cols-1 gap-4">
                    {loadingKategori ? (
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Loader2 className="animate-spin" size={14} /> Memuat kategori...
                        </div>
                    ) : (
                        categories.map((cat) => (
                            <div key={cat.id_kategori} className="bg-white p-5 rounded-[2rem] border border-slate-100 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-slate-50 rounded-xl">
                                        <Leaf size={20} className="text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                            {cat.nama_kategori}
                                        </p>
                                        {/* FITUR POIN DINONAKTIFKAN */}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        placeholder="0.0"
                                        className="w-20 p-2 bg-slate-50 border border-slate-100 rounded-xl text-center font-black text-slate-800 outline-none focus:border-emerald-500"
                                        onChange={(e) => handleInputVolume(cat.id_kategori, e.target.value)}
                                    />
                                    <span className="text-[10px] font-bold text-slate-300">{cat.satuan || 'm³'}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Real-time Point Preview - FITUR POIN DINONAKTIFKAN */}

                {/* Tombol Simpan */}
                <button
                    onClick={handleSubmitPengangkutan}
                    className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black uppercase text-sm tracking-[0.2em] shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all">
                    <Save size={20} /> Simpan Data Pengangkutan
                </button>
            </div>
        </div>
    );
};

export default PengangkutInputPoin;
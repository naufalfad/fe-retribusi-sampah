import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Save, Upload, Building2, BadgeCheck,
    FileText, Globe, MapPin, Loader2,
    CheckCircle2, RefreshCcw, Landmark, Eye
} from 'lucide-react';
import api, { BASE_URL } from '../../api/axios';
import SkrdPreviewModal from '../dlh/components/SkrdPreviewModal';
import SsrdPreviewModal from '../dlh/components/SsrdPreviewModal';

const AdminSettings = () => {
    const navigate = useNavigate();
    // --- STATES ---
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [showToast, setShowToast] = useState(false);
    const [logoPreview, setLogoPreview] = useState(null);
    const [logoFile, setLogoFile] = useState(null); // Menyimpan file asli untuk upload
    const [showSkrd, setShowSkrd] = useState(false);
    const [showSsrd, setShowSsrd] = useState(false);
    const [templateId, setTemplateId] = useState(null);

    // State form sesuai dengan field di database Anda
    const [formData, setFormData] = useState({
        pemda: "",
        dinas: "",
        alamat: "",
        pejabat_nama: "",
        pejabat_nip: "",
        pejabat_jabatan: "",
        prefix_skrd: "",
        prefix_ssrd: ""
    });

    // --- 1. FETCH DATA DARI DATABASE ---
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await api.get('/form/get-template');
                if (response.data.success && response.data.data.length > 0) {
                    const db = response.data.data[0];
                    setTemplateId(db.id_form);
                    setFormData({
                        pemda: db.nama_pemda,
                        dinas: db.dinas_pelaksana,
                        alamat: db.alamat_pemda,
                        pejabat_nama: db.nama_pejabat,
                        pejabat_nip: db.nip_pejabat,
                        pejabat_jabatan: db.jabatan_pejabat,
                        prefix_skrd: db.format_skrd,
                        prefix_ssrd: db.format_ssrd
                    });

                    // Set preview logo dari path server
                    if (db.logo) {
                        const cleanPath = db.logo.replace(/\\/g, '/');
                        setLogoPreview(`${BASE_URL}/${cleanPath}`);
                    }
                }
            } catch (error) {
                console.error("Gagal memuat konfigurasi:", error);
            } finally {
                setIsLoadingData(false);
            }
        };
        fetchConfig();
    }, []);

    // --- 2. HANDLERS ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file); // Simpan file asli untuk upload
            const reader = new FileReader();
            reader.onloadend = () => setLogoPreview(reader.result); // Base64 untuk preview lokal
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (!templateId) return alert("ID Template tidak ditemukan");

        setIsSaving(true);
        const dataSubmit = new FormData();

        // Mapping kembali ke nama field yang diminta backend Anda
        dataSubmit.append('nama_pemda', formData.pemda);
        dataSubmit.append('dinas_pelaksana', formData.dinas);
        dataSubmit.append('alamat_pemda', formData.alamat);
        dataSubmit.append('nama_pejabat', formData.pejabat_nama);
        dataSubmit.append('nip_pejabat', formData.pejabat_nip);
        dataSubmit.append('jabatan_pejabat', formData.pejabat_jabatan);
        dataSubmit.append('format_skrd', formData.prefix_skrd);
        dataSubmit.append('format_ssrd', formData.prefix_ssrd);

        // Tambahkan file logo jika ada perubahan
        if (logoFile) {
            dataSubmit.append('logo', logoFile);
        }

        try {
            const response = await api.put(`/form/update-template/${templateId}`, dataSubmit, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.status === 200) {
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
            }
        } catch (error) {
            console.error("Gagal update template:", error);
            alert(error.response?.data?.message || "Gagal memperbarui konfigurasi");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoadingData) {
        return (
            <div className="h-96 flex items-center justify-center gap-3 font-bold text-gray-400">
                <Loader2 className="animate-spin" /> Memuat Konfigurasi Sistem...
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-24 animate-in fade-in duration-500 font-sans text-left">
            {/* NOTIFIKASI SUKSES */}
            {showToast && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[500] animate-in slide-in-from-bottom-5">
                    <div className="bg-gray-950 text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-4">
                        <CheckCircle2 size={18} className="text-green-500" />
                        <p className="text-sm font-black uppercase tracking-widest">Konfigurasi Berhasil Diperbarui!</p>
                    </div>
                </div>
            )}

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-800 tracking-tighter uppercase leading-none">Konfigurasi REKAS</h1>
                    <p className="text-gray-500 font-medium text-sm mt-1">Personalisasi identitas instansi dan format dokumen resmi daerah.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="group bg-green-700 text-white px-10 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl hover:bg-black transition-all disabled:bg-gray-400"
                >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* PANEL KIRI */}
                <div className="lg:col-span-8 space-y-8 text-left">
                    {/* Identitas Instansi */}
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 bg-gray-950 text-white flex items-center justify-between px-8">
                            <div className="flex items-center gap-3">
                                <Building2 size={20} className="text-green-500" />
                                <span className="font-black uppercase text-[10px] tracking-[0.2em]">Profil Pemerintah Daerah</span>
                            </div>
                        </div>
                        <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-1.5 text-left">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Pemerintah Daerah</label>
                                <input name="pemda" value={formData.pemda} onChange={handleInputChange} type="text" className="w-full p-4 bg-gray-50 border-2 border-gray-50 rounded-2xl outline-none focus:border-green-700 font-bold text-sm" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Dinas Pelaksana</label>
                                <input name="dinas" value={formData.dinas} onChange={handleInputChange} type="text" className="w-full p-4 bg-gray-50 border-2 border-gray-50 rounded-2xl outline-none focus:border-green-700 font-bold text-sm" />
                            </div>
                            <div className="md:col-span-2 space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Alamat Kantor Pelayanan Pusat</label>
                                <textarea name="alamat" value={formData.alamat} onChange={handleInputChange} rows="2" className="w-full p-4 bg-gray-50 border-2 border-gray-50 rounded-2xl outline-none focus:border-green-700 font-bold text-sm"></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Signature */}
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden border-t-4 border-t-blue-600">
                        <div className="p-6 border-b border-gray-50 flex items-center gap-3 px-8 uppercase font-black text-[10px] tracking-widest">
                            <BadgeCheck className="text-blue-600" size={20} /> Otoritas Pengesahan (Signature)
                        </div>
                        <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Pejabat (TTD)</label>
                                <input name="pejabat_nama" value={formData.pejabat_nama} onChange={handleInputChange} type="text" className="w-full p-4 bg-gray-50 border-2 border-gray-50 rounded-2xl outline-none focus:border-blue-600 font-black text-sm uppercase" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">NIP Pejabat</label>
                                <input name="pejabat_nip" value={formData.pejabat_nip} onChange={handleInputChange} type="text" className="w-full p-4 bg-gray-50 border-2 border-gray-50 rounded-2xl outline-none focus:border-blue-600 font-mono font-bold text-sm" />
                            </div>
                            <div className="md:col-span-2 space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Jabatan Struktural</label>
                                <input name="pejabat_jabatan" value={formData.pejabat_jabatan} onChange={handleInputChange} type="text" className="w-full p-4 bg-gray-50 border-2 border-gray-50 rounded-2xl outline-none focus:border-blue-600 font-bold text-sm uppercase" />
                            </div>
                        </div>
                    </div>

                    {/* Pattern */}
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden border-t-4 border-t-amber-500">
                        <div className="p-6 border-b border-gray-50 flex items-center gap-3 px-8 uppercase font-black text-[10px] tracking-widest">
                            <RefreshCcw className="text-amber-500" size={20} /> Pola Penomoran Dokumen
                        </div>
                        <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Format Nomor SKRD</label>
                                <input name="prefix_skrd" value={formData.prefix_skrd} onChange={handleInputChange} type="text" className="w-full p-4 bg-gray-50 border-2 border-gray-50 rounded-2xl outline-none focus:border-amber-500 font-mono font-bold text-sm" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Format Nomor SSRD</label>
                                <input name="prefix_ssrd" value={formData.prefix_ssrd} onChange={handleInputChange} type="text" className="w-full p-4 bg-gray-50 border-2 border-gray-50 rounded-2xl outline-none focus:border-amber-500 font-mono font-bold text-sm" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* PANEL KANAN */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm text-center group">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-8 leading-none">Visual Identitas Dokumen</label>
                        <div className="relative w-40 h-40 mx-auto mb-8 flex items-center justify-center bg-gray-50 rounded-[2.5rem] border-4 border-dashed border-gray-100 overflow-hidden p-6 group-hover:border-green-200 transition-all">
                            {logoPreview ? (
                                <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
                            ) : (
                                <Building2 size={40} className="text-gray-200" />
                            )}
                            <label className="absolute inset-0 bg-gray-900/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center cursor-pointer">
                                <Upload className="text-white" size={32} />
                                <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                            </label>
                        </div>
                        <p className="text-[9px] text-gray-400 italic px-6 mb-2">Logo ini muncul pada KOP surat resmi.</p>
                    </div>

                    <div className="bg-blue-600 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden text-left">
                        <div className="relative z-10">
                            <h4 className="text-xl font-black italic tracking-tighter leading-tight uppercase mb-6">
                                Sistem <br /> Peninjauan
                            </h4>

                            <button
                                onClick={() => navigate('/admin/form-preview')}
                                className="group relative w-full overflow-hidden rounded-[2rem] bg-white p-1 transition-all hover:scale-[1.02] active:scale-95 shadow-2xl"
                            >
                                {/* Konten Utama Tombol */}
                                <div className="relative z-10 flex items-center justify-between bg-white rounded-[1.8rem] px-6 py-5 overflow-hidden">

                                    <div className="relative z-20 text-left">
                                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-600 mb-1">Live Preview</p>
                                        <h5 className="text-[13px] font-black uppercase tracking-tight text-gray-900 flex items-center gap-2">
                                            Lihat Dokumen <span className="text-blue-600 group-hover:translate-x-1 transition-transform">→</span>
                                        </h5>
                                    </div>

                                    <div className="relative z-20 flex -space-x-3 group-hover:space-x-1 transition-all duration-500">
                                        {/* Ikon Representasi SKRD & SSRD */}
                                        <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center text-white shadow-lg group-hover:rotate-[-12deg] transition-all">
                                            <FileText size={18} />
                                        </div>
                                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg group-hover:rotate-[12deg] transition-all">
                                            <Eye size={18} />
                                        </div>
                                    </div>
                                </div>
                            </button>

                            <p className="mt-4 text-[9px] font-medium text-white/60 italic leading-relaxed uppercase tracking-widest text-center px-4">
                                * Pratinjau mencakup tampilan cetak SKRD dan SSRD secara keseluruhan.
                            </p>
                        </div>
                        <FileText size={180} className="absolute -right-12 -bottom-12 opacity-10" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
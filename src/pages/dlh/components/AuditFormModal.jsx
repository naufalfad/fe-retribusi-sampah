import React, { useState, useEffect, act } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    X, Save, MapPin, Info,
    Calculator, Banknote, Loader2, ChevronDown, History
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import api from '../../../api/axios';

const toTitik = (val) => {
    if (!val && val !== 0) return "";
    let stringValue = val.toString().replace(/\D/g, ""); // Hanya ambil angka
    return stringValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

// Menghapus titik agar menjadi angka murni untuk kalkulasi & Database
const toAngka = (val) => {
    if (!val) return 0;
    const clean = val.toString().replace(/\./g, "");
    return parseInt(clean, 10) || 0;
};

// Validasi Schema
const schema = z.object({
    nama_objek: z.string().min(3, "Nama objek harus diisi"),
    alamat_jalan: z.string().min(5, "Alamat jalan diperlukan"),
    rt_rw: z.string().min(1, "RT/RW diperlukan"),
    kecamatan_objek: z.string().min(1, "Kecamatan diperlukan"),
    kelurahan_objek: z.string().min(1, "Kelurahan diperlukan"),
    telepon: z.string().min(10, "Nomor telepon minimal 10 digit"),
    kelas_retribusi: z.string().min(1, "Pilih kelas retribusi"),
    latitude: z.string().min(1, "Latitude diperlukan"),
    longitude: z.string().min(1, "Longitude diperlukan"),
    catatan_audit: z.string().min(10, "Wajib memberikan alasan audit"),
    tarif_audit: z.string().min(1, "Tarif wajib diisi"),
    durasi_audit: z.string().optional(),
    volume_audit: z.string().optional(),
    total_terhutang: z.string().min(1, "Total terhutang wajib diisi"),
    total_terbayar: z.string().min(1, "Total terbayar wajib diisi"),
    total_wajib_bayar: z.string().min(1, "Total wajib bayar wajib diisi"),
});

const LocationPicker = ({ setPosition, setValue }) => {
    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            setPosition([lat, lng]);
            setValue('latitude', lat.toString(), { shouldValidate: true });
            setValue('longitude', lng.toString(), { shouldValidate: true });
        },
    });
    return null;
};

const AuditFormModal = ({ objek, onClose, onSuccess }) => {
    const [type, setType] = useState(objek.kategori_objek === 'Rumah Tinggal' ? 'pribadi' : 'badan');
    const [mapPosition, setMapPosition] = useState([
        objek.lat ? parseFloat(objek.lat) : -6.4797,
        objek.lng ? parseFloat(objek.lng) : 106.8249
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [kelasData, setKelasData] = useState([]);
    const [filteredKelas, setFilteredKelas] = useState([]);

    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            nama_objek: objek.nama_objek,
            alamat_jalan: objek.alamat_objek,
            rt_rw: objek.rt_rw_objek,
            kecamatan_objek: objek.kecamatan_objek,
            kelurahan_objek: objek.kelurahan_objek,
            telepon: objek.telepon_objek,
            kelas_retribusi: objek.id_kelas.toString(),
            latitude: objek.lat ? objek.lat.toString() : "",
            longitude: objek.lng ? objek.lng.toString() : "",
            tarif_audit: "",
            durasi_audit: "1",
            volume_audit: "",
            total_terhutang: "",
            total_terbayar: "",
            total_wajib_bayar: "0",
            catatan_audit: ""
        }
    });

    const watchKelas = watch('kelas_retribusi');
    const watchA = watch('total_terhutang');
    const watchB = watch('total_terbayar');

    useEffect(() => {
        api.get('/objek/all-kelas').then(res => {
            if (res.data.success) setKelasData(res.data.data);
        });
    }, []);

    useEffect(() => {
        const filtered = kelasData.filter(item => {
            if (type === 'pribadi') return item.deskripsi_kelas.includes("Rumah Tinggal") && !item.deskripsi_kelas.includes("Non");
            return !item.deskripsi_kelas.includes("Rumah Tinggal") && (item.deskripsi_kelas.includes("Pertokoan") || item.deskripsi_kelas.includes("Perkantoran"));
        });
        setFilteredKelas(filtered);
    }, [type, kelasData]);

    const activeClass = filteredKelas.find(item => item.id_kelas.toString() === watchKelas);

    useEffect(() => {
        if (activeClass) {
            const tarifDasar = activeClass.tarif_kelas ? activeClass.tarif_kelas.toString() : "0";
            setValue('tarif_audit', tarifDasar);
        }
    }, [activeClass, setValue]);

    useEffect(() => {
        const a = toAngka(watchA);
        const b = toAngka(watchB);
        setValue('total_wajib_bayar', toTitik(a - b));
    }, [watchA, watchB, setValue]);

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const payload = {
                ...data,
                id_objek: objek.id_objek,
                id_kelas_temuan: data.kelas_retribusi,
                tarif_audit: toAngka(data.tarif_audit),
                total_terhutang: toAngka(data.total_terhutang),
                total_terbayar: toAngka(data.total_terbayar),
                total_wajib_bayar: toAngka(data.total_wajib_bayar),
            };

            await api.put('/objek/submit-audit', payload);
            alert("Hasil Audit Manual Berhasil Disimpan.");
            onSuccess();
            onClose();
        } catch (error) {
            alert("Gagal menyimpan data audit.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-6xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">

                {/* HEADER */}
                <div className="bg-slate-950 p-8 text-white flex justify-between items-center border-b border-white/5">
                    <div className="text-left">
                        <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                            <History size={24} className="text-red-500" /> Lembar Audit Lapangan
                        </h2>
                        <div className="flex gap-4 mt-1 opacity-60 text-[10px] font-bold uppercase tracking-widest">
                            <span>NPWRD: {objek.Subjek?.npwrd_subjek}</span>
                            <span className="w-1.5 h-1.5 bg-white/20 rounded-full my-auto"></span>
                            <span>NPOR: {objek.npor_objek}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all text-slate-400"><X size={28} /></button>
                </div>

                <div className="overflow-y-auto custom-scrollbar p-8 bg-gray-50/50">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                            {/* KIRI: DATA FISIK & SURVEY */}
                            <div className="space-y-6">
                                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6 text-left">
                                    <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] border-b pb-3 flex items-center gap-2">
                                        <MapPin size={14} /> 1. Koreksi Lokasi & Klasifikasi
                                    </h3>

                                    {/* Toggle Kategori */}
                                    <div className="flex p-1.5 bg-gray-100 rounded-2xl mb-4">
                                        <button type="button" onClick={() => setType('pribadi')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all text-[10px] font-black uppercase ${type === 'pribadi' ? 'bg-white shadow-md text-slate-900' : 'text-gray-400'}`}>
                                            Rumah Tinggal
                                        </button>
                                        <button type="button" onClick={() => setType('badan')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all text-[10px] font-black uppercase ${type === 'badan' ? 'bg-white shadow-md text-slate-900' : 'text-gray-400'}`}>
                                            Non Rumah Tinggal
                                        </button>
                                    </div>

                                    <FormInput label="Nama Objek" name="nama_objek" register={register} errors={errors} />
                                    <FormInput label="Alamat Lengkap" name="alamat_jalan" register={register} errors={errors} />

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormInput label="Kecamatan" name="kecamatan_objek" register={register} errors={errors} />
                                        <FormInput label="Kelurahan" name="kelurahan_objek" register={register} errors={errors} />
                                    </div>

                                    {/* Klasifikasi Kelas - TAMPIL LAGI */}
                                    <FormSelect
                                        label="Klasifikasi Kelas Seharusnya"
                                        name="kelas_retribusi"
                                        register={register}
                                        errors={errors}
                                        options={filteredKelas.map(k => ({ id: k.id_kelas, label: k.deskripsi_kelas }))}
                                    />

                                    {activeClass && (
                                        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-between">
                                            <p className="text-[10px] font-black text-blue-700 uppercase">Tarif Ref:</p>
                                            <p className="text-sm font-black text-blue-800">Rp {Number(activeClass.tarif_kelas || 0).toLocaleString()}</p>
                                        </div>
                                    )}

                                    <div className="h-48 w-full rounded-3xl overflow-hidden border-2 border-gray-100 z-0">
                                        <MapContainer center={mapPosition} zoom={15} style={{ height: '100%', width: '100%' }}>
                                            <TileLayer url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" />
                                            <Marker position={mapPosition} />
                                            <LocationPicker setPosition={setMapPosition} setValue={setValue} />
                                        </MapContainer>
                                    </div>
                                </div>
                            </div>

                            {/* KANAN: DATA FINANSIAL (INPUT MANUAL) */}
                            <div className="space-y-6">
                                <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-xl space-y-6 text-left relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-5">
                                        <Calculator size={160} />
                                    </div>

                                    <h3 className="relative z-10 text-[10px] font-black text-green-400 uppercase tracking-[0.2em] border-b border-white/10 pb-4 flex items-center gap-2">
                                        <Banknote size={14} /> 2. Perhitungan Manual (Audit Hasil Survey)
                                    </h3>

                                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Field Tarif (ReadOnly) */}
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Tarif Retribusi (Sistem)</label>
                                            <input
                                                readOnly
                                                {...register('tarif_audit')}
                                                className="w-full p-4 bg-white/5 border border-white/20 rounded-2xl font-black text-slate-500 outline-none cursor-not-allowed"
                                            />
                                        </div>

                                        {/* --- KONDISI DINAMIS DI SINI --- */}
                                        {type === 'pribadi' ? (
                                            <div className="space-y-1 animate-in fade-in slide-in-from-right-2">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Durasi Pelanggaran (Bulan)</label>
                                                <input
                                                    type="number"
                                                    {...register('durasi_audit')}
                                                    onWheel={(e) => e.target.blur()}
                                                    className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl font-black text-white outline-none focus:border-green-400"
                                                    placeholder="0"
                                                />
                                            </div>
                                        ) : (
                                            <div className="space-y-1 animate-in fade-in slide-in-from-right-2">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Volume Temuan (m³)</label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        {...register('volume_audit')}
                                                        onWheel={(e) => e.target.blur()}
                                                        className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl font-black text-white outline-none focus:border-green-400"
                                                        placeholder="0"
                                                    />
                                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/20">M3</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* FIELD A: TERHUTANG */}
                                        <div className="md:col-span-2 space-y-1.5 pt-4 border-t border-white/5">
                                            <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest ml-1 flex justify-between">
                                                <span>A. Total Retribusi Terhutang (Rp)</span>
                                                <span className="text-[8px] italic opacity-50">Input Manual</span>
                                            </label>
                                            <input
                                                type="text"
                                                {...register('total_terhutang')}
                                                onChange={(e) => setValue('total_terhutang', toTitik(e.target.value))}
                                                className="w-full p-5 bg-blue-500/10 border border-blue-500/20 rounded-2xl font-black text-2xl text-blue-400 outline-none focus:bg-blue-500/20"
                                                placeholder="0"
                                            />
                                        </div>

                                        {/* FIELD B: TELAH DIBAYAR */}
                                        <div className="md:col-span-2 space-y-1.5">
                                            <label className="text-[10px] font-bold text-red-400 uppercase tracking-widest ml-1 flex justify-between">
                                                <span>B. Retribusi Telah Dibayar (Rp)</span>
                                                <span className="text-[8px] italic opacity-50">Input Manual</span>
                                            </label>
                                            <input
                                                type="text"
                                                {...register('total_terbayar')}
                                                onChange={(e) => setValue('total_terbayar', toTitik(e.target.value))}
                                                className="w-full p-5 bg-red-500/10 border border-red-500/20 rounded-2xl font-black text-2xl text-red-400 outline-none focus:bg-red-500/20"
                                                placeholder="0"
                                            />
                                        </div>

                                        {/* FIELD C: HASIL SELISIH (HASIL KALKULASI) */}
                                        <div className="md:col-span-2 bg-gradient-to-r from-green-600 to-emerald-700 p-8 rounded-[2.5rem] mt-4 shadow-lg border border-green-500/30">
                                            <label className="block text-[10px] font-black text-white/70 uppercase tracking-widest mb-3">C. Total Retribusi Kurang / Lebih Bayar (Rp)</label>
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-white/20 rounded-2xl">
                                                    <Calculator className="text-white" size={32} />
                                                </div>
                                                <div className="flex-1">
                                                    <input
                                                        readOnly
                                                        type="text"
                                                        {...register('total_wajib_bayar')}
                                                        className="w-full bg-transparent font-black text-5xl text-white outline-none p-0 tracking-tighter"
                                                    />
                                                    <p className="text-[9px] text-white/50 font-bold uppercase mt-2 italic">Otomatis: (A - B)</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Catatan Audit */}
                                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm text-left">
                                    <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest border-b pb-3 mb-4 flex items-center gap-2">
                                        <Info size={14} className="text-blue-600" /> 3. Narasi Temuan Audit
                                    </h3>
                                    <textarea
                                        {...register('catatan_audit')}
                                        className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-slate-900 text-xs font-bold h-28"
                                        placeholder="Tuliskan justifikasi perubahan data dan perhitungan manual di sini..."
                                    />
                                    {errors.catatan_audit && <p className="text-[10px] text-red-500 font-bold mt-2">{errors.catatan_audit.message}</p>}
                                </div>
                            </div>
                        </div>

                        {/* ACTIONS */}
                        <div className="flex gap-4 pt-6">
                            <button type="button" onClick={onClose} className="flex-1 py-5 bg-white border border-gray-200 text-gray-400 font-black rounded-3xl uppercase text-xs hover:bg-gray-50 transition-all">Batalkan</button>
                            <button type="submit" disabled={isLoading} className="flex-[2] py-5 bg-slate-950 text-white font-black rounded-3xl uppercase text-xs flex items-center justify-center gap-3 shadow-2xl hover:bg-red-600 transition-all active:scale-95 disabled:opacity-50">
                                {isLoading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                                Simpan Audit & Terbitkan Sanksi
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// Sub-komponen Input
const FormInput = ({ label, name, register, errors }) => (
    <div className="flex flex-col gap-1.5 w-full">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
        <input {...register(name)} className={`w-full p-4 bg-gray-50 border-2 rounded-2xl outline-none font-bold text-sm transition-all ${errors[name] ? 'border-red-500 bg-red-50' : 'border-gray-50 focus:border-blue-600 focus:bg-white'}`} />
        {errors[name] && <span className="text-[9px] text-red-500 font-bold ml-1">{errors[name].message}</span>}
    </div>
);

// Sub-komponen Select
const FormSelect = ({ label, name, register, errors, options }) => (
    <div className="flex flex-col gap-1.5 w-full">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
        <div className="relative group">
            <select {...register(name)} className={`w-full p-4 bg-gray-50 border-2 border-gray-50 rounded-2xl outline-none font-bold text-sm appearance-none cursor-pointer focus:border-blue-600 focus:bg-white transition-all`}>
                <option value="">-- Pilih Kelas --</option>
                {options.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-focus-within:text-blue-600" size={18} />
        </div>
        {errors[name] && <span className="text-[9px] text-red-500 font-bold ml-1">{errors[name].message}</span>}
    </div>
);

export default AuditFormModal;
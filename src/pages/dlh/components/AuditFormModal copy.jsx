import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Building2, User, Save, Banknote, TrendingUp, History, Calculator,
    AlertTriangle, ArrowRight, CalendarDays, Info, AlertCircle, MapPin, Loader2, X, ChevronDown
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import api from '../../../api/axios';

// Validasi Schema ditingkatkan
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
    catatan_audit: z.string().min(10, "Berikan alasan perubahan minimal 10 karakter"),
    tgl_mulai_pelanggaran: z.string().min(1, "Tanggal mulai pelanggaran wajib diisi"), // Tambahan
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
            catatan_audit: "",
            tgl_mulai_pelanggaran: new Date().toISOString().split('T')[0] // Default hari ini
        }
    });
    const watchKelas = watch('kelas_retribusi');
    const watchTgl = watch('tgl_mulai_pelanggaran');

    useEffect(() => {
        api.get('/objek/all-kelas').then(res => {
            if (res.data.success) {
                setKelasData(res.data.data);
            }
        });
    }, []);

    useEffect(() => {
        const filtered = kelasData.filter(item => {
            if (type === 'pribadi') return item.deskripsi_kelas.includes("Rumah Tinggal") && !item.deskripsi_kelas.includes("Non");
            return !item.deskripsi_kelas.includes("Rumah Tinggal") && (item.deskripsi_kelas.includes("Pertokoan") || item.deskripsi_kelas.includes("Perkantoran"));
        });
        setFilteredKelas(filtered);
    }, [type, kelasData]);

    const activeClass = filteredKelas.find(item => item.id_kelas.toString() === watch('kelas_retribusi'));

    // Deteksi jika terjadi perubahan kategori dari Rumah Tinggal ke Non Rumah Tinggal (Fraud Check)
    const isPotentiallyFraud = objek.kategori_objek === 'Rumah Tinggal' && type === 'badan';

    const billingSimulasi = useMemo(() => {
        if (!activeClass || !watchTgl) return null;

        const start = new Date(watchTgl);
        const now = new Date();
        const durasiBulan = Math.max(0, (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()));

        const pelayananUtama = activeClass.pelayanan && activeClass.pelayanan.length > 0
            ? activeClass.pelayanan[0]
            : null;

        const tarifPerM3 = pelayananUtama ? parseFloat(pelayananUtama.tarif_pelayanan) : 0;

        const asumsiVolume = activeClass.asumsi_volume_audit || 10;
        const isNonRumah = !activeClass.deskripsi_kelas.includes("Rumah Tinggal");

        // Tarif seharusnya (per bulan)
        const tarifSeharusnya = isNonRumah
            ? (asumsiVolume * tarifPerM3)
            : parseFloat(activeClass.tarif_kelas);
        const tarifTerbayar = parseFloat(objek.tarif_pokok_objek || 0);

        const selisihPerBulan = Math.max(0, tarifSeharusnya - tarifTerbayar);
        const totalSelisihPokok = selisihPerBulan * durasiBulan;
        const dendaSanksi = totalSelisihPokok * 0.5;
        const grandTotal = totalSelisihPokok + dendaSanksi;

        return {
            durasiBulan,
            tarifSeharusnya,
            tarifTerbayar,
            selisihPerBulan,
            totalSelisihPokok,
            dendaSanksi,
            grandTotal,
            namaPelayanan: pelayananUtama?.nama_pelayanan || 'Tarif Dasar'
        };
    }, [activeClass, watchTgl, objek.tarif_pokok_objek]);

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            // Sesuaikan payload dengan parameter backend Anda
            await api.put('/objek/submit-audit', {
                id_objek: objek.id_objek,
                id_kelas: objek.id_kelas, // ID Kelas Lama
                id_kelas_temuan: data.kelas_retribusi, // ID Kelas Baru
                nama_objek: data.nama_objek,
                alamat_objek: data.alamat_jalan,
                rt_rw: data.rt_rw,
                kecamatan_objek: data.kecamatan_objek,
                kelurahan_objek: data.kelurahan_objek,
                latitude: data.latitude,
                longitude: data.longitude,
                tgl_mulai_pelanggaran: data.tgl_mulai_pelanggaran,
                catatan_audit: data.catatan_audit
            });
            alert("Audit Berhasil disimpan. Data objek dan denda (jika ada) telah diproses.");
            onSuccess();
            onClose();
        } catch (error) {
            alert(error.response?.data?.message || "Gagal menyimpan audit.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[95vh]">

                <div className="bg-slate-900 p-8 text-white flex justify-between items-center relative">
                    <div className="text-left">
                        <h2 className="text-2xl font-bold uppercase tracking-widest leading-none">Audit Survey Objek</h2>
                        <p className="text-xs opacity-60 mt-2 font-bold uppercase tracking-tighter">NPOR: {objek.npor_objek}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all text-white"><X size={24} /></button>
                </div>

                <div className="overflow-y-auto custom-scrollbar p-8">
                    <div className="flex p-2 bg-gray-100 rounded-2xl mb-8">
                        <button type="button" onClick={() => setType('pribadi')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${type === 'pribadi' ? 'bg-white shadow-md text-slate-900 font-bold' : 'text-gray-400'}`}>
                            <User size={18} /> Rumah Tinggal
                        </button>
                        <button type="button" onClick={() => setType('badan')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${type === 'badan' ? 'bg-white shadow-md text-slate-900 font-bold' : 'text-gray-400'}`}>
                            <Building2 size={18} /> Non Rumah Tinggal
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">

                            <div className="md:col-span-2 border-b pb-2 flex items-center gap-2">
                                <MapPin size={18} className="text-red-600" />
                                <h3 className="font-black text-xs uppercase tracking-widest text-gray-800">1. Alamat & Kontak Objek (Revisi)</h3>
                            </div>

                            <FormInput label="Nama Objek" name="nama_objek" register={register} errors={errors} />
                            <FormInput label="Jalan / No. Rumah" name="alamat_jalan" register={register} errors={errors} />
                            <FormInput label="RT / RW" name="rt_rw" register={register} errors={errors} />
                            <FormInput label="Nomor Telepon / WA" name="telepon" register={register} errors={errors} />
                            <FormInput label="Kecamatan" name="kecamatan_objek" register={register} errors={errors} />
                            <FormInput label="Kelurahan / Desa" name="kelurahan_objek" register={register} errors={errors} />

                            <div className="md:col-span-2 border-b pb-2 pt-4 flex items-center gap-2">
                                <Info size={18} className="text-red-600" />
                                <h3 className="font-black text-xs uppercase tracking-widest text-gray-800">2. Klasifikasi Retribusi (Audit)</h3>
                            </div>

                            <div className="md:col-span-2">
                                <FormSelect
                                    label="Pilih Kelas Objek"
                                    name="kelas_retribusi"
                                    register={register}
                                    errors={errors}
                                    options={filteredKelas.map(k => ({ id: k.id_kelas, label: k.deskripsi_kelas }))}
                                />
                                {activeClass && (
                                    <div className={`mt-4 p-6 rounded-[2rem] border animate-in fade-in duration-300 ${isPotentiallyFraud ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
                                        <div className="flex justify-between items-center">
                                            <div className="text-left">
                                                <h4 className={`font-black uppercase text-xs ${isPotentiallyFraud ? 'text-red-700' : 'text-slate-800'}`}>{activeClass.nama_kelas}</h4>
                                                <p className="text-[10px] text-slate-400 italic mt-1">{activeClass.deskripsi_kelas}</p>
                                            </div>
                                            <div className="text-right bg-white p-3 rounded-2xl shadow-sm border border-slate-200">
                                                <span className="text-[9px] font-black text-slate-400 uppercase block mb-1 tracking-widest">Tarif Pokok Baru</span>
                                                <p className="text-xl font-black text-red-600">Rp {Number(activeClass.tarif_kelas || 0).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Section 3 (Map) */}
                            <div className="md:col-span-2 border-b pb-2 pt-4 flex items-center gap-2">
                                <MapPin size={18} className="text-red-600" />
                                <h3 className="font-black text-xs uppercase tracking-widest text-gray-800">3. Titik Koordinat Audit</h3>
                            </div>
                            <div className="md:col-span-2 relative h-64 w-full rounded-3xl overflow-hidden border-2 border-gray-100 z-0">
                                <MapContainer center={mapPosition} zoom={15} style={{ height: '100%', width: '100%' }}>
                                    <TileLayer url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" />
                                    <Marker position={mapPosition} />
                                    <LocationPicker setPosition={setMapPosition} setValue={setValue} />
                                </MapContainer>
                            </div>
                            <FormInput label="Latitude" name="latitude" register={register} errors={errors} readOnly />
                            <FormInput label="Longitude" name="longitude" register={register} errors={errors} readOnly />

                            {/* --- SECTION 4: PARAMETER SANKSI & SIMULASI --- */}
                            <div className="md:col-span-2 border-b pb-2 pt-4 flex items-center gap-2">
                                <History size={18} className="text-red-600" />
                                <h3 className="font-black text-xs uppercase tracking-widest text-gray-800">4. Penagihan Mundur & Simulasi Beban</h3>
                            </div>

                            <div className="md:col-span-1 space-y-4">
                                <FormInput
                                    label="Terhitung Sejak Tanggal"
                                    name="tgl_mulai_pelanggaran"
                                    register={register}
                                    errors={errors}
                                    type="date"
                                />
                                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3 italic">
                                    <Info size={16} className="text-amber-600 shrink-0" />
                                    <p className="text-[10px] text-amber-800 font-bold leading-tight uppercase tracking-tighter">
                                        Data volume dihitung berdasarkan asumsi minimal kelas temuan dikalikan tarif standar pelayanan m³.
                                    </p>
                                </div>
                            </div>

                            {/* PANEL TRANSPARANSI SIMULASI */}
                            <div className="md:col-span-1">
                                {billingSimulasi && billingSimulasi.durasiBulan > 0 ? (
                                    <div className="bg-white border-2 border-red-100 rounded-[2rem] overflow-hidden shadow-sm animate-in zoom-in-95">
                                        <div className="bg-red-600 p-4 text-center">
                                            <p className="text-[10px] font-black text-white uppercase tracking-widest">Estimasi Total Tagihan SKRDKB</p>
                                            <h4 className="text-2xl font-black text-white">Rp {billingSimulasi.grandTotal.toLocaleString('id-ID')}</h4>
                                        </div>
                                        <div className="p-5 space-y-3">
                                            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b pb-2">
                                                <span>Durasi Pelanggaran</span>
                                                <span className="text-slate-800">{billingSimulasi.durasiBulan} Bulan</span>
                                            </div>

                                            <div className="space-y-2 py-1">
                                                <div className="flex justify-between text-[11px] font-bold">
                                                    <span className="text-slate-500 italic">Tarif Seharusnya / Bln</span>
                                                    <span className="text-slate-900">Rp {billingSimulasi.tarifSeharusnya.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-[11px] font-bold">
                                                    <span className="text-slate-500 italic">Tarif Terbayar / Bln</span>
                                                    <span className="text-red-500">- Rp {billingSimulasi.tarifTerbayar.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-[11px] font-black border-t pt-2 border-dashed">
                                                    <span className="text-slate-800 uppercase">Selisih Pokok</span>
                                                    <span className="text-slate-900">Rp {billingSimulasi.totalSelisihPokok.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-[11px] font-black">
                                                    <span className="text-amber-600 uppercase">Denda Admin (50%)</span>
                                                    <span className="text-amber-600">+ Rp {billingSimulasi.dendaSanksi.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-[11px] font-bold">
                                                    <span className="text-slate-500 italic">Dasar Tarif ({billingSimulasi.namaPelayanan})</span>
                                                    <span className="text-slate-900">Rp {billingSimulasi.tarifSeharusnya.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                                        <AlertTriangle className="text-slate-300 mb-2" size={32} />
                                        <p className="text-[10px] font-black text-slate-400 uppercase text-center leading-tight">
                                            Pilih tanggal & kelas <br /> untuk melihat simulasi.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Catatan Pemeriksaan Lapangan</label>
                                <textarea
                                    {...register('catatan_audit')}
                                    placeholder="Wajib berikan penjelasan temuan untuk dasar penerbitan sanksi..."
                                    className={`w-full p-4 bg-slate-50 border-2 rounded-2xl outline-none transition-all text-sm font-bold text-gray-700 h-24 ${errors.catatan_audit ? 'border-red-500' : 'border-slate-100 focus:border-slate-900'}`}
                                />
                            </div>
                        </div>

                        {/* Button Action */}
                        <div className="pt-6 flex gap-4">
                            <button type="button" onClick={onClose} className="flex-1 py-5 bg-gray-100 text-gray-400 font-black rounded-2xl uppercase text-[10px] tracking-widest">Batalkan</button>
                            <button type="submit" disabled={isLoading}
                                className="flex-[2] py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-3 hover:bg-red-600 transition-all">
                                {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                Finalisasi & Terbitkan SKRDKB
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

const FormInput = ({ label, name, register, errors, readOnly, placeholder, type = "text" }) => (
    <div className="flex flex-col gap-1.5 text-left">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
        <input
            {...register(name)}
            type={type}
            readOnly={readOnly}
            placeholder={placeholder}
            className={`w-full px-4 py-3.5 rounded-xl border-2 bg-gray-50 outline-none transition-all text-sm font-bold text-gray-700 ${readOnly ? 'opacity-60 cursor-not-allowed' : ''} ${errors[name] ? 'border-red-500' : 'border-gray-100 focus:border-slate-900 focus:bg-white'}`}
        />
        {errors[name] && <span className="text-[10px] text-red-500 font-bold ml-1">{errors[name].message}</span>}
    </div>
);

const FormSelect = ({ label, name, register, errors, options }) => (
    <div className="flex flex-col gap-1.5 text-left">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
        <div className="relative">
            <select {...register(name)} className={`w-full px-4 py-3.5 rounded-xl border-2 bg-gray-50 outline-none appearance-none text-sm font-bold text-gray-700 ${errors[name] ? 'border-red-500' : 'border-gray-100 focus:border-slate-900 focus:bg-white'}`}>
                <option value="">Pilih {label}</option>
                {options.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>
        {errors[name] && <span className="text-[10px] text-red-500 font-bold ml-1">{errors[name].message}</span>}
    </div>
);

export default AuditFormModal;
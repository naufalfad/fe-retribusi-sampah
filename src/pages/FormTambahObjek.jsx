import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import FormInput from '../components/ui/FormInput';
import {
    Building2, User, Upload, Send, ChevronLeft, Search,
    Info, AlertCircle, MapPin, Loader2, FileText, X
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Leaflet Icon Setup
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const schema = z.object({
    nama_objek: z.string().min(3, "Nama objek harus diisi"),
    alamat_jalan: z.string().min(5, "Alamat jalan diperlukan"),
    rt_rw: z.string().min(1, "RT/RW diperlukan"),
    id_provinsi: z.string().min(1, "Pilih Provinsi"),
    id_kabupaten: z.string().min(1, "Pilih Kabupaten"),
    id_kecamatan: z.string().min(1, "Pilih Kecamatan"),
    id_kelurahan: z.string().min(1, "Pilih Kelurahan/Desa"),
    kodepos: z.string().min(1, "Kode Pos otomatis terisi"),
    telepon: z.string().min(10, "Nomor telepon minimal 10 digit"),
    kelas_retribusi: z.string().min(1, "Pilih kelas retribusi"),
    latitude: z.string().min(1, "Latitude diperlukan"),
    longitude: z.string().min(1, "Longitude diperlukan"),
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

const FormTambahObjek = ({ isStaff = false }) => {
    const { id_subjek } = useParams();
    const navigate = useNavigate();
    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { latitude: "", longitude: "" }
    });
    const targetIcon = L.divIcon({
        className: "custom-target-icon",
        html: `
        <div class="target-wrapper">
            <div class="target-outer"></div>
            <div class="target-inner"></div>
            <div class="target-center"></div>
        </div>
    `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
    });

    // --- STATES ---
    const [type, setType] = useState('pribadi'); // 'pribadi' (Rumah Tinggal) atau 'badan' (Non Rumah Tinggal)
    const [kelasData, setKelasData] = useState([]); // Semua data dari API
    const [filteredKelas, setFilteredKelas] = useState([]); // Data yang sudah difilter berdasarkan tipe
    const [mapPosition, setMapPosition] = useState([-6.4797, 106.8249]);
    const [mapType, setMapType] = useState('satellite');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingKelas, setIsFetchingKelas] = useState(true);
    const [allKelurahan, setAllKelurahan] = useState([]); // Master data
    const [filteredKelurahan, setFilteredKelurahan] = useState([]); // Data hasil filter
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchLabel, setSearchLabel] = useState(""); // Teks yang tampil di input

    const selectedKelId = watch('id_kelurahan');

    // 1. Ambil data Kelurahan (beserta relasinya) saat pertama kali buka form
    useEffect(() => {
        const fetchInitialData = async () => {
            const res = await api.get('/wilayah/search-kelurahan?q=');
            if (res.data.success) {
                setAllKelurahan(res.data.data);
                setFilteredKelurahan(res.data.data);
            }
        };
        fetchInitialData();
    }, []);

    // 2. Logic Filter saat user mengetik
    const handleSearch = async (e) => {
        const val = e.target.value;
        setSearchLabel(val);
        setIsDropdownOpen(true);

        try {
            const res = await api.get(`/wilayah/search-kelurahan?q=${val}`);
            if (res.data.success) {
                setFilteredKelurahan(res.data.data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // 3. Logic saat item dipilih
    const handleSelectKelurahan = (kel) => {
        // Set field ID ke React Hook Form
        setValue('id_kelurahan', kel.id, { shouldValidate: true });
        setValue('id_kecamatan', kel.RefKecamatan?.id);
        setValue('id_kabupaten', kel.RefKecamatan?.RefKabupaten?.id);
        setValue('id_provinsi', kel.RefKecamatan?.RefKabupaten?.RefProvinsi?.id);
        setValue('kodepos', kel.kode_pos);

        // Set Label yang tampil
        setSearchLabel(kel.name);

        // Update Map
        if (kel.lokasi && kel.lokasi.coordinates) {
            const [lng, lat] = kel.lokasi.coordinates;
            setMapPosition([lat, lng]);
            setValue('latitude', lat.toString());
            setValue('longitude', lng.toString());
        }

        setIsDropdownOpen(false);
    };

    const activeKelData = allKelurahan.find(k => k.id === selectedKelId);

    // --- 1. FETCH DATA KELAS DARI API ---
    useEffect(() => {
        const fetchKelas = async () => {
            try {
                const response = await api.get('/objek/all-kelas');
                if (response.data.success) {
                    setKelasData(response.data.data);
                }
            } catch (error) {
                console.error("Gagal mengambil data kelas:", error);
            } finally {
                setIsFetchingKelas(false);
            }
        };
        fetchKelas();
    }, []);

    // --- 2. FILTER KELAS BERDASARKAN TIPE ---
    useEffect(() => {
        if (kelasData.length > 0) {
            const filtered = kelasData.filter(item => {
                if (type === 'pribadi') {
                    // Mencari yang namanya mengandung "Rumah Tinggal" tapi bukan "Non Rumah Tinggal"
                    return item.deskripsi_kelas.includes("Rumah Tinggal") && !item.deskripsi_kelas.includes("Non");
                } else {
                    // Non Rumah Tinggal (boleh Pertokoan ATAU Perkantoran)
                    return (
                        !item.deskripsi_kelas.includes("Rumah Tinggal") &&
                        (item.deskripsi_kelas.includes("Pertokoan") || item.deskripsi_kelas.includes("Perkantoran"))
                    );
                }
            });
            setFilteredKelas(filtered);
            setValue('kelas_retribusi', ''); // Reset pilihan kelas saat ganti tipe
        }
    }, [type, kelasData, setValue]);

    // Ambil detail kelas yang sedang dipilih user
    const selectedKelasId = watch('kelas_retribusi');
    const activeClass = filteredKelas.find(item => item.id_kelas.toString() === selectedKelasId);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
    };

    const removeFile = (index) => {
        setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };

    const onSubmit = async (data) => {
        if (!id_subjek) return alert("ID Subjek tidak valid");

        setIsLoading(true);
        const formData = new FormData();
        formData.append('id_kelas', data.kelas_retribusi);
        formData.append('kategori_objek', type === 'pribadi' ? 'Rumah Tinggal' : 'Non Rumah Tinggal');
        formData.append('nama_objek', data.nama_objek);
        formData.append('alamat_objek', data.alamat_jalan);
        formData.append('rt_rw_objek', data.rt_rw);
        formData.append('telepon_objek', data.telepon);
        formData.append('koordinat_objek', `${data.latitude},${data.longitude}`);

        const selectedKel = allKelurahan.find(k => k.id === data.id_kelurahan);
        formData.append('provinsi_objek', selectedKel?.RefKecamatan?.RefKabupaten?.RefProvinsi?.name || '');
        formData.append('kabupaten_objek', selectedKel?.RefKecamatan?.RefKabupaten?.name || '');
        formData.append('kecamatan_objek', selectedKel?.RefKecamatan?.name || '');
        formData.append('kelurahan_objek', selectedKel?.name || '');
        formData.append('kode_pos_objek', data.kodepos);

        selectedFiles.forEach(file => {
            formData.append('dokumen_objek', file);
        });

        try {
            const response = await api.post(`/objek/tambah-objek/${id_subjek}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert(response.data.message);
            navigate(isStaff ? navigate(-1) : '/dashboard');
        } catch (error) {
            alert(error.response?.data?.message || "Gagal menambah objek");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pt-6 pb-12 px-4">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 font-bold hover:text-green-700 mb-6 group">
                <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                Kembali
            </button>

            <div className="bg-white shadow-xl rounded-[2.5rem] overflow-hidden border border-gray-100">
                <div className={`${isStaff ? 'bg-gray-900' : 'bg-green-700'} p-8 text-white text-center`}>
                    <h2 className="text-2xl font-bold uppercase tracking-widest">
                        {isStaff ? 'Penetapan Objek Baru (NPOR)' : 'Permohonan NPOR baru'}
                    </h2>
                </div>

                {/* Tipe Kategori */}
                <div className="flex p-2 bg-gray-100 m-6 rounded-xl">
                    <button type="button" onClick={() => setType('pribadi')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${type === 'pribadi' ? 'bg-white shadow-md text-green-700 font-bold' : 'text-gray-500'}`}>
                        <User size={18} /> Rumah Tinggal
                    </button>
                    <button type="button" onClick={() => setType('badan')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${type === 'badan' ? 'bg-white shadow-md text-green-700 font-bold' : 'text-gray-500'}`}>
                        <Building2 size={18} /> Non Rumah Tinggal
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                        {/* Section 1: Alamat */}
                        <div className="md:col-span-2 border-b pb-2"><h3 className="font-bold text-gray-800 flex items-center gap-2"><MapPin size={18} className="text-green-700" /> 1. Alamat & Kontak Objek</h3></div>

                        {/* <div className="md:col-span-2">
                            <FormInput label="Nama Objek" name="nama_objek" register={register} errors={errors} placeholder="Contoh: Rumah Tinggal Bpk. Ahmad" />
                        </div> */}
                        <FormInput label="Nama Objek" name="nama_objek" register={register} errors={errors} placeholder="Contoh: Rumah Tinggal Bpk. Ahmad / Toko Ahmad" />
                        <FormInput label="Jalan / No. Rumah" name="alamat_jalan" register={register} errors={errors} />
                        <FormInput label="Nomor Telepon / WA" name="telepon" register={register} errors={errors} />
                        <FormInput label="RT / RW" name="rt_rw" register={register} errors={errors} />
                        {/* SMART SELECT KELURAHAN */}
                        <div className="md:col-span-2 relative">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                Kelurahan / Desa (Cari atau Pilih)
                            </label>

                            <div className="relative group mt-1.5">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <MapPin size={18} />
                                </div>

                                <input
                                    type="text"
                                    placeholder="Klik untuk pilih atau ketik nama desa..."
                                    value={searchLabel}
                                    onChange={handleSearch}
                                    onFocus={() => setIsDropdownOpen(true)}
                                    className={`w-full pl-12 pr-12 py-3.5 bg-gray-50 border-2 rounded-2xl outline-none transition-all text-sm font-bold text-gray-700 
                ${errors.id_kelurahan ? 'border-red-500' : 'border-gray-100 focus:border-green-700'}`}
                                />

                                {/* Ikon Dropdown di kanan */}
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                    <ChevronDown size={18} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                </div>

                                {/* DROPDOWN MENU */}
                                {isDropdownOpen && (
                                    <>
                                        {/* Overlay transparan untuk menutup dropdown saat klik luar */}
                                        <div className="fixed inset-0 z-[998]" onClick={() => setIsDropdownOpen(false)}></div>

                                        <div className="absolute z-[999] left-0 right-0 mt-2 bg-white border border-gray-100 shadow-2xl rounded-2xl max-h-64 overflow-y-auto custom-scrollbar animate-in slide-in-from-top-2">
                                            {filteredKelurahan.length > 0 ? (
                                                filteredKelurahan.map((kel) => (
                                                    <div
                                                        key={kel.id}
                                                        onClick={() => handleSelectKelurahan(kel)}
                                                        className="p-4 hover:bg-green-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
                                                    >
                                                        <div className="flex justify-between items-center">
                                                            <div>
                                                                <p className="text-sm font-black text-gray-800 uppercase">{kel.name}</p>
                                                                <p className="text-[10px] text-gray-400 font-bold uppercase">
                                                                    Kec. {kel.RefKecamatan?.name} • Kab. {kel.RefKecamatan?.RefKabupaten?.name}
                                                                </p>
                                                            </div>
                                                            <span className="text-[10px] font-mono text-green-600 bg-green-50 px-2 py-0.5 rounded">
                                                                {kel.kode_pos}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-8 text-center text-gray-400 italic text-xs">Kelurahan tidak ditemukan...</div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                            {errors.id_kelurahan && <span className="text-[10px] text-red-500 font-bold ml-1">{errors.id_kelurahan.message}</span>}
                        </div>

                        {/* INFO FIELD OTOMATIS (READ ONLY) */}
                        <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-6 rounded-[2rem] border border-gray-100 mt-2">
                            <div className="space-y-1">
                                <label className="text-[8px] font-black text-gray-400 uppercase">Kecamatan</label>
                                <p className="text-xs font-black text-gray-700 uppercase">
                                    {activeKelData?.RefKecamatan?.name || '-'}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[8px] font-black text-gray-400 uppercase">Kabupaten</label>
                                <p className="text-xs font-black text-gray-700 uppercase">
                                    {activeKelData?.RefKecamatan?.RefKabupaten?.name || '-'}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[8px] font-black text-gray-400 uppercase">Provinsi</label>
                                <p className="text-xs font-black text-gray-700 uppercase">
                                    {activeKelData?.RefKecamatan?.RefKabupaten?.RefProvinsi?.name || '-'}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[8px] font-black text-gray-400 uppercase">Kode Pos</label>
                                <p className="text-xs font-black text-green-700">
                                    {activeKelData?.kode_pos || '-'}
                                </p>
                            </div>
                        </div>

                        {/* Section 2: Klasifikasi */}
                        <div className="md:col-span-2 border-b pb-2 pt-4"><h3 className="font-bold text-gray-800 flex items-center gap-2"><Info size={18} className="text-green-700" /> 2. Klasifikasi Retribusi</h3></div>

                        <div className="md:col-span-2">
                            {isFetchingKelas ? (
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 italic py-3"><Loader2 className="animate-spin" size={14} /> Memuat data tarif...</div>
                            ) : (
                                <FormSelect
                                    label="Pilih Kelas Objek"
                                    name="kelas_retribusi"
                                    register={register}
                                    errors={errors}
                                    options={filteredKelas.map(k => ({ id: k.id_kelas, label: k.deskripsi_kelas }))}
                                />
                            )}

                            {/* INFO PANEL DINAMIS DARI API */}
                            {activeClass && (
                                <div className="mt-4 bg-gray-50 p-6 rounded-3xl border border-gray-100 animate-in fade-in duration-300">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-800">
                                                {activeClass.nama_kelas}
                                            </h4>
                                            <p className="text-[11px] text-gray-500 italic mt-1">
                                                {activeClass.deskripsi_kelas}
                                            </p>
                                        </div>

                                        {/* TAMPILAN KHUSUS RUMAH TINGGAL (TARIF FLAT / BULAN) */}
                                        {type === 'pribadi' && activeClass.tarif_kelas && (
                                            <div className="text-right ml-4 bg-white p-3 rounded-2xl shadow-sm border border-green-100">
                                                <span className="text-[9px] font-black text-green-700 uppercase tracking-widest block mb-1">
                                                    Tarif Kelas
                                                </span>
                                                <p className="text-xl font-black text-green-700 leading-none">
                                                    Rp {Number(activeClass.tarif_kelas).toLocaleString()}/Bulan
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* RINCIAN PELAYANAN */}
                                    <div className="space-y-3 border-t pt-4">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            {type === 'pribadi'
                                                ? 'Komponen Tambahan (Jika Ada):'
                                                : 'Rincian Komponen Tarif Pelayanan:'}
                                        </p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {activeClass.pelayanan?.length > 0 ? (
                                                activeClass.pelayanan.map((item) => (
                                                    <div
                                                        key={item.id_pelayanan}
                                                        className="bg-white p-3 rounded-xl border border-gray-100 flex items-center justify-between"
                                                    >
                                                        <span className="text-[10px] font-bold text-gray-600 max-w-[160px] leading-tight">
                                                            {item.nama_pelayanan}
                                                        </span>
                                                        <div className="text-right">
                                                            <span className="text-[11px] font-black text-green-700 block">
                                                                Rp {Number(item.tarif_pelayanan).toLocaleString()}/m³
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-[10px] text-gray-400 italic">
                                                    Tidak ada komponen pelayanan tambahan
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* NOTE KHUSUS RUMAH TINGGAL */}
                                    {type === 'pribadi' && (
                                        <div className="mt-4 flex items-start gap-3 text-[10px] text-blue-700 bg-blue-50 p-3 rounded-xl border border-blue-100">
                                            <Info size={14} className="shrink-0 mt-0.5" />
                                            <p>
                                                Khusus kategori <b>Rumah Tinggal</b>, tagihan akhir adalah
                                                <b> Tarif Kelas (Flat)</b> ditambah biaya volume sampah
                                                (jika melebihi batas standar) yang dihitung per m³.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* MAP & KOORDINAT */}
                        <div className="md:col-span-2 space-y-3 pt-4">
                            <div className="md:col-span-2 border-b pb-2"><h3 className="font-bold text-gray-800 flex items-center gap-2"><MapPin size={18} className="text-green-700" /> 3. Titik Koordinat (Klik pada peta)</h3></div>
                            <div className="relative h-80 w-full rounded-3xl overflow-hidden border-2 border-gray-100 z-0">
                                <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
                                    <button type="button" onClick={() => setMapType('roadmap')} className={`p-2 rounded-xl text-[10px] font-bold shadow-lg ${mapType === 'roadmap' ? 'bg-green-700 text-white' : 'bg-white text-gray-600'}`}>Roadmap</button>
                                    <button type="button" onClick={() => setMapType('satellite')} className={`p-2 rounded-xl text-[10px] font-bold shadow-lg ${mapType === 'satellite' ? 'bg-green-700 text-white' : 'bg-white text-gray-600'}`}>Satelit</button>
                                </div>
                                <MapContainer center={mapPosition} zoom={13} style={{ height: '100%', width: '100%' }}>
                                    <TileLayer url={mapType === 'roadmap' ? "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" : "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"} />
                                    <Marker position={mapPosition} icon={targetIcon} />
                                    <LocationPicker setPosition={setMapPosition} setValue={setValue} />
                                </MapContainer>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormInput label="Latitude" name="latitude" register={register} errors={errors} readOnly />
                                <FormInput label="Longitude" name="longitude" register={register} errors={errors} readOnly />
                            </div>
                        </div>

                        {/* --- SECTION 4: DOKUMEN PENDUKUNG --- */}
                        <div className="md:col-span-2 border-b pb-2 pt-4">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2 uppercase tracking-tighter">
                                <Upload size={18} className="text-green-700" /> 4. Dokumen Pendukung
                            </h3>
                        </div>

                        <div className="md:col-span-2 space-y-4">
                            {/* Dropzone Area */}
                            <label className="group flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-[2rem] cursor-pointer transition-all border-gray-200 bg-gray-50/50 hover:bg-white hover:border-green-500 hover:shadow-xl hover:shadow-green-900/5">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <div className="p-4 bg-white rounded-2xl shadow-sm mb-3 group-hover:scale-110 transition-transform">
                                        <Upload size={28} className="text-green-600" />
                                    </div>
                                    <p className="text-sm font-black text-gray-700 uppercase tracking-widest">Pilih berkas dokumen</p>
                                    <p className="text-[10px] text-gray-400 mt-1 italic font-medium">Klik untuk upload IMB, Foto Lokasi, atau KTP (Bisa pilih banyak)</p>
                                </div>
                                <input type="file" multiple className="hidden" onChange={handleFileChange} />
                            </label>

                            {/* File List Preview */}
                            {selectedFiles.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                    {selectedFiles.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm group hover:border-green-200 transition-all"
                                        >
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                                    <FileText size={18} />
                                                </div>
                                                <div className="flex flex-col overflow-hidden">
                                                    <p className="text-xs font-bold text-gray-700 truncate max-w-[150px] md:max-w-[200px]">
                                                        {file.name}
                                                    </p>
                                                    <p className="text-[9px] text-gray-400 font-medium">
                                                        {(file.size / 1024).toFixed(1)} KB
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => removeFile(index)}
                                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                title="Hapus berkas"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Empty State List (Optional) */}
                            {selectedFiles.length === 0 && (
                                <div className="flex items-center gap-2 px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                                    <AlertCircle size={14} className="text-gray-400" />
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Belum ada dokumen yang dipilih</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-8">
                        <button type="submit" disabled={isLoading} className={`w-full py-5 rounded-2xl font-black text-white shadow-xl flex items-center justify-center gap-3 transition-all ${isStaff ? 'bg-gray-900 hover:bg-black' : 'bg-green-700 hover:bg-green-800'}`}>
                            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                            {isStaff ? 'Simpan' : 'Ajukan Pendaftaran'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const FormSelect = ({ label, name, register, errors, options }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
        <div className="relative group">
            <select {...register(name)} className={`w-full px-4 py-3.5 rounded-xl border-2 bg-gray-50 outline-none transition-all appearance-none text-sm font-bold text-gray-700 ${errors[name] ? 'border-red-500' : 'border-gray-100 focus:border-green-700 focus:bg-white focus:ring-4 focus:ring-green-50'}`}>
                <option value="">Pilih {label}</option>
                {options.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"><ChevronDown size={16} /></div>
        </div>
        {errors[name] && <span className="text-[10px] text-red-500 font-bold ml-1">{errors[name].message}</span>}
    </div>
);

// Impor ChevronDown yang tertinggal
import { ChevronDown } from 'lucide-react';

export default FormTambahObjek;
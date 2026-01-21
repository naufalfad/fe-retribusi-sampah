import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import FormInput from '../../components/ui/FormInput';
import { Building2, User, Upload, Send, ChevronLeft, Calculator, Info, CheckCircle2, MapPin, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Skema Validasi diperbarui untuk mendukung dropdown
const schema = z.object({
    email_akun: z.string().email("Email akun harus valid"),
    nama_obyek: z.string().min(3, "Nama obyek harus diisi"),
    alamat_jalan: z.string().min(5, "Alamat jalan diperlukan"),
    rt_rw: z.string().min(1, "RT/RW diperlukan"),
    kabupaten: z.string().min(1, "Pilih Kabupaten"),
    kecamatan: z.string().min(1, "Pilih Kecamatan"),
    kelurahan: z.string().min(1, "Pilih Kelurahan/Desa"),
    kodepos: z.string().min(1, "Pilih Kode Pos"),
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

const TARIF_REFERENSI = {
    pribadi: [
        {
            id: 'p_1',
            label: 'Rumah Tinggal Kelas 1',
            desc: 'Luas > 350m² / Listrik > 3.500 VA',
            tarif_flat: 12800,
            unit_flat: 'Bulan',
            inclusions: [{ name: 'Pelayanan Sampah TPS/TPST', price: 56950, unit: 'm³' }]
        },
        {
            id: 'p_2',
            label: 'Rumah Tinggal Kelas 2',
            desc: 'Luas 60-350m² / Listrik 900-3.500 VA',
            tarif_flat: 9600,
            unit_flat: 'Bulan',
            inclusions: [{ name: 'Pelayanan Sampah TPS/TPST', price: 56950, unit: 'm³' }]
        },
        {
            id: 'p_3',
            label: 'Rumah Tinggal Kelas 3',
            desc: 'Luas < 60m² / Listrik 450 VA',
            tarif_flat: 6400,
            unit_flat: 'Bulan',
            inclusions: [{ name: 'Pelayanan Sampah TPS/TPST', price: 56950, unit: 'm³' }]
        }
    ],
    badan: [
        {
            id: 'b_1',
            label: 'Non Rumah Tinggal Kelas 1',
            desc: 'Pertokoan, Industri, Restoran, Hotel, Wisata',
            inclusions: [
                { name: 'Pelayanan Sumber Sampah', price: 67000, unit: 'm³' },
                { name: 'Pengangkutan TPS/TPST', price: 60300, unit: 'm³' },
                { name: 'Pemrosesan Akhir (TPA)', price: 50250, unit: 'm³' },
            ]
        },
        {
            id: 'b_2',
            label: 'Non Rumah Tinggal Kelas 2',
            desc: 'Perkantoran, Pasar, RS / Fasilitas Kesehatan',
            inclusions: [
                { name: 'Pelayanan Sumber Sampah', price: 63650, unit: 'm³' },
                { name: 'Pengangkutan TPS/TPST', price: 56950, unit: 'm³' },
                { name: 'Pemrosesan Akhir (TPA)', price: 46900, unit: 'm³' },
            ]
        }
    ]
};

const FormSelect = ({ label, name, register, errors, options, placeholder }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-sm font-bold text-gray-700 ml-1">{label}</label>
        <select
            {...register(name)}
            className={`w-full px-4 py-3 rounded-xl border-2 bg-gray-50 outline-none transition-all focus:bg-white
                ${errors[name] ? 'border-red-500 focus:ring-red-100' : 'border-gray-100 focus:border-green-600 focus:ring-4 focus:ring-green-50'}`}
        >
            <option value="">{placeholder || `Pilih ${label}`}</option>
            {options.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
        </select>
        {errors[name] && <span className="text-[10px] text-red-500 font-bold ml-1">{errors[name].message}</span>}
    </div>
);

const RegistrationForm = ({ isStaff = false }) => {
    const [type, setType] = useState('pribadi');
    const [mapPosition, setMapPosition] = useState([-6.4797, 106.8249]);
    const navigate = useNavigate();

    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            latitude: "",
            longitude: ""
        }
    });

    const listKabupaten = ["Kabupaten Bogor"];
    const listKecamatan = ["Cibinong", "Babakan Madang", "Bojonggede", "Ciampea", "Ciawi"];
    const listKelurahan = ["Pakansari", "Cibinong", "Sukahati", "Harapan Jaya"];
    const listKodePos = ["16911", "16912", "16913", "16914", "16915"];

    const selectedKelas = watch('kelas_retribusi');
    const activeClass = TARIF_REFERENSI[type === 'pribadi' ? 'pribadi' : 'badan'].find(item => item.id === selectedKelas);

    const onSubmit = (data) => {
        console.log("Data Pendaftaran:", { ...data, jenis_kategori: type });
        alert("NPOR berhasil diajukan dengan klasifikasi tarif terpilih!");
        navigate(isStaff ? '/upt/verifikasi' : '/dashboard');
    };

    const backConfig = isStaff
        ? { label: "Kembali ke List NPWRD", action: () => navigate('/upt/list') }
        : { label: "Kembali ke Halaman Dashboard", action: () => navigate('/dashboard') }

    return (
        <div className="max-w-4xl mx-auto pt-6 pb-12 px-4">
            <button
                onClick={backConfig.action}
                className="flex items-center gap-2 text-gray-500 font-bold hover:text-green-700 transition-all mb-6 group"
            >
                <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                {backConfig.label}
            </button>

            <div className="bg-white shadow-xl rounded-[2.5rem] overflow-hidden border border-gray-100">
                <div className={`${isStaff ? 'bg-gray-900' : 'bg-green-700'} p-8 text-white text-center`}>
                    <h2 className="text-2xl font-bold uppercase tracking-widest">
                        {isStaff ? 'Penetapan NPOR baru (UPT)' : 'Permohonan NPOR baru'}
                    </h2>
                    <p className="text-sm opacity-70 mt-1">
                        {isStaff ? 'Otoritas pendaftaran aset untuk akun Wajib Retribusi' :
                            'Daftarkan obyek retribusi ke akun Anda'}
                    </p>
                </div>

                {/* Tipe Kategori */}
                <div className="flex p-2 bg-gray-100 m-6 rounded-xl">
                    <button type="button" onClick={() => { setType('pribadi'); setValue('kelas_retribusi', ''); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${type === 'pribadi' ? 'bg-white shadow-md text-green-700 font-bold' : 'text-gray-500'}`}>
                        <User size={18} /> Rumah Tinggal
                    </button>
                    <button type="button" onClick={() => { setType('badan'); setValue('kelas_retribusi', ''); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${type === 'badan' ? 'bg-white shadow-md text-green-700 font-bold' : 'text-gray-500'}`}>
                        <Building2 size={18} /> Non Rumah Tinggal
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Section 1: Alamat Lengkap */}
                        <div className="md:col-span-2 border-b pb-2 pt-4">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <span className="bg-green-700 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                                Alamat Obyek
                            </h3>
                        </div>

                        {type === 'pribadi' ? (
                            <FormInput
                                label="Nama Obyek"
                                name="nama_obyek"
                                register={register}
                                errors={errors}
                            />
                        ) : (
                            <FormInput
                                label="Nama Badan Usaha/Merek"
                                name="nama_badan"
                                register={register} errors={errors} />
                        )}

                        <FormInput
                            label="Jalan / No. Rumah"
                            name="alamatObyek"
                            register={register} errors={errors} />

                        <FormInput
                            label="Nomor Telepon / WA"
                            name="teleponObyek"
                            register={register} errors={errors} />

                        <FormInput
                            label="RT / RW"
                            name="rt_rwObyek"
                            register={register} errors={errors} />

                        <FormSelect
                            label="Kabupaten"
                            name="kabupatenObyek"
                            register={register}
                            errors={errors}
                            options={listKabupaten}
                        />

                        <FormSelect
                            label="Kecamatan"
                            name="kecamatanObyek"
                            register={register}
                            errors={errors}
                            options={listKecamatan}
                        />

                        <FormSelect
                            label="Desa / Kelurahan"
                            name="kelurahanObyek"
                            register={register}
                            errors={errors}
                            options={listKelurahan}
                        />

                        <FormSelect
                            label="Kode Pos"
                            name="kodeposObyek"
                            register={register}
                            errors={errors}
                            options={listKodePos}
                        />

                        {/* Section 2: KLASIFIKASI & TARIF */}
                        <div className="space-y-6">
                            <div className="md:col-span-2 border-b pb-2 pt-4">
                                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                    <span className="bg-green-700 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                                    Klasifikasi Retribusi & Tarif
                                </h3>
                            </div>

                            <FormSelect
                                label="Pilih Kelas Objek"
                                name="kelas_retribusi"
                                register={register}
                                errors={errors}
                                options={TARIF_REFERENSI[type === 'pribadi' ? 'pribadi' : 'badan']}
                            />

                            {/* INFO PANEL DINAMIS */}
                            {activeClass && (
                                <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 animate-in fade-in duration-300">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="font-bold text-gray-800">{activeClass.label}</h4>
                                            <p className="text-xs text-gray-500 italic">{activeClass.desc}</p>
                                        </div>
                                        {type === 'pribadi' && (
                                            <div className="text-right">
                                                <span className="text-[10px] font-black text-green-700 uppercase tracking-widest block">Tarif Flat</span>
                                                <p className="text-xl font-black text-green-700">Rp {activeClass.tarif_flat.toLocaleString()}<span className="text-xs font-normal">/{activeClass.unit_flat}</span></p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Daftar Pelayanan Otomatis (Muncul untuk Kedua Kategori) */}
                                    <div className="space-y-3 mt-4 border-t pt-4">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rincian Pelayanan Termasuk (Otomatis):</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {activeClass.inclusions.map((s, i) => (
                                                <div key={i} className="bg-white p-3 rounded-xl border border-gray-100 flex items-center gap-3">
                                                    <div className="bg-green-50 p-2 rounded-lg">
                                                        <CheckCircle2 size={16} className="text-green-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] font-bold text-gray-700 leading-tight">{s.name}</p>
                                                        <p className="text-[10px] text-green-600 font-bold">Rp {s.price.toLocaleString()}/{s.unit}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-6 flex items-start gap-3 text-[11px] text-orange-700 font-medium bg-orange-50/50 p-4 rounded-2xl border border-orange-100">
                                        <Info size={16} className="mt-0.5 flex-shrink-0" />
                                        <p>Volume sampah (m³) akan dihitung dan ditetapkan oleh petugas lapangan setelah pendaftaran diverifikasi. Tagihan bulanan Anda adalah gabungan dari <b>Tarif Kelas</b> dan <b>Volume Sampah</b>.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* MAP SELECTION AREA */}
                        <div className="md:col-span-2 space-y-3">
                            <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                                <Navigation size={14} /> Titik Koordinat Objek (Klik pada peta)
                            </label>
                            <div className="h-72 w-full rounded-2xl overflow-hidden border-2 border-gray-100 shadow-inner z-0">
                                <MapContainer center={mapPosition} zoom={13} style={{ height: '100%', width: '100%' }}>
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <Marker position={mapPosition} />
                                    <LocationPicker setPosition={setMapPosition} setValue={setValue} />
                                </MapContainer>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormInput label="Latitude" name="latitude" register={register} errors={errors} readOnly placeholder="Klik peta..." />
                                <FormInput label="Longitude" name="longitude" register={register} errors={errors} readOnly placeholder="Klik peta..." />
                            </div>
                            <p className="text-[10px] text-gray-400 italic font-medium">*Koordinat otomatis terisi saat Anda menandai lokasi di peta.</p>
                        </div>

                        {/* Section 3: Upload Dokumen */}
                        <div className="md:col-span-2 border-b pb-2 pt-4">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <span className="bg-green-700 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                                Dokumen Pendukung
                            </h3>
                        </div>

                        <div className="md:col-span-2">
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-gray-500 hover:border-green-700 transition-colors cursor-pointer">
                                <Upload size={40} className="mb-2 text-gray-400" />
                                <p className="text-sm font-medium">Klik atau seret scan dokumen IMB (Izin Mendirikan Bangunan) di sini</p>
                                <p className="text-xs mt-1">Format: JPG, PNG, atau PDF (Maks. 2MB)</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6">
                        <button type="submit" className={`w-full py-5 rounded-2xl font-black text-white shadow-xl transition-all flex items-center justify-center gap-3 ${isStaff ? 'bg-gray-900 hover:bg-black' : 'bg-green-700 hover:bg-green-800'}`}>
                            <Send size={20} /> {isStaff ? 'Simpan & Tautkan Aset' : 'Ajukan Pendaftaran'}
                        </button>
                        <p className="text-center text-xs text-gray-400 mt-4 italic">
                            *Dengan menekan tombol kirim, Anda setuju bahwa data yang diisi adalah benar sesuai dengan ketentuan yang berlaku.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegistrationForm;
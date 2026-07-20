import React, { useState, useEffect, useRef } from 'react';
import {
    AlertCircle, MapPin, Edit3, Trash2, ArrowLeft,
    Home, Building2, CheckCircle2, Navigation,
    Upload, Info, Loader2, Save, Map as MapIcon, ChevronDown, MousePointer2
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

// Leaflet Icon Setup (Sama dengan FormTambahObjek)
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const ChangeMapView = ({ coords }) => {
    const map = useMap();
    useEffect(() => {
        if (coords) {
            map.setView(coords, map.getZoom());
        }
    }, [coords, map]);
    return null;
};

const LayananPage = () => {
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    // --- STATES ---
    const [step, setStep] = useState('select');
    const [type, setType] = useState('Perubahan Data');
    const [myObjects, setMyObjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedObject, setSelectedObject] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Kelurahan Search States
    const [allKelurahan, setAllKelurahan] = useState([]);
    const [filteredKelurahan, setFilteredKelurahan] = useState([]);
    const [searchTermKelurahan, setSearchTermKelurahan] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

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

    // Form States
    const [formData, setFormData] = useState({
        nama_objek: '',
        alamat_objek: '',
        kategori_objek: '',
        rt_rw_objek: '',
        kelurahan_objek: '',
        kecamatan_objek: '',
        kabupaten_objek: '',
        provinsi_objek: '',
        kode_pos_objek: '',
        telepon_objek: '',
        latitude: '',
        longitude: '',
        alasan: ''
    });

    const [mapPosition, setMapPosition] = useState([-6.4797, 106.8249]);
    const [selectedFile, setSelectedFile] = useState(null);

    // --- 1. FETCH DATA AWAL ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Ganti dengan endpoint asli Anda untuk objek milik user
                const [objRes, kelRes] = await Promise.all([
                    api.get('/objek/objek-saya'),
                    api.get('/wilayah/search-kelurahan?q=')
                ]);
                setMyObjects(objRes.data.data || []);
                if (kelRes.data.success) {
                    setAllKelurahan(kelRes.data.data);
                    setFilteredKelurahan(kelRes.data.data);
                }
            } catch (err) {
                console.error("Gagal load data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- 2. LOGIKA SEARCH KELURAHAN (Identik dengan Ref) ---
    useEffect(() => {
        const search = searchTermKelurahan.toLowerCase();
        const results = allKelurahan.filter(item =>
            (item?.name?.toLowerCase() || "").includes(search) ||
            (item?.RefKecamatan?.name?.toLowerCase() || "").includes(search)
        );
        setFilteredKelurahan(results);
    }, [searchTermKelurahan, allKelurahan]);

    // --- 3. HANDLERS ---
    const handleSelectObject = (obj) => {
        setSelectedObject(obj);
        // Pre-fill data objek ke form
        setFormData({
            nama_objek: obj.nama_objek,
            alamat_objek: obj.alamat_objek,
            kategori_objek: obj.kategori_objek,
            rt_rw_objek: obj.rt_rw_objek,
            kelurahan_objek: obj.kelurahan_objek,
            kecamatan_objek: obj.kecamatan_objek,
            kabupaten_objek: obj.kabupaten_objek,
            provinsi_objek: obj.provinsi_objek,
            kode_pos_objek: obj.kode_pos_objek,
            telepon_objek: obj.telepon_objek,
            latitude: obj.lat?.toString() || '',
            longitude: obj.lng?.toString() || '',
            alasan: ''
        });
        setSearchTermKelurahan(obj.kelurahan_objek || "");
        if (obj.lat && obj.lng) setMapPosition([parseFloat(obj.lat), parseFloat(obj.lng)]);
        setStep('form');
    };

    const handleSelectKelurahan = (kel) => {
        // 1. Ekstrak koordinat dari data lokasi (GeoJSON: [lng, lat])
        let lat = -6.4797; // fallback default
        let lng = 106.8249;

        if (kel.lokasi && kel.lokasi.coordinates) {
            lng = kel.lokasi.coordinates[0];
            lat = kel.lokasi.coordinates[1];
        }

        // 2. Update State Form (Administrative & Coordinate)
        setFormData(prev => ({
            ...prev,
            kelurahan_objek: kel.name,
            kecamatan_objek: kel.RefKecamatan?.name || '',
            kabupaten_objek: kel.RefKecamatan?.RefKabupaten?.name || '',
            provinsi_objek: kel.RefKecamatan?.RefKabupaten?.RefProvinsi?.name || '',
            kode_pos_objek: kel.kode_pos || '',
            latitude: lat.toString(),
            longitude: lng.toString()
        }));

        // 3. Set Label yang tampil di input pencarian
        setSearchTermKelurahan(kel.name);

        // 4. Update Peta (Ini akan mentrigger ChangeMapView untuk bergeser)
        setMapPosition([lat, lng]);

        // 5. Tutup Dropdown
        setShowDropdown(false);
    };

    const LocationPicker = () => {
        useMapEvents({
            click(e) {
                setMapPosition([e.latlng.lat, e.latlng.lng]);
                setFormData(prev => ({ ...prev, latitude: e.latlng.lat.toString(), longitude: e.latlng.lng.toString() }));
            },
        });
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validasi sederhana
        if (!selectedFile) return alert("Harap unggah dokumen pendukung (Surat/Foto)!");
        if (type === 'Penonaktifan' && !formData.alasan) return alert("Alasan penonaktifan wajib diisi!");

        setIsSubmitting(true);

        // 1. Gunakan FormData untuk mengirim File + Data Teks
        const dataSubmit = new FormData();

        // 2. Kirim data dasar
        dataSubmit.append('id_objek', selectedObject.id_objek);
        dataSubmit.append('jenis_pengajuan', type);
        dataSubmit.append('alasan', formData.alasan);

        // 3. Jika jenisnya 'Perubahan Data', bungkus data objek baru ke dalam JSON string
        if (type === 'Perubahan Data') {
            const dataBaruObj = {
                nama_objek: formData.nama_objek,
                alamat_objek: formData.alamat_objek,
                kategori_objek: formData.kategori_objek,
                rt_rw_objek: formData.rt_rw_objek,
                kelurahan_objek: formData.kelurahan_objek,
                kecamatan_objek: formData.kecamatan_objek,
                kabupaten_objek: formData.kabupaten_objek,
                provinsi_objek: formData.provinsi_objek,
                kode_pos_objek: formData.kode_pos_objek,
                telepon_objek: formData.telepon_objek,
                latitude: formData.latitude,
                longitude: formData.longitude
            };
            dataSubmit.append('data_baru', JSON.stringify(dataBaruObj));
        }

        // 4. Masukkan File (Pastikan nama field 'dokumen_layanan' sama dengan multer di BE)
        dataSubmit.append('file_pendukung', selectedFile);

        try {
            const response = await api.post('/layanan/pengajuan', dataSubmit, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                alert("Pengajuan Berhasil Terkirim! Mohon tunggu verifikasi Dinas.");
                setStep('select');
                setSelectedFile(null);
                setSearchTermKelurahan('');
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Gagal mengirim pengajuan.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="h-96 flex flex-col items-center justify-center gap-4 text-slate-400 font-bold uppercase tracking-widest text-xs"><Loader2 className="animate-spin" /> Menghubungkan ke Server...</div>;

    return (
        <div className="space-y-8 pb-24 animate-in fade-in duration-500 font-sans text-left">

            {/* --- HEADER --- */}
            <div className="flex items-center gap-4 px-2">
                {step === 'form' && (
                    <button onClick={() => setStep('select')} className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 active:scale-90 transition-all">
                        <ArrowLeft size={20} className="text-slate-600" />
                    </button>
                )}
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">
                        Layanan <span className="text-green-700">Mandiri</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-sm mt-2 uppercase tracking-widest leading-none">
                        {step === 'select' ? 'Pilih Objek Retribusi' : `Form Pengajuan ${type}`}
                    </p>
                </div>
            </div>

            {/* --- STEP 1: PILIH OBJEK --- */}
            {step === 'select' && (
                myObjects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2">
                        {myObjects.map((obj) => (
                            <div
                                key={obj.id_objek}
                                className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-green-500 transition-all group cursor-pointer"
                                onClick={() => handleSelectObject(obj)}
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`p-4 rounded-2xl ${obj.kategori_objek === 'Non Rumah Tinggal' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                                        {obj.kategori_objek === 'Non Rumah Tinggal' ? <Building2 size={24} /> : <Home size={24} />}
                                    </div>
                                    <span
                                        className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${obj.status_objek?.toLowerCase() === 'aktif'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                            }`}
                                    >
                                        {obj.status_objek}
                                    </span>
                                </div>
                                <h4 className="font-black text-slate-800 uppercase text-lg tracking-tight leading-none mb-2 group-hover:text-green-700 transition-colors">
                                    {obj.nama_objek}
                                </h4>
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-tighter">
                                    <MapPin size={14} className="text-red-500" /> {obj.kelurahan_objek}, {obj.kecamatan_objek}
                                </div>
                                <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                    <span>NPOR: {obj.npor_objek}</span>
                                    <ChevronDown className="-rotate-90" size={16} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-[3rem] border-2 border-dashed border-gray-200 p-16 flex flex-col items-center text-center animate-in zoom-in mx-2">
                        <Building2 size={48} className="text-gray-200 mb-4" />
                        <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">Belum Ada Objek Terdaftar</h3>
                        <p className="text-gray-400 max-w-sm mt-2 text-sm font-medium  ">Anda tidak memiliki aset yang terverifikasi untuk diajukan perubahan.</p>
                    </div>
                )
            )}

            {/* --- STEP 2: FORM PENGAJUAN --- */}
            {step === 'form' && (
                <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex p-2 bg-gray-200 rounded-[2.5rem] w-full md:w-fit mx-auto shadow-inner">
                        <button onClick={() => setType('Perubahan Data')} className={`flex-1 md:flex-none px-12 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${type === 'Perubahan Data' ? 'bg-white text-green-700 shadow-md' : 'text-slate-500'}`}>
                            <Edit3 size={16} className="inline mr-2" /> Perubahan Data
                        </button>
                        <button onClick={() => setType('Penonaktifan')} className={`flex-1 md:flex-none px-12 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${type === 'Penonaktifan' ? 'bg-white text-red-600 shadow-md' : 'text-slate-500'}`}>
                            <Trash2 size={16} className="inline mr-2" /> Penonaktifan
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-white rounded-[3.5rem] border border-gray-100 shadow-2xl overflow-hidden">
                        <div className="p-10 space-y-10">
                            {type === 'Perubahan Data' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="md:col-span-2 border-b border-slate-50 pb-4 flex items-center gap-2">
                                        <Info size={18} className="text-green-700" />
                                        <h3 className="font-black text-xs uppercase tracking-[0.2em] text-green-700">Detail Perubahan Data Objek</h3>
                                    </div>

                                    {/* Kolom Kiri */}
                                    <div className="space-y-6">
                                        {/* <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pilih Kategori Objek (Seharusnya)</label>
                                        <div className="grid grid-cols-2 gap-3 p-1.5 bg-gray-50 rounded-2xl border-2 border-gray-100">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, kategori_objek: 'Rumah Tinggal' })}
                                                className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${formData.kategori_objek === 'Rumah Tinggal' ? 'bg-green-700 text-white shadow-lg' : 'bg-transparent text-slate-400'}`}
                                            >
                                                <Home size={14} /> Rumah
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, kategori_objek: 'Non Rumah Tinggal' })}
                                                className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${formData.kategori_objek === 'Non Rumah Tinggal' ? 'bg-blue-600 text-white shadow-lg' : 'bg-transparent text-slate-400'}`}
                                            >
                                                <Building2 size={14} /> Bisnis/Ruko
                                            </button>
                                        </div> */}
                                        <FormInput label="Nama Objek" value={formData.nama_objek} onChange={(v) => setFormData({ ...formData, nama_objek: v })} />
                                        <FormInput label="Alamata Objek" value={formData.alamat_objek} onChange={(v) => setFormData({ ...formData, alamat_objek: v })} />
                                        <FormInput label="RT / RW" value={formData.rt_rw_objek} onChange={(v) => setFormData({ ...formData, rt_rw_objek: v })} />

                                        {/* Smart Select Kelurahan (Sesuai Referensi) */}
                                        <div className="space-y-1.5 text-left relative" ref={dropdownRef}>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kelurahan / Desa Baru</label>
                                            <div className="relative group">
                                                <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                                <input
                                                    type="text"
                                                    value={searchTermKelurahan}
                                                    onChange={(e) => { setSearchTermKelurahan(e.target.value); setShowDropdown(true); }}
                                                    onFocus={() => setShowDropdown(true)}
                                                    placeholder="Cari Kelurahan..."
                                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-green-600 font-bold text-sm transition-all shadow-inner"
                                                />
                                            </div>
                                            {showDropdown && filteredKelurahan.length > 0 && (
                                                <div className="absolute top-full left-0 right-0 z-[100] mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl max-h-60 overflow-y-auto p-2">
                                                    {filteredKelurahan.map((item, idx) => (
                                                        <div key={idx} onClick={() => handleSelectKelurahan(item)} className="p-4 hover:bg-green-50 rounded-xl cursor-pointer border-b border-gray-50 last:border-0 text-left">
                                                            <p className="text-sm font-black text-slate-800 uppercase">{item.name}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Kec. {item.RefKecamatan?.name}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Auto-filled Info */}
                                        <div className="p-5 bg-blue-50 rounded-3xl border border-blue-100 grid grid-cols-2 gap-4">
                                            <div><p className="text-[8px] font-black text-blue-400 uppercase">Kecamatan</p><p className="text-xs font-bold text-blue-900 uppercase">{formData.kecamatan_objek || '-'}</p></div>
                                            <div><p className="text-[8px] font-black text-blue-400 uppercase">Kode Pos</p><p className="text-xs font-bold text-blue-900">{formData.kode_pos_objek || '-'}</p></div>
                                        </div>
                                        <div className="space-y-8">
                                            {/* <div className="bg-red-50 p-8 rounded-[2.5rem] border border-red-100 flex items-start gap-4">
                                                <AlertCircle className="text-red-600 shrink-0" size={24} />
                                                <p className="text-xs text-red-600 font-medium leading-relaxed uppercase tracking-tight text-left">
                                                    Anda mengajukan pengubahan data retribusi untuk <strong>{selectedObject.nama_objek}</strong>. Harap berikan alasan yang jelas.
                                                </p>
                                            </div> */}
                                            <FormInput label="Alasan Perubahan" value={formData.alasan} onChange={(v) => setFormData({ ...formData, alasan: v })} isTextarea />
                                        </div>
                                    </div>

                                    {/* Kolom Kanan */}
                                    <div className="flex-1 min-h-[450px] relative rounded-[2.5rem] overflow-hidden border-4 border-gray-50 z-0 shadow-inner group">
                                        <MapContainer center={mapPosition} zoom={13} style={{ height: '100%', width: '100%' }}>
                                            <TileLayer url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}" />
                                            <Marker position={mapPosition} icon={targetIcon} />
                                            <LocationPicker />
                                            <ChangeMapView coords={mapPosition} />
                                        </MapContainer>

                                        {/* Overlay Info di Peta */}
                                        <div className="absolute bottom-6 left-6 z-[500] bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-white text-[9px] font-bold uppercase text-slate-500 flex items-center gap-3">
                                            <div className="flex flex-col border-r pr-3">
                                                <span className="text-blue-600">Latitude</span>
                                                <span className="text-slate-800">{formData.latitude}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-blue-600">Longitude</span>
                                                <span className="text-slate-800">{formData.longitude}</span>
                                            </div>
                                        </div>

                                        <div className="absolute top-6 right-6 z-[500] bg-black/80 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase flex items-center gap-2 animate-pulse">
                                            <MousePointer2 size={12} /> Klik Peta Untuk Pin Lokasi
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    <div className="bg-red-50 p-8 rounded-[2.5rem] border border-red-100 flex items-start gap-4">
                                        <AlertCircle className="text-red-600 shrink-0" size={24} />
                                        <p className="text-xs text-red-600 font-medium leading-relaxed uppercase tracking-tight text-left">
                                            Anda mengajukan penghentian layanan retribusi untuk <strong>{selectedObject.nama_objek}</strong>. Harap berikan alasan yang jelas.
                                        </p>
                                    </div>
                                    <FormInput label="Alasan Penonaktifan" value={formData.alasan} onChange={(v) => setFormData({ ...formData, alasan: v })} isTextarea />
                                </div>
                            )}

                            {/* Upload Dokumen */}
                            <div className="pt-6 border-t border-slate-50 text-left">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-4">Berkas Pendukung (Surat Permohonan / Foto)</label>
                                <label className="border-4 border-dashed border-slate-100 rounded-[2.5rem] p-12 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-white hover:border-blue-400 transition-all cursor-pointer group shadow-inner">
                                    <Upload size={32} className="text-blue-600" />
                                    <p className="text-xs font-black text-gray-400 mt-4 uppercase tracking-[0.2em]">{selectedFile ? selectedFile.name : 'Pilih Berkas Scan'}</p>
                                    <input type="file" className="hidden" onChange={(e) => setSelectedFile(e.target.files[0])} />
                                </label>
                            </div>

                            <button type="submit" disabled={isSubmitting} className={`w-full py-6 rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${type === 'Perubahan Data' ? 'bg-green-700 hover:bg-black' : 'bg-red-600 hover:bg-black'} text-white`}>
                                {isSubmitting ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                                {isSubmitting ? 'MEMPROSES...' : `KIRIM PENGAJUAN ${type.toUpperCase()}`}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

const FormInput = ({ label, value, onChange, isTextarea = false, type = "text" }) => (
    <div className="space-y-1.5 text-left w-full">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
        {isTextarea ? (
            <textarea value={value} onChange={(e) => onChange(e.target.value)} rows="4" className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-slate-900 font-bold text-sm transition-all shadow-inner" />
        ) : (
            <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-slate-900 font-bold text-sm transition-all shadow-inner" />
        )}
    </div>
);

export default LayananPage;
import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import FormInput from '../components/ui/FormInput';
import {
    Building2, User, Upload, Send, ChevronLeft, Search,
    Info, AlertCircle, MapPin, Loader2, FileText, X, ChevronDown, CheckCircle2,
    Maximize2, Minimize2, Crosshair, Navigation, Compass, Layers, Check
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
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

const BOGOR_COORDS = [-6.4797, 106.8249];

const MapController = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        if (center && center[0] && center[1] && !isNaN(center[0]) && !isNaN(center[1])) {
            map.setView(center, zoom || map.getZoom());
        }
    }, [center, zoom, map]);
    return null;
};

const MapInvalidateOnMount = () => {
    const map = useMap();
    useEffect(() => {
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 200);
        return () => clearTimeout(timer);
    }, [map]);
    return null;
};

const FullscreenLocationPicker = ({ setSelectedPos }) => {
    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            setSelectedPos([lat, lng]);
        },
    });
    return null;
};

const schema = z.object({
    nama_objek: z.string().min(3, "Nama objek harus diisi"),
    alamat_jalan: z.string().min(5, "Alamat jalan diperlukan"),
    rt_rw: z.string().min(1, "RT/RW diperlukan"),
    id_provinsi: z.any().refine(val => val !== undefined && val !== null && String(val).trim() !== '', "Pilih Provinsi"),
    id_kabupaten: z.any().refine(val => val !== undefined && val !== null && String(val).trim() !== '', "Pilih Kabupaten"),
    id_kecamatan: z.any().refine(val => val !== undefined && val !== null && String(val).trim() !== '', "Pilih Kecamatan"),
    id_kelurahan: z.any().refine(val => val !== undefined && val !== null && String(val).trim() !== '', "Pilih Kelurahan/Desa"),
    kodepos: z.any().refine(val => val !== undefined && val !== null && String(val).trim() !== '', "Kode Pos otomatis terisi"),
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

// Helper parsing JWT token yang tahan error format
const parseJwt = (token) => {
    try {
        if (!token) return null;
        const parts = token.split('.');
        if (parts.length < 2) return null;
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            window.atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
};

const FormTambahObjek = ({ isStaff = false }) => {
    const { id_subjek: paramIdSubjek } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    // Ambil data user yang sedang login dari berbagai sumber (token, subjek, user)
    const currentUser = useMemo(() => {
        let userObj = {};

        // 1. Coba dari token JWT (paling akurat dari backend)
        try {
            const token = localStorage.getItem('token');
            const decoded = parseJwt(token);
            if (decoded && typeof decoded === 'object') {
                userObj = { ...decoded };
            }
        } catch (e) { }

        // 2. Gabungkan dengan localStorage 'subjek'
        try {
            const rawSubjek = localStorage.getItem('subjek');
            if (rawSubjek && rawSubjek !== 'undefined' && rawSubjek !== 'null') {
                const parsed = JSON.parse(rawSubjek);
                if (parsed && typeof parsed === 'object') {
                    userObj = { ...userObj, ...parsed };
                }
            }
        } catch (e) { }

        // 3. Gabungkan dengan localStorage 'user'
        try {
            const rawUser = localStorage.getItem('user');
            if (rawUser && rawUser !== 'undefined' && rawUser !== 'null') {
                const parsed = JSON.parse(rawUser);
                if (parsed && typeof parsed === 'object') {
                    if (parsed.id_subjek || parsed.role === 'User' || !userObj.id_subjek) {
                        userObj = { ...userObj, ...parsed };
                    }
                }
            }
        } catch (e) { }

        return userObj;
    }, []);

    // State untuk data subjek yang ter-resolve
    const [subjekInfo, setSubjekInfo] = useState(null);
    const [resolvedSubjekId, setResolvedSubjekId] = useState(() => {
        if (paramIdSubjek) return paramIdSubjek;
        if (location.state?.id_subjek) return location.state.id_subjek;
        return currentUser.id_subjek || currentUser.id || null;
    });

    const id_subjek = isStaff ? paramIdSubjek : (resolvedSubjekId || paramIdSubjek || currentUser.id_subjek || currentUser.id);

    // Ambil detail Subjek untuk memastikan nama & NPWRD yang didaftarkan
    useEffect(() => {
        const fetchSubjekData = async () => {
            const token = localStorage.getItem('token');
            if (!token && !paramIdSubjek) return;

            // Jika staff dengan paramIdSubjek
            if (isStaff && paramIdSubjek) {
                try {
                    const res = await api.get(`/subjek/detail/${paramIdSubjek}`);
                    if (res.data?.success && res.data.data) {
                        setSubjekInfo(res.data.data);
                    }
                } catch (e) {
                    console.error("Gagal ambil detail subjek staff:", e);
                }
                return;
            }

            // Jika user/wajib retribusi:
            try {
                const targetEndpoint = id_subjek ? `/subjek/detail/${id_subjek}` : '/subjek/me';
                const res = await api.get(targetEndpoint);
                if (res.data?.success && res.data.data) {
                    const data = res.data.data;
                    setSubjekInfo(data);
                    if (data.id_subjek) {
                        setResolvedSubjekId(data.id_subjek);
                        localStorage.setItem('subjek', JSON.stringify(data));
                        localStorage.setItem('user', JSON.stringify({ ...data, role: 'User' }));
                    }
                }
            } catch (err) {
                // Fallback kedua: coba /subjek/me jika targetEndpoint tadi gagal
                try {
                    const resMe = await api.get('/subjek/me');
                    if (resMe.data?.success && resMe.data.data) {
                        const dataMe = resMe.data.data;
                        setSubjekInfo(dataMe);
                        if (dataMe.id_subjek) {
                            setResolvedSubjekId(dataMe.id_subjek);
                            localStorage.setItem('subjek', JSON.stringify(dataMe));
                            localStorage.setItem('user', JSON.stringify({ ...dataMe, role: 'User' }));
                        }
                    }
                } catch (e) {
                    console.warn("Gagal fetch subjek me:", e);
                }
            }
        };

        fetchSubjekData();
    }, [isStaff, paramIdSubjek, id_subjek]);

    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { latitude: "", longitude: "" }
    });
    // --- STATES ---
    const [type, setType] = useState('pribadi'); // 'pribadi' (Rumah Tinggal) atau 'badan' (Non Rumah Tinggal)
    const [kelasData, setKelasData] = useState([]); // Semua data dari API
    const [filteredKelas, setFilteredKelas] = useState([]); // Data yang sudah difilter berdasarkan tipe
    const [mapPosition, setMapPosition] = useState(BOGOR_COORDS);
    const [mapType, setMapType] = useState('satellite');

    // Target titik koordinat interaktif:
    // Jika layer roadmap (latar putih), target berwarna HITAM (#000000)
    // Jika layer satelit (latar gelap), target berwarna PUTIH (#ffffff)
    const targetIcon = useMemo(() => {
        const isRoadmap = mapType === 'roadmap';
        const color = isRoadmap ? '#000000' : '#ffffff';
        const shadowFilter = isRoadmap
            ? 'drop-shadow(0 0 3px rgba(255,255,255,0.95)) drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
            : 'drop-shadow(0 0 3px rgba(0,0,0,0.95)) drop-shadow(0 2px 4px rgba(0,0,0,0.8))';

        return L.divIcon({
            className: `custom-interactive-target ${isRoadmap ? 'target-black' : 'target-white'}`,
            html: `
            <div class="target-wrapper" style="filter: ${shadowFilter}; width: 36px; height: 36px; position: relative;">
                <!-- Crosshairs / Garis Bidik Silang -->
                <div style="position: absolute; top: 0; bottom: 0; left: 17px; width: 2px; background: ${color}; opacity: 0.9;"></div>
                <div style="position: absolute; left: 0; right: 0; top: 17px; height: 2px; background: ${color}; opacity: 0.9;"></div>
                
                <!-- Lingkaran Luar -->
                <div class="target-outer" style="position: absolute; inset: 2px; border: 2.5px solid ${color}; border-radius: 50%;"></div>
                
                <!-- Lingkaran Tengah -->
                <div class="target-inner" style="position: absolute; inset: 9px; border: 2px solid ${color}; border-radius: 50%;"></div>
                
                <!-- Titik Pusat -->
                <div class="target-center" style="position: absolute; inset: 15px; background: ${color}; border-radius: 50%;"></div>
            </div>
            `,
            iconSize: [36, 36],
            iconAnchor: [18, 18],
        });
    }, [mapType]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingKelas, setIsFetchingKelas] = useState(true);
    const [allKelurahan, setAllKelurahan] = useState([]); // Master data
    const [filteredKelurahan, setFilteredKelurahan] = useState([]); // Data hasil filter
    const [selectedKelData, setSelectedKelData] = useState(null); // Data kelurahan yang dipilih saat ini
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchLabel, setSearchLabel] = useState(""); // Teks yang tampil di input

    // --- STATES FULLSCREEN MAP ---
    const [isFullscreenMapOpen, setIsFullscreenMapOpen] = useState(false);
    const [fullscreenCenter, setFullscreenCenter] = useState(BOGOR_COORDS);
    const [fullscreenZoom, setFullscreenZoom] = useState(12);
    const [fullscreenSelectedPos, setFullscreenSelectedPos] = useState(null);

    // Kunci scroll body saat peta full screen aktif
    useEffect(() => {
        if (isFullscreenMapOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isFullscreenMapOpen]);

    const activeKelData = selectedKelData || allKelurahan.find(k => String(k.id) === String(watch('id_kelurahan')));

    // Buka peta full screen dengan titik center berdasarkan kelurahan yang dipilih,
    // atau Kabupaten Bogor jika belum memilih kelurahan
    const handleOpenFullscreen = () => {
        if (activeKelData?.lokasi?.coordinates && activeKelData.lokasi.coordinates.length === 2) {
            const [lng, lat] = activeKelData.lokasi.coordinates;
            if (!isNaN(lat) && !isNaN(lng)) {
                setFullscreenCenter([Number(lat), Number(lng)]);
                setFullscreenZoom(15);
            } else {
                setFullscreenCenter(BOGOR_COORDS);
                setFullscreenZoom(12);
            }
        } else {
            setFullscreenCenter(BOGOR_COORDS);
            setFullscreenZoom(12);
        }

        // Cek apakah sudah ada koordinat yang dipilih sebelumnya
        const curLat = parseFloat(watch('latitude'));
        const curLng = parseFloat(watch('longitude'));
        if (!isNaN(curLat) && !isNaN(curLng) && curLat !== 0 && curLng !== 0) {
            setFullscreenSelectedPos([curLat, curLng]);
        } else if (activeKelData?.lokasi?.coordinates) {
            const [lng, lat] = activeKelData.lokasi.coordinates;
            setFullscreenSelectedPos([Number(lat), Number(lng)]);
        } else {
            setFullscreenSelectedPos(null);
        }

        setIsFullscreenMapOpen(true);
    };

    // Terapkan hasil pemilihan titik dari full screen ke formulir
    const handleApplyFullscreenCoords = (targetCoords) => {
        const coords = targetCoords || fullscreenSelectedPos || fullscreenCenter;
        if (coords && coords[0] && coords[1]) {
            const [lat, lng] = coords;
            setMapPosition([lat, lng]);
            setValue('latitude', lat.toString(), { shouldValidate: true });
            setValue('longitude', lng.toString(), { shouldValidate: true });
        }
        setIsFullscreenMapOpen(false);
    };

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
            const res = await api.get(`/wilayah/search-kelurahan?q=${encodeURIComponent(val)}`);
            if (res.data.success) {
                setFilteredKelurahan(res.data.data);
                // Merge hasil pencarian ke allKelurahan agar data tidak pernah hilang
                setAllKelurahan(prev => {
                    const map = new Map();
                    prev.forEach(item => map.set(String(item.id), item));
                    res.data.data.forEach(item => map.set(String(item.id), item));
                    return Array.from(map.values());
                });
            }
        } catch (err) {
            console.error(err);
        }
    };

    // 3. Logic saat item dipilih
    const handleSelectKelurahan = (kel) => {
        // Set field ID ke React Hook Form sebagai string
        setValue('id_kelurahan', String(kel.id || ''), { shouldValidate: true });
        setValue('id_kecamatan', String(kel.RefKecamatan?.id || ''), { shouldValidate: true });
        setValue('id_kabupaten', String(kel.RefKecamatan?.RefKabupaten?.id || ''), { shouldValidate: true });
        setValue('id_provinsi', String(kel.RefKecamatan?.RefKabupaten?.RefProvinsi?.id || ''), { shouldValidate: true });
        setValue('kodepos', String(kel.kode_pos || ''), { shouldValidate: true });

        // Simpan referensi lengkap objek kelurahan terpilih
        setSelectedKelData(kel);

        // Pastikan masuk ke allKelurahan
        setAllKelurahan(prev => {
            if (prev.some(k => String(k.id) === String(kel.id))) return prev;
            return [...prev, kel];
        });

        // Set Label yang tampil
        setSearchLabel(`${kel.name} (Kec. ${kel.RefKecamatan?.name || '-'})`);

        // Update Map
        if (kel.lokasi && kel.lokasi.coordinates) {
            const [lng, lat] = kel.lokasi.coordinates;
            setMapPosition([lat, lng]);
            setValue('latitude', lat.toString(), { shouldValidate: true });
            setValue('longitude', lng.toString(), { shouldValidate: true });
        }

        setIsDropdownOpen(false);
    };

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
        const token = localStorage.getItem('token');
        const effectiveSubjekId = isStaff ? paramIdSubjek : (id_subjek || resolvedSubjekId || currentUser.id_subjek || paramIdSubjek);

        // Jika form dibuka oleh staff: wajib ada parameter subjek
        if (isStaff && !effectiveSubjekId) {
            alert("ID Subjek tidak valid. Silakan pilih Wajib Retribusi terlebih dahulu dari daftar Subjek.");
            navigate(-1);
            return;
        }

        // Jika pendaftaran oleh user: pastikan sesi login ada (token atau id_subjek)
        if (!isStaff && !token && !effectiveSubjekId) {
            alert("Sesi login Wajib Retribusi tidak ditemukan. Silakan login kembali.");
            navigate('/login');
            return;
        }

        setIsLoading(true);
        const formData = new FormData();
        formData.append('id_kelas', data.kelas_retribusi);
        formData.append('kategori_objek', type === 'pribadi' ? 'Rumah Tinggal' : 'Non Rumah Tinggal');
        formData.append('nama_objek', data.nama_objek);
        formData.append('alamat_objek', data.alamat_jalan);
        formData.append('rt_rw_objek', data.rt_rw);
        formData.append('telepon_objek', data.telepon);
        formData.append('koordinat_objek', `${data.latitude},${data.longitude}`);

        const selectedKel = selectedKelData || allKelurahan.find(k => String(k.id) === String(data.id_kelurahan));
        formData.append('provinsi_objek', selectedKel?.RefKecamatan?.RefKabupaten?.RefProvinsi?.name || 'Jawa Barat');
        formData.append('kabupaten_objek', selectedKel?.RefKecamatan?.RefKabupaten?.name || 'KAB. BOGOR');
        formData.append('kecamatan_objek', selectedKel?.RefKecamatan?.name || '');
        formData.append('kelurahan_objek', selectedKel?.name || '');
        formData.append('kode_pos_objek', data.kodepos || selectedKel?.kode_pos || '');

        selectedFiles.forEach(file => {
            formData.append('dokumen_objek', file);
        });

        try {
            // Jika ada ID subjek spesifik, gunakan route berparameter
            // Jika user mendaftar tanpa parameter ID, gunakan route /tambah-objek (backend akan membaca req.user.id_subjek)
            const endpoint = effectiveSubjekId ? `/objek/tambah-objek/${effectiveSubjekId}` : '/objek/tambah-objek';
            const response = await api.post(endpoint, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert(response.data.message || "Objek berhasil ditambahkan");
            if (isStaff) {
                navigate(-1);
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            console.error("Gagal menambah objek:", error);
            if (error.response?.status === 401) {
                alert("Sesi login telah berakhir. Silakan login kembali.");
                navigate('/login');
            } else {
                alert(error.response?.data?.message || "Gagal menambah objek");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pt-6 pb-12 px-4">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 font-bold hover:text-green-700 mb-6 group cursor-pointer">
                <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                Kembali
            </button>

            <div className="bg-white shadow-xl rounded-[2.5rem] overflow-hidden border border-gray-100">
                <div className={`${isStaff ? 'bg-gray-900' : 'bg-green-700'} p-8 text-white text-center`}>
                    <h2 className="text-2xl font-bold uppercase tracking-widest">
                        {isStaff ? 'Penetapan Objek Baru (NPOR)' : 'Permohonan NPOR Baru'}
                    </h2>
                    <p className="text-xs text-white/80 mt-1 uppercase tracking-wider">
                        {isStaff ? 'Formulir Pendaftaran Objek oleh Petugas' : 'Daftarkan Lokasi/Properti Wajib Retribusi'}
                    </p>
                </div>

                {/* Subjek Info Banner */}
                {isStaff ? (
                    subjekInfo ? (
                        <div className="bg-slate-50 border border-slate-200 p-4 mx-6 mt-6 rounded-2xl flex items-center justify-between text-left">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                    Menetapkan Objek Untuk Subjek:
                                </span>
                                <h4 className="text-sm font-bold text-slate-800">{subjekInfo.nama_subjek}</h4>
                                <p className="text-xs font-mono text-emerald-700 font-bold">NPWRD: {subjekInfo.npwrd_subjek}</p>
                            </div>
                            <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold">
                                ID Subjek: #{id_subjek}
                            </span>
                        </div>
                    ) : (
                        <div className="bg-slate-50 border border-slate-200 p-4 mx-6 mt-6 rounded-2xl text-left text-xs text-slate-700 font-bold">
                            Penetapan Objek untuk ID Subjek: #{id_subjek || 'Tidak Ditentukan'}
                        </div>
                    )
                ) : (
                    (subjekInfo?.nama_subjek || currentUser.nama_subjek) && (
                        <div className="bg-emerald-50/50 border border-emerald-100 p-4 mx-6 mt-6 rounded-2xl flex items-center justify-between text-left">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">
                                    Pemohon (Akun Anda):
                                </span>
                                <h4 className="text-sm font-bold text-slate-800">
                                    {subjekInfo?.nama_subjek || currentUser.nama_subjek}
                                </h4>
                                <p className="text-xs font-mono text-slate-600 font-bold">
                                    NPWRD: {subjekInfo?.npwrd_subjek || currentUser.npwrd_subjek || '-'}
                                </p>
                            </div>
                            <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                                <CheckCircle2 size={13} /> Terverifikasi
                            </span>
                        </div>
                    )
                )}

                {/* Tipe Kategori */}
                <div className="flex p-2 bg-gray-100 m-6 rounded-xl">
                    <button type="button" onClick={() => setType('pribadi')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all cursor-pointer ${type === 'pribadi' ? 'bg-white shadow-md text-green-700 font-bold' : 'text-gray-500'}`}>
                        <User size={18} /> Rumah Tinggal
                    </button>
                    <button type="button" onClick={() => setType('badan')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all cursor-pointer ${type === 'badan' ? 'bg-white shadow-md text-green-700 font-bold' : 'text-gray-500'}`}>
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
                                    placeholder="Ketik nama Desa atau Kecamatan (cth: Ciawi, Cibinong, Babakan Madang)..."
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
                                                <div className="p-8 text-center text-gray-400  text-xs">Kelurahan tidak ditemukan...</div>
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
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-400  py-3"><Loader2 className="animate-spin" size={14} /> Memuat data tarif...</div>
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
                                            <p className="text-[11px] text-gray-500  mt-1">
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
                                                <p className="text-[10px] text-gray-400 ">
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

                        {/* 3. TITIK KOORDINAT (HANYA TOMBOL BUKA FULLSCREEN) */}
                        <div className="md:col-span-2 space-y-4 pt-4">
                            <div className="border-b pb-2">
                                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                    <MapPin size={18} className="text-green-700" /> 3. Titik Koordinat Objek
                                </h3>
                                <p className="text-[11px] text-gray-400 mt-0.5">
                                    Penentuan titik lokasi bangunan/properti wajib dilakukan melalui peta interaktif layar penuh.
                                </p>
                            </div>

                            {/* KARTU STATUS KOORDINAT & TOMBOL BUKA FULLSCREEN MAP */}
                            <div className={`p-6 rounded-3xl border-2 transition-all ${(watch('latitude') && watch('longitude'))
                                ? 'bg-emerald-50/50 border-emerald-200'
                                : (errors.latitude || errors.longitude)
                                    ? 'bg-red-50/40 border-red-200'
                                    : 'bg-gray-50 border-gray-100 hover:border-green-300'
                                }`}>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3.5 rounded-2xl shrink-0 ${(watch('latitude') && watch('longitude'))
                                            ? 'bg-emerald-100 text-emerald-700 shadow-sm'
                                            : 'bg-white text-gray-400 border border-gray-200 shadow-sm'
                                            }`}>
                                            <MapPin size={26} className={(watch('latitude') && watch('longitude')) ? 'animate-bounce' : ''} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h4 className="text-sm font-black uppercase tracking-wider text-gray-800">
                                                    {(watch('latitude') && watch('longitude')) ? 'Titik Koordinat Telah Ditentukan' : 'Titik Koordinat Belum Dipilih'}
                                                </h4>
                                                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${(watch('latitude') && watch('longitude'))
                                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                                                    }`}>
                                                    {(watch('latitude') && watch('longitude')) ? 'Terverifikasi' : 'Wajib Diisi'}
                                                </span>
                                            </div>

                                            {(watch('latitude') && watch('longitude')) ? (
                                                <div className="mt-2 space-y-1">
                                                    <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-700 flex-wrap">
                                                        <span className="bg-white px-2.5 py-1 rounded-lg border border-emerald-100 text-emerald-800 shadow-sm">
                                                            Lat: {watch('latitude')}
                                                        </span>
                                                        <span>,</span>
                                                        <span className="bg-white px-2.5 py-1 rounded-lg border border-emerald-100 text-emerald-800 shadow-sm">
                                                            Lng: {watch('longitude')}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-gray-500 font-medium pt-1">
                                                        {activeKelData ? (
                                                            <span>Pusat acuan: <b className="text-gray-800">Kel. {activeKelData.name}</b> (Kec. {activeKelData.RefKecamatan?.name || '-'})</span>
                                                        ) : (
                                                            <span>Pusat acuan: <b className="text-gray-800">Kabupaten Bogor</b></span>
                                                        )}
                                                    </p>
                                                </div>
                                            ) : (
                                                <p className="text-xs text-gray-500 mt-1 max-w-md leading-relaxed font-medium">
                                                    Silakan klik tombol di samping untuk membuka peta layar penuh dan menandai titik bangunan objek retribusi Anda secara leluasa dan presisi.
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* TOMBOL BUKA PETA FULLSCREEN */}
                                    <button
                                        type="button"
                                        onClick={handleOpenFullscreen}
                                        className={`w-full sm:w-auto px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-wider text-white shadow-xl transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer shrink-0 ${(watch('latitude') && watch('longitude'))
                                            ? 'bg-gray-900 hover:bg-black shadow-slate-900/20'
                                            : 'bg-green-700 hover:bg-green-800 shadow-green-900/20'
                                            }`}
                                    >
                                        <Maximize2 size={18} />
                                        <span>{(watch('latitude') && watch('longitude')) ? 'Ubah Titik di Peta Fullscreen' : 'Buka Peta Fullscreen'}</span>
                                    </button>
                                </div>

                                {/* Pesan Error jika user langsung submit tanpa memilih titik */}
                                {(errors.latitude || errors.longitude) && !(watch('latitude') && watch('longitude')) && (
                                    <div className="mt-4 pt-3 border-t border-red-200 text-xs text-red-600 font-bold flex items-center gap-2 animate-in fade-in">
                                        <AlertCircle size={15} />
                                        <span>Titik koordinat wajib dipilih melalui peta fullscreen sebelum formulir dikirim.</span>
                                    </div>
                                )}
                            </div>

                            {/* Form Input Latitude & Longitude (Read-only info) */}
                            <div className="grid grid-cols-2 gap-4">
                                <FormInput label="Latitude" name="latitude" register={register} errors={errors} readOnly placeholder="Otomatis dari peta fullscreen" />
                                <FormInput label="Longitude" name="longitude" register={register} errors={errors} readOnly placeholder="Otomatis dari peta fullscreen" />
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
                                    <p className="text-[10px] text-gray-400 mt-1  font-medium">Klik untuk upload IMB, Foto Lokasi, atau KTP (Bisa pilih banyak)</p>
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
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ">Belum ada dokumen yang dipilih</p>
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

            {/* MODAL PETA FULL SCREEN DENGAN TITIK CENTER OTOMATIS */}
            {isFullscreenMapOpen && (
                <div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col overflow-hidden animate-in fade-in duration-200">
                    {/* HEADER MODAL */}
                    <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4 z-10 shadow-2xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-green-500/20 text-green-400 border border-green-500/30 flex items-center justify-center shrink-0">
                                <MapPin size={22} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-base font-black text-white uppercase tracking-tight">
                                        Peta Pemilihan Titik Objek
                                    </h3>
                                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                                        Layar Penuh
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 font-medium">
                                    {activeKelData ? (
                                        <span className="text-emerald-400 font-bold">
                                            Pusat: Kel. {activeKelData.name}, Kec. {activeKelData.RefKecamatan?.name || '-'}
                                        </span>
                                    ) : (
                                        <span className="text-amber-400 font-bold">
                                            Pusat: Kabupaten Bogor (Kelurahan belum dipilih)
                                        </span>
                                    )}
                                    {' • '}
                                    <span className="text-slate-400">Klik di mana saja pada peta untuk menandai titik</span>
                                </p>
                            </div>
                        </div>

                        {/* KOORDINAT PILL & AKSI CEPAT */}
                        <div className="flex items-center gap-3 flex-wrap">
                            {fullscreenSelectedPos ? (
                                <div className="flex items-center gap-2.5 bg-slate-800/90 border border-slate-700/80 px-4 py-2 rounded-2xl font-mono text-xs shadow-inner">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                    <span className="text-slate-300 font-bold">
                                        Lat: <span className="text-emerald-400">{Number(fullscreenSelectedPos[0]).toFixed(6)}</span>
                                    </span>
                                    <span className="text-slate-600">•</span>
                                    <span className="text-slate-300 font-bold">
                                        Lng: <span className="text-emerald-400">{Number(fullscreenSelectedPos[1]).toFixed(6)}</span>
                                    </span>
                                </div>
                            ) : (
                                <div className="text-xs text-slate-400 italic bg-slate-800 px-3.5 py-2 rounded-2xl border border-slate-700">
                                    Klik peta untuk menandai titik
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={() => handleApplyFullscreenCoords()}
                                disabled={!fullscreenSelectedPos}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider text-white bg-green-600 hover:bg-green-700 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-lg shadow-green-900/30 cursor-pointer"
                            >
                                <CheckCircle2 size={16} />
                                <span>Terapkan Titik Ini</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsFullscreenMapOpen(false)}
                                className="p-2.5 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700 transition-all cursor-pointer"
                                title="Tutup Peta Layar Penuh"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* KONTEN PETA FULL SCREEN */}
                    <div className="flex-1 relative w-full h-full bg-slate-950">
                        {/* KONTROL FLOATING DI DALAM PETA */}
                        <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
                            {/* Layer Selector dengan indikator warna target */}
                            <div className="bg-slate-900/95 backdrop-blur-md p-2 rounded-2xl border border-slate-800 shadow-2xl flex flex-col gap-1.5">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">Latar & Warna Target:</span>
                                <button
                                    type="button"
                                    onClick={() => setMapType('roadmap')}
                                    className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-between gap-2.5 cursor-pointer ${mapType === 'roadmap'
                                        ? 'bg-white text-slate-900 shadow-md font-extrabold'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                        }`}
                                >
                                    <span>Roadmap</span>
                                    <span className="w-3 h-3 rounded-full bg-black border border-white/60 shadow-sm" title="Target Berwarna Hitam"></span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMapType('satellite')}
                                    className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-between gap-2.5 cursor-pointer ${mapType === 'satellite'
                                        ? 'bg-green-600 text-white shadow-md font-extrabold'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                        }`}
                                >
                                    <span>Satelit</span>
                                    <span className="w-3 h-3 rounded-full bg-white border border-black/60 shadow-sm" title="Target Berwarna Putih"></span>
                                </button>
                            </div>

                            {/* Tombol Re-center */}
                            <div className="bg-slate-900/95 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800 shadow-2xl flex flex-col gap-1">
                                {activeKelData?.lokasi?.coordinates && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const [lng, lat] = activeKelData.lokasi.coordinates;
                                            setFullscreenCenter([Number(lat), Number(lng)]);
                                            setFullscreenZoom(16);
                                        }}
                                        className="px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2 transition-all cursor-pointer"
                                        title="Pusatkan peta ke Kelurahan yang dipilih"
                                    >
                                        <Crosshair size={14} className="text-emerald-400 shrink-0" />
                                        <span>Ke Pusat Kelurahan</span>
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFullscreenCenter(BOGOR_COORDS);
                                        setFullscreenZoom(12);
                                    }}
                                    className="px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2 transition-all cursor-pointer"
                                    title="Pusatkan peta ke Kabupaten Bogor"
                                >
                                    <Compass size={14} className="text-blue-400 shrink-0" />
                                    <span>Ke Kab. Bogor</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (navigator.geolocation) {
                                            navigator.geolocation.getCurrentPosition(
                                                (pos) => {
                                                    const userLat = pos.coords.latitude;
                                                    const userLng = pos.coords.longitude;
                                                    setFullscreenCenter([userLat, userLng]);
                                                    setFullscreenZoom(16);
                                                    setFullscreenSelectedPos([userLat, userLng]);
                                                },
                                                (err) => {
                                                    alert("Gagal membaca lokasi saat ini: " + err.message);
                                                }
                                            );
                                        } else {
                                            alert("Browser Anda tidak mendukung geolokasi.");
                                        }
                                    }}
                                    className="px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2 transition-all cursor-pointer"
                                    title="Pusatkan ke lokasi GPS perangkat Anda"
                                >
                                    <Navigation size={14} className="text-amber-400 shrink-0" />
                                    <span>Lokasi Saya (GPS)</span>
                                </button>
                            </div>
                        </div>

                        {/* BANNER INSTRUKSI DI BAWAH PETA */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none max-w-xl w-full px-4">
                            <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 pointer-events-auto">
                                <div className="p-2.5 bg-green-500/20 text-green-400 rounded-xl shrink-0">
                                    <MapPin size={20} />
                                </div>
                                <div className="flex-1 text-left overflow-hidden">
                                    <p className="text-xs font-bold text-slate-200 truncate">
                                        {fullscreenSelectedPos
                                            ? `Titik terpilih: [${fullscreenSelectedPos[0].toFixed(6)}, ${fullscreenSelectedPos[1].toFixed(6)}]`
                                            : "Klik di mana saja pada peta untuk menandai titik objek"}
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-medium">
                                        Geser, perbesar peta satelit, lalu klik titik bangunan properti Anda secara presisi.
                                    </p>
                                </div>
                                {fullscreenSelectedPos && (
                                    <button
                                        type="button"
                                        onClick={() => handleApplyFullscreenCoords()}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
                                    >
                                        Terapkan
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* MAP CONTAINER LEAFLET */}
                        <MapContainer
                            center={fullscreenCenter}
                            zoom={fullscreenZoom}
                            style={{ height: '100%', width: '100%' }}
                        >
                            <MapInvalidateOnMount />
                            <MapController center={fullscreenCenter} zoom={fullscreenZoom} />
                            <TileLayer
                                url={mapType === 'roadmap'
                                    ? "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                                    : "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                                }
                            />
                            {fullscreenSelectedPos && (
                                <Marker position={fullscreenSelectedPos} icon={targetIcon} />
                            )}
                            <FullscreenLocationPicker
                                setSelectedPos={setFullscreenSelectedPos}
                            />
                        </MapContainer>
                    </div>
                </div>
            )}
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

export default FormTambahObjek;
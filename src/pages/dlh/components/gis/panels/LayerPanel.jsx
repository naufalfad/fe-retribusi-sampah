import React from 'react';
import {
    Layers,
    MapPin,
    Settings2,
    Home,
    Building2,
    AlertTriangle,
    Recycle,
    Trash2,
    Factory,
    Truck,
    Wind,
    Droplets,
    Flame,
    Mountain,
} from 'lucide-react';
import { useGisUIStore } from '../../../../../store/useGisUIStore';

export default function LayerPanel() {
    const {
        activeLayers,
        toggleLayer,
        mapOpacity,
        setMapOpacity,
        maskOpacity,
        setMaskOpacity,
        activeAdminBoundary,
        setActiveAdminBoundary,
    } = useGisUIStore();

    const layerItems = [
        {
            id: 'layer-rumah',
            label: 'Rumah Tinggal',
            desc: 'Objek retribusi sektor domestik',
            color: 'bg-emerald-600',
            icon: Home,
        },
        {
            id: 'layer-non-rumah',
            label: 'Non Rumah Tinggal',
            desc: 'Bisnis, komersil, industri & instansi',
            color: 'bg-blue-600',
            icon: Building2,
        },
        {
            id: 'layer-status-nunggak',
            label: 'Alarm Penunggak (EWS)',
            desc: 'Objek dengan tagihan SKRD belum lunas',
            color: 'bg-rose-600',
            icon: AlertTriangle,
            pulse: true,
        },
    ];

    const tempatSampahLayers = [
        {
            id: 'layer-bank-sampah',
            label: 'Bank Sampah',
            desc: 'Pemilahan mandiri warga & bernilai jual',
            color: 'bg-teal-600',
            icon: Recycle,
        },
        {
            id: 'layer-tps',
            label: 'TPS (Penampungan Sementara)',
            desc: 'Transit sampah lingkungan sebelum diangkut',
            color: 'bg-amber-600',
            icon: Trash2,
        },
        {
            id: 'layer-tpst',
            label: 'TPST (Pengolahan Terpadu 3R)',
            desc: 'Pusat pengolahan & daur ulang kawasan',
            color: 'bg-indigo-600',
            icon: Factory,
        },
        {
            id: 'layer-tpa',
            label: 'TPA (Pemrosesan Akhir)',
            desc: 'Pusat pemrosesan akhir (TPA Galuga)',
            color: 'bg-purple-700',
            icon: Truck,
        },
    ];

    const airLayers = [
        {
            id: 'layer-aqi',
            label: 'Kualitas Udara (AQI & Angin)',
            desc: 'Telemetri atmosfer & arah angin real-time',
            color: 'bg-teal-500',
            icon: Wind,
        },
    ];

    const waterLayers = [
        {
            id: 'layer-river',
            label: 'Aliran Sungai',
            desc: 'Jejak geospasial & baku mutu air sungai',
            color: 'bg-cyan-400',
            icon: Droplets,
        },
        {
            id: 'layer-water-stations',
            label: 'Stasiun Sampel Air',
            desc: 'Parameter BOD, COD, DO & pH PP 22/2021',
            color: 'bg-blue-600',
            icon: Droplets,
            pulse: true,
        },
    ];

    const fireVolcanoLayers = [
        {
            id: 'layer-wildfire',
            label: 'Titik Api (Hotspots)',
            desc: 'Deteksi termal NASA FIRMS / MODIS',
            color: 'bg-rose-500',
            icon: Flame,
            pulse: true,
        },
        {
            id: 'layer-volcano-ash',
            label: 'Abu Vulkanik & SO2',
            desc: 'Plume SO2 & Index Aerosol NASA GIBS',
            color: 'bg-purple-600',
            icon: Mountain,
        },
    ];

    return (
        <div className="flex flex-col h-full bg-white font-sans text-left pb-10 select-none">
            {/* Header Deskripsi */}
            <div className="px-5 py-3.5 bg-emerald-50/40 border-b border-slate-100 flex items-start gap-2.5">
                <Layers size={14} className="text-emerald-700 mt-0.5 shrink-0" />
                <p className="text-[11px] text-slate-600 leading-relaxed font-normal">
                    Kelola visibilitas layer tematik, batas administrasi wilayah, dan transparansi kanvas peta.
                </p>
            </div>

            {/* SECTION 1: LAYER DATA OBJEK RETRIBUSI */}
            <div className="flex flex-col">
                <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2 text-slate-700">
                    <Layers size={13} className="text-emerald-700" />
                    <h4 className="text-xs font-bold text-slate-800">Layer Objek Retribusi</h4>
                </div>

                <div className="flex flex-col divide-y divide-slate-100">
                    {layerItems.map((layer) => {
                        const isActive = activeLayers.includes(layer.id);
                        const IconComp = layer.icon;

                        return (
                            <button
                                key={layer.id}
                                onClick={() => toggleLayer(layer.id)}
                                className="group flex items-center justify-between px-5 py-3 bg-white hover:bg-slate-50/70 transition-colors text-left w-full outline-none cursor-pointer"
                            >
                                <div className="flex items-center gap-3">
                                    {/* Toggle Switch */}
                                    <div
                                        className={`relative inline-flex h-3.5 w-7 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out ${
                                            isActive ? 'bg-emerald-600' : 'bg-slate-300'
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                                                isActive ? 'translate-x-3.5' : 'translate-x-0.5'
                                            }`}
                                        />
                                    </div>

                                    <div className="flex items-center gap-2.5">
                                        <div
                                            className={`relative w-6 h-6 rounded-md shrink-0 flex items-center justify-center text-white shadow-sm border border-white ${layer.color}`}
                                        >
                                            {layer.pulse && isActive && (
                                                <span className="absolute inset-0 rounded-md bg-rose-400 opacity-75 animate-ping" />
                                            )}
                                            <IconComp size={13} strokeWidth={2.3} className="relative z-10" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-semibold text-slate-800 leading-tight">
                                                {layer.label}
                                            </span>
                                            <span className="text-[10px] text-slate-400 leading-tight mt-0.5">
                                                {layer.desc}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* SECTION 2: LAYER FASILITAS PENGELOLAAN SAMPAH */}
            <div className="flex flex-col mt-2">
                <div className="px-5 py-3 bg-slate-50 border-y border-slate-100 flex items-center justify-between text-slate-700">
                    <div className="flex items-center gap-2">
                        <Recycle size={13} className="text-teal-700" />
                        <h4 className="text-xs font-bold text-slate-800">Fasilitas Pengelolaan Sampah</h4>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded border border-teal-200">
                        4 Tipe
                    </span>
                </div>

                <div className="flex flex-col divide-y divide-slate-100">
                    {tempatSampahLayers.map((layer) => {
                        const isActive = activeLayers.includes(layer.id);
                        const IconComp = layer.icon;

                        return (
                            <button
                                key={layer.id}
                                onClick={() => toggleLayer(layer.id)}
                                className="group flex items-center justify-between px-5 py-3 bg-white hover:bg-slate-50/70 transition-colors text-left w-full outline-none cursor-pointer"
                            >
                                <div className="flex items-center gap-3">
                                    {/* Toggle Switch */}
                                    <div
                                        className={`relative inline-flex h-3.5 w-7 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out ${
                                            isActive ? 'bg-teal-600' : 'bg-slate-300'
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                                                isActive ? 'translate-x-3.5' : 'translate-x-0.5'
                                            }`}
                                        />
                                    </div>

                                    <div className="flex items-center gap-2.5">
                                        <div
                                            className={`relative w-6 h-6 rounded-md shrink-0 flex items-center justify-center text-white shadow-sm border border-white ${layer.color}`}
                                        >
                                            <IconComp size={13} strokeWidth={2.3} className="relative z-10" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-semibold text-slate-800 leading-tight">
                                                {layer.label}
                                            </span>
                                            <span className="text-[10px] text-slate-400 leading-tight mt-0.5">
                                                {layer.desc}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* SECTION 3: KUALITAS UDARA (AQI & ANGIN) */}
            <div className="flex flex-col mt-2">
                <div className="px-5 py-3 bg-slate-50 border-y border-slate-100 flex items-center justify-between text-slate-700">
                    <div className="flex items-center gap-2">
                        <Wind size={13} className="text-teal-700" />
                        <h4 className="text-xs font-bold text-slate-800">Kualitas Udara</h4>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded border border-teal-200">
                        US EPA AQI
                    </span>
                </div>

                <div className="flex flex-col divide-y divide-slate-100">
                    {airLayers.map((layer) => {
                        const isActive = activeLayers.includes(layer.id);
                        const IconComp = layer.icon;

                        return (
                            <button
                                key={layer.id}
                                onClick={() => toggleLayer(layer.id)}
                                className="group flex items-center justify-between px-5 py-3 bg-white hover:bg-slate-50/70 transition-colors text-left w-full outline-none cursor-pointer"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`relative inline-flex h-3.5 w-7 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out ${
                                            isActive ? 'bg-teal-600' : 'bg-slate-300'
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                                                isActive ? 'translate-x-3.5' : 'translate-x-0.5'
                                            }`}
                                        />
                                    </div>

                                    <div className="flex items-center gap-2.5">
                                        <div
                                            className={`relative w-6 h-6 rounded-md shrink-0 flex items-center justify-center text-white shadow-sm border border-white ${layer.color}`}
                                        >
                                            <IconComp size={13} strokeWidth={2.3} className="relative z-10" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-semibold text-slate-800 leading-tight">
                                                {layer.label}
                                            </span>
                                            <span className="text-[10px] text-slate-400 leading-tight mt-0.5">
                                                {layer.desc}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* SECTION 4: KUALITAS AIR SUNGAI & STASIUN SAMPE */}
            <div className="flex flex-col mt-2">
                <div className="px-5 py-3 bg-slate-50 border-y border-slate-100 flex items-center justify-between text-slate-700">
                    <div className="flex items-center gap-2">
                        <Droplets size={13} className="text-cyan-700" />
                        <h4 className="text-xs font-bold text-slate-800">Kualitas Air Sungai</h4>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-cyan-50 text-cyan-700 px-1.5 py-0.5 rounded border border-cyan-200">
                        PP 22/2021
                    </span>
                </div>

                <div className="flex flex-col divide-y divide-slate-100">
                    {waterLayers.map((layer) => {
                        const isActive = activeLayers.includes(layer.id);
                        const IconComp = layer.icon;

                        return (
                            <button
                                key={layer.id}
                                onClick={() => toggleLayer(layer.id)}
                                className="group flex items-center justify-between px-5 py-3 bg-white hover:bg-slate-50/70 transition-colors text-left w-full outline-none cursor-pointer"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`relative inline-flex h-3.5 w-7 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out ${
                                            isActive ? 'bg-cyan-600' : 'bg-slate-300'
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                                                isActive ? 'translate-x-3.5' : 'translate-x-0.5'
                                            }`}
                                        />
                                    </div>

                                    <div className="flex items-center gap-2.5">
                                        <div
                                            className={`relative w-6 h-6 rounded-md shrink-0 flex items-center justify-center text-white shadow-sm border border-white ${layer.color}`}
                                        >
                                            {layer.pulse && isActive && (
                                                <span className="absolute inset-0 rounded-md bg-cyan-400 opacity-75 animate-ping" />
                                            )}
                                            <IconComp size={13} strokeWidth={2.3} className="relative z-10" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-semibold text-slate-800 leading-tight">
                                                {layer.label}
                                            </span>
                                            <span className="text-[10px] text-slate-400 leading-tight mt-0.5">
                                                {layer.desc}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* SECTION 5: KEBAKARAN HUTAN & VULKANIK */}
            <div className="flex flex-col mt-2">
                <div className="px-5 py-3 bg-slate-50 border-y border-slate-100 flex items-center justify-between text-slate-700">
                    <div className="flex items-center gap-2">
                        <Flame size={13} className="text-rose-600" />
                        <h4 className="text-xs font-bold text-slate-800">Kebakaran Hutan & Vulkanik</h4>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded border border-rose-200">
                        NASA GIBS
                    </span>
                </div>

                <div className="flex flex-col divide-y divide-slate-100">
                    {fireVolcanoLayers.map((layer) => {
                        const isActive = activeLayers.includes(layer.id);
                        const IconComp = layer.icon;

                        return (
                            <button
                                key={layer.id}
                                onClick={() => toggleLayer(layer.id)}
                                className="group flex items-center justify-between px-5 py-3 bg-white hover:bg-slate-50/70 transition-colors text-left w-full outline-none cursor-pointer"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`relative inline-flex h-3.5 w-7 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out ${
                                            isActive ? 'bg-rose-600' : 'bg-slate-300'
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                                                isActive ? 'translate-x-3.5' : 'translate-x-0.5'
                                            }`}
                                        />
                                    </div>

                                    <div className="flex items-center gap-2.5">
                                        <div
                                            className={`relative w-6 h-6 rounded-md shrink-0 flex items-center justify-center text-white shadow-sm border border-white ${layer.color}`}
                                        >
                                            {layer.pulse && isActive && (
                                                <span className="absolute inset-0 rounded-md bg-rose-400 opacity-75 animate-ping" />
                                            )}
                                            <IconComp size={13} strokeWidth={2.3} className="relative z-10" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-semibold text-slate-800 leading-tight">
                                                {layer.label}
                                            </span>
                                            <span className="text-[10px] text-slate-400 leading-tight mt-0.5">
                                                {layer.desc}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* SECTION 6: BATAS WILAYAH ADMINISTRASI */}
            <div className="flex flex-col mt-2">
                <div className="px-5 py-3 bg-slate-50 border-y border-slate-100 flex items-center gap-2 text-slate-700">
                    <MapPin size={13} className="text-emerald-700" />
                    <h4 className="text-xs font-bold text-slate-800">Batas Wilayah & Analitik</h4>
                </div>

                <div className="flex flex-col divide-y divide-slate-100">
                    {/* Batas Kecamatan */}
                    <button
                        onClick={() =>
                            setActiveAdminBoundary(activeAdminBoundary === 'kecamatan' ? 'none' : 'kecamatan')
                        }
                        className="group flex items-center justify-between px-5 py-3 bg-white hover:bg-slate-50/70 transition-colors text-left w-full outline-none cursor-pointer"
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className={`relative inline-flex h-3.5 w-7 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out ${
                                    activeAdminBoundary === 'kecamatan' ? 'bg-indigo-600' : 'bg-slate-300'
                                }`}
                            >
                                <span
                                    className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                                        activeAdminBoundary === 'kecamatan' ? 'translate-x-3.5' : 'translate-x-0.5'
                                    }`}
                                />
                            </div>
                            <div className="flex items-center gap-2.5">
                                <span className="w-2.5 h-2.5 rounded-none shrink-0 bg-indigo-600 border border-slate-200" />
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-slate-700">
                                        Peta Kepadatan Kecamatan
                                    </span>
                                    <span className="text-[10px] text-slate-400 leading-none mt-1">
                                        Agregasi objek per kecamatan (Kab. Bogor)
                                    </span>
                                </div>
                            </div>
                        </div>
                    </button>

                    {/* Batas Desa / Kelurahan */}
                    <button
                        onClick={() =>
                            setActiveAdminBoundary(activeAdminBoundary === 'desa' ? 'none' : 'desa')
                        }
                        className="group flex items-center justify-between px-5 py-3 bg-white hover:bg-slate-50/70 transition-colors text-left w-full outline-none cursor-pointer"
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className={`relative inline-flex h-3.5 w-7 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out ${
                                    activeAdminBoundary === 'desa' ? 'bg-blue-600' : 'bg-slate-300'
                                }`}
                            >
                                <span
                                    className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                                        activeAdminBoundary === 'desa' ? 'translate-x-3.5' : 'translate-x-0.5'
                                    }`}
                                />
                            </div>
                            <div className="flex items-center gap-2.5">
                                <span className="w-2.5 h-2.5 rounded-none shrink-0 bg-transparent border-2 border-blue-600 border-dashed" />
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-slate-700">
                                        Garis Batas Desa / Kelurahan
                                    </span>
                                    <span className="text-[10px] text-slate-400 leading-none mt-1">
                                        Pemetaan batas tingkat desa
                                    </span>
                                </div>
                            </div>
                        </div>
                    </button>
                </div>
            </div>

            {/* SECTION 4: KONTROL VISUAL PETA (OPASITAS) */}
            <div className="flex flex-col mt-2">
                <div className="px-5 py-3 bg-slate-50 border-y border-slate-100 flex items-center gap-2 text-slate-700">
                    <Settings2 size={13} className="text-emerald-700" />
                    <h4 className="text-xs font-bold text-slate-800">Kontrol Visual Peta</h4>
                </div>

                <div className="flex flex-col divide-y divide-slate-100">
                    {/* Slider Transparansi Poligon */}
                    <div className="px-5 py-3.5 bg-white space-y-2.5">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-medium text-slate-700">Transparansi Poligon</span>
                            <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                                {mapOpacity}%
                            </span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={mapOpacity}
                            onChange={(e) => setMapOpacity(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-slate-200 rounded-none appearance-none cursor-pointer accent-emerald-600 outline-none"
                        />
                    </div>

                    {/* Slider Peredupan Luar Wilayah */}
                    <div className="px-5 py-3.5 bg-white space-y-2.5">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-medium text-slate-700">Peredupan Luar Wilayah Bogor</span>
                            <span className="text-[10px] font-mono text-slate-800 bg-slate-100 px-2 py-0.5 border border-slate-200">
                                {maskOpacity}%
                            </span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={maskOpacity}
                            onChange={(e) => setMaskOpacity(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-slate-200 rounded-none appearance-none cursor-pointer accent-slate-800 outline-none"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

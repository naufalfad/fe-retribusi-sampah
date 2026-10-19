import React, { useState } from 'react';
import {
    MapPin,
    Building2,
    Home,
    Phone,
    User,
    CreditCard,
    ExternalLink,
    AlertCircle,
    CheckCircle2,
    Radio,
    Calendar,
    Layers,
    Eye,
} from 'lucide-react';
import { useGisUIStore } from '../../../../../store/useGisUIStore';
import { openSmartStreetView, openGoogleMapsPin } from '../../../../../lib/streetViewHelper';

export default function DetailPanel({ data }) {
    const { showImpactRadius, setShowImpactRadius } = useGisUIStore();
    const [activeTab, setActiveTab] = useState('profil');

    if (!data) {
        return (
            <div className="p-6 text-center text-xs text-slate-400 font-medium">
                Pilih objek pada peta untuk melihat detail spesifikasi.
            </div>
        );
    }

    const isNonRumah = data.kategori_objek === 'Non Rumah Tinggal';
    const skrdList = data.Skrds || [];
    const unpaidSkrd = skrdList.filter((s) => s.status?.toLowerCase() === 'unpaid');
    const hasUnpaid = unpaidSkrd.length > 0;

    return (
        <div className="flex flex-col h-full bg-white font-sans text-left pb-12 select-none overflow-y-auto custom-scrollbar">
            {/* HERO BANNER */}
            <div className="p-5 bg-slate-900 text-white flex flex-col gap-2 relative">
                <div className="flex items-center justify-between">
                    <span
                        className={`text-[8px] font-bold px-2 py-0.5 uppercase tracking-wider flex items-center gap-1 ${
                            isNonRumah ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
                        }`}
                    >
                        {isNonRumah ? <Building2 size={10} /> : <Home size={10} />}
                        {data.kategori_objek}
                    </span>

                    <span className="text-[10px] font-mono font-bold text-slate-400">
                        {data.npor_objek}
                    </span>
                </div>

                <h3 className="text-sm font-bold text-white tracking-tight leading-snug break-words">
                    {data.nama_objek}
                </h3>

                <p className="text-[10px] text-slate-400 leading-relaxed truncate">
                    {data.alamat_objek}
                </p>

                {/* Status Kepatuhan Badge */}
                <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 text-[10px]">Status Retribusi:</span>
                    {hasUnpaid ? (
                        <span className="text-rose-400 font-bold flex items-center gap-1">
                            <AlertCircle size={12} /> {unpaidSkrd.length} Tagihan Belum Lunas
                        </span>
                    ) : (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 size={12} /> Tertib & Lunas
                        </span>
                    )}
                </div>
            </div>

            {/* TAB SELECTOR */}
            <div className="flex border-b border-slate-200 bg-slate-50 text-[11px] font-medium text-slate-600">
                <button
                    onClick={() => setActiveTab('profil')}
                    className={`flex-1 py-2.5 text-center transition-colors border-b-2 cursor-pointer ${
                        activeTab === 'profil'
                            ? 'border-emerald-600 text-emerald-800 font-bold bg-white'
                            : 'border-transparent hover:text-slate-900'
                    }`}
                >
                    Profil Objek
                </button>
                <button
                    onClick={() => setActiveTab('tagihan')}
                    className={`flex-1 py-2.5 text-center transition-colors border-b-2 cursor-pointer ${
                        activeTab === 'tagihan'
                            ? 'border-emerald-600 text-emerald-800 font-bold bg-white'
                            : 'border-transparent hover:text-slate-900'
                    }`}
                >
                    SKRD ({skrdList.length})
                </button>
            </div>

            {/* TAB CONTENT 1: PROFIL */}
            {activeTab === 'profil' && (
                <div className="flex flex-col divide-y divide-slate-100">
                    <DetailRow
                        icon={Building2}
                        label="Tarif Pokok Retribusi"
                        value={`Rp ${Number(data.tarif_pokok_objek || 0).toLocaleString('id-ID')} / bulan`}
                        highlight
                    />
                    <DetailRow
                        icon={User}
                        label="Wajib Retribusi (Subjek)"
                        value={data.Subjek?.nama_subjek || '-'}
                    />
                    <DetailRow
                        icon={MapPin}
                        label="Wilayah Administrasi"
                        value={`Kec. ${data.kecamatan_objek || '-'}, Kel. ${data.kelurahan_objek || '-'}`}
                    />
                    <DetailRow
                        icon={MapPin}
                        label="RT / RW"
                        value={data.rt_rw_objek || '-'}
                    />
                    <DetailRow
                        icon={Phone}
                        label="Kontak / Telepon"
                        value={data.telepon_objek || '-'}
                    />
                    <DetailRow
                        icon={Layers}
                        label="Koordinat Geografis"
                        value={`${data.lat || '-'}, ${data.lng || '-'}`}
                    />

                    {/* RADIUS TOGGLE BUTTON */}
                    <div className="p-4 bg-slate-50/60 flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-xs font-medium text-slate-700">Radius Pelayanan 3 KM</span>
                            <span className="text-[10px] text-slate-400">
                                Gambar lingkaran cakupan armada di sekeliling objek
                            </span>
                        </div>
                        <button
                            onClick={() => setShowImpactRadius(!showImpactRadius)}
                            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-none transition-colors cursor-pointer ${
                                showImpactRadius
                                    ? 'bg-rose-600 text-white'
                                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                            }`}
                        >
                            <Radio size={12} className="inline mr-1" />
                            {showImpactRadius ? 'Aktif' : 'Tampilkan'}
                        </button>
                    </div>
                </div>
            )}

            {/* TAB CONTENT 2: SKRD BILLS */}
            {activeTab === 'tagihan' && (
                <div className="flex flex-col p-4 space-y-3">
                    {skrdList.length > 0 ? (
                        skrdList.map((skrd) => {
                            const isPaid = skrd.status?.toLowerCase() === 'paid';
                            return (
                                <div
                                    key={skrd.id_skrd}
                                    className={`p-3 border text-left flex flex-col gap-1.5 ${
                                        isPaid
                                            ? 'bg-emerald-50/40 border-emerald-200'
                                            : 'bg-rose-50/40 border-rose-200'
                                    }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-mono font-bold text-slate-600">
                                            {skrd.no_skrd || `SKRD #${skrd.id_skrd}`}
                                        </span>
                                        <span
                                            className={`text-[8px] font-bold px-1.5 py-0.5 uppercase tracking-wider ${
                                                isPaid
                                                    ? 'bg-emerald-600 text-white'
                                                    : 'bg-rose-600 text-white'
                                            }`}
                                        >
                                            {isPaid ? 'Lunas' : 'Belum Lunas'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                                        <span>
                                            Bulan {skrd.periode_bulan}/{skrd.periode_tahun}
                                        </span>
                                        <span className="font-mono text-emerald-800">
                                            Rp {Number(skrd.total_bayar || 0).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                    {skrd.jatuh_tempo && (
                                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                            <Calendar size={10} />
                                            <span>
                                                Jatuh Tempo: {new Date(skrd.jatuh_tempo).toLocaleDateString('id-ID')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-8 text-center text-xs text-slate-400 font-medium">
                            Belum ada dokumen SKRD terbit untuk objek ini.
                        </div>
                    )}
                </div>
            )}

            {/* ACTION BUTTONS (BOTTOM) */}
            <div className="mt-auto p-4 border-t border-slate-200 bg-white space-y-2">
                {data.lat && data.lng && (
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => openSmartStreetView(data.lat, data.lng)}
                            className="w-full flex items-center justify-center gap-1.5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer"
                            title="Buka Google Street View 360° (Otomatis snap ke jalan terdekat)"
                        >
                            <Eye size={13} />
                            <span>Google Street</span>
                        </button>
                        <button
                            onClick={() => openGoogleMapsPin(data.lat, data.lng)}
                            className="w-full flex items-center justify-center gap-1.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                            title="Buka Google Maps (Dijamin 100% selalu menampilkan pin merah pada titik asli)"
                        >
                            <MapPin size={13} className="text-rose-600" />
                            <span>Peta & Pin Asli</span>
                        </button>
                    </div>
                )}

                <button
                    onClick={() => window.open(`/dlh/list-objek?npor=${data.npor_objek}`, '_blank')}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer rounded-none"
                >
                    <ExternalLink size={13} />
                    <span>Buka Manajemen Aset Objek</span>
                </button>
            </div>
        </div>
    );
}

function DetailRow({ icon: Icon, label, value, highlight = false }) {
    return (
        <div className="flex flex-col px-5 py-2.5 hover:bg-slate-50/50 transition-colors">
            <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1.5">
                <Icon size={12} className="text-emerald-700" />
                {label}
            </span>
            <span
                className={`text-xs mt-0.5 leading-snug break-words ${
                    highlight ? 'font-bold text-emerald-800 font-mono text-sm' : 'text-slate-800 font-normal'
                }`}
            >
                {value}
            </span>
        </div>
    );
}

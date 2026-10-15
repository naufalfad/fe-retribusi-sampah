import React from 'react';
import { Trash2, ShieldCheck, MapPin, Layers } from 'lucide-react';

export default function TentangPanel() {
    return (
        <div className="flex flex-col h-full bg-white font-sans text-left p-6 space-y-4 select-none">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 bg-emerald-700 flex items-center justify-center text-white">
                    <Trash2 size={22} />
                </div>
                <div className="flex flex-col">
                    <h3 className="text-sm font-bold text-slate-800 leading-tight">
                        REKAS GIS Command Center
                    </h3>
                    <span className="text-[10px] text-emerald-700 font-mono font-bold">
                        Sistem Pemantauan Spasial Retribusi v2.0
                    </span>
                </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
                Modul GIS Monitoring REKAS mengadopsi arsitektur <strong>GFW Command Center</strong> untuk memberikan kendali pengawasan visual penuh atas seluruh titik wajib retribusi sampah di Kabupaten Bogor.
            </p>

            <div className="space-y-2 pt-2">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Fitur Unggulan
                </h4>
                <ul className="space-y-2 text-xs text-slate-600">
                    <li className="flex items-start gap-2">
                        <ShieldCheck size={14} className="text-emerald-700 shrink-0 mt-0.5" />
                        <span><strong>Early Warning System (EWS)</strong> mendeteksi dan memberi tanda berdenyut pada wajib retribusi dengan tunggakan SKRD.</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <MapPin size={14} className="text-emerald-700 shrink-0 mt-0.5" />
                        <span><strong>Inverted Boundary Masking</strong> meredupkan wilayah di luar Kabupaten Bogor untuk fokus monitoring yang lebih presisi.</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <Layers size={14} className="text-emerald-700 shrink-0 mt-0.5" />
                        <span><strong>Level of Detail (LOD)</strong> transisi dinamis antara pin lingkaran, klaster kepadatan, dan poligon tapak bangunan saat zoom dekat.</span>
                    </li>
                </ul>
            </div>

            <div className="mt-auto pt-6 border-t border-slate-100 text-[10px] text-slate-400">
                Dinas Lingkungan Hidup Kabupaten Bogor • Bidang Pengelolaan Sampah
            </div>
        </div>
    );
}

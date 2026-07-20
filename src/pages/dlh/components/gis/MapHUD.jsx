import React from 'react';
import { Home, Building2 } from 'lucide-react';

const MapHUD = () => {
    return (
        <div className="absolute bottom-6 right-6 z-[1000] pointer-events-none select-none">
            <div className="bg-white/95 backdrop-blur-md p-4 border border-slate-200 shadow-xl pointer-events-auto flex flex-col gap-2 min-w-[200px]">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1.5 mb-1 text-left">
                    Legenda Objek Retribusi
                </h4>
                
                <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-600 text-white flex items-center justify-center border border-white shadow-sm">
                        <Home size={12} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col text-left">
                        <span className="text-[11px] font-bold text-slate-700 leading-none">Rumah Tinggal</span>
                        <span className="text-[8px] font-medium text-slate-400 mt-0.5">Sektor Domestik</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-blue-600 text-white flex items-center justify-center border border-white shadow-sm">
                        <Building2 size={12} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col text-left">
                        <span className="text-[11px] font-bold text-slate-700 leading-none">Non Rumah Tinggal</span>
                        <span className="text-[8px] font-medium text-slate-400 mt-0.5">Bisnis, Industri & Instansi</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapHUD;

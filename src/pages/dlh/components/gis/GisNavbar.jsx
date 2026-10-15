import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Trash2, RefreshCw, Share2, Layers } from 'lucide-react';
import { useGisUIStore } from '../../../../store/useGisUIStore';

export default function GisNavbar({ onRefresh, loading }) {
    const navigate = useNavigate();
    const { clearPanels, resetMapContext } = useGisUIStore();

    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const username = savedUser.username || savedUser.nama || savedUser.npwrd_subjek || 'Admin DLH';
    const role = (savedUser.role || 'DLH').toUpperCase();

    const getInitials = (name) => {
        return name ? name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2) : 'DL';
    };

    const handleBackClick = () => {
        const r = role.toLowerCase();
        if (r === 'admin') navigate('/admin/dashboard');
        else if (r === 'petugas' || r === 'penagih') navigate('/penagih/dashboard');
        else if (r === 'user' || r === 'wajib retribusi') navigate('/user/dashboard');
        else navigate('/dlh/dashboard');
    };

    const handleLogoClick = () => {
        clearPanels();
        resetMapContext();
    };

    return (
        <nav className="absolute top-0 left-0 right-0 h-16 px-6 flex items-center justify-between bg-white border-b border-slate-200 z-50 pointer-events-auto select-none">
            {/* Left: Back Button & Branding */}
            <div className="flex items-center gap-4">
                <button
                    onClick={handleBackClick}
                    className="group flex items-center gap-2 text-slate-500 hover:text-emerald-700 transition-all rounded-none outline-none cursor-pointer"
                    title="Kembali ke Dashboard"
                >
                    <div className="p-1.5 group-hover:bg-slate-100 transition-colors">
                        <ChevronLeft size={20} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest hidden md:block">
                        Kembali
                    </span>
                </button>

                <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

                <button
                    onClick={handleLogoClick}
                    className="flex items-center gap-3 active:scale-95 transition-transform group rounded-none outline-none text-left cursor-pointer"
                >
                    <div className="w-8 h-8 bg-emerald-700 flex items-center justify-center text-white rounded-none shadow-sm group-hover:bg-emerald-800 transition-colors">
                        <Trash2 size={18} />
                    </div>
                    <div className="flex flex-col leading-none">
                        <span className="font-sans font-semibold text-lg tracking-tight text-slate-800">
                            REKAS <span className="text-emerald-700">GIS</span>
                        </span>
                        <span className="text-[8px] text-slate-400 font-bold tracking-[0.2em] uppercase mt-0.5">
                            Command Center Retribusi
                        </span>
                    </div>
                </button>
            </div>

            {/* Right: Tools & Profile */}
            <div className="flex items-center gap-1 md:gap-3">
                {/* Sync / Refresh Button */}
                <button
                    onClick={onRefresh}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:bg-slate-100 hover:text-emerald-700 transition-all active:scale-95 rounded-none outline-none cursor-pointer"
                    title="Sinkronisasi Data Spasial"
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin text-emerald-600' : ''} />
                    <span className="text-[9px] font-black uppercase tracking-widest hidden sm:block">
                        Sync
                    </span>
                </button>

                {/* Reset View Button */}
                <button
                    onClick={handleLogoClick}
                    className="flex items-center gap-1.5 px-3 py-2 text-slate-500 hover:bg-slate-100 hover:text-emerald-700 transition-all active:scale-95 rounded-none outline-none cursor-pointer"
                    title="Reset Tampilan Peta"
                >
                    <Layers size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest hidden sm:block">
                        Reset
                    </span>
                </button>

                <div className="h-6 w-px bg-slate-200 mx-2 hidden sm:block" />

                {/* Profile Badge */}
                <div className="flex items-center gap-3 pl-2 pr-2 py-1 group cursor-default">
                    <div className="w-8 h-8 bg-emerald-100 flex items-center justify-center text-[11px] font-black text-emerald-800 rounded-none">
                        {getInitials(username)}
                    </div>
                    <div className="hidden sm:flex flex-col items-start text-left">
                        <span className="text-[10px] font-black text-slate-800 uppercase tracking-tight line-clamp-1 max-w-[120px]">
                            {username}
                        </span>
                        <span className="text-[8px] text-emerald-700 font-bold uppercase tracking-widest">
                            {role}
                        </span>
                    </div>
                </div>
            </div>
        </nav>
    );
}

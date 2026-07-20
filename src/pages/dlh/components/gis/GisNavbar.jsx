import React from 'react';
import { Leaf, ArrowLeft, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GisNavbar = ({ username = "Admin DLH" }) => {
    const navigate = useNavigate();

    const handleBack = () => {
        const savedUser = JSON.parse(localStorage.getItem('user'));
        const role = savedUser?.role?.toLowerCase() || 'dlh';
        if (role === 'admin') {
            navigate('/admin/dashboard');
        } else {
            navigate('/dlh/dashboard');
        }
    };

    return (
        <header className="absolute top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-[1000] px-6 flex items-center justify-between pointer-events-auto shadow-sm select-none">
            {/* Left: Brand / Title */}
            <div className="flex items-center gap-3">
                <div className="bg-green-700 p-2 text-white shrink-0">
                    <Leaf size={18} />
                </div>
                <div className="flex flex-col">
                    <h1 className="text-sm font-black text-slate-800 tracking-tight leading-none uppercase">
                        Sistem Monitoring Spasial Retribusi
                    </h1>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                        REKAS GIS Command Center
                    </span>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600">
                    <Shield size={12} className="text-green-700" />
                    <span className="text-[10px] font-black uppercase tracking-wider">{username}</span>
                </div>

                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] uppercase tracking-widest transition-colors cursor-pointer"
                >
                    <ArrowLeft size={12} /> Kembali
                </button>
            </div>
        </header>
    );
};

export default GisNavbar;

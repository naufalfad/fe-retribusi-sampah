import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ShieldCheck, ArrowRight, MapPin, Loader2 } from 'lucide-react';

const PenagihLoginPage = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulasi Login Role Penagih
        setTimeout(() => {
            setIsLoading(false);
            navigate('/penagih/dashboard');
        }, 1500);
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative font-sans"
            style={{ backgroundImage: "url('/kebun-raya.png')" }}
        >
            {/* Overlay Gradient: Memberikan kesan maskulin dan lapangan (Deep Blue-Green) */}
            <div className="absolute inset-0 bg-gradient-to-tr from-green-950/90 via-green-900/70 to-emerald-800/50 backdrop-blur-[3px]"></div>

            <div className="max-w-md w-full relative z-10">
                {/* Logo & Branding */}
                <div className="text-center mb-10">
                    <div className="bg-white w-20 h-20 rounded-[2rem] shadow-2xl shadow-green-900/50 flex items-center justify-center mx-auto mb-4 border-4 border-green-500/30">
                        <MapPin size={40} className="text-green-700 animate-bounce" />
                    </div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter drop-shadow-xl">
                        REKAS <span className="text-green-400 italic">MOBILE</span>
                    </h1>
                    <p className="text-sm text-green-100 font-bold uppercase tracking-[0.2em] opacity-80">
                        Petugas Penagihan Lapangan
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white/95 backdrop-blur-xl rounded-[3rem] shadow-2xl p-10 border border-white/20">
                    <div className="mb-8 text-center">
                        <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Otoritas Penagih</h2>
                        <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-widest">Gunakan ID Petugas Anda</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* ID Petugas / Username */}
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">ID Petugas (Username)</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" size={20} />
                                <input
                                    type="text"
                                    placeholder="Masukkan ID Petugas"
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-[1.5rem] focus:ring-4 focus:ring-green-700/5 focus:border-green-700 outline-none transition-all font-bold text-gray-700 shadow-inner"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Kata Sandi</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" size={20} />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-[1.5rem] focus:ring-4 focus:ring-green-700/5 focus:border-green-700 outline-none transition-all font-bold text-gray-700 shadow-inner"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-green-700 hover:bg-black text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-green-900/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 text-sm uppercase tracking-[0.2em]"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    Mulai Tugas <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                            Kendala Login? <br />
                            <a href="#" className="text-green-700 hover:underline">Hubungi Admin UPT Wilayah</a>
                        </p>
                    </div>
                </div>

                {/* Footer Copy */}
                <p className="text-center mt-10 text-[10px] text-green-100/60 font-black uppercase tracking-[0.3em]">
                    &copy; 2026 DLH Kota Bogor <br />
                    v2.0.4-Stable
                </p>
            </div>
        </div>
    );
};

export default PenagihLoginPage;
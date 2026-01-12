import React from 'react';
import { CheckCircle2, XCircle, ExternalLink, FileText } from 'lucide-react';

const DlhValidasiBayar = () => {
    return (
        <div className="space-y-6 text-slate-800">
            <div>
                <h2 className="text-2xl font-bold">Validasi Bukti Pembayaran</h2>
                <p className="text-sm text-slate-500">Verifikasi bukti bayar dari Wajib Retribusi sebelum diteruskan ke Bendahara.</p>
            </div>

            {/* Grid List Bukti Bayar */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3].map((item) => (
                    <div key={item} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden hover:border-green-500 transition-all group">
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">Perlu Validasi</div>
                                <span className="text-xs text-gray-400">09 Jan 2026</span>
                            </div>

                            <div>
                                <h4 className="font-black text-gray-800 leading-tight">TOKO KUE LEZAT</h4>
                                <p className="text-xs text-gray-500 font-mono mt-1">NPWRD: 4.1.2.01.02.000088</p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">Nominal Bayar</p>
                                    <p className="text-lg font-black text-green-700 tracking-tight">Rp 75.000</p>
                                </div>
                                <button className="p-3 bg-white text-blue-600 rounded-xl shadow-sm hover:shadow-md transition-all">
                                    <ExternalLink size={20} />
                                </button>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button className="flex-1 bg-green-700 text-white py-3 rounded-xl text-xs font-bold hover:bg-green-800 flex items-center justify-center gap-2">
                                    <CheckCircle2 size={16} /> Valid
                                </button>
                                <button className="flex-1 bg-white text-red-600 border border-red-100 py-3 rounded-xl text-xs font-bold hover:bg-red-50 flex items-center justify-center gap-2">
                                    <XCircle size={16} /> Tolak
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DlhValidasiBayar;
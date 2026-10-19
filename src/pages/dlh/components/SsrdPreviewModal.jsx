import React, { useEffect } from 'react';
import { FileText, Printer, X } from 'lucide-react';
import { BASE_URL } from '../../../api/axios';

const SsrdPreviewModal = ({ data, onClose }) => {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose?.();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    if (!data) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-5">
            <div className="bg-white w-[94vw] max-w-5xl h-[92vh] max-h-[960px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-3.5 border-b bg-white">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                            <FileText size={18} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-sm font-black uppercase tracking-wider text-gray-900">
                                    Preview SSRD
                                </h2>
                                {data.no_ssrd && (
                                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                                        {data.no_ssrd}
                                    </span>
                                )}
                            </div>
                            <p className="text-[10px] text-gray-400 font-medium">
                                Bukti setor resmi dengan tata letak cetak dokumen A4
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200">
                            <Printer size={12} /> Format Cetak A4
                        </span>
                        <button
                            onClick={onClose}
                            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Tutup"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* CONTENT: HTML BACKEND */}
                <div className="flex-1 w-full bg-[#525659] relative overflow-hidden">
                    <iframe
                        src={`${BASE_URL}/api/ssrd/preview-ssrd/${data.id_ssrd}`}
                        className="w-full h-full border-none"
                        title="Preview SSRD"
                    />
                </div>

                {/* Footer */}
                <div className="px-6 py-3.5 border-t bg-white flex items-center justify-between">
                    <p className="text-xs text-gray-500 hidden sm:flex items-center gap-1.5 font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Format field, garis, dan tabel diposisikan presisi seperti cetak PDF (A4)
                    </p>
                    <div className="flex items-center gap-2 ml-auto">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold transition-all"
                        >
                            Tutup
                        </button>
                        <button
                            onClick={() =>
                                window.open(`${BASE_URL}/api/ssrd/pdf/${data.id_ssrd}`, '_blank')
                            }
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-sm transition-all"
                        >
                            <Printer size={14} />
                            Cetak PDF
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SsrdPreviewModal;
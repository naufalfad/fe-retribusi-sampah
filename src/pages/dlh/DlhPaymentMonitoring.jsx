import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import {
    Search, AlertCircle, Printer,
    CheckCircle2, Clock, FileCheck2, Image as ImageIcon, X
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import SsrdPreviewModal from './components/SsrdPreviewModal';

const DlhPaymentMonitoring = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showSsrdModal, setShowSsrdModal] = useState(false);
    const [selectedData, setSelectedData] = useState(null);

    const [showProofModal, setShowProofModal] = useState(false);

    /* ===============================
       FETCH LIST SSRD
    ================================ */
    useEffect(() => {
        const fetchSsrd = async () => {
            try {
                const res = await api.get('/ssrd/list-ssrd');

                const mapped = res.data.data.map(item => ({
                    id: item.id_ssrd,
                    nama: item.Skrd.Objek?.nama_objek,
                    npor: item.Skrd.Objek?.npor_objek,
                    skrd_no: item.Skrd?.no_skrd ?? '-',
                    tgl_bayar: item.paid_at?.split('T')[0],
                    jumlah: Number(item.amount_paid),
                    status: item.payment_status,
                    ssrd_no: item.no_ssrd,
                    points_used: item.points_used || 0,
                    point_value: item.point_value || 0,
                    raw: item
                }));

                setPayments(mapped);
            } catch (err) {
                console.error('Gagal mengambil SSRD:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSsrd();
    }, []);

    const getStatusInfo = (status) => {
        switch (status?.toLowerCase()) {
            case 'paid':
                return { label: 'PAID', color: 'bg-green-100 text-green-700', icon: <CheckCircle2 size={12} /> };
            case 'unpaid':
                return { label: 'UNPAID', color: 'bg-amber-100 text-amber-700', icon: <AlertCircle size={12} /> };
            case 'expired':
                return { label: 'EXPIRED', color: 'bg-red-100 text-red-700', icon: <AlertCircle size={12} /> };
            case 'partial':
                return { label: 'PAID PARTIAL', color: 'bg-green-100 text-amber-700', icon: <AlertCircle size={12} /> };
            default:
                return { label: 'PENDING', color: 'bg-gray-100 text-gray-700', icon: null };
        }
    };

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div>
                <h1 className="text-2xl font-black text-gray-800 tracking-tight">
                    Monitoring Pembayaran & SSRD
                </h1>
                <p className="text-sm text-gray-500">
                    Monitoring penerbitan SSRD oleh Bendahara.
                </p>
            </div>

            {/* SEARCH */}
            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Cari No. SKRD / SSRD..."
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-green-700 text-sm"
                    />
                </div>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <tr>
                                <th className="p-6">Objek Retribusi</th>
                                <th className="p-6">No. SKRD / Nominal</th>
                                <th className="p-6">Poin Digunakan</th>
                                <th className="p-6">Tgl Bayar</th>
                                <th className="p-6">Status</th>
                                <th className="p-6 text-center">Aksi</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-10 text-center text-sm text-gray-400 italic">
                                        Memuat data SSRD...
                                    </td>
                                </tr>
                            ) : payments.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-10 text-center text-sm text-gray-400 italic">
                                        Belum ada SSRD terbit
                                    </td>
                                </tr>
                            ) : (
                                payments.map(p => (
                                    <tr key={p.id} className="hover:bg-gray-50/50">
                                        <td className="p-6">
                                            <p className="font-bold text-sm">{p.nama}</p>
                                            <p className="text-[10px] text-green-700 font-mono font-bold">
                                                {p.npor}
                                            </p>
                                        </td>

                                        <td className="p-6">
                                            <p className="text-xs font-bold text-gray-500">
                                                {p.skrd_no}
                                            </p>
                                            <p className="font-black text-gray-800">
                                                Rp {p.jumlah.toLocaleString()}
                                            </p>
                                        </td>

                                        <td className="p-6">
                                            {p.points_used > 0 ? (
                                                <div className="mt-2 space-y-1">
                                                    <p className="text-xs font-black text-amber-600">
                                                        - {p.points_used.toLocaleString()} Poin
                                                    </p>
                                                    <p className="text-xs text-slate-400 font-bold">
                                                        ≈ Rp {p.point_value.toLocaleString()}
                                                    </p>
                                                </div>
                                            ) : (
                                                <p className="text-xs font-black text-slate-400">
                                                    0
                                                </p>
                                            )}
                                        </td>

                                        <td className="p-6 text-sm text-gray-600">
                                            {p.tgl_bayar}
                                        </td>

                                        <td className="p-6">
                                            <StatusBadge status={getStatusInfo(p.status).label} />
                                        </td>

                                        <td className="p-6">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedData(p.raw);
                                                        setShowSsrdModal(true);
                                                    }}
                                                    className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-black"
                                                >
                                                    <FileCheck2 size={14} />
                                                    Lihat SSRD
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL SSRD */}
            {showSsrdModal && (
                <SsrdPreviewModal
                    data={selectedData}
                    onClose={() => setShowSsrdModal(false)}
                />
            )}
        </div>
    );
};

export default DlhPaymentMonitoring;
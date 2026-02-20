import { BASE_URL } from '../../../api/axios';
const SkrdPreviewModal = ({ data, onClose }) => {
    if (!data) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-md">
            <div className="bg-white w-[90vw] h-[90vh] rounded-2xl shadow-2xl flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h2 className="text-sm font-black uppercase tracking-widest">
                        Preview SKRD
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-black">✕</button>
                </div>

                {/* CONTENT: HTML BACKEND */}
                <iframe
                    src={`${BASE_URL}/api/skrd/preview-skrd/${data.id_skrd}`}
                    className="flex-1 w-full border-none"
                    title="Preview SKRD"
                />

                {/* Footer */}
                <div className="p-4 border-t flex justify-end gap-2">
                    <button
                        onClick={() =>
                            window.open(`${BASE_URL}/api/skrd/pdf/${data.id_skrd}`, '_blank')
                        }
                        className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-black"
                    >
                        Cetak PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SkrdPreviewModal;
import { Trash2 } from "lucide-react";

function DeleteModal({
    isOpen,
    title,
    onClose,
    onConfirm,
}: {
    isOpen: boolean;
    title: string;
    onClose: () => void;
    onConfirm: () => void;
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/30 dark:bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-sm bg-white dark:bg-[#1A1A18] border border-[#E8E8E4] dark:border-[#2A2A26] rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/40 overflow-hidden">
                <div className="p-6 space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center shrink-0">
                            <Trash2 size={16} className="text-rose-500" strokeWidth={2} />
                        </div>
                        <div>
                            <h3 className="text-[14px] font-semibold text-[#1A1A18] dark:text-[#F0EFE9]">
                                Eliminar sesión
                            </h3>
                            <p className="text-[12px] text-[#8B8B85] dark:text-[#6B6B63] mt-1 leading-relaxed">
                                Se eliminará <span className="text-[#1A1A18] dark:text-[#F0EFE9] font-medium">"{title}"</span> junto con los recursos en GitHub y Notion. Esta acción es irreversible.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl text-[12px] font-medium bg-[#F7F7F5] dark:bg-[#252522] text-[#5C5C56] dark:text-[#8B8B85] hover:bg-[#EFEFEC] dark:hover:bg-[#2A2A26] border border-[#E8E8E4] dark:border-[#2A2A26] transition-colors duration-150"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 py-2.5 rounded-xl text-[12px] font-medium bg-rose-500 hover:bg-rose-600 text-white transition-colors duration-150"
                        >
                            Eliminar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DeleteModal
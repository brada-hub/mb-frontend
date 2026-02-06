import { X, AlertTriangle } from 'lucide-react';
import { createPortal } from 'react-dom';
import { Button } from '../ui/Button';

export default function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, confirmText = "Eliminar", cancelText = "Cancelar", type = "danger" }) {
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-surface-card border border-surface-border rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-gray-900 dark:text-gray-100">
                <div className="p-8 text-center space-y-6">
                    <div className="w-16 h-16 bg-[#bc1b1b]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-8 h-8 text-[#bc1b1b]" />
                    </div>
                    
                    <div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2 transition-colors">{title}</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium transition-colors">{message}</p>
                    </div>

                    <div className="flex gap-3">
                        <button 
                            onClick={onClose}
                            className="flex-1 py-3 px-4 rounded-xl border border-surface-border text-gray-900 dark:text-white font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-all text-xs uppercase tracking-widest"
                        >
                            {cancelText}
                        </button>
                        <Button 
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className="flex-1 rounded-xl shadow-lg shadow-[#bc1b1b]/20 bg-[#bc1b1b] hover:bg-[#991b1b] text-xs uppercase font-black tracking-widest"
                        >
                            {confirmText}
                        </Button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}

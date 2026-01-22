import { X, AlertCircle } from 'lucide-react';
import { createPortal } from 'react-dom';
import { Button } from '../ui/Button';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = "Eliminar", cancelText = "Cancelar", variant = "danger" }) {
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative w-full max-w-md bg-surface-card border border-surface-border rounded-[32px] shadow-2xl overflow-hidden transform animate-in zoom-in-95 duration-300 text-gray-900 dark:text-gray-100">
                
                {/* Header/Icon Area */}
                <div className="p-8 pb-4 flex flex-col items-center text-center">
                    <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-2xl ${
                        variant === 'danger' ? 'bg-red-500/10 text-red-500 shadow-red-500/20' : 'bg-indigo-500/10 text-indigo-500 shadow-indigo-500/20'
                    }`}>
                        <AlertCircle className="w-10 h-10" />
                    </div>
                    
                    <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2 transition-colors">
                        {title}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-widest leading-relaxed transition-colors">
                        {message}
                    </p>
                </div>

                {/* Actions Area */}
                <div className="p-8 pt-4 flex flex-col gap-3">
                    <Button 
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        variant={variant === 'danger' ? 'danger' : 'primary'}
                        className="w-full h-14 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl"
                    >
                        {confirmText}
                    </Button>
                    <button 
                        onClick={onClose}
                        className="w-full py-3 text-[10px] font-black text-gray-500 dark:text-gray-500 uppercase tracking-[0.2em] hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        {cancelText}
                    </button>
                </div>

                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl text-gray-500 transition-all"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>,
        document.body
    );
}

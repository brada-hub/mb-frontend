import { X, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';

export default function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, confirmText = "Eliminar", cancelText = "Cancelar", type = "danger" }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-transparent animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-[#161b2c] border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8 text-center space-y-6">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    
                    <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">{title}</h3>
                        <p className="text-gray-400 text-sm font-medium">{message}</p>
                    </div>

                    <div className="flex gap-3">
                        <button 
                            onClick={onClose}
                            className="flex-1 py-3 px-4 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-all text-xs uppercase tracking-widest"
                        >
                            {cancelText}
                        </button>
                        <Button 
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className="flex-1 rounded-xl shadow-lg shadow-red-500/20 bg-red-600 hover:bg-red-500 text-xs uppercase font-black tracking-widest"
                        >
                            {confirmText}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

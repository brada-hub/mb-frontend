import { AlertTriangle, Info, X } from 'lucide-react';
import { Button } from './Button';
import { clsx } from 'clsx';

export default function ConfirmModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    confirmText = "Confirmar", 
    cancelText = "Cancelar",
    variant = "danger", // danger, warning, info
    loading = false
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative w-full max-w-md bg-surface-card border border-surface-border rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                
                <div className={clsx(
                    "p-8 text-center space-y-6",
                    variant === 'danger' ? "bg-red-500/5 transition-colors" : "bg-brand-primary/5 transition-colors"
                )}>
                    <div className={clsx(
                        "w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6",
                        variant === 'danger' ? "bg-red-500/20 text-red-500" : "bg-brand-primary/20 text-brand-primary"
                    )}>
                        {variant === 'danger' ? <AlertTriangle className="w-10 h-10" /> : <Info className="w-10 h-10" />}
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-tight transition-colors">{title}</h2>
                        <p className="text-gray-500 dark:text-gray-400 font-medium transition-colors">{message}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-4">
                        <Button 
                            variant="secondary" 
                            onClick={onClose}
                            className="h-14 rounded-2xl font-bold border-surface-border active:scale-95"
                            disabled={loading}
                        >
                            {cancelText}
                        </Button>
                        <Button 
                            variant={variant === 'danger' ? 'monster' : 'monster'}
                            onClick={onConfirm}
                            loading={loading}
                            className={clsx(
                                "h-14 rounded-2xl font-bold active:scale-95",
                                variant === 'danger' ? "bg-red-600 hover:bg-red-700 shadow-red-500/20" : ""
                            )}
                        >
                            {confirmText}
                        </Button>
                    </div>
                </div>

                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
}

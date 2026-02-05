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
            <div className="relative w-full max-w-md bg-surface-card border border-surface-border rounded-3xl sm:rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                
                <div className={clsx(
                    "p-6 sm:p-8 text-center space-y-4 sm:space-y-6",
                    variant === 'danger' ? "bg-red-500/5 transition-colors" : "bg-brand-primary/5 transition-colors"
                )}>
                    <div className={clsx(
                        "w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6",
                        variant === 'danger' ? "bg-red-500/20 text-red-500" : "bg-brand-primary/20 text-brand-primary"
                    )}>
                        {variant === 'danger' ? <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10" /> : <Info className="w-8 h-8 sm:w-10 sm:h-10" />}
                    </div>

                    <div className="space-y-1 sm:space-y-2">
                        <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-tight transition-colors">{title}</h2>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium transition-colors">{message}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-2 sm:pt-4">
                        <Button 
                            variant="secondary" 
                            onClick={onClose}
                            className="h-11 sm:h-14 rounded-xl sm:rounded-2xl font-bold border-surface-border active:scale-95 text-[11px] sm:text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                            disabled={loading}
                        >
                            {cancelText}
                        </Button>
                        <Button 
                            variant={variant === 'danger' ? 'danger' : 'primary'}
                            onClick={onConfirm}
                            loading={loading}
                            className={clsx(
                                "h-11 sm:h-14 rounded-xl sm:rounded-2xl font-bold active:scale-95 shadow-xl text-[11px] sm:text-sm",
                                variant === 'danger' ? "shadow-red-500/20" : "shadow-brand-primary/25"
                            )}
                        >
                            {confirmText}
                        </Button>
                    </div>
                </div>

                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all active:scale-90"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}

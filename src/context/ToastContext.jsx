import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { clsx } from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const notify = useCallback((message, type = 'success', duration = 4000) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
    }, []);

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ notify }}>
            {children}
            <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[300] flex flex-col items-center gap-3 w-full max-w-sm pointer-events-none px-4">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, y: -20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            className={clsx(
                                "flex items-center gap-4 p-4 pr-12 rounded-2xl border shadow-2xl backdrop-blur-md pointer-events-auto relative w-full",
                                toast.type === 'success' && "bg-[#10b981]/10 border-[#10b981]/20 text-[#10b981]",
                                toast.type === 'error' && "bg-[#ef4444]/10 border-[#ef4444]/20 text-[#ef4444]",
                                toast.type === 'info' && "bg-brand-primary/10 border-brand-primary/20 text-brand-primary"
                            )}
                        >
                            <div className="flex-shrink-0">
                                {toast.type === 'success' && <CheckCircle2 className="w-6 h-6" />}
                                {toast.type === 'error' && <AlertCircle className="w-6 h-6" />}
                                {toast.type === 'info' && <Info className="w-6 h-6" />}
                            </div>
                            <p className="text-sm font-bold tracking-tight leading-snug">{toast.message}</p>
                            <button 
                                onClick={() => removeToast(toast.id)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
};

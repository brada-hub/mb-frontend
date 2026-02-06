import { useState, useEffect } from 'react';
import api from '../../api';
import { Button } from '../ui/Button';
import { X, Shield, ShieldCheck, CheckCircle2, Circle, Save } from 'lucide-react';
import { clsx } from 'clsx';
import { useToast } from '../../context/ToastContext';

export default function MiembroPermisosModal({ isOpen, onClose, onSuccess, miembro }) {
    const [loading, setLoading] = useState(false);
    const [allPermisos, setAllPermisos] = useState([]);
    const [selectedPermisos, setSelectedPermisos] = useState([]);
    const { notify } = useToast();

    useEffect(() => {
        if (isOpen && miembro) {
            // Cargar todos los permisos
            api.post('/sync/master-data')
                .then(res => {
                    const sorted = (res.data.permisos || []).sort((a, b) => a.permiso.localeCompare(b.permiso));
                    setAllPermisos(sorted);
                })
                .catch(console.error);

            // Obtener IDs de permisos del rol
            const rolePerms = miembro.rol?.permisos?.map(p => p.id_permiso) || [];
            // Obtener IDs de permisos personalizados
            const customPerms = miembro.permisos?.map(p => p.id_permiso) || [];
            
            // Combinar ambos (sin duplicados)
            const combined = [...new Set([...rolePerms, ...customPerms])];
            setSelectedPermisos(combined);
        }
    }, [isOpen, miembro]);

    const togglePermiso = (id) => {
        if (selectedPermisos.includes(id)) {
            setSelectedPermisos(selectedPermisos.filter(p => p !== id));
        } else {
            setSelectedPermisos([...selectedPermisos, id]);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await api.put(`/miembros/${miembro.id_miembro}`, {
                permisos: selectedPermisos
            });
            notify("Permisos actualizados correctamente", "success");
            if (onSuccess) onSuccess(res.data);
            onClose();
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || "Error al guardar permisos";
            notify(msg, "error");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !miembro) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative w-full max-w-xl bg-surface-card border border-surface-border rounded-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh] text-gray-900 dark:text-gray-100">
                
                <div className="flex items-center justify-between p-6 bg-[#bc1b1b] text-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-xl">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight">Permisos Especiales</h2>
                            <p className="text-xs text-white/60 font-medium uppercase tracking-widest">{miembro.nombres} {miembro.apellidos}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-all">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                    <p className="text-gray-500 dark:text-gray-400 text-sm italic transition-colors">
                        Selecciona los permisos adicionales que tendrá este músico por encima de los de su rol ({miembro.rol?.rol}).
                    </p>

                    <div className="grid grid-cols-1 gap-3">
                        {allPermisos.map((p) => {
                            const isSelected = selectedPermisos.includes(p.id_permiso);
                            return (
                                <button
                                    key={p.id_permiso}
                                    type="button"
                                    onClick={() => togglePermiso(p.id_permiso)}
                                    className={clsx(
                                        "flex items-center justify-between p-4 rounded-2xl border transition-all text-left",
                                        isSelected 
                                            ? "bg-[#bc1b1b]/10 border-[#bc1b1b]/30 text-gray-900 dark:text-white" 
                                            : "bg-black/5 dark:bg-white/5 border-surface-border text-gray-500 dark:text-gray-400 hover:border-[#bc1b1b]/30"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={clsx(
                                            "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                            isSelected ? "bg-[#bc1b1b] text-white" : "bg-black/10 dark:bg-white/5 text-gray-400 dark:text-gray-500"
                                        )}>
                                            <ShieldCheck className="w-5 h-5" />
                                        </div>
                                        <span className={clsx("text-sm font-bold uppercase tracking-tight transition-colors", isSelected ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400")}>
                                            {p.permiso.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                    {isSelected ? (
                                        <CheckCircle2 className="w-6 h-6 text-[#bc1b1b]" />
                                    ) : (
                                        <Circle className="w-6 h-6 text-gray-300 dark:text-gray-700" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="p-6 border-t border-surface-border bg-black/5 dark:bg-white/5 flex gap-3">
                    <Button variant="ghost" onClick={onClose} className="flex-1">Cancelar</Button>
                    <Button onClick={handleSave} loading={loading} className="flex-1" variant="monster">
                        <Save className="w-5 h-5 mr-3" /> Guardar Permisos
                    </Button>
                </div>
            </div>
        </div>
    );
}

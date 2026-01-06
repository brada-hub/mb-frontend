import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../../api';
import { Button } from '../ui/Button';
import { 
    X, 
    Music, 
    Plus, 
    Trash2,
    Check,
    Video,
    Link as LinkIcon
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function TemaModal({ isOpen, onClose, idGenero, nombreGenero, onSuccess, initialData }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nombre_tema: '',
        url_video: ''
    });
    const { notify } = useToast();

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    nombre_tema: initialData.nombre_tema,
                    url_video: initialData.videos?.[0]?.url_video || ''
                });
            } else {
                setFormData({
                    nombre_tema: '',
                    url_video: ''
                });
            }
        }
    }, [isOpen, initialData]);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.nombre_tema.trim()) {
            notify("El nombre del tema es obligatorio", "warning");
            return;
        }
        setLoading(true);
        try {
            const payload = {
                nombre_tema: formData.nombre_tema.toUpperCase(),
                id_genero: idGenero,
                url_video: formData.url_video
            };

            if (initialData) {
                await api.put(`temas/${initialData.id_tema}`, payload);
                notify("Tema actualizado correctamente", "success");
            } else {
                await api.post('temas', payload);
                notify("Tema añadido correctamente", "success");
            }
            onSuccess();
            onClose();
        } catch (error) {
            notify(error.response?.data?.message || "Error al procesar el tema", "error");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative w-full max-w-md bg-[#161b2c] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden p-8 animate-in zoom-in-95 duration-300">
                
                {/* Close Button */}
                <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-xl transition-all">
                    <X className="w-5 h-5 text-gray-500" />
                </button>

                <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-16 h-16 bg-indigo-600/20 rounded-3xl flex items-center justify-center text-indigo-400 mb-4 shadow-xl shadow-indigo-600/10">
                        <Music className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                        {initialData ? 'EDITAR TEMA' : 'NUEVO TEMA'}
                    </h2>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-2">
                        Categoría: <span className="text-indigo-400">{nombreGenero}</span>
                    </p>
                </div>

                <form onSubmit={handleSave} className="space-y-5">
                    <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2 mb-2 block">Nombre de la Canción</label>
                        <input 
                            type="text"
                            placeholder="EJ: AZUL Y AMARILLO..."
                            value={formData.nombre_tema}
                            onChange={(e) => setFormData({...formData, nombre_tema: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 uppercase font-bold placeholder:text-gray-700"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2 mb-2 block">Link de Video (YouTube/Referencia)</label>
                        <div className="relative">
                            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input 
                                type="text"
                                placeholder="YouTube, Drive, etc (Opcional)..."
                                value={formData.url_video}
                                onChange={(e) => setFormData({...formData, url_video: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder:text-gray-700 font-medium"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-2">
                        <Button 
                            type="submit"
                            className="w-full h-14 rounded-2xl shadow-xl shadow-indigo-600/20 uppercase font-black tracking-widest"
                            loading={loading}
                        >
                            {initialData ? <Check className="w-5 h-5 mr-1" /> : <Plus className="w-5 h-5 mr-1" />}
                            {initialData ? 'GUARDAR CAMBIOS' : 'CREAR TEMA'}
                        </Button>
                        <button 
                            type="button"
                            onClick={onClose}
                            className="w-full py-2 text-[10px] font-black text-gray-600 uppercase tracking-widest hover:text-white transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}

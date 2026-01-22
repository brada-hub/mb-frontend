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
import { clsx } from 'clsx';

export default function TemaModal({ isOpen, onClose, idGenero, nombreGenero, onSuccess, initialData }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nombre_tema: '',
        url_video: '',
        audio_file: null
    });
    const { notify } = useToast();

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    nombre_tema: initialData.nombre_tema,
                    url_video: initialData.videos?.[0]?.url_video || '',
                    audio_file: null // Files can't be preset in input, user must re-upload if changing
                });
            } else {
                setFormData({
                    nombre_tema: '',
                    url_video: '',
                    audio_file: null
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
            const data = new FormData();
            data.append('nombre_tema', formData.nombre_tema.toUpperCase());
            data.append('id_genero', idGenero);
            if (formData.url_video) data.append('url_video', formData.url_video);
            if (formData.audio_file) data.append('audio_file', formData.audio_file);

            // If updating and not using FormData before, be careful. 
            // Put using FormData typically requires non-standard handling in Laravel or using _method: PUT
            
            if (initialData) {
                // Laravel sometimes struggles with PUT and FormData files. Usually best to use POST with _method=PUT
                data.append('_method', 'PUT');
                await api.post(`temas/${initialData.id_tema}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                notify("Tema actualizado correctamente", "success");
            } else {
                await api.post('temas', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
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
            <div className="relative w-full max-w-md bg-surface-card border border-surface-border rounded-[40px] shadow-2xl overflow-hidden p-8 animate-in zoom-in-95 duration-300 transition-colors">
                
                {/* Close Button */}
                <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all">
                    <X className="w-5 h-5 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors" />
                </button>

                <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-16 h-16 bg-indigo-600/20 rounded-3xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 shadow-xl shadow-indigo-600/10">
                        <Music className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight transition-colors">
                        {initialData ? 'EDITAR TEMA' : 'NUEVO TEMA'}
                    </h2>
                    <p className="text-[10px] text-gray-500 dark:text-gray-500 font-bold uppercase tracking-[0.2em] mt-2 transition-colors">
                        Categoría: <span className="text-indigo-600 dark:text-indigo-400">{nombreGenero}</span>
                    </p>
                </div>

                <form onSubmit={handleSave} className="space-y-5">
                    <div>
                        <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-2 mb-2 block transition-colors">Nombre de la Canción</label>
                        <input 
                            type="text"
                            placeholder="EJ: AZUL Y AMARILLO..."
                            value={formData.nombre_tema}
                            onChange={(e) => setFormData({...formData, nombre_tema: e.target.value})}
                            className="w-full bg-surface-input border border-surface-border rounded-2xl px-5 py-4 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 uppercase font-bold placeholder:text-gray-400 dark:placeholder:text-gray-700 transition-all"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-2 mb-2 block transition-colors">Audio del Tema (Opcional)</label>
                        <div className="relative group">
                            <input 
                                id="audio-upload"
                                type="file"
                                accept=".mp3,.wav,.ogg,.m4a"
                                onChange={(e) => setFormData({...formData, audio_file: e.target.files[0]})}
                                className="hidden"
                            />
                            <div className={clsx(
                                "flex items-center gap-4 w-full bg-surface-input border rounded-2xl p-2 transition-all",
                                formData.audio_file || initialData?.audio ? "border-indigo-500/50 bg-indigo-500/5" : "border-surface-border"
                            )}>
                                <label 
                                    htmlFor="audio-upload"
                                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl cursor-pointer transition-all shadow-lg shrink-0"
                                >
                                    Seleccionar Archivo
                                </label>
                                <div className="flex-1 min-w-0 pr-2">
                                    <p className="text-[10px] font-bold text-gray-900 dark:text-white uppercase truncate transition-colors">
                                        {formData.audio_file 
                                            ? formData.audio_file.name 
                                            : initialData?.audio 
                                                ? initialData.audio.url_audio.split('/').pop() 
                                                : 'Sin archivo seleccionado'}
                                    </p>
                                    {(formData.audio_file || initialData?.audio) && (
                                        <p className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mt-0.5 transition-colors">
                                            {formData.audio_file ? 'Archivo listo para subir' : 'Audio actual guardado'}
                                        </p>
                                    )}
                                </div>
                                {formData.audio_file && (
                                    <button 
                                        type="button"
                                        onClick={() => setFormData({...formData, audio_file: null})}
                                        className="p-1.5 hover:bg-red-500/20 text-red-600 dark:text-red-500 rounded-lg transition-all"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-2 mb-2 block transition-colors">Link de Video (YouTube/Referencia)</label>
                        <div className="relative">
                            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 transition-colors" />
                            <input 
                                type="text"
                                placeholder="YouTube, Drive, etc (Opcional)..."
                                value={formData.url_video}
                                onChange={(e) => setFormData({...formData, url_video: e.target.value})}
                                className="w-full bg-surface-input border border-surface-border rounded-2xl pl-12 pr-5 py-4 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder:text-gray-400 dark:placeholder:text-gray-700 font-medium transition-all"
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
                            className="w-full py-2 text-[10px] font-black text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors uppercase tracking-widest"
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

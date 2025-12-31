import { X, User, Phone, MapPin, Calendar, Shield, Music, Star, Fingerprint, Home, MessageCircle, AlertCircle, Map, Share2 } from 'lucide-react';
import { Button } from '../ui/Button';

export default function MiembroDetalleModal({ isOpen, onClose, miembro }) {
    if (!isOpen || !miembro) return null;

    const getStatusColor = (estado) => {
        return estado ? 'text-green-400 bg-green-500/10 border-green-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20';
    };

    const googleMapsUrl = miembro.latitud && miembro.longitud 
        ? `https://www.google.com/maps?q=${miembro.latitud},${miembro.longitud}`
        : null;

    const shareInfo = () => {
        const text = `*Perfil de Integrante - Monster Band*\n\n` +
            `Nombre: ${miembro.nombres} ${miembro.apellidos}\n` +
            `Seccion: ${miembro.seccion?.seccion || 'N/A'}\n` +
            `Celular: ${miembro.celular}\n` +
            `Direccion: ${miembro.direccion || 'No especificada'}\n` +
            (googleMapsUrl ? `\nUbicacion GPS: ${googleMapsUrl}` : '');
        
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative w-full max-w-2xl h-full md:h-auto max-h-[100vh] md:max-h-[95vh] bg-surface-card md:border md:border-white/10 md:rounded-4xl shadow-2xl overflow-y-auto animate-in zoom-in-95 duration-300">
                
                {/* Header / Banner */}
                <div className="relative h-32 bg-gradient-to-r from-brand-primary to-monster-purple group">
                    <button 
                        onClick={onClose} 
                        className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Profile Info Header */}
                <div className="px-6 md:px-10 pb-8 -mt-12 relative">
                    <div className="flex flex-col md:flex-row md:items-end gap-6">
                        <div className="relative">
                            <div className="w-24 h-24 md:w-32 md:h-32 bg-surface-input border-4 border-surface-card rounded-3xl flex items-center justify-center shadow-xl">
                                <User className="w-12 h-12 md:w-16 md:h-16 text-gray-500" />
                            </div>
                            <div className={`absolute bottom-2 right-2 w-5 h-5 rounded-full border-4 border-surface-card ${miembro.user?.estado ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        </div>
                        
                        <div className="space-y-1 py-2">
                            <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
                                {miembro.nombres} {miembro.apellidos}
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(miembro.user?.estado)}`}>
                                    {miembro.user?.estado ? 'ACTIVO' : 'INACTIVO'}
                                </span>
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/5 border border-white/10 text-gray-400">
                                    ID: {miembro.id_miembro}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                        
                        {/* Personal Details */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                                <Shield className="w-4 h-4 text-brand-primary" />
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Información Personal</h3>
                            </div>
                            
                            <div className="space-y-4">
                                <DetailItem icon={Fingerprint} label="Cédula de Identidad" value={miembro.ci} />
                                <DetailItem icon={Phone} label="Teléfono Celular" value={miembro.celular} />
                                <DetailItem icon={Calendar} label="Fecha de Nacimiento" value={new Date(miembro.fecha).toLocaleDateString('es-BO', { day: 'numeric', month: 'long', year: 'numeric' })} />
                                <DetailItem icon={Home} label="Dirección" value={miembro.direccion} />
                            </div>
                        </div>

                        {/* Operational Details */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                                <Music className="w-4 h-4 text-brand-primary" />
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Asignación Band</h3>
                            </div>
                            
                            <div className="space-y-4">
                                <DetailItem icon={Music} label="Sección / Instrumento" value={miembro.seccion?.seccion || 'Sin Sección'} />
                                <DetailItem icon={Star} label="Categoría" value={miembro.categoria?.nombre_categoria || 'Sin Categoría'} />
                                <DetailItem icon={Shield} label="Rol en Sistema" value={miembro.rol?.rol || 'Sin Rol'} />
                            </div>
                        </div>

                        {/* Location Details */}
                        <div className="md:col-span-2 space-y-6 pt-4">
                            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                                <MapPin className="w-4 h-4 text-brand-primary" />
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ubicación y Vivienda</h3>
                            </div>
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-1">
                                    <DetailItem icon={Home} label="Dirección Detallada" value={miembro.direccion} />
                                </div>
                                {googleMapsUrl && (
                                    <a 
                                        href={googleMapsUrl} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl hover:bg-blue-500/20 transition-all group"
                                    >
                                        <div className="p-2 bg-blue-500/20 rounded-xl group-hover:scale-110 transition-transform">
                                            <Map className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">GPS Disponible</p>
                                            <p className="text-sm font-bold text-white">Ver en Google Maps</p>
                                        </div>
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Emergency Contact */}
                        {miembro.contactos && miembro.contactos.length > 0 && (
                            <div className="md:col-span-2 p-6 bg-red-500/5 border border-red-500/10 rounded-3xl space-y-4">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-red-400" />
                                    <h3 className="text-xs font-bold text-red-400 uppercase tracking-widest">Contacto de Emergencia</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <DetailItem label="Nombre" value={miembro.contactos[0].nombres_apellidos} light />
                                    <DetailItem label="Celular" value={miembro.contactos[0].celular} light />
                                    <DetailItem label="Parentesco" value={miembro.contactos[0].parentesco} light />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap justify-end gap-3">
                        <Button variant="ghost" onClick={onClose}>Cerrar</Button>
                        <Button 
                            variant="secondary" 
                            onClick={shareInfo}
                            className="bg-monster-purple/20 hover:bg-monster-purple/30 text-monster-purple-light border-monster-purple/20"
                        >
                            <Share2 className="w-4 h-4 mr-2" />
                            Compartir Perfil
                        </Button>
                        <a 
                            href={`https://wa.me/591${miembro.celular}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex items-center gap-2 px-6 py-2.5 bg-[#25D366] hover:bg-[#20bd5c] text-white rounded-2xl font-bold transition-all shadow-lg shadow-green-500/10 active:scale-95"
                        >
                            <MessageCircle className="w-5 h-5 mr-1" />
                            Chat Directo
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DetailItem({ icon: Icon, label, value, light = false }) {
    return (
        <div className="flex items-start gap-3">
            {Icon && (
                <div className={`mt-1 p-1.5 rounded-lg ${light ? 'bg-white/10' : 'bg-surface-input'} border border-white/5`}>
                    <Icon className="w-3.5 h-3.5 text-gray-400" />
                </div>
            )}
            <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter leading-none mb-1">{label}</p>
                <p className="text-sm font-semibold text-white/90 leading-tight">{value || 'N/A'}</p>
            </div>
        </div>
    );
}

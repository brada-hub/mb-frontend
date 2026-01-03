import { useState, useEffect } from 'react';
import { X, User, Phone, MapPin, Calendar, Shield, Music, Star, Fingerprint, Home, MessageCircle, AlertCircle, Map, Share2, Smartphone, Trash2, Save, RefreshCw, Key } from 'lucide-react';
import { Button } from '../ui/Button';
import ConfirmModal from '../ui/ConfirmModal';

import api from '../../api';
import { useToast } from '../../context/ToastContext';

export default function MiembroDetalleModal({ isOpen, onClose, miembro }) {
    const [activeTab, setActiveTab] = useState('profile');
    const [devices, setDevices] = useState([]);
    const [deviceLimit, setDeviceLimit] = useState(1);
    const [loadingDevices, setLoadingDevices] = useState(false);
    const [confirmState, setConfirmState] = useState({ isOpen: false, type: null, data: null }); // type: 'deleteDevice' | 'resetPass'
    const { notify } = useToast();

    useEffect(() => {
        if (isOpen && activeTab === 'scurity' && miembro) {
            loadDevices();
        }
    }, [isOpen, activeTab, miembro]);

    const loadDevices = async () => {
        setLoadingDevices(true);
        try {
            const res = await api.get(`/miembros/${miembro.id_miembro}/dispositivos`);
            setDevices(res.data.devices);
            setDeviceLimit(res.data.limit);
        } catch (error) {
            console.error(error);
            notify('Error cargando dispositivos', 'error');
        } finally {
            setLoadingDevices(false);
        }
    };

    const handleUpdateLimit = async () => {
        try {
            await api.put(`/miembros/${miembro.id_miembro}/limite-dispositivos`, { limit: deviceLimit });
            notify('Límite actualizado correctamente', 'success');
        } catch (error) {
            notify('Error al actualizar límite', 'error');
        }
    };

    const handleDeleteDevice = (id) => {
        setConfirmState({
            isOpen: true,
            type: 'deleteDevice',
            data: id,
            title: '¿Eliminar dispositivo?',
            message: 'El usuario tendrá que volver a iniciar sesión para registrar su teléfono nuevamente.',
            confirmText: 'Sí, Eliminar',
            variant: 'danger'
        });
    };

    const handleResetPassword = () => {
        setConfirmState({
            isOpen: true,
            type: 'resetPass',
            data: null,
            title: '¿Restablecer Contraseña?',
            message: 'Se generará una nueva contraseña temporal y se abrirá WhatsApp para enviársela al usuario.',
            confirmText: 'Generar Nueva Clave',
            variant: 'warning'
        });
    };

    const handleConfirmAction = async () => {
        setConfirmState(prev => ({ ...prev, loading: true }));
        try {
            if (confirmState.type === 'deleteDevice') {
                await api.delete(`/dispositivos/${confirmState.data}`);
                notify('Dispositivo eliminado', 'success');
                loadDevices();
            } else if (confirmState.type === 'resetPass') {
                const res = await api.post(`/miembros/${miembro.id_miembro}/reset-password`);
                notify('Contraseña restablecida correctamente', 'success');
                window.open(res.data.whatsapp_url, '_blank');
            }
        } catch (error) {
            notify('Ocurrió un error al procesar la solicitud', 'error');
        } finally {
            setConfirmState({ isOpen: false, type: null, data: null, loading: false });
        }
    };

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
        <>
            <ConfirmModal 
                isOpen={confirmState.isOpen}
                onClose={() => setConfirmState({ ...confirmState, isOpen: false })}
                onConfirm={handleConfirmAction}
                loading={confirmState.loading}
                title={confirmState.title}
                message={confirmState.message}
                confirmText={confirmState.confirmText}
                variant={confirmState.variant}
            />
            
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative w-full max-w-2xl h-full md:h-auto max-h-[100vh] md:max-h-[95vh] bg-surface-card md:border md:border-white/10 md:rounded-4xl shadow-2xl overflow-y-auto animate-in zoom-in-95 duration-300">
                
                {/* Header / Banner */}
                <div className="relative h-32 bg-gradient-to-r from-brand-primary to-monster-purple group">
                    <button 
                        onClick={() => { setActiveTab('profile'); onClose(); }} 
                        className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    
                    {/* Tabs */}
                    <div className="absolute bottom-0 left-0 right-0 px-6 md:px-10 flex gap-6 translate-y-1/2 md:justify-start justify-center pt-16 md:pt-0 pointer-events-none">
                         {/* Spacer for avatar */}
                        <div className="w-24 md:w-32 hidden md:block"></div>
                        
                        <div className="flex gap-2 pointer-events-auto bg-surface-card/80 backdrop-blur-md p-1 rounded-2xl border border-white/10 shadow-lg">
                             <button
                                onClick={() => setActiveTab('profile')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'profile' ? 'bg-monster-purple text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                             >
                                <User className="w-4 h-4 inline-block mr-2 -mt-0.5" />
                                Perfil
                             </button>
                             <button
                                onClick={() => setActiveTab('scurity')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'scurity' ? 'bg-monster-purple text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                             >
                                <Shield className="w-4 h-4 inline-block mr-2 -mt-0.5" />
                                Seguridad
                             </button>
                        </div>
                    </div>
                </div>

                    {/* Profile Info Header */}
                    <div className="px-6 md:px-10 pb-8 mt-4 md:mt-2 relative">
                        <div className="flex flex-col md:flex-row md:items-end gap-6 pt-8 md:pt-0">
                             {/* Avatar - Adjusted position */}
                            <div className="relative md:absolute md:-top-16 md:left-0 mx-auto md:mx-0">
                                <div className="w-24 h-24 md:w-32 md:h-32 bg-surface-input border-4 border-surface-card rounded-3xl flex items-center justify-center shadow-xl">
                                    <User className="w-12 h-12 md:w-16 md:h-16 text-gray-500" />
                                </div>
                                <div className={`absolute bottom-2 right-2 w-5 h-5 rounded-full border-4 border-surface-card ${miembro.user?.estado ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            </div>
                            
                            {/* Name & Basic Info - Adjusted margin */}
                            <div className="space-y-1 py-0 md:py-2 md:pl-36 text-center md:text-left w-full">
                                <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
                                    {miembro.nombres} {miembro.apellidos}
                                </h2>
                                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(miembro.user?.estado)}`}>
                                        {miembro.user?.estado ? 'ACTIVO' : 'INACTIVO'}
                                    </span>
                                </div>
                            </div>
                        </div>

                    {/* Content Switcher */}
                    {activeTab === 'profile' ? (
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        
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
                                <DetailItem 
                                    icon={Music} 
                                    label="Sección / Instrumento" 
                                    value={`${miembro.seccion?.seccion || 'Sin Sección'} - ${miembro.instrumento?.instrumento || 'Sin Instrumento'}`} 
                                />
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
                    ) : (
                        <div className="mt-8 space-y-6">
                            {/* Device Controls */}
                            <div className="p-6 bg-surface-input/30 rounded-3xl border border-white/5">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                     <div>
                                         <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                             <Smartphone className="w-5 h-5 text-brand-primary" />
                                             Control de Dispositivos Móviles
                                         </h3>
                                         <p className="text-sm text-gray-400 mt-1">
                                             Gestiona cuántos y cuáles teléfonos pueden acceder a esta cuenta.
                                         </p>
                                     </div>
                                     <div className="flex items-end gap-2 p-3 bg-surface-card rounded-2xl border border-white/5">
                                         <div>
                                             <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Límite Permitido</label>
                                             <input 
                                                 type="number" 
                                                 min="1" 
                                                 max="10" 
                                                 value={deviceLimit}
                                                 onChange={(e) => setDeviceLimit(parseInt(e.target.value))}
                                                 className="w-20 h-8 bg-surface-input text-center text-white font-bold rounded-lg border border-white/10 focus:border-brand-primary outline-none"
                                             />
                                         </div>
                                         <Button onClick={handleUpdateLimit} size="sm" className="h-8">
                                             <Save className="w-3.5 h-3.5 mr-1" />
                                             Guardar
                                         </Button>
                                     </div>
                                </div>

                                {/* Password Reset Section */}
                                <div className="mb-6 p-4 bg-orange-500/10 rounded-2xl border border-orange-500/20 flex items-center justify-between gap-4">
                                    <div>
                                        <h4 className="text-white font-bold flex items-center gap-2">
                                            <Key className="w-4 h-4 text-orange-400" />
                                            Accesos del Usuario
                                        </h4>
                                        <p className="text-xs text-orange-200/70 mt-1">
                                            Si olvidó su contraseña, puedes restablecerla aquí.
                                        </p>
                                    </div>
                                    <Button 
                                        onClick={handleResetPassword}
                                        variant="secondary"
                                        size="sm"
                                        className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border-orange-500/30"
                                    >
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        Restablecer Clave
                                    </Button>
                                </div>

                                {/* Device List */}
                                <div className="space-y-3">
                                    {loadingDevices ? (
                                        <div className="text-center py-8 text-gray-500">Cargando...</div>
                                    ) : devices.length > 0 ? (
                                        devices.map(device => (
                                            <div key={device.id_dispositivo} className="flex items-center justify-between p-4 bg-surface-card rounded-2xl border border-white/5 hover:border-brand-primary/20 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                                                        <Smartphone className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-white">{device.nombre_modelo}</p>
                                                        <p className="text-xs text-gray-500 font-mono tracking-wider">
                                                            {new Date(device.fecha_registro).toLocaleDateString()} • {device.estado ? 'ACTIVO' : 'BLOQUEADO'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => handleDeleteDevice(device.id_dispositivo)}
                                                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                                                    title="Eliminar dispositivo"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-10 border-2 border-dashed border-white/5 rounded-2xl">
                                            <Smartphone className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                                            <p className="text-gray-500 font-medium px-6 text-center">
                                                Aún no ha iniciado sesión en la App Móvil.<br/>
                                                <span className="text-xs opacity-70">El dispositivo se registrará automáticamente al ingresar.</span>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-4 bg-blue-500/5 text-blue-200 text-sm rounded-2xl border border-blue-500/10 flex gap-3">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <p>Nota: Al eliminar un dispositivo, el usuario deberá iniciar sesión nuevamente para registrar el nuevo teléfono. Si superan el límite establecido, el sistema les impedirá entrar.</p>
                            </div>
                        </div>
                    )}

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
        </>
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

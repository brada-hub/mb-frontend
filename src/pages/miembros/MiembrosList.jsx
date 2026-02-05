import { useState, useEffect, useMemo } from 'react';
import api from '../../api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { 
    Search, Plus, User, MapPin, Phone, Briefcase, 
    Shield, Power, LayoutGrid, List, MoreVertical, 
    MessageCircle, ExternalLink, Filter, ChevronDown,
    Flame, CheckCircle2, XCircle, AlertCircle, Clock
} from 'lucide-react';
import { clsx } from 'clsx';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import MiembroModal from '../../components/modals/MiembroModal';
import MiembroDetalleModal from '../../components/modals/MiembroDetalleModal';
import MiembroPermisosModal from '../../components/modals/MiembroPermisosModal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { motion, AnimatePresence } from 'framer-motion';
import { SkeletonMemberTable } from '../../components/ui/skeletons/Skeletons';

export default function MiembrosList() {
    const [miembros, setMiembros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    
    // Filtros avanzados
    const [filterInstrument, setFilterInstrument] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive
    const [catalogs, setCatalogs] = useState({ secciones: [], categorias: [] });

    // UI States
    const [memberStats, setMemberStats] = useState([]);
    const [activeMenu, setActiveMenu] = useState(null);
    const [togglingId, setTogglingId] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
    const [selectedMiembro, setSelectedMiembro] = useState(null);
    const [confirmState, setConfirmState] = useState({ isOpen: false, member: null, loading: false });
    const { notify } = useToast();
    const { user } = useAuth();
    const isSuperAdmin = user?.is_super_admin;


    useEffect(() => {
        let isMounted = true;
        
        const loadInitialData = async () => {
             const token = localStorage.getItem('token');
             if (!token) return; // No intentamos cargar si no hay token (evita 401 al cerrar sesión)

             try {
                const [membersRes, catalogsRes, statsRes] = await Promise.all([
                    api.get('/miembros'),
                    api.post('/sync/master-data'),
                    api.get('/asistencias/reporte-grupal')
                ]);
                
                if (isMounted) {
                    setMiembros(membersRes.data);
                    setCatalogs(catalogsRes.data);
                    setMemberStats(statsRes.data?.report || []);
                    setLoading(false);
                }
             } catch (error) {
                 if (isMounted) {
                    console.error("Error loading data:", error);
                    setLoading(false);
                 }
             }
        };

        loadInitialData();

        const handleClickOutside = () => setActiveMenu(null);
        window.addEventListener('click', handleClickOutside);
        return () => { 
            isMounted = false;
            window.removeEventListener('click', handleClickOutside);
        };
    }, []);

    const loadMiembros = () => {
        setLoading(true);
        api.get('/miembros')
            .then(res => setMiembros(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    const handleEdit = (miembro) => {
        setSelectedMiembro(miembro);
        setIsModalOpen(true);
    };

    const handleViewProfile = (miembro) => {
        setSelectedMiembro(miembro);
        setIsDetailOpen(true);
    };

    const handleAdd = () => {
        setSelectedMiembro(null);
        setIsModalOpen(true);
    };

    const handleToggleStatus = async (miembro) => {
        if (togglingId) return;
        
        setTogglingId(miembro.id_miembro);
        try {
            const res = await api.post(`/miembros/${miembro.id_miembro}/toggle-status`);
            setMiembros(prev => prev.map(m => m.id_miembro === miembro.id_miembro ? res.data : m));
            const statusMsg = miembro.user?.estado ? "Acceso desactivado" : "Acceso habilitado";
            notify(`${statusMsg} para ${miembro.nombres}`, "success");
        } catch (error) {
            notify("Error al cambiar estado", "error");
        } finally {
            setTogglingId(null);
        }
    };

    const handleOpenPermissions = (miembro) => {
        setSelectedMiembro(miembro);
        setIsPermissionsOpen(true);
    };

    const getMemberStat = (id) => {
        return memberStats.find(s => s.id_miembro === id);
    };

    const filtered = useMemo(() => {
        return miembros.filter(m => {
            // Filtro de Texto
            const searchLower = search.toLowerCase();
            const fullName = `${m.nombres} ${m.apellidos}`.toLowerCase();
            const ci = m.ci ? m.ci.toString().toLowerCase() : '';
            const celular = m.celular ? m.celular.toString() : '';
            
            const matchesSearch = fullName.includes(searchLower) || 
                                ci.includes(searchLower) || 
                                celular.includes(searchLower);

            // Filtros de Selección
            const matchesInstrument = !filterInstrument || m.id_instrumento == filterInstrument;
            const matchesCategory = !filterCategory || m.id_categoria == filterCategory;
            
            // Filtro de Estado (Acceso)
            const hasAccess = m.user && m.user.estado;
            const matchesStatus = filterStatus === 'all' || 
                                (filterStatus === 'active' && hasAccess) || 
                                (filterStatus === 'inactive' && !hasAccess);

            return matchesSearch && matchesInstrument && matchesCategory && matchesStatus;
        });
    }, [miembros, search, filterInstrument, filterCategory, filterStatus]);

    const AccessSwitch = ({ checked, onChange, loading }) => (
        <button 
            onClick={(e) => {
                e.stopPropagation();
                if (!loading) onChange();
            }}
            disabled={loading}
            className={clsx(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300",
                checked ? "bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.3)]" : "bg-gray-300 dark:bg-white/10",
                loading ? "opacity-30 cursor-wait" : "cursor-pointer"
            )}
        >
            <span
                className={clsx(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-300 shadow-lg",
                    checked ? "translate-x-6" : "translate-x-1"
                )}
            />
        </button>
    );

    const HealthBadge = ({ id }) => {
        const stat = getMemberStat(id);
        if (!stat) return null;

        const rate = stat.rate;
        const color = rate >= 80 ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                      rate >= 50 ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                      'bg-red-500/10 text-red-500 border-red-500/20';
        
        return (
            <div className={clsx("flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest border", color)}>
                {rate >= 90 && <Flame className="w-3 h-3 fill-current animate-pulse" />}
                {rate}%
            </div>
        );
    };

    const WhatsAppButton = ({ phone, name, variant = 'default' }) => (
        <a 
            href={`https://wa.me/591${phone}`} 
            target="_blank" 
            rel="noreferrer"
            className={clsx(
                "w-11 h-11 flex items-center justify-center rounded-xl transition-all active:scale-90 shadow-sm",
                variant === 'sos' 
                    ? "bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/10" 
                    : "bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/10"
            )}
            title={variant === 'sos' ? `SOS: Contactar a ${name}` : `Contactar a ${name}`}
            onClick={(e) => e.stopPropagation()}
        >
            <MessageCircle className="w-5 h-5" />
        </a>
    );

    const LocationButton = ({ miembro }) => {
        const { latitud: lat, longitud: lng, nombres: name, direccion, referencia_vivienda } = miembro;
        const emergencyContact = miembro.contactos?.[0];

        if (!lat || !lng) return (
            <div className="p-2 text-gray-700 opacity-20" title="Sin ubicación registrada">
                <MapPin className="w-4 h-4" />
            </div>
        );

        const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
        
        // Mensaje detallado para WhatsApp
        let message = `📍 *Ubicación de ${name}*\n\n`;
        message += `🏠 *Dirección:* ${direccion || 'No especificada'}\n`;
        if (referencia_vivienda) message += `🔍 *Referencia:* ${referencia_vivienda}\n`;
        
        if (emergencyContact) {
            message += `\n🆘 *Contacto SOS:* ${emergencyContact.nombres_apellidos}\n`;
            message += `📞 *Celular SOS:* ${emergencyContact.celular}\n`;
        }
        
        message += `\n🗺️ *Google Maps:* ${mapsUrl}`;

        const whatsappShare = `https://wa.me/?text=${encodeURIComponent(message)}`;

        return (
            <div className="flex items-center gap-2">
                <a 
                    href={mapsUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-11 h-11 flex items-center justify-center bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl transition-all active:scale-90 border border-blue-500/10 shadow-sm"
                    title="Ver en Google Maps"
                    onClick={(e) => e.stopPropagation()}
                >
                    <MapPin className="w-5 h-5" />
                </a>
                <a 
                    href={whatsappShare} 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-11 h-11 flex items-center justify-center bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-xl transition-all active:scale-90 border border-indigo-500/10 shadow-sm"
                    title="Compartir Info Completa (Dirección + SOS)"
                    onClick={(e) => e.stopPropagation()}
                >
                    <ExternalLink className="w-5 h-5" />
                </a>
            </div>
        );
    };

    const MemberActions = ({ miembro }) => {
        const isOpen = activeMenu === miembro.id_miembro;

        return (
            <div className="relative">
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenu(isOpen ? null : miembro.id_miembro);
                    }}
                    className={clsx(
                        "w-11 h-11 flex items-center justify-center rounded-xl transition-all active:scale-90 border shadow-lg sm:shadow-none",
                        isOpen 
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-indigo-600/20" 
                            : "bg-black/5 dark:bg-white/5 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10 border-surface-border"
                    )}
                >
                    <MoreVertical className="w-5 h-5" />
                </button>
                
                <AnimatePresence>
                    {isOpen && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="absolute right-0 mt-2 w-56 rounded-2xl bg-surface-card border border-surface-border shadow-[0_20px_50px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] py-2 overflow-hidden backdrop-blur-xl transition-colors"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button onClick={() => handleViewProfile(miembro)} className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left uppercase tracking-widest">
                                <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Ver Perfil Completo
                            </button>
                            <button onClick={() => handleEdit(miembro)} className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left uppercase tracking-widest">
                                <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Editar Información
                            </button>
                            {/* Solo SuperAdmin puede gestionar permisos */}
                            {isSuperAdmin && (
                                <button onClick={() => handleOpenPermissions(miembro)} className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left uppercase tracking-widest">
                                    <Shield className="w-4 h-4 text-monster-purple" /> Gestionar Permisos
                                </button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    return (
        <div className="h-full overflow-y-auto custom-scrollbar relative px-1 lg:px-4">
            <MiembroModal 
                isOpen={isModalOpen} 
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedMiembro(null);
                }} 
                onSuccess={() => loadMiembros()}
                miembro={selectedMiembro}
            />

            <MiembroDetalleModal 
                isOpen={isDetailOpen}
                onClose={() => {
                    setIsDetailOpen(false);
                    setSelectedMiembro(null);
                }}
                miembro={selectedMiembro}
            />

            <MiembroPermisosModal 
                isOpen={isPermissionsOpen}
                onClose={() => {
                    setIsPermissionsOpen(false);
                    setSelectedMiembro(null);
                }}
                onSuccess={(updated) => {
                    setMiembros(miembros.map(m => m.id_miembro === updated.id_miembro ? updated : m));
                }}
                miembro={selectedMiembro}
            />

            {/* Modal de Confirmación descontinuado por Switch directo, pero se mantiene referencia por si se requiere en otros flujos */}

            {/* FAB para Móvil */}
            <div className="fixed bottom-6 right-6 z-[60] md:hidden">
                <Button 
                    onClick={handleAdd} 
                    className="w-14 h-14 rounded-full shadow-2xl bg-brand-primary flex items-center justify-center p-0 border-4 border-[#121625]"
                >
                    <Plus className="w-6 h-6 text-white" />
                </Button>
            </div>

            {/* Header Sticky */}
            <div className="sticky top-0 z-40 bg-white/80 dark:bg-[#121625]/80 backdrop-blur-xl border-b border-surface-border -mx-4 px-4 py-2 sm:py-4 mb-4 sm:mb-6 transition-colors">
                <div className="flex flex-col gap-3 sm:gap-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 sm:gap-3">
                                <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight transition-colors">Miembros</h1>
                                <span className="bg-brand-primary/20 text-brand-primary text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full border border-brand-primary/30">
                                    {miembros.length}
                                </span>
                            </div>
                            <p className="text-gray-500 dark:text-gray-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mt-0.5 transition-colors leading-none">Gestión de personal militar</p>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                             {/* Lógica de Límites (SaaS) */}
                             {!loading && catalogs.suscripcion && (
                                <div className="flex flex-col items-end gap-1">
                                    <div className="flex items-center gap-2">
                                        <span className={clsx(
                                            "text-[9px] font-black uppercase tracking-tighter",
                                            catalogs.suscripcion.uso_miembros >= catalogs.suscripcion.max_miembros ? "text-red-400" : "text-gray-500"
                                        )}>
                                            Músicos: {catalogs.suscripcion.uso_miembros} / {catalogs.suscripcion.max_miembros}
                                        </span>
                                        {catalogs.suscripcion.uso_miembros >= catalogs.suscripcion.max_miembros && (
                                            <div className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded-md animate-pulse">
                                                <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">Upgrade</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden">
                                        <div 
                                            className={clsx(
                                                "h-full transition-all duration-1000",
                                                (catalogs.suscripcion.uso_miembros / catalogs.suscripcion.max_miembros) >= 0.9 ? "bg-red-500" : "bg-brand-primary"
                                            )}
                                            style={{ width: `${Math.min(100, (catalogs.suscripcion.uso_miembros / catalogs.suscripcion.max_miembros) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                             )}

                             <div className="hidden md:flex items-center gap-2">
                                <Button 
                                    onClick={handleAdd} 
                                    disabled={catalogs.suscripcion?.uso_miembros >= catalogs.suscripcion?.max_miembros}
                                    className={clsx(
                                        "h-10 px-5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                                        catalogs.suscripcion?.uso_miembros >= catalogs.suscripcion?.max_miembros 
                                            ? "bg-gray-800 text-gray-500 cursor-not-allowed grayscale" 
                                            : "bg-brand-primary hover:bg-brand-primary/90"
                                    )}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    {catalogs.suscripcion?.uso_miembros >= catalogs.suscripcion?.max_miembros ? 'Límite Alcanzado' : 'Nuevo'}
                                </Button>
                             </div>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-2 sm:gap-3">
                        {/* Buscador - 60% approx */}
                        <div className="flex-grow lg:flex-[6]">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 dark:text-gray-500" />
                                <input 
                                    type="text"
                                    placeholder="BUSCAR..."
                                    className="w-full bg-surface-input border border-surface-border rounded-xl py-2.5 sm:py-3 pl-11 pr-4 text-[9px] sm:text-[10px] font-bold text-gray-900 dark:text-white uppercase placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-brand-primary/50 transition-all h-10 sm:h-12"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Filtros - 20% approx */}
                        <div className="flex lg:flex-[3] gap-2">
                             <select 
                                className="flex-1 bg-surface-input border-surface-border border rounded-xl h-9 sm:h-11 px-3 text-[9px] sm:text-[10px] font-bold uppercase text-gray-600 dark:text-gray-400 focus:outline-none focus:border-brand-primary/50 transition-colors"
                                value={filterInstrument}
                                onChange={(e) => setFilterInstrument(e.target.value)}
                            >
                                <option value="" className="bg-surface-card">INSTRUMENTOS</option>
                                {catalogs.secciones?.flatMap(s => s.instrumentos || []).map(inst => (
                                    <option key={inst.id_instrumento} value={inst.id_instrumento} className="bg-surface-card">{inst.instrumento}</option>
                                ))}
                            </select>
 
                            <select 
                                className="flex-1 bg-surface-input border-surface-border border rounded-xl h-9 sm:h-11 px-3 text-[9px] sm:text-[10px] font-bold uppercase text-gray-600 dark:text-gray-400 focus:outline-none focus:border-brand-primary/50 transition-colors"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="all" className="bg-surface-card">ESTADOS</option>
                                <option value="active" className="bg-surface-card">CON ACCESO</option>
                                <option value="inactive" className="bg-surface-card">SIN ACCESO</option>
                            </select>
                        </div>

                    </div>
                </div>
            </div>

            {loading ? (
                <div className="pb-20">
                     <SkeletonMemberTable />
                </div>
            ) : (
                <div className="pb-20">
                    <AnimatePresence mode="wait">
                        {filtered.length === 0 ? (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="py-20 text-center text-gray-500 border border-surface-border rounded-[40px] bg-black/5 dark:bg-white/5 border-dashed mx-4 transition-colors"
                            >
                                <Search className="w-12 h-12 mx-auto mb-4 opacity-50 text-brand-primary" />
                                <p className="text-xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight transition-colors">Sin resultados</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest">No encontramos miembros con esos filtros</p>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="list"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="bg-surface-card border border-surface-border rounded-3xl shadow-2xl transition-colors"
                            >
                                <div className="space-y-4">
                                    {/* Header Visible solo en Desktop */}
                                    <div className="hidden md:grid grid-cols-[1fr_1fr_100px_100px_90px_80px_80px_60px] gap-4 px-8 py-4 bg-black/5 dark:bg-black/20 rounded-t-3xl border-b border-surface-border">
                                        <div className="text-[10px] font-black text-gray-500 dark:text-gray-500 uppercase tracking-widest transition-colors">Miembro</div>
                                        <div className="text-[10px] font-black text-gray-500 dark:text-gray-500 uppercase tracking-widest transition-colors">Instrumento / Rol</div>
                                        <div className="text-[10px] font-black text-gray-500 dark:text-gray-500 uppercase tracking-widest text-center transition-colors">Contacto</div>
                                        <div className="text-[10px] font-black text-gray-500 dark:text-gray-500 uppercase tracking-widest text-center transition-colors">S.O.S</div>
                                        <div className="text-[10px] font-black text-gray-500 dark:text-gray-500 uppercase tracking-widest text-center transition-colors">Ubicación</div>
                                        <div className="text-[10px] font-black text-gray-500 dark:text-gray-500 uppercase tracking-widest text-center transition-colors">Asistencia</div>
                                        <div className="text-[10px] font-black text-gray-500 dark:text-gray-500 uppercase tracking-widest text-center transition-colors">Acceso</div>
                                        <div className="text-[10px] font-black text-gray-500 dark:text-gray-500 uppercase tracking-widest text-right transition-colors">Menú</div>
                                    </div>

                                    {/* Rows */}
                                    <div className="divide-y divide-surface-border md:space-y-0 space-y-4 p-4 md:p-0">
                                        {filtered.map(miembro => {
                                            const isInactive = miembro.user && !miembro.user.estado;
                                            const emergencyContact = miembro.contactos?.[0];
                                            
                                            // ... handleRoleChange logic remains the same ...
                                            const handleRoleChange = async (rolId) => {
                                                try {
                                                    await api.put(`/miembros/${miembro.id_miembro}`, { ...miembro, id_rol: rolId });
                                                    notify(`Rol actualizado para ${miembro.nombres}`, "success");
                                                    setMiembros(prev => prev.map(m => m.id_miembro === miembro.id_miembro ? { ...m, id_rol: rolId, rol: catalogs.roles.find(r => r.id_rol == rolId) } : m));
                                                } catch (error) { notify("Error al actualizar rol", "error"); }
                                            };

                                            return (
                                                <div 
                                                    key={miembro.id_miembro} 
                                                    className="grid grid-cols-1 md:grid-cols-[1.2fr_1.2fr_100px_100px_90px_80px_80px_60px] gap-4 items-center px-6 md:px-8 py-6 md:py-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-all group relative border-b last:border-0 border-surface-border bg-black/[0.02] dark:bg-white/[0.02] md:bg-transparent rounded-3xl md:rounded-none"
                                                >
                                                    {/* Miembro Info */}
                                                    <div className="flex items-center gap-4">
                                                        <div className={clsx(
                                                            "w-12 h-12 md:w-11 md:h-11 rounded-2xl flex items-center justify-center font-black text-sm transition-all group-hover:scale-110",
                                                            isInactive ? "bg-red-500/10 text-red-500" : "bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 shadow-xl shadow-indigo-600/10"
                                                        )}>
                                                            {miembro.nombres.charAt(0)}{miembro.apellidos.charAt(0)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-none mb-1 truncate">
                                                                {miembro.nombres}
                                                            </p>
                                                            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest opacity-60 truncate transition-colors">
                                                                {miembro.apellidos}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Instrumento / Rol */}
                                                    <div className="flex items-center md:flex-col justify-between md:justify-start gap-4 md:gap-1.5 md:pr-4">
                                                        <span className="md:hidden text-[9px] font-black text-gray-500 uppercase tracking-widest">Puesto:</span>
                                                        <div className="flex flex-col gap-1 w-2/3 md:w-full">
                                                            <p className="text-[10px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-widest truncate transition-colors">
                                                                {miembro.instrumento?.instrumento || 'General'}
                                                            </p>
                                                            <select
                                                                value={miembro.id_rol}
                                                                onChange={(e) => handleRoleChange(e.target.value)}
                                                                className="bg-black/10 dark:bg-black/30 border-surface-border border rounded-lg h-8 px-2 text-[9px] font-black uppercase text-indigo-600 dark:text-indigo-400 focus:ring-1 focus:ring-indigo-500/50 outline-none w-full cursor-pointer transition-colors"
                                                            >
                                                                {catalogs.roles?.map(r => (
                                                                    <option key={r.id_rol} value={r.id_rol} className="bg-surface-card">{r.rol}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 md:contents gap-4">
                                                        {/* Contacto Principal */}
                                                        <div className="flex flex-col md:items-center gap-2 p-3 bg-black/5 dark:bg-white/5 md:bg-transparent rounded-2xl md:p-0 transition-colors">
                                                            <span className="md:hidden text-[9px] font-black text-gray-500 uppercase tracking-widest">Contacto:</span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 font-mono tracking-tighter hidden md:block transition-colors">{miembro.celular}</span>
                                                                <WhatsAppButton phone={miembro.celular} name={miembro.nombres} />
                                                            </div>
                                                        </div>

                                                        {/* S.O.S */}
                                                        <div className="flex flex-col md:items-center gap-2 p-3 bg-black/5 dark:bg-white/5 md:bg-transparent rounded-2xl md:p-0 transition-colors">
                                                            <span className="md:hidden text-[9px] font-black text-red-500/70 uppercase tracking-widest">S.O.S:</span>
                                                            {emergencyContact ? (
                                                                <WhatsAppButton phone={emergencyContact.celular} name={emergencyContact.nombres_apellidos} variant="sos" />
                                                            ) : (
                                                                <div className="w-11 h-11 flex items-center justify-center opacity-20"><Phone className="w-4 h-4 text-gray-500" /></div>
                                                            )}
                                                        </div>

                                                        {/* Ubicación (GPS) */}
                                                        <div className="flex flex-col md:items-center gap-2 p-3 bg-black/5 dark:bg-white/5 md:bg-transparent rounded-2xl md:p-0 transition-colors">
                                                            <span className="md:hidden text-[9px] font-black text-blue-500/70 uppercase tracking-widest">Gps:</span>
                                                            <LocationButton miembro={miembro} />
                                                        </div>

                                                        {/* Asistencia */}
                                                        <div className="flex flex-col md:items-center gap-2 p-3 bg-black/5 dark:bg-white/5 md:bg-transparent rounded-2xl md:p-0 transition-colors">
                                                            <span className="md:hidden text-[9px] font-black text-gray-500 uppercase tracking-widest">Rate:</span>
                                                            <HealthBadge id={miembro.id_miembro} />
                                                        </div>
                                                    </div>

                                                    {/* Acceso */}
                                                    <div className="flex items-center justify-between md:justify-center pt-2 md:pt-0 border-t md:border-t-0 border-surface-border mt-2 md:mt-0 transition-colors">
                                                        <span className="md:hidden text-[10px] font-black text-gray-500 uppercase tracking-widest">Estado Acceso:</span>
                                                        <AccessSwitch checked={!isInactive} onChange={() => handleToggleStatus(miembro)} loading={togglingId === miembro.id_miembro} />
                                                    </div>

                                                    {/* Acciones */}
                                                    <div className="absolute top-6 right-6 md:static md:flex md:justify-end">
                                                        <MemberActions miembro={miembro} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}

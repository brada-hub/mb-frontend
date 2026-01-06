import { useState, useEffect } from 'react';
import api from '../../api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Search, Plus, User, MapPin, Phone, Briefcase, Shield, Power } from 'lucide-react';
import { clsx } from 'clsx';
import { useToast } from '../../context/ToastContext';
import MiembroModal from '../../components/modals/MiembroModal';
import MiembroDetalleModal from '../../components/modals/MiembroDetalleModal';
import MiembroPermisosModal from '../../components/modals/MiembroPermisosModal';
import ConfirmModal from '../../components/ui/ConfirmModal';

export default function MiembrosList() {
    const [miembros, setMiembros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    
    // Filtros avanzados
    const [filterInstrument, setFilterInstrument] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [catalogs, setCatalogs] = useState({ secciones: [], categorias: [] });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
    const [selectedMiembro, setSelectedMiembro] = useState(null);
    const [confirmState, setConfirmState] = useState({ isOpen: false, member: null, loading: false });
    const { notify } = useToast();

    useEffect(() => {
        let isMounted = true;
        
        const loadInitialData = async () => {
             const token = localStorage.getItem('token');
             if (!token) return; // No intentamos cargar si no hay token (evita 401 al cerrar sesión)

             try {
                const [membersRes, catalogsRes] = await Promise.all([
                    api.get('/miembros'),
                    api.post('/sync/master-data')
                ]);
                
                if (isMounted) {
                    setMiembros(membersRes.data);
                    setCatalogs(catalogsRes.data);
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

        return () => { isMounted = false; };
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

    const handleToggleStatus = (miembro) => {
        setConfirmState({
            isOpen: true,
            member: miembro,
            loading: false
        });
    };

    const handleConfirmToggle = async () => {
        const { member } = confirmState;
        if (!member) return;

        setConfirmState(prev => ({ ...prev, loading: true }));
        try {
            const res = await api.post(`/miembros/${member.id_miembro}/toggle-status`);
            setMiembros(miembros.map(m => m.id_miembro === member.id_miembro ? res.data : m));
            const statusMsg = member.user?.estado ? "Acceso desactivado para" : "Acceso habilitado para";
            notify(`${statusMsg} ${member.nombres} ${member.apellidos}`, "success");
            setConfirmState({ isOpen: false, member: null, loading: false });
        } catch (error) {
            notify("Error al cambiar estado", "error");
            setConfirmState(prev => ({ ...prev, loading: false }));
        }
    };

    const handleOpenPermissions = (miembro) => {
        setSelectedMiembro(miembro);
        setIsPermissionsOpen(true);
    };

    const filtered = miembros.filter(m => {
        // Filtro de Texto (Nombre, Apellidos, CI, Celular)
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

        return matchesSearch && matchesInstrument && matchesCategory;
    });

    return (
        <div className="h-full overflow-y-auto custom-scrollbar space-y-6 pr-2">
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

            <ConfirmModal 
                isOpen={confirmState.isOpen}
                onClose={() => setConfirmState({ isOpen: false, member: null, loading: false })}
                onConfirm={handleConfirmToggle}
                loading={confirmState.loading}
                title={confirmState.member?.user?.estado ? "Desactivar Acceso" : "Habilitar Acceso"}
                message={confirmState.member?.user?.estado 
                    ? `¿Estás seguro de desactivar a ${confirmState.member?.nombres} ${confirmState.member?.apellidos}? Ya no podrá entrar al sistema hasta que lo habilites de nuevo.` 
                    : `¿Quieres habilitar el acceso para ${confirmState.member?.nombres} ${confirmState.member?.apellidos}?`
                }
                confirmText={confirmState.member?.user?.estado ? "Quitar Acceso" : "Habilitar Ahora"}
                variant={confirmState.member?.user?.estado ? "danger" : "info"}
            />

            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-2">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tight">Miembros</h1>
                    <p className="text-gray-500 text-sm font-medium uppercase tracking-widest mt-1">Gestión de personal y músicos</p>
                </div>
                
                <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
                    {/* Filtro Instrumento */}
                    <select 
                        id="filter-instrument"
                        className="bg-[#161b2c] border-white/5 rounded-xl h-12 px-4 text-xs font-bold uppercase tracking-wider text-gray-400 focus:ring-brand-primary/50 outline-none cursor-pointer hover:bg-white/5 transition-colors"
                        value={filterInstrument}
                        onChange={(e) => setFilterInstrument(e.target.value)}
                    >
                        <option value="" className="bg-[#161b2c] text-gray-400">FILTRAR POR INSTRUMENTO</option>
                        {catalogs.secciones?.flatMap(s => s.instrumentos || []).map(inst => (
                            <option key={inst.id_instrumento} value={inst.id_instrumento} className="bg-[#161b2c] text-white">
                                {inst.instrumento}
                            </option>
                        ))}
                    </select>

                    <select 
                        id="filter-category"
                        className="bg-[#161b2c] border-white/5 rounded-xl h-12 px-4 text-xs font-bold uppercase tracking-wider text-gray-400 focus:ring-brand-primary/50 outline-none cursor-pointer hover:bg-white/5 transition-colors"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                    >
                        <option value="" className="bg-[#161b2c] text-gray-400">FILTRAR POR CATEGORÍA</option>
                        {catalogs.categorias?.map(c => (
                            <option key={c.id_categoria} value={c.id_categoria} className="bg-[#161b2c] text-white">{c.nombre_categoria}</option>
                        ))}
                    </select>

                    {/* Buscador */}
                    <div className="w-full md:w-64">
                        <Input 
                            id="search-input"
                            icon={Search}
                            placeholder="BUSCAR MIEMBRO..." 
                            className="h-12 w-full text-sm bg-[#161b2c] border-white/5 rounded-xl focus:ring-brand-primary/50 placeholder:text-gray-600"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    
                    <Button id="btn-nuevo" onClick={handleAdd} className="h-12 px-6 shadow-lg shadow-brand-primary/10 text-xs font-black uppercase tracking-widest rounded-xl bg-brand-primary hover:bg-brand-primary/90 shrink-0">
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="text-white text-center py-20 flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Cargando lista...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-10">
                    {filtered.length > 0 ? filtered.map(miembro => {
                        const isInactive = miembro.user && !miembro.user.estado;
                        return (
                            <div key={miembro.id_miembro} className={clsx(
                                "group relative bg-surface-card border rounded-[32px] overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-brand-primary/10 hover:-translate-y-1",
                                isInactive ? "border-red-500/20 opacity-90" : "border-white/5 hover:border-brand-primary/30"
                            )}>
                                {/* Status Header */}
                                <div className="absolute top-4 right-4 z-10">
                                    <span className={clsx(
                                        "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md",
                                        isInactive 
                                            ? "bg-red-500/10 text-red-500 border-red-500/20" 
                                            : "bg-green-500/10 text-green-500 border-green-500/20"
                                    )}>
                                        {isInactive ? 'Sin Acceso' : 'Con Acceso'}
                                    </span>
                                </div>

                                <div className="p-7">
                                    <div className="flex items-start gap-5 mb-6">
                                        <div className={clsx(
                                            "w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl transition-transform group-hover:scale-110 duration-500",
                                            isInactive ? "bg-red-500/10 text-red-500" : "bg-brand-primary/20 text-brand-primary"
                                        )}>
                                            {miembro.nombres.charAt(0)}{miembro.apellidos.charAt(0)}
                                        </div>
                                        <div className="flex-1 pr-12">
                                            <h3 className="font-bold text-xl text-white group-hover:text-brand-primary transition-colors leading-tight">
                                                {miembro.nombres} {miembro.apellidos}
                                            </h3>
                                            <p className="text-sm text-gray-400 font-medium uppercase tracking-tight">
                                                {miembro.rol?.rol || 'Sin Rol asignado'}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-3 pt-6 border-t border-white/5 text-sm">
                                        <div className="flex items-center gap-3 text-gray-400">
                                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-brand-primary">
                                                <Briefcase className="w-4 h-4" />
                                            </div>
                                            <span className="font-medium truncate">
                                                {miembro.instrumento?.instrumento || miembro.seccion?.seccion || 'N/A'} • {miembro.categoria?.nombre_categoria || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-400">
                                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-monster-purple">
                                                <Phone className="w-4 h-4" />
                                            </div>
                                            <span className="font-medium">{miembro.celular}</span>
                                        </div>
                                    </div>

                                    {/* Action Grid */}
                                    <div className="mt-8 grid grid-cols-2 gap-3">
                                        <Button 
                                            variant="secondary" 
                                            size="sm" 
                                            className="h-11 rounded-2xl border-white/5 font-bold"
                                            onClick={() => handleViewProfile(miembro)}
                                        >
                                            Perfil
                                        </Button>
                                        <Button 
                                            variant="secondary" 
                                            size="sm" 
                                            className="h-11 rounded-2xl border-white/5 font-bold"
                                            onClick={() => handleEdit(miembro)}
                                        >
                                            Editar
                                        </Button>
                                    </div>
                                </div>

                                {/* Management Bar */}
                                <div className={clsx(
                                    "px-4 py-3 flex gap-2 border-t transition-colors",
                                    isInactive ? "bg-red-500/5 border-red-500/10" : "bg-brand-primary/5 border-white/5"
                                )}>
                                    <button 
                                        onClick={() => handleToggleStatus(miembro)}
                                        className={clsx(
                                            "flex-1 flex items-center justify-center gap-2 h-10 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest active:scale-95",
                                            isInactive 
                                                ? "bg-red-500 text-white shadow-lg shadow-red-500/20" 
                                                : "bg-[#1e2330] text-gray-400 hover:text-white border border-white/5"
                                        )}
                                    >
                                        <Power className="w-3.5 h-3.5" />
                                        {isInactive ? 'Habilitar Acceso' : 'Quitar Acceso'}
                                    </button>
                                    <button 
                                        onClick={() => handleOpenPermissions(miembro)}
                                        className="w-12 h-10 flex items-center justify-center rounded-xl bg-[#1e2330] border border-white/5 text-gray-400 hover:text-brand-primary hover:border-brand-primary/30 transition-all active:scale-95"
                                        title="Permisos Especiales"
                                    >
                                        <Shield className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="col-span-full py-20 text-center text-gray-500 border border-white/5 rounded-[40px] bg-white/5 border-dashed">
                             <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                             <p className="text-xl font-bold text-white mb-2">Sin resultados</p>
                             <p className="text-sm">No encontramos miembros que coincidan con tu búsqueda</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

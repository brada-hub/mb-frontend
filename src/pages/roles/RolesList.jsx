import { useState, useEffect } from 'react';
import api from '../../api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Shield, Plus, Trash2, Edit2, Search } from 'lucide-react';
import RolModal from '../../components/modals/RolModal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { useToast } from '../../context/ToastContext';

export default function RolesList() {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRol, setSelectedRol] = useState(null);
    const [search, setSearch] = useState('');
    const [confirmState, setConfirmState] = useState({ isOpen: false, id: null, loading: false });
    const { notify } = useToast();

    const loadRoles = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        setLoading(true);
        setError(null);
        try {
            const res = await api.get('roles');
            setRoles(res.data);
        } catch (error) {
            console.error("Error loading roles:", error);
            setError(error.response?.data?.message || "Error al conectar con el servidor.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRoles();
    }, []);

    const handleEdit = (rol) => {
        setSelectedRol(rol);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedRol(null);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (id) => {
        setConfirmState({ isOpen: true, id, loading: false });
    };

    const handleConfirmDelete = async () => {
        setConfirmState(prev => ({ ...prev, loading: true }));
        try {
            await api.delete(`/roles/${confirmState.id}`);
            notify("Rol eliminado correctamente", "success");
            loadRoles();
            setConfirmState({ isOpen: false, id: null, loading: false });
        } catch (error) {
            // Error handling mejorado: mostrar mensaje del backend si existe (ej. tiene miembros)
            console.error("Error deleting role:", error);
            const msg = error.response?.data?.message || "Error al eliminar el rol";
            notify(msg, "error");
            setConfirmState(prev => ({ ...prev, loading: false }));
        }
    };

    const filteredRoles = roles.filter(r => 
        r.rol.toLowerCase().includes(search.toLowerCase()) ||
        (r.descripcion && r.descripcion.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <RolModal 
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedRol(null);
                }}
                onSuccess={() => loadRoles()}
                rol={selectedRol}
            />

            <ConfirmModal 
                isOpen={confirmState.isOpen}
                onClose={() => setConfirmState({ isOpen: false, id: null, loading: false })}
                onConfirm={handleConfirmDelete}
                loading={confirmState.loading}
                title="Eliminar Rol"
                message="¿Estás seguro de eliminar este rol? Esta acción es irreversible y podría afectar los permisos de los usuarios."
                confirmText="Eliminar Ahora"
                variant="danger"
            />

            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 sm:gap-6 pb-2">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight transition-colors">Roles y Permisos</h1>
                    <p className="text-[10px] sm:text-xs text-gray-500 font-medium uppercase tracking-widest mt-0.5 sm:mt-1 transition-colors">Gestión de accesos y facultades</p>
                </div>
                
                <div className="flex flex-col md:flex-row gap-2 sm:gap-3 w-full xl:w-auto">
                    <div className="w-full xl:w-80">
                        <Input 
                            icon={Search}
                            placeholder="Buscar rol..." 
                            className="h-10 sm:h-12 w-full text-xs sm:text-sm bg-surface-input border-surface-border rounded-xl focus:ring-[#bc1b1b]/50"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    
                    <Button onClick={handleAdd} className="h-10 sm:h-12 px-5 sm:px-6 shadow-lg shadow-[#bc1b1b]/10 text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-xl bg-[#bc1b1b] hover:bg-[#bc1b1b]/90 shrink-0">
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                    <div className="w-12 h-12 border-4 border-[#bc1b1b] border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500 dark:text-gray-400 font-bold transition-colors">Cargando roles...</p>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-20 bg-[#bc1b1b]/5 border border-dashed border-[#bc1b1b]/20 rounded-[32px] text-center px-4">
                    <Shield className="w-16 h-16 text-[#bc1b1b]/30 mb-4" />
                    <p className="text-gray-900 dark:text-white font-bold uppercase tracking-widest text-lg transition-colors">Error de Acceso</p>
                    <p className="text-gray-400 text-sm mt-2 max-w-md">
                        {error}
                        {error.includes("401") || error.includes("403") || error.includes("sesión") ? 
                            " Como acabas de limpiar la base de datos, tu sesión actual ya no es válida." : ""}
                    </p>
                    <div className="flex gap-3 mt-6">
                        <Button onClick={loadRoles} variant="secondary">Reintentar</Button>
                        <Button onClick={() => { localStorage.removeItem('token'); window.location.reload(); }} variant="monster">Cerrar Sesión y Volver</Button>
                    </div>
                </div>
            ) : filteredRoles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredRoles.map((rol) => (
                        <div 
                            key={rol.id_rol} 
                            className="group bg-surface-card border border-surface-border rounded-[32px] p-6 hover:border-[#bc1b1b]/30 transition-all duration-300 hover:shadow-2xl hover:shadow-[#bc1b1b]/5 flex flex-col h-full"
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-[#bc1b1b]/10 rounded-2xl flex items-center justify-center text-[#bc1b1b] group-hover:scale-110 transition-transform">
                                        <Shield className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight transition-colors">{rol.rol}</h3>
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest transition-colors">{rol.permisos?.length || 0} Permisos</p>
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 flex-grow leading-relaxed font-medium transition-colors">
                                {rol.descripcion || 'Sin descripción detallada.'}
                            </p>

                            <div className="space-y-3 mb-8">
                                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 transition-colors">Permisos Asignados</h4>
                                <div className="flex flex-wrap gap-2">
                                    {rol.permisos?.slice(0, 5).map(p => (
                                        <span key={p.id_permiso} className="px-2 py-1 bg-black/5 dark:bg-white/5 border border-surface-border rounded-lg text-[10px] text-gray-600 dark:text-gray-400 font-bold uppercase transition-colors">
                                            {p.permiso}
                                        </span>
                                    ))}
                                    {rol.permisos?.length > 5 && (
                                        <span className="px-2 py-1 bg-[#bc1b1b]/10 border border-[#bc1b1b]/20 rounded-lg text-[10px] text-[#bc1b1b] font-bold">
                                            +{rol.permisos.length - 5} MÁS
                                        </span>
                                    )}
                                    {(!rol.permisos || rol.permisos.length === 0) && (
                                        <span className="text-[10px] text-gray-500 dark:text-gray-600 italic uppercase transition-colors">Sin permisos</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-4 border-t border-surface-border transition-colors">
                                <Button 
                                    className="flex-1 h-10 text-xs font-bold" 
                                    variant="secondary"
                                    onClick={() => handleEdit(rol)}
                                >
                                    {rol.es_protegido ? (
                                        <Search className="w-3.5 h-3.5 mr-2" />
                                    ) : (
                                        <Edit2 className="w-3.5 h-3.5 mr-2" />
                                    )}
                                    {rol.es_protegido ? 'VER' : 'EDITAR'}
                                </Button>
                                {!rol.es_protegido && (
                                    <Button 
                                        className="flex-1 h-10 text-xs font-bold" 
                                        variant="danger"
                                        onClick={() => handleDeleteClick(rol.id_rol)}
                                        title="Eliminar rol"
                                    >
                                        <Trash2 className="w-3.5 h-3.5 mr-2" /> ELIMINAR
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-surface-card border border-dashed border-surface-border rounded-[32px] transition-colors">
                    <Search className="w-16 h-16 text-gray-200 dark:text-white/5 mb-4 transition-colors" />
                    <p className="text-gray-900 dark:text-white font-bold uppercase tracking-widest transition-colors">
                        {roles.length === 0 ? "No hay roles registrados" : "Sin resultados"}
                    </p>
                    <p className="text-gray-500 text-sm mt-1 transition-colors">
                        {roles.length === 0 ? "Usa el botón superior para crear el primer rol." : "Intenta con otro término de búsqueda."}
                    </p>
                </div>
            )}
        </div>
    );
}

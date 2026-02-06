import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import { 
    Building2, Plus, Palette, Crown, Shield, 
    HardDrive, Activity, Settings, X
} from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function SuperAdminPanel() {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [searchParams] = useSearchParams();
    
    // El activeTab ahora se deduce de la ruta para resaltar el botón correcto
    const activeRoute = location.pathname.split('/').pop();
    // Si la ruta es exactamente 'superadmin', estamos en el resumen (index)
    const activeTab = activeRoute === 'superadmin' ? 'resumen' : 
                      activeRoute === 'organizaciones' ? 'organizaciones' :
                      activeRoute === 'almacenamiento' ? 'almacenamiento' :
                      activeRoute === 'planes' ? 'planes' :
                      activeRoute === 'logs' ? 'logs' : 'resumen';

    // Soporte para enlaces antiguos con ?tab=
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab) {
            const routeMap = {
                'resumen': '/dashboard/superadmin',
                'bandas': '/dashboard/superadmin/organizaciones',
                'storage': '/dashboard/superadmin/almacenamiento',
                'config': '/dashboard/superadmin/planes',
                'logs': '/dashboard/superadmin/logs'
            };
            if (routeMap[tab]) {
                navigate(routeMap[tab], { replace: true });
            }
        }
    }, [searchParams, navigate]);
    
    const [stats, setStats] = useState(null);
    const [bandas, setBandas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedBanda, setSelectedBanda] = useState(null);
    const [formData, setFormData] = useState({ 
        nombre: '', color_primario: '#bc1b1b', color_secundario: '#0a0a0a',
        plan: 'BASIC', id_plan: '', cuota_mensual: 0, max_miembros: 15,
        logo: null, estado: true, admin_user: '', admin_password: ''
    });
    const [logoPreview, setLogoPreview] = useState(null);
    const [processing, setProcessing] = useState(false);
    
    const [storageReport, setStorageReport] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [plans, setPlans] = useState([]);
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [planFormData, setPlanFormData] = useState({
        nombre: '', label: '', max_miembros: 15, storage_mb: 100,
        can_upload_audio: false, can_upload_video: false,
        gps_attendance: false, custom_branding: false,
        precio_base: 0, features: []
    });

    useEffect(() => {
        if (!user?.is_super_admin) {
            navigate('/dashboard');
            return;
        }
        loadData();
    }, [user, navigate]);

    // Cargar logs solo si entramos a la sección de auditoría
    useEffect(() => {
        if (activeTab === 'logs') loadAuditLogs();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/superadmin/dashboard');
            setStats(data.stats);
            setBandas(data.bandas);
            setStorageReport(data.storage);
            setPlans(data.plans);
        } catch (error) {
            console.error('Error cargando datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadAuditLogs = async () => {
        try {
            const res = await api.get('/superadmin/audit-logs');
            setAuditLogs(res.data.data);
        } catch (error) {
            console.error('Error cargando logs:', error);
        }
    };

    const handleOpenCreate = () => {
        setModalMode('create');
        setSelectedBanda(null);
        setFormData({ 
            nombre: '', color_primario: '#bc1b1b', color_secundario: '#0a0a0a',
            plan: 'BASIC', id_plan: plans.find(p => p.nombre === 'BASIC')?.id_plan || '',
            cuota_mensual: 0, max_miembros: 15, logo: null,
            admin_user: '', admin_password: '', estado: true
        });
        setLogoPreview(null);
        setShowModal(true);
    };

    const handleOpenEdit = (banda) => {
        setModalMode('edit');
        setSelectedBanda(banda);
        setFormData({ 
            nombre: banda.nombre, color_primario: banda.color_primario || '#bc1b1b', 
            color_secundario: banda.color_secundario || '#0a0a0a',
            plan: banda.plan || 'BASIC', id_plan: banda.id_plan || plans.find(p => p.nombre === banda.plan)?.id_plan || '',
            cuota_mensual: banda.cuota_mensual || 0, max_miembros: banda.max_miembros || 15,
            logo: null, estado: banda.estado ?? true, admin_user: '', admin_password: ''
        });
        setLogoPreview(banda.logo ? `${import.meta.env.VITE_API_URL.replace('/api', '')}/storage/${banda.logo}` : null);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== undefined) {
                    data.append(key, key === 'estado' ? (formData[key] ? 1 : 0) : formData[key]);
                }
            });
            if (modalMode === 'edit') {
                data.append('_method', 'PUT');
                await api.post(`/superadmin/bandas/${selectedBanda.id_banda}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
            } else {
                await api.post('/superadmin/bandas', data, { headers: { 'Content-Type': 'multipart/form-data' } });
            }
            setShowModal(false);
            loadData();
        } catch (error) {
            console.error('Error al procesar banda:', error);
            alert(error.response?.data?.message || 'Error al procesar banda');
        } finally {
            setProcessing(false);
        }
    };

    const handleOpenPlanModal = (plan = null) => {
        setSelectedPlan(plan);
        if (plan) {
            setPlanFormData({ ...plan, features: plan.features || [] });
        } else {
            setPlanFormData({
                nombre: '', label: '', max_miembros: 15, storage_mb: 100,
                can_upload_audio: false, can_upload_video: false,
                gps_attendance: false, custom_branding: false,
                precio_base: 0, features: []
            });
        }
        setShowPlanModal(true);
    };

    const handleSavePlan = async (e) => {
        e.preventDefault();
        setProcessing(true);
        try {
            if (selectedPlan) {
                await api.put(`/superadmin/plans/${selectedPlan.id_plan}`, planFormData);
            } else {
                await api.post('/superadmin/plans', planFormData);
            }
            setShowPlanModal(false);
            loadData();
        } catch (error) {
            console.error('Error guardando plan:', error);
            alert(error.response?.data?.message || 'Error guardando plan');
        } finally {
            setProcessing(false);
        }
    };

    const handleImpersonate = async (bandaId) => {
        if (!window.confirm('¿Deseas ingresar como administrador de esta organización?')) return;
        try {
            const res = await api.post(`/superadmin/impersonate/${bandaId}`);
            updateUser(res.data.user);
            navigate('/dashboard');
        } catch (error) {
            console.error('Error impersonando:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface-base">
                <div className="w-12 h-12 border-4 border-[#bc1b1b] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-gray-50 dark:bg-surface-base p-2 sm:p-6 lg:p-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6">
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-br from-[#bc1b1b] to-[#991b1b] rounded-xl sm:rounded-3xl flex items-center justify-center shadow-lg shadow-[#bc1b1b]/20">
                        <Crown className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter transition-colors leading-none mb-0.5">
                            Simba Admin
                        </h1>
                        <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-[0.2em] transition-colors leading-none">Modular & SaaS</p>
                    </div>
                </div>
            </div>


            {/* Content Area - Router Outlet */}
            <div className="space-y-8 min-h-[400px]">
                <Outlet context={{
                    stats, plans, bandas, storageReport, auditLogs,
                    handleOpenCreate, handleOpenEdit, handleImpersonate, handleOpenPlanModal
                }} />
            </div>

            {/* Modals compartidos por todas las secciones */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-surface-card w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-8 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/[0.02]">
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
                                        {modalMode === 'create' ? 'Nueva Organización' : 'Editar Organización'}
                                    </h2>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">
                                        {modalMode === 'create' ? 'Registrar en la plataforma' : 'Modificar configuración'}
                                    </p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="p-8 space-y-8">
                                <div className="flex gap-6 items-center">
                                    <div 
                                        className="w-24 h-24 rounded-3xl bg-gray-100 dark:bg-white/5 border-2 border-dashed border-gray-300 dark:border-white/10 flex items-center justify-center relative overflow-hidden group hover:border-[#bc1b1b] transition-colors cursor-pointer"
                                        style={!logoPreview ? {backgroundColor: formData.color_primario} : {}}
                                    >
                                        <input type="file" onChange={e => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                setFormData(prev => ({...prev, logo: file}));
                                                setLogoPreview(URL.createObjectURL(file));
                                            }
                                        }} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                        
                                        {logoPreview ? (
                                            <img src={logoPreview} className="w-full h-full object-contain" />
                                        ) : (
                                            <Palette className="w-8 h-8 text-white opacity-50" />
                                        )}
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Plus className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Nombre Organización</label>
                                        <input 
                                            type="text" 
                                            value={formData.nombre} 
                                            onChange={e => {
                                                const val = e.target.value;
                                                setFormData(prev => {
                                                    const newData = { ...prev, nombre: val };
                                                    if (modalMode === 'create') {
                                                        const slug = val.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15);
                                                        newData.admin_user = slug;
                                                        newData.admin_password = slug;
                                                    }
                                                    return newData;
                                                });
                                            }}
                                            className="w-full bg-gray-100 dark:bg-surface-input px-4 py-3 rounded-xl border border-transparent focus:border-[#bc1b1b] focus:bg-white dark:focus:bg-black/20 outline-none font-bold text-gray-900 dark:text-white transition-all placeholder-gray-400" 
                                            placeholder="EJ. BANDA MUNICIPAL"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Color Institucional</label>
                                        <div className="flex gap-2">
                                            <input type="color" value={formData.color_primario} onChange={e => setFormData({...formData, color_primario: e.target.value})} className="w-12 h-12 rounded-xl cursor-pointer border-none p-0 bg-transparent" />
                                            <input type="text" value={formData.color_primario} onChange={e => setFormData({...formData, color_primario: e.target.value})} className="flex-1 bg-gray-100 dark:bg-surface-input px-3 rounded-xl border-transparent focus:border-[#bc1b1b] outline-none font-mono text-xs uppercase" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Plan Suscripción</label>
                                        <select 
                                            value={formData.id_plan}
                                            onChange={e => {
                                                const id = e.target.value;
                                                const plan = plans.find(p => String(p.id_plan) === String(id));
                                                setFormData(prev => ({
                                                    ...prev, 
                                                    id_plan: id,
                                                    plan: plan?.nombre || 'BASIC',
                                                    max_miembros: plan?.max_miembros || 15
                                                }));
                                            }}
                                            className="w-full bg-gray-100 dark:bg-surface-input px-4 py-3 rounded-xl border border-transparent focus:border-[#bc1b1b] outline-none font-bold text-gray-900 dark:text-white cursor-pointer appearance-none"
                                        >
                                            <option value="">Seleccionar...</option>
                                            {plans.map(p => <option key={p.id_plan} value={p.id_plan}>{p.label}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Estado</label>
                                        <button 
                                            type="button"
                                            onClick={() => setFormData({...formData, estado: !formData.estado})}
                                            className={clsx(
                                                "w-full py-3 rounded-xl font-black uppercase text-xs transition-all border",
                                                formData.estado ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" : "bg-red-500/10 border-red-500 text-red-500"
                                            )}
                                        >
                                            {formData.estado ? 'Activo' : 'Inactivo'}
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Límite Miembros (Manual)</label>
                                        <input 
                                            type="number" 
                                            value={formData.max_miembros} 
                                            onChange={e => setFormData({...formData, max_miembros: e.target.value})} 
                                            className="w-full bg-gray-100 dark:bg-surface-input px-4 py-3 rounded-xl border border-transparent focus:border-[#bc1b1b] outline-none font-bold text-gray-900 dark:text-white"
                                        />
                                    </div>
                                </div>

                                {modalMode === 'create' && (
                                    <div className="p-6 bg-[#bc1b1b]/5 border border-[#bc1b1b]/10 rounded-2xl space-y-4">
                                        <div className="flex items-center gap-2 text-[#bc1b1b] font-black uppercase text-xs">
                                            <Shield className="w-4 h-4" /> Credenciales Admin
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-bold uppercase text-gray-500">Usuario</label>
                                                <input type="text" value={formData.admin_user} onChange={e => setFormData({...formData, admin_user: e.target.value})} className="w-full bg-white dark:bg-black/20 px-3 py-2 rounded-lg text-sm font-bold outline-none" placeholder="USER_ADMIN" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-bold uppercase text-gray-500">Contraseña</label>
                                                <input type="text" value={formData.admin_password} onChange={e => setFormData({...formData, admin_password: e.target.value})} className="w-full bg-white dark:bg-black/20 px-3 py-2 rounded-lg text-sm font-bold outline-none" placeholder="PASSWORD" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-white/5">
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 rounded-xl font-black uppercase text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">Cancelar</button>
                                    <button type="submit" disabled={processing} className="flex-1 py-4 bg-[#bc1b1b] hover:bg-[#991b1b] text-white rounded-xl font-black uppercase text-xs shadow-lg shadow-[#bc1b1b]/20 transition-all active:scale-95 disabled:opacity-50">
                                        {processing ? 'Guardando...' : 'Guardar Organización'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}

                {showPlanModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                        onClick={() => setShowPlanModal(false)}
                    >
                        <motion.div
                             initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                             className="bg-white dark:bg-surface-card w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar"
                             onClick={e => e.stopPropagation()}
                        >
                            <div className="p-8 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/[0.02]">
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Configurar Plan</h2>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Niveles de servicio y límites</p>
                                </div>
                                <button onClick={() => setShowPlanModal(false)} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSavePlan} className="p-8 space-y-8">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">ID Técnico</label>
                                        <input 
                                            type="text" 
                                            value={planFormData.nombre} 
                                            onChange={e => setPlanFormData({...planFormData, nombre: e.target.value.toUpperCase().replace(/\s/g, '_')})} 
                                            className="w-full bg-gray-100 dark:bg-surface-input px-4 py-3 rounded-xl border border-transparent focus:border-[#bc1b1b] outline-none font-bold text-gray-900 dark:text-white" 
                                            placeholder="EJ. PRO_MAX"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Etiqueta Visible</label>
                                        <input 
                                            type="text" 
                                            value={planFormData.label} 
                                            onChange={e => setPlanFormData({...planFormData, label: e.target.value})} 
                                            className="w-full bg-gray-100 dark:bg-surface-input px-4 py-3 rounded-xl border border-transparent focus:border-[#bc1b1b] outline-none font-bold text-gray-900 dark:text-white" 
                                            placeholder="EJ. Profesional"
                                        />
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block mb-2">Max. Músicos</label>
                                        <input type="number" value={planFormData.max_miembros} onChange={e => setPlanFormData({...planFormData, max_miembros: e.target.value})} className="w-full bg-gray-100 dark:bg-surface-input px-4 py-3 rounded-xl font-bold outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block mb-2">Storage MB</label>
                                        <input type="number" value={planFormData.storage_mb} onChange={e => setPlanFormData({...planFormData, storage_mb: e.target.value})} className="w-full bg-gray-100 dark:bg-surface-input px-4 py-3 rounded-xl font-bold outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block mb-2">Precio Base</label>
                                        <input type="number" value={planFormData.precio_base} onChange={e => setPlanFormData({...planFormData, precio_base: e.target.value})} className="w-full bg-gray-100 dark:bg-surface-input px-4 py-3 rounded-xl font-bold outline-none" />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block mb-3">Capabilities</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            {id: 'can_upload_audio', label: 'Audio Upload'},
                                            {id: 'can_upload_video', label: 'Video Upload'},
                                            {id: 'gps_attendance', label: 'Asistencia GPS'},
                                            {id: 'custom_branding', label: 'Marca Propia'}
                                        ].map(cap => (
                                            <button 
                                                key={cap.id} type="button"
                                                onClick={() => setPlanFormData(prev => ({...prev, [cap.id]: !prev[cap.id]}))}
                                                className={clsx(
                                                    "px-4 py-3 rounded-xl text-xs font-bold uppercase transition-all border",
                                                    planFormData[cap.id] ? "bg-[#bc1b1b]/10 border-[#bc1b1b] text-[#bc1b1b]" : "bg-gray-50 dark:bg-white/5 border-transparent text-gray-400"
                                                )}
                                            >
                                                {cap.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-100 dark:border-white/5 flex gap-4">
                                     <button type="button" onClick={() => setShowPlanModal(false)} className="flex-1 py-4 rounded-xl font-black uppercase text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">Cancelar</button>
                                     <button type="submit" disabled={processing} className="flex-1 py-4 bg-[#bc1b1b] hover:bg-[#991b1b] text-white rounded-xl font-black uppercase text-xs shadow-lg shadow-[#bc1b1b]/20 transition-all active:scale-95">Guardar Plan</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import { 
    Building2, Plus, Users, Calendar, TrendingUp, Settings, 
    Eye, Power, Palette, ChevronRight, Crown, Shield, Search,
    HardDrive, Activity, CheckCircle, FileText, Music, Monitor,
    Lock, RefreshCw, X
} from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import logoMb from '../../assets/logo_mb.png';
import { Button } from '../../components/ui/Button'; // Si existen, usarlos sería ideal, pero por flexibilidad usaré estilos directos consistentes

export default function SuperAdminPanel() {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const tabFromUrl = searchParams.get('tab') || 'resumen';
    
    const [stats, setStats] = useState(null);
    const [bandas, setBandas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
    const [selectedBanda, setSelectedBanda] = useState(null);
    const [formData, setFormData] = useState({ 
        nombre: '', 
        color_primario: '#6366f1', 
        color_secundario: '#161b2c',
        plan: 'BASIC',
        id_plan: '',
        cuota_mensual: 0,
        max_miembros: 15,
        logo: null,
        estado: true,
        admin_user: '',
        admin_password: ''
    });
    const [logoPreview, setLogoPreview] = useState(null);
    const [processing, setProcessing] = useState(false);
    
    const [activeTab, setActiveTab] = useState(tabFromUrl);
    const [storageReport, setStorageReport] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [plans, setPlans] = useState([]);
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [planFormData, setPlanFormData] = useState({
        nombre: '',
        label: '',
        max_miembros: 15,
        storage_mb: 100,
        can_upload_audio: false,
        can_upload_video: false,
        gps_attendance: false,
        custom_branding: false,
        precio_base: 0,
        features: []
    });

    // Actualizar tab si cambia el URL
    useEffect(() => {
        if (!searchParams.get('tab')) {
            setSearchParams({ tab: 'resumen' }, { replace: true });
            return;
        }
        setActiveTab(tabFromUrl);
        if (tabFromUrl === 'logs') loadAuditLogs();
    }, [tabFromUrl, searchParams, setSearchParams]);

    useEffect(() => {
        if (!user?.is_super_admin) {
            navigate('/dashboard');
            return;
        }
        loadData();
    }, [user, navigate]);

    const loadData = async () => {
        setLoading(true);
        try {
            // SUPER ENDPOINT: Una sola petición para toda la data
            const { data } = await api.get('/superadmin/dashboard');
            setStats(data.stats);
            setBandas(data.bandas);
            setStorageReport(data.storage);
            setPlans(data.plans);
        } catch (error) {
            if (!error.silent) console.error('Error cargando datos:', error);
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
            nombre: '', 
            color_primario: '#6366f1', 
            color_secundario: '#161b2c',
            plan: 'BASIC',
            id_plan: plans.find(p => p.nombre === 'BASIC')?.id_plan || '',
            cuota_mensual: 0,
            max_miembros: 15,
            logo: null,
            admin_user: '',
            admin_password: '',
            estado: true
        });
        setLogoPreview(null);
        setShowModal(true);
    };

    const handleOpenEdit = (banda) => {
        setModalMode('edit');
        setSelectedBanda(banda);
        setFormData({ 
            nombre: banda.nombre, 
            color_primario: banda.color_primario || '#6366f1', 
            color_secundario: banda.color_secundario || '#161b2c',
            plan: banda.plan || 'BASIC',
            id_plan: banda.id_plan || plans.find(p => p.nombre === banda.plan)?.id_plan || '',
            cuota_mensual: banda.cuota_mensual || 0,
            max_miembros: banda.max_miembros || 15,
            logo: null,
            estado: banda.estado ?? true,
            admin_user: '',
            admin_password: ''
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
                    if (key === 'estado') {
                        data.append(key, formData[key] ? 1 : 0);
                    } else {
                        data.append(key, formData[key]);
                    }
                }
            });

            if (modalMode === 'edit') {
                data.append('_method', 'PUT');
                const res = await api.post(`/superadmin/bandas/${selectedBanda.id_banda}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setBandas(prev => prev.map(b => b.id_banda === selectedBanda.id_banda ? { ...b, ...res.data } : b));
            } else {
                const res = await api.post('/superadmin/bandas', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setBandas(prev => [res.data, ...prev]);
            }

            setShowModal(false);
            loadData();
        } catch (error) {
            console.error('Error al procesar banda:', error);
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
                nombre: '',
                label: '',
                max_miembros: 15,
                storage_mb: 100,
                can_upload_audio: false,
                can_upload_video: false,
                gps_attendance: false,
                custom_branding: false,
                precio_base: 0,
                features: []
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
        } finally {
            setProcessing(false);
        }
    };

    const handleImpersonate = async (bandaId) => {
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
                <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0f111a] p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-dark rounded-3xl flex items-center justify-center shadow-lg shadow-brand-primary/20 rotate-3 transform transition-transform hover:rotate-0">
                        <Crown className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter transition-colors leading-none mb-1">
                            Simba Admin
                        </h1>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] transition-colors">Panel de Control SaaS</p>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-4 pt-1 no-scrollbar mask-linear-fade">
                {[
                    { id: 'resumen', label: 'Resumen', icon: Activity },
                    { id: 'bandas', label: 'Organizaciones', icon: Building2 },
                    { id: 'storage', label: 'Almacenamiento', icon: HardDrive },
                    { id: 'config', label: 'Planes', icon: Settings },
                    { id: 'logs', label: 'Auditoría', icon: Shield },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setSearchParams({ tab: tab.id })}
                        className={clsx(
                            "flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap active:scale-95",
                            activeTab === tab.id 
                                ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/25 translate-y-[-2px]" 
                                : "bg-white dark:bg-white/5 border border-transparent hover:border-gray-200 dark:hover:border-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        )}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="space-y-8">
                {activeTab === 'resumen' && (
                    <>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: 'Ingresos MRR', value: `$${stats?.ingresos_proyectados || 0}`, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                                { label: 'Bandas Activas', value: stats?.total_bandas || 0, icon: Building2, color: 'text-brand-primary', bg: 'bg-brand-primary/10' },
                                { label: 'Usuarios Totales', value: stats?.total_miembros || 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                                { label: 'Nuevos (Mes)', value: `+${stats?.metricas_crecimiento?.nuevas_bandas_mes || 0}`, icon: Calendar, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                            ].map((stat, idx) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-white dark:bg-surface-card border border-gray-100 dark:border-white/5 rounded-3xl p-6 transition-colors shadow-sm hover:shadow-md"
                                >
                                    <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors", stat.bg)}>
                                        <stat.icon className={clsx("w-6 h-6", stat.color)} />
                                    </div>
                                    <p className="text-3xl font-black text-gray-900 dark:text-white transition-colors tracking-tight">{stat.value}</p>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">{stat.label}</p>
                                </motion.div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white dark:bg-surface-card border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="w-24 h-24 bg-brand-primary/10 rounded-full flex items-center justify-center mb-8 relative z-10 group-hover:scale-110 transition-transform duration-500">
                                    <Activity className="w-10 h-10 text-brand-primary" />
                                </div>
                                <h3 className="text-2xl font-black uppercase tracking-tight mb-3 text-gray-900 dark:text-white relative z-10">Sistema Operativo</h3>
                                <p className="text-sm text-gray-500 font-medium max-w-sm relative z-10 leading-relaxed">
                                    Todos los sistemas funcionan correctamente. No se detectan anomalías en el servicio de notificaciones ni en el almacenamiento.
                                </p>
                            </div>
                            
                            <div className="bg-white dark:bg-surface-card border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-8">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-500">
                                        <Crown className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white">Salud de Suscripciones</h3>
                                </div>
                                <div className="space-y-4">
                                    {plans.map(plan => (
                                        <div key={plan.nombre} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className={clsx(
                                                    "w-3 h-3 rounded-full shadow-sm",
                                                    plan.nombre === 'PRO' ? 'bg-amber-500' : plan.nombre === 'PREMIUM' ? 'bg-brand-primary' : 'bg-gray-400'
                                                )} />
                                                <span className="text-xs font-black uppercase tracking-widest text-gray-700 dark:text-gray-300">{plan.label}</span>
                                            </div>
                                            <span className="text-lg font-black text-gray-900 dark:text-white">{stats?.salud_suscripciones?.[plan.nombre] || 0}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'bandas' && (
                    <div className="bg-white dark:bg-surface-card border border-gray-100 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-sm transition-colors">
                        <div className="p-6 border-b border-gray-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight pl-2">Organizaciones</h2>
                            <button
                                onClick={handleOpenCreate}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-brand-primary hover:bg-brand-dark text-white text-xs font-black uppercase rounded-2xl transition-all shadow-lg shadow-brand-primary/20 active:scale-95"
                            >
                                <Plus className="w-4 h-4" />
                                Nueva Organización
                            </button>
                        </div>
                        <div className="divide-y divide-gray-100 dark:divide-white/5">
                            {bandas.map((banda) => (
                                <div key={banda.id_banda} className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group">
                                    <div className="flex items-center gap-5 flex-1 min-w-0">
                                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 overflow-hidden flex-shrink-0">
                                            {banda.logo ? (
                                                <img src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/storage/${banda.logo}`} alt={banda.nombre} className="w-full h-full object-contain" />
                                            ) : (
                                                <img src={logoMb} alt="MB" className="w-10 h-10 opacity-50 grayscale" />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-gray-900 dark:text-white font-black text-lg truncate flex items-center gap-3">
                                                {banda.nombre}
                                                {!banda.estado && <span className="px-2 py-0.5 bg-red-500 text-white text-[9px] rounded-md">OFF</span>}
                                            </h3>
                                            <div className="flex items-center gap-4 mt-1 text-gray-500 dark:text-gray-400">
                                                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-md text-gray-600 dark:text-gray-300">
                                                    <Crown className="w-3 h-3" /> {banda.plan}
                                                </span>
                                                <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                                                    <Users className="w-3 h-3" /> {banda.miembros_count} Miembros
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleImpersonate(banda.id_banda)}
                                            className="p-3 hover:bg-brand-primary/10 hover:text-brand-primary rounded-xl transition-colors text-gray-400"
                                            title="Ingresar como Admin"
                                        >
                                            <Eye className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleOpenEdit(banda)}
                                            className="p-3 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                            title="Configurar"
                                        >
                                            <Settings className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'config' && (
                    <div className="space-y-8">
                        <div className="flex justify-end">
                            <button 
                                onClick={() => handleOpenPlanModal()}
                                className="flex items-center gap-2 px-6 py-3 bg-brand-primary hover:bg-brand-dark text-white text-xs font-black uppercase rounded-2xl transition-all shadow-lg shadow-brand-primary/20"
                            >
                                <Plus className="w-5 h-5" /> Nuevo Plan
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {plans.map(plan => (
                                <div 
                                    key={plan.id_plan} 
                                    onClick={() => handleOpenPlanModal(plan)}
                                    className={clsx(
                                        "bg-white dark:bg-surface-card border-2 rounded-[2.5rem] p-8 transition-all hover:scale-[1.02] cursor-pointer group relative overflow-hidden",
                                        plan.nombre === 'PRO' ? 'border-amber-500/50 hover:border-amber-500' : 
                                        plan.nombre === 'PREMIUM' ? 'border-brand-primary/50 hover:border-brand-primary' : 'border-gray-200 dark:border-white/10 hover:border-gray-400'
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-8 relative z-10">
                                        <div className="w-14 h-14 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center">
                                            <Crown className={clsx("w-8 h-8", plan.nombre === 'PRO' ? 'text-amber-500' : plan.nombre === 'PREMIUM' ? 'text-brand-primary' : 'text-gray-400')} />
                                        </div>
                                        <h3 className="text-xl font-black uppercase text-gray-900 dark:text-white">{plan.label}</h3>
                                    </div>
                                    <div className="space-y-4 relative z-10">
                                        <div className="flex justify-between text-sm font-bold border-b border-gray-100 dark:border-white/5 pb-2">
                                            <span className="text-gray-500 uppercase tracking-wider text-[10px] mt-1">Capacidad</span>
                                            <span className="text-gray-900 dark:text-white">{plan.max_miembros}</span>
                                        </div>
                                        <div className="flex justify-between text-sm font-bold border-b border-gray-100 dark:border-white/5 pb-2">
                                            <span className="text-gray-500 uppercase tracking-wider text-[10px] mt-1">Storage</span>
                                            <span className="text-gray-900 dark:text-white">{plan.storage_mb >= 1024 ? `${plan.storage_mb/1024} GB` : `${plan.storage_mb} MB`}</span>
                                        </div>
                                    </div>
                                    <div className="mt-6 flex flex-wrap gap-2 relative z-10">
                                        {plan.features?.slice(0, 3).map(f => (
                                            <span key={f} className="px-2 py-1 bg-gray-100 dark:bg-white/5 rounded-md text-[9px] font-black uppercase text-gray-500">{f}</span>
                                        ))}
                                        {(plan.features?.length > 3) && <span className="px-2 py-1 bg-gray-100 dark:bg-white/5 rounded-md text-[9px] font-black uppercase text-gray-500">+{plan.features.length - 3}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'storage' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {storageReport.map(report => (
                            <div key={report.id_banda} className="bg-white dark:bg-surface-card border border-gray-100 dark:border-white/5 rounded-[2rem] p-6 shadow-sm">
                                <div className="flex justify-between items-start mb-6">
                                    <h3 className="font-bold text-gray-900 dark:text-white truncate pr-4">{report.nombre}</h3>
                                    <span className={clsx("px-2 py-1 rounded-md text-[9px] font-black uppercase", 
                                        report.status === 'OK' ? "bg-emerald-500/10 text-emerald-500" : "bg-amer-500/10 text-amber-500"
                                    )}>{report.status}</span>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-gray-500">
                                        <span>Uso</span>
                                        <span>{report.current_mb} / {report.limit_mb} MB</span>
                                    </div>
                                    <div className="h-3 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(report.percent, 100)}%` }}
                                            className={clsx("h-full rounded-full", report.percent > 90 ? "bg-red-500" : "bg-brand-primary")}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Banda */}
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
                                        className="w-24 h-24 rounded-3xl bg-gray-100 dark:bg-white/5 border-2 border-dashed border-gray-300 dark:border-white/10 flex items-center justify-center relative overflow-hidden group hover:border-brand-primary transition-colors cursor-pointer"
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
                                            className="w-full bg-gray-100 dark:bg-surface-input px-4 py-3 rounded-xl border border-transparent focus:border-brand-primary focus:bg-white dark:focus:bg-black/20 outline-none font-bold text-gray-900 dark:text-white transition-all placeholder-gray-400" 
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
                                            <input type="text" value={formData.color_primario} onChange={e => setFormData({...formData, color_primario: e.target.value})} className="flex-1 bg-gray-100 dark:bg-surface-input px-3 rounded-xl border-transparent focus:border-brand-primary outline-none font-mono text-xs uppercase" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Plan Suscripción</label>
                                        <select 
                                            value={formData.id_plan}
                                            onChange={e => {
                                                const id = e.target.value;
                                                const plan = plans.find(p => p.id_plan == id);
                                                setFormData(prev => ({
                                                    ...prev, 
                                                    id_plan: id,
                                                    plan: plan?.nombre || 'BASIC',
                                                    max_miembros: plan?.max_miembros || 15
                                                }));
                                            }}
                                            className="w-full bg-gray-100 dark:bg-surface-input px-4 py-3 rounded-xl border border-transparent focus:border-brand-primary outline-none font-bold text-gray-900 dark:text-white cursor-pointer appearance-none"
                                        >
                                            <option value="">Seleccionar...</option>
                                            {plans.map(p => <option key={p.id_plan} value={p.id_plan}>{p.label}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {modalMode === 'create' && (
                                    <div className="p-6 bg-brand-primary/5 border border-brand-primary/10 rounded-2xl space-y-4">
                                        <div className="flex items-center gap-2 text-brand-primary font-black uppercase text-xs">
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
                                    <button type="submit" disabled={processing} className="flex-1 py-4 bg-brand-primary hover:bg-brand-dark text-white rounded-xl font-black uppercase text-xs shadow-lg shadow-brand-primary/20 transition-all active:scale-95 disabled:opacity-50">
                                        {processing ? 'Guardando...' : 'Guardar Organización'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

             {/* Modal Plan */}
             <AnimatePresence>
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
                                            className="w-full bg-gray-100 dark:bg-surface-input px-4 py-3 rounded-xl border border-transparent focus:border-brand-primary outline-none font-bold text-gray-900 dark:text-white" 
                                            placeholder="EJ. PRO_MAX"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Etiqueta Visible</label>
                                        <input 
                                            type="text" 
                                            value={planFormData.label} 
                                            onChange={e => setPlanFormData({...planFormData, label: e.target.value})} 
                                            className="w-full bg-gray-100 dark:bg-surface-input px-4 py-3 rounded-xl border border-transparent focus:border-brand-primary outline-none font-bold text-gray-900 dark:text-white" 
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
                                                    planFormData[cap.id] ? "bg-brand-primary/10 border-brand-primary text-brand-primary" : "bg-gray-50 dark:bg-white/5 border-transparent text-gray-400"
                                                )}
                                            >
                                                {cap.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-100 dark:border-white/5 flex gap-4">
                                     <button type="button" onClick={() => setShowPlanModal(false)} className="flex-1 py-4 rounded-xl font-black uppercase text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">Cancelar</button>
                                     <button type="submit" disabled={processing} className="flex-1 py-4 bg-brand-primary hover:bg-brand-dark text-white rounded-xl font-black uppercase text-xs shadow-lg shadow-brand-primary/20 transition-all active:scale-95">Guardar Plan</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
             </AnimatePresence>
        </div>
    );
}

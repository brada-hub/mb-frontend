import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import { 
    Building2, Plus, Users, Calendar, TrendingUp, Settings, 
    Eye, Power, Palette, ChevronRight, Crown, Shield, Search,
    HardDrive, Activity, CheckCircle, FileText, Music, Monitor
} from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import logoMb from '../../assets/logo_mb.png';

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
        cuota_mensual: 0,
        max_miembros: 15,
        logo: null,
        estado: true
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
            const [statsRes, bandasRes, storageRes, plansRes] = await Promise.all([
                api.get('/superadmin/stats'),
                api.get('/superadmin/bandas'),
                api.get('/superadmin/storage-report'),
                api.get('/superadmin/plans')
            ]);
            setStats(statsRes.data);
            setBandas(bandasRes.data);
            setStorageReport(storageRes.data);
            setPlans(plansRes.data);
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
            estado: banda.estado ?? true
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
                // Para simular PUT con FormData en PHP/Laravel
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
            loadData(); // Recargar para actualizar storage si cambió el plan
        } catch (error) {
            console.error('Error al procesar banda:', error);
        } finally {
            setProcessing(false);
        }
    };

    const handleOpenPlanModal = (plan = null) => {
        setSelectedPlan(plan);
        if (plan) {
            setPlanFormData({ ...plan });
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
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface-base p-6">
            {/* Header */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                        <Crown className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight transition-colors">
                            {activeTab === 'resumen' ? 'Resumen Global' : 
                             activeTab === 'bandas' ? 'Organizaciones' : 
                             activeTab === 'storage' ? 'Uso de Almacenamiento' : 
                             activeTab === 'logs' ? 'Registro de Auditoría' : 'Configuración de App'}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors">Panel de Control Global (Dueño)</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards - Only on Summary */}
            {activeTab === 'resumen' && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Ingresos Proyectados', value: `$${stats?.ingresos_proyectados || 0}`, icon: TrendingUp, color: 'from-emerald-500 to-teal-600' },
                        { label: 'Total Bandas', value: stats?.total_bandas || 0, icon: Building2, color: 'from-indigo-500 to-purple-600' },
                        { label: 'Total Músicos', value: stats?.total_miembros || 0, icon: Users, color: 'from-blue-500 to-cyan-600' },
                        { label: 'Crecimiento (Mes)', value: `+${stats?.metricas_crecimiento?.nuevas_bandas_mes || 0}`, icon: Calendar, color: 'from-amber-500 to-orange-600' },
                    ].map((stat, idx) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-surface-card border border-surface-border rounded-2xl p-5 transition-colors"
                        >
                            <div className={clsx("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center mb-3", stat.color)}>
                                <stat.icon className="w-5 h-5 text-white" />
                            </div>
                            <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white transition-colors">{stat.value}</p>
                            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-500 uppercase tracking-wider transition-colors">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* SECCIÓN RESUMEN (DASHBOARD GLOBAL) */}
            {activeTab === 'resumen' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Aquí podrías poner gráficos globales después */}
                    <div className="bg-surface-card border border-surface-border rounded-3xl p-8 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6">
                            <Activity className="w-10 h-10 text-indigo-500" />
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-tight mb-2 text-gray-900 dark:text-white">Panel de Control Activo</h3>
                        <p className="text-sm text-gray-500 max-w-sm">
                            Utiliza el menú lateral para gestionar organizaciones, verificar el uso de disco o auditar la actividad del sistema.
                        </p>
                    </div>
                    
                    <div className="bg-surface-card border border-surface-border rounded-3xl p-8">
                         <h3 className="text-sm font-black uppercase tracking-widest mb-6 text-indigo-600 dark:text-indigo-400">Salud de Suscripciones</h3>
                         <div className="space-y-6">
                             {plans.map(plan => (
                                 <div key={plan.nombre} className="flex items-center justify-between">
                                     <div className="flex items-center gap-3">
                                         <div className={clsx(
                                             "w-2 h-2 rounded-full",
                                             plan.nombre === 'PRO' ? 'bg-amber-500' : plan.nombre === 'PREMIUM' ? 'bg-indigo-500' : 'bg-gray-400'
                                         )} />
                                         <span className="text-xs font-bold uppercase tracking-widest">{plan.label}</span>
                                     </div>
                                     <span className="text-sm font-black">{stats?.salud_suscripciones?.[plan.nombre] || 0}</span>
                                 </div>
                             ))}
                         </div>
                    </div>
                </div>
            )}

            {activeTab === 'config' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-end">
                        <button 
                            onClick={() => handleOpenPlanModal()}
                            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase rounded-2xl transition-all shadow-xl shadow-emerald-600/20 active:scale-95"
                        >
                            <Plus className="w-5 h-5" />
                            Nuevo Plan
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {plans.map(plan => (
                            <div key={plan.id_plan} className={clsx(
                                "bg-surface-card border-2 rounded-[40px] p-8 transition-all hover:scale-[1.02] cursor-pointer group relative",
                                plan.nombre === 'PRO' ? 'border-amber-500' : plan.nombre === 'PREMIUM' ? 'border-indigo-500' : 'border-gray-400'
                            )}
                            onClick={() => handleOpenPlanModal(plan)}
                            >
                                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                                        <Settings className="w-4 h-4 text-gray-400" />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mb-8">
                                    <div className="w-14 h-14 bg-black/5 dark:bg-white/5 rounded-2xl flex items-center justify-center">
                                        <Crown className={clsx("w-8 h-8", 
                                            plan.nombre === 'PRO' ? 'text-amber-500' : 
                                            plan.nombre === 'PREMIUM' ? 'text-indigo-500' : 'text-gray-400'
                                        )} />
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Plan</span>
                                        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase">{plan.label}</h3>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 p-4 bg-black/5 dark:bg-white/5 rounded-2xl">
                                        <Users className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Capacidad</p>
                                            <p className="text-sm font-bold">{plan.max_miembros} Miembros</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 p-4 bg-black/5 dark:bg-white/5 rounded-2xl">
                                        <HardDrive className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Almacenamiento</p>
                                            <p className="text-sm font-bold">{plan.storage_mb >= 1024 ? (plan.storage_mb / 1024) + ' GB' : plan.storage_mb + ' MB'}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-4">
                                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest ml-1">Características:</p>
                                        {(plan.features || []).map(f => (
                                            <div key={f} className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-300">
                                                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                                                {f}
                                            </div>
                                        ))}
                                        
                                        <div className="pt-4 border-t border-surface-border">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2">Técnico:</p>
                                            <div className="grid grid-cols-2 gap-2 text-[8px] font-black uppercase">
                                                <div className={clsx("px-2 py-1 rounded-md", plan.can_upload_audio ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500")}>Audio: {plan.can_upload_audio ? 'SÍ' : 'NO'}</div>
                                                <div className={clsx("px-2 py-1 rounded-md", plan.gps_attendance ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500")}>GPS: {plan.gps_attendance ? 'SÍ' : 'NO'}</div>
                                                <div className={clsx("px-2 py-1 rounded-md", plan.can_upload_video ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500")}>Video: {plan.can_upload_video ? 'SÍ' : 'NO'}</div>
                                                <div className={clsx("px-2 py-1 rounded-md", plan.custom_branding ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500")}>Marca: {plan.custom_branding ? 'SÍ' : 'NO'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-surface-card border border-surface-border rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 transition-colors">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500">
                                <FileText className="w-7 h-7" />
                            </div>
                            <div>
                                <h4 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Política de Precios</h4>
                                <p className="text-sm text-gray-500">Las cuotas mensuales se configuran individualmente por organización según negociación.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'bandas' && (
                <div className="bg-surface-card border border-surface-border rounded-3xl overflow-hidden shadow-2xl transition-colors">
                    <div className="p-6 border-b border-surface-border flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">
                        <div className="flex items-center gap-3">
                            <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight transition-colors">Bandas Registradas</h2>
                        </div>
                        <button
                            onClick={handleOpenCreate}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase rounded-2xl transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
                        >
                            <Plus className="w-5 h-5" />
                            Nueva Banda
                        </button>
                    </div>

                    <div className="divide-y divide-surface-border min-w-full">
                        {bandas.map((banda) => (
                            <div key={banda.id_banda} className="p-5 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/[0.02] transition-colors gap-4">
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div 
                                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg overflow-hidden border border-surface-border flex-shrink-0 bg-transparent"
                                    >
                                        {banda.logo ? (
                                            <img 
                                                src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/storage/${banda.logo}`} 
                                                alt={banda.nombre}
                                                className="w-full h-full object-contain"
                                            />
                                        ) : (
                                            <img 
                                                src={logoMb} 
                                                alt="Monster Band"
                                                className="w-full h-full object-contain p-1"
                                            />
                                        )}
                                    </div>
                                    <div className="truncate">
                                        <h3 className="text-gray-900 dark:text-white font-bold flex items-center gap-2 truncate transition-colors">
                                            {banda.nombre}
                                            {!banda.estado && (
                                                <span className="px-2 py-0.5 bg-red-500/20 text-red-600 dark:text-red-400 text-[10px] font-black rounded-full uppercase flex-shrink-0">
                                                    OFF
                                                </span>
                                            )}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <p className="text-[10px] text-gray-500 dark:text-gray-500 truncate transition-colors">
                                                <span className={clsx(
                                                    "font-black mr-2 uppercase",
                                                    banda.plan === 'PRO' ? 'text-amber-600 dark:text-amber-400' : 
                                                    banda.plan === 'PREMIUM' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'
                                                )}>
                                                    {banda.plan}
                                                </span>
                                                {banda.miembros_count || 0}/{banda.subscription_plan?.max_miembros || banda.max_miembros} músicos
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => handleImpersonate(banda.id_banda)}
                                        className="w-11 h-11 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-all group active:scale-90"
                                        title="Modo Soporte"
                                    >
                                        <Eye className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors" />
                                    </button>
                                    <button
                                        onClick={() => handleOpenEdit(banda)}
                                        className="w-11 h-11 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-all group active:scale-90"
                                        title="Configurar"
                                    >
                                        <Settings className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
                                    </button>
                                    <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-600 ml-1 hidden sm:block transition-colors" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'storage' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {storageReport.map(report => (
                        <div key={report.id_banda} className="bg-surface-card border border-surface-border rounded-3xl p-6 shadow-xl transition-colors">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-gray-900 dark:text-white truncate pr-4">{report.nombre}</h3>
                                <div className={clsx(
                                    "px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest",
                                    report.status === 'OK' ? "bg-emerald-500/10 text-emerald-500" :
                                    report.status === 'WARNING' ? "bg-amber-500/10 text-amber-500" : "bg-red-500/10 text-red-500"
                                )}>
                                    {report.status}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-tight">
                                        <span>Espacio Utilizado</span>
                                        <span>{report.current_mb} MB / {report.limit_mb} MB</span>
                                    </div>
                                    <div className="h-2 w-full bg-black/10 dark:bg-white/5 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(report.percent, 100)}%` }}
                                            className={clsx(
                                                "h-full rounded-full transition-all",
                                                report.percent > 90 ? "bg-red-500" : report.percent > 70 ? "bg-amber-500" : "bg-indigo-500"
                                            )}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Plan: {report.plan}</p>
                                    <p className="text-[14px] font-black text-gray-900 dark:text-white">{report.percent}%</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'logs' && (
                <div className="bg-surface-card border border-surface-border rounded-3xl overflow-hidden shadow-2xl transition-colors">
                    <div className="p-6 border-b border-surface-border flex items-center justify-between transition-colors">
                        <div className="flex items-center gap-3">
                            <Search className="w-5 h-5 text-indigo-400" />
                            <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight transition-colors">Registro de Actividad Reciente</h2>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-black/5 dark:bg-white/[0.02] border-b border-surface-border">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Evento</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Banda / Usuario</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Mensaje</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Fecha</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-border">
                                {auditLogs.map(log => (
                                    <tr key={log.id_audit_log} className="hover:bg-black/5 dark:hover:bg-white/[0.01] transition-colors">
                                        <td className="px-6 py-4">
                                            <span className={clsx(
                                                "px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tight",
                                                log.event === 'created' ? "bg-emerald-500/10 text-emerald-500" :
                                                log.event === 'deleted' ? "bg-red-500/10 text-red-500" :
                                                log.event === 'security' ? "bg-amber-500/10 text-amber-500" : "bg-indigo-500/10 text-indigo-500"
                                            )}>
                                                {log.event}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs">
                                            <p className="font-bold text-gray-900 dark:text-white">{log.banda?.nombre || 'SISTEMA GLOBAL'}</p>
                                            <p className="text-[10px] text-gray-500">{log.user?.user || 'Automático'}</p>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500 max-w-xs truncate">{log.message}</td>
                                        <td className="px-6 py-4 text-[10px] font-bold text-gray-400 text-right">
                                            {new Date(log.created_at).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'bandas' && bandas.length === 0 && (
                <div className="p-12 text-center bg-surface-card border border-surface-border rounded-3xl">
                    <Building2 className="w-12 h-12 text-gray-600 mx-auto mb-4 opacity-20" />
                    <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">Sin bandas registradas</p>
                </div>
            )}

            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-0 sm:p-4"
                        onClick={() => setShowModal(false)}
                    >
                         <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-surface-card border-t sm:border border-surface-border rounded-t-[40px] sm:rounded-3xl w-full max-w-xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto custom-scrollbar shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-gray-900 dark:text-gray-100"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="sticky top-0 z-10 bg-surface-card/80 backdrop-blur-xl p-6 border-b border-surface-border flex items-center justify-between transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 bg-indigo-600/20 rounded-2xl flex items-center justify-center">
                                        {modalMode === 'create' ? <Plus className="w-6 h-6 text-indigo-500 dark:text-indigo-400" /> : <Settings className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight transition-colors">
                                            {modalMode === 'create' ? 'Nueva Banda' : 'Editar Banda'}
                                        </h3>
                                        <p className="text-[10px] font-bold text-gray-500 dark:text-gray-500 uppercase tracking-widest transition-colors">
                                            {modalMode === 'create' ? 'Registra una organización' : 'Actualiza la configuración'}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-full hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center text-gray-500">
                                    <Plus className="w-6 h-6 rotate-45" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
                                 <div className="flex flex-col sm:flex-row items-center gap-6">
                                    <div 
                                        className="w-24 h-24 rounded-3xl bg-surface-input border-2 border-dashed border-surface-border flex items-center justify-center overflow-hidden transition-all hover:border-indigo-500/50 relative group flex-shrink-0"
                                        style={{ backgroundColor: formData.color_primario }}
                                    >
                                        {logoPreview ? (
                                            <>
                                                <img src={logoPreview} className="w-full h-full object-contain" alt="Preview" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                                                    <Plus className="w-8 h-8 text-white" />
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center cursor-pointer">
                                                <Palette className="w-8 h-8 text-gray-400 dark:text-gray-600 mx-auto" />
                                                <span className="text-[10px] font-black text-gray-500 dark:text-gray-500 uppercase block mt-2">Logotipo</span>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={e => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    setFormData(prev => ({ ...prev, logo: file }));
                                                    setLogoPreview(URL.createObjectURL(file));
                                                }
                                            }}
                                            accept="image/*"
                                        />
                                    </div>
                                    <div className="flex-1 w-full">
                                        <label className="block text-[10px] font-black text-gray-500 uppercase mb-3 tracking-widest">Nombre de la Organización</label>
                                         <input
                                            type="text"
                                            value={formData.nombre}
                                            onChange={e => {
                                                const nombre = e.target.value;
                                                setFormData(prev => {
                                                    const newData = { ...prev, nombre };
                                                    if (modalMode === 'create') {
                                                        const slug = nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '').slice(0, 15);
                                                        newData.admin_user = slug;
                                                        newData.admin_password = slug;
                                                    }
                                                    return newData;
                                                });
                                            }}
                                            className="w-full bg-surface-input border border-surface-border rounded-2xl px-5 py-4 text-gray-900 dark:text-white font-bold placeholder-gray-400 dark:placeholder-gray-700 focus:border-indigo-500 outline-none transition-all shadow-inner"
                                            placeholder="Ej: Banda de Música Imperial"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-500 uppercase mb-3 tracking-widest">Color de Identidad</label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="color"
                                                value={formData.color_primario}
                                                onChange={e => setFormData(prev => ({ ...prev, color_primario: e.target.value }))}
                                                className="w-12 h-12 rounded-xl cursor-pointer bg-transparent border-none"
                                            />
                                            <input
                                                type="text"
                                                value={formData.color_primario}
                                                onChange={e => setFormData(prev => ({ ...prev, color_primario: e.target.value }))}
                                                className="flex-1 bg-surface-input border border-surface-border rounded-xl px-4 py-3 text-gray-900 dark:text-white font-mono text-sm uppercase transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-500 uppercase mb-3 tracking-widest">Plan de Suscripción</label>
                                         <select
                                            value={formData.id_plan}
                                            onChange={e => {
                                                const selectedId = e.target.value;
                                                const planObj = plans.find(p => p.id_plan == selectedId);
                                                setFormData(prev => ({ 
                                                    ...prev, 
                                                    id_plan: selectedId,
                                                    plan: planObj?.nombre || 'BASIC',
                                                    max_miembros: planObj?.max_miembros || 15
                                                }));
                                            }}
                                            className="w-full bg-surface-input border border-surface-border rounded-xl px-4 py-4 text-gray-900 dark:text-white font-bold focus:border-indigo-500 outline-none transition-all cursor-pointer"
                                        >
                                            <option value="">Seleccionar Plan...</option>
                                            {plans.map(p => (
                                                <option key={p.id_plan} value={p.id_plan} className="bg-surface-card">
                                                    {p.label} ({p.max_miembros} MÚSICOS)
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {modalMode === 'edit' && (
                                    <div className="flex items-center justify-between p-4 bg-surface-input rounded-2xl border border-surface-border">
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">Estado de la Banda</p>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Habilitar/Deshabilitar acceso</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, estado: !prev.estado }))}
                                            className={clsx(
                                                "w-12 h-6 rounded-full transition-all relative",
                                                formData.estado ? "bg-indigo-600" : "bg-gray-400 dark:bg-gray-700"
                                            )}
                                        >
                                            <div className={clsx(
                                                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                                                formData.estado ? "left-7" : "left-1"
                                            )} />
                                        </button>
                                    </div>
                                )}

                                {modalMode === 'create' && (
                                    <div className="p-6 bg-indigo-600/5 rounded-3xl space-y-5 border border-indigo-500/10 transition-colors">
                                        <h4 className="flex items-center gap-3 text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight transition-colors">
                                            <Shield className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                                            Credenciales de Director
                                        </h4>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                             <div>
                                                <label className="block text-[10px] font-black text-gray-500 dark:text-gray-500 uppercase mb-2 tracking-widest transition-colors">Usuario Director</label>
                                                <input
                                                    type="text"
                                                    value={formData.admin_user || ''}
                                                    onChange={e => setFormData(prev => ({ ...prev, admin_user: e.target.value }))}
                                                    className="w-full bg-surface-input border border-surface-border rounded-xl px-4 py-3 text-gray-900 dark:text-white font-bold placeholder-gray-400 dark:placeholder-gray-700 focus:border-indigo-500 outline-none transition-all shadow-inner"
                                                    placeholder="Usuario..."
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-500 dark:text-gray-500 uppercase mb-2 tracking-widest transition-colors">Password Inicial</label>
                                                <input
                                                    type="text"
                                                    value={formData.admin_password || ''}
                                                    onChange={e => setFormData(prev => ({ ...prev, admin_password: e.target.value }))}
                                                    className="w-full bg-surface-input border border-surface-border rounded-xl px-4 py-3 text-gray-900 dark:text-white font-bold placeholder-gray-400 dark:placeholder-gray-700 focus:border-indigo-500 outline-none transition-all shadow-inner"
                                                    placeholder="Password..."
                                                />
                                            </div>
                                        </div>
                                        <p className="text-[9px] font-bold text-indigo-500 dark:text-indigo-400/60 uppercase tracking-widest transition-colors">Cualquier miembro podrá ser ascendido a administrador global de la banda después.</p>
                                    </div>
                                )}

                                 <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 py-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-2xl text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest transition-all text-[10px]"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-white font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50 text-[10px]"
                                    >
                                        {processing ? 'Procesando...' : (modalMode === 'create' ? 'Registrar Banda' : 'Guardar Cambios')}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showPlanModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[110] p-0 sm:p-4"
                        onClick={() => setShowPlanModal(false)}
                    >
                         <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-surface-card border-t sm:border border-surface-border rounded-t-[40px] sm:rounded-3xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl text-gray-900 dark:text-gray-100"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="sticky top-0 z-10 bg-surface-card/80 backdrop-blur-xl p-6 border-b border-surface-border flex items-center justify-between transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 bg-indigo-600/20 rounded-2xl flex items-center justify-center">
                                        <Settings className="w-6 h-6 text-indigo-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight transition-colors">
                                            {selectedPlan ? 'Editar Plan' : 'Nuevo Plan de Suscripción'}
                                        </h3>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest transition-colors">Configura límites y capacidades técnicas</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowPlanModal(false)} className="w-10 h-10 rounded-full hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center text-gray-500">
                                    <Plus className="w-6 h-6 rotate-45" />
                                </button>
                            </div>

                            <form onSubmit={handleSavePlan} className="p-6 sm:p-8 space-y-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-500 uppercase mb-3 tracking-widest">Identificador (ID)</label>
                                        <input
                                            type="text"
                                            value={planFormData.nombre}
                                            onChange={e => setPlanFormData(prev => ({ ...prev, nombre: e.target.value.toUpperCase().replace(/\s+/g, '_') }))}
                                            className="w-full bg-surface-input border border-surface-border rounded-2xl px-5 py-4 text-gray-900 dark:text-white font-bold focus:border-indigo-500 outline-none transition-all shadow-inner"
                                            placeholder="EJ: BASIC_PLUS"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-500 uppercase mb-3 tracking-widest">Nombre del Plan</label>
                                        <input
                                            type="text"
                                            value={planFormData.label}
                                            onChange={e => setPlanFormData(prev => ({ ...prev, label: e.target.value }))}
                                            className="w-full bg-surface-input border border-surface-border rounded-2xl px-5 py-4 text-gray-900 dark:text-white font-bold focus:border-indigo-500 outline-none transition-all shadow-inner"
                                            placeholder="EJ: Básico Plus"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-500 uppercase mb-3 tracking-widest">Max Miembros</label>
                                        <input
                                            type="number"
                                            value={planFormData.max_miembros}
                                            onChange={e => setPlanFormData(prev => ({ ...prev, max_miembros: e.target.value }))}
                                            className="w-full bg-surface-input border border-surface-border rounded-2xl px-5 py-4 text-gray-900 dark:text-white font-bold focus:border-indigo-500 outline-none transition-all shadow-inner"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-500 uppercase mb-3 tracking-widest">Storage (MB)</label>
                                        <input
                                            type="number"
                                            value={planFormData.storage_mb}
                                            onChange={e => setPlanFormData(prev => ({ ...prev, storage_mb: e.target.value }))}
                                            className="w-full bg-surface-input border border-surface-border rounded-2xl px-5 py-4 text-gray-900 dark:text-white font-bold focus:border-indigo-500 outline-none transition-all shadow-inner"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-500 uppercase mb-3 tracking-widest">Precio Base ($)</label>
                                        <input
                                            type="number"
                                            value={planFormData.precio_base}
                                            onChange={e => setPlanFormData(prev => ({ ...prev, precio_base: e.target.value }))}
                                            className="w-full bg-surface-input border border-surface-border rounded-2xl px-5 py-4 text-gray-900 dark:text-white font-bold focus:border-indigo-500 outline-none transition-all shadow-inner"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-[10px] font-black text-gray-500 uppercase mb-3 tracking-widest">Capacidades Técnicas</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { id: 'can_upload_audio', label: 'Carga de Audio (MP3)', icon: Music },
                                            { id: 'can_upload_video', label: 'Carga de Video', icon: Monitor },
                                            { id: 'gps_attendance', label: 'Asistencia GPS', icon: Activity },
                                            { id: 'custom_branding', label: 'Marca Personalizada', icon: Palette },
                                        ].map(feature => (
                                            <button
                                                key={feature.id}
                                                type="button"
                                                onClick={() => setPlanFormData(prev => ({ ...prev, [feature.id]: !prev[feature.id] }))}
                                                className={clsx(
                                                    "flex items-center gap-3 p-4 rounded-2xl border transition-all",
                                                    planFormData[feature.id] ? "bg-indigo-600/10 border-indigo-500 text-indigo-500" : "bg-surface-input border-surface-border text-gray-500"
                                                )}
                                            >
                                                <feature.icon className="w-5 h-5" />
                                                <span className="text-xs font-bold uppercase tracking-tight">{feature.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase mb-3 tracking-widest">Lista de Características (Visual)</label>
                                    <div className="space-y-3">
                                        <div className="flex gap-2">
                                            <input
                                                id="new-feature-input"
                                                type="text"
                                                className="flex-1 bg-surface-input border border-surface-border rounded-xl px-4 py-3 text-sm"
                                                placeholder="Agregar característica..."
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        const val = e.target.value.trim();
                                                        if (val) {
                                                            setPlanFormData(prev => ({ ...prev, features: [...prev.features, val] }));
                                                            e.target.value = '';
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {(planFormData.features || []).map((f, i) => (
                                                <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 text-indigo-500 rounded-lg text-[10px] font-bold uppercase tracking-tight border border-indigo-500/20">
                                                    {f}
                                                    <button 
                                                        type="button" 
                                                        onClick={() => setPlanFormData(prev => ({ ...prev, features: prev.features.filter((_, idx) => idx !== i) }))}
                                                        className="hover:text-red-500"
                                                    >
                                                        <Plus className="w-3 h-3 rotate-45" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowPlanModal(false)}
                                        className="flex-1 py-4 bg-black/5 dark:bg-white/5 rounded-2xl text-gray-500 font-bold uppercase text-[10px]"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-3 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-600/20 disabled:opacity-50 text-[10px]"
                                    >
                                        {processing ? 'Procesando...' : (selectedPlan ? 'Guardar Cambios' : 'Crear Plan')}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import { 
    Building2, Plus, Users, Calendar, TrendingUp, Settings, 
    Eye, Power, Palette, ChevronRight, Crown, Shield
} from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function SuperAdminPanel() {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [bandas, setBandas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newBanda, setNewBanda] = useState({ 
        nombre: '', 
        color_primario: '#6366f1', 
        color_secundario: '#161b2c',
        plan: 'BASIC',
        cuota_mensual: 0,
        max_miembros: 15,
        logo: null
    });
    const [logoPreview, setLogoPreview] = useState(null);
    const [creating, setCreating] = useState(false);

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
            const [statsRes, bandasRes] = await Promise.all([
                api.get('/superadmin/stats'),
                api.get('/superadmin/bandas')
            ]);
            setStats(statsRes.data);
            setBandas(bandasRes.data);
        } catch (error) {
            console.error('Error cargando datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBanda = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            const formData = new FormData();
            Object.keys(newBanda).forEach(key => {
                if (newBanda[key] !== null) {
                    formData.append(key, newBanda[key]);
                }
            });

            const res = await api.post('/superadmin/bandas', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setBandas(prev => [res.data, ...prev]);
            setShowCreateModal(false);
            setLogoPreview(null);
            setNewBanda({ 
                nombre: '', 
                color_primario: '#6366f1', 
                color_secundario: '#161b2c',
                plan: 'BASIC',
                cuota_mensual: 0,
                max_miembros: 15,
                logo: null
            });
        } catch (error) {
            console.error('Error creando banda:', error);
        } finally {
            setCreating(false);
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
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center">
                        <Crown className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight transition-colors">Administrador Monster</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors">Panel de Control Global</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
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

            {/* Bandas Section */}
            <div className="bg-surface-card border border-surface-border rounded-3xl overflow-hidden shadow-2xl transition-colors">
                <div className="p-6 border-b border-surface-border flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">
                    <div className="flex items-center gap-3">
                        <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight transition-colors">Bandas Registradas</h2>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
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
                                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg overflow-hidden border border-surface-border flex-shrink-0"
                                    style={{ backgroundColor: banda.color_primario }}
                                >
                                    {banda.logo ? (
                                        <img 
                                            src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/storage/${banda.logo}`} 
                                            alt={banda.nombre}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        banda.nombre.charAt(0)
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
                                    <p className="text-[10px] text-gray-500 dark:text-gray-500 truncate transition-colors">
                                        <span className={clsx(
                                            "font-black mr-2 uppercase transition-colors",
                                            banda.plan === 'PRO' ? 'text-amber-600 dark:text-amber-400' : 
                                            banda.plan === 'PREMIUM' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'
                                        )}>
                                            {banda.plan}
                                        </span>
                                        {banda.miembros_count || 0}/{banda.max_miembros} músicos
                                    </p>
                                </div>
                            </div>

                             <div className="flex items-center gap-1">
                                 <button
                                    onClick={() => handleImpersonate(banda.id_banda)}
                                    className="w-11 h-11 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-all group active:scale-90"
                                    title="Modo Impersonar"
                                >
                                    <Eye className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors" />
                                </button>
                                <button
                                    className="w-11 h-11 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-all group active:scale-90"
                                    title="Configurar"
                                >
                                    <Settings className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
                                </button>
                                <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-600 ml-1 hidden sm:block transition-colors" />
                            </div>
                        </div>
                    ))}

                    {bandas.length === 0 && (
                        <div className="p-12 text-center">
                            <Building2 className="w-12 h-12 text-gray-600 mx-auto mb-4 opacity-20" />
                            <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">Sin bandas registradas</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-0 sm:p-4"
                        onClick={() => setShowCreateModal(false)}
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
                                        <Plus className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight transition-colors">Nueva Banda</h3>
                                        <p className="text-[10px] font-bold text-gray-500 dark:text-gray-500 uppercase tracking-widest transition-colors">Registra una organización</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowCreateModal(false)} className="w-10 h-10 rounded-full hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center text-gray-500">
                                    <Plus className="w-6 h-6 rotate-45" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateBanda} className="p-6 sm:p-8 space-y-8">
                                 <div className="flex flex-col sm:flex-row items-center gap-6">
                                    <div 
                                        className="w-24 h-24 rounded-3xl bg-surface-input border-2 border-dashed border-surface-border flex items-center justify-center overflow-hidden transition-all hover:border-indigo-500/50 relative group flex-shrink-0"
                                        style={{ backgroundColor: newBanda.color_primario }}
                                    >
                                        {logoPreview ? (
                                            <>
                                                <img src={logoPreview} className="w-full h-full object-cover" alt="Preview" />
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
                                                    setNewBanda(prev => ({ ...prev, logo: file }));
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
                                            value={newBanda.nombre}
                                            onChange={e => {
                                                const nombre = e.target.value;
                                                const slug = nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '').slice(0, 15);
                                                setNewBanda(prev => ({ 
                                                    ...prev, 
                                                    nombre,
                                                    admin_user: slug,
                                                    admin_password: slug
                                                }));
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
                                                value={newBanda.color_primario}
                                                onChange={e => setNewBanda(prev => ({ ...prev, color_primario: e.target.value }))}
                                                className="w-12 h-12 rounded-xl cursor-pointer bg-transparent border-none"
                                            />
                                            <input
                                                type="text"
                                                value={newBanda.color_primario}
                                                onChange={e => setNewBanda(prev => ({ ...prev, color_primario: e.target.value }))}
                                                className="flex-1 bg-surface-input border border-surface-border rounded-xl px-4 py-3 text-gray-900 dark:text-white font-mono text-sm uppercase transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-500 uppercase mb-3 tracking-widest">Plan de Suscripción</label>
                                         <select
                                            value={newBanda.plan}
                                            onChange={e => {
                                                const plan = e.target.value;
                                                setNewBanda(prev => ({ 
                                                    ...prev, 
                                                    plan,
                                                    max_miembros: plan === 'BASIC' ? 15 : plan === 'PREMIUM' ? 50 : 100
                                                }));
                                            }}
                                            className="w-full bg-surface-input border border-surface-border rounded-xl px-4 py-4 text-gray-900 dark:text-white font-bold focus:border-indigo-500 outline-none transition-all cursor-pointer"
                                        >
                                            <option value="BASIC" className="bg-surface-card">BÁSICO (15 MÚSICOS)</option>
                                            <option value="PREMIUM" className="bg-surface-card">PREMIUM (50 MÚSICOS)</option>
                                            <option value="PRO" className="bg-surface-card">PROFESIONAL (100+ MÚSICOS)</option>
                                        </select>
                                    </div>
                                </div>

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
                                                value={newBanda.admin_user || ''}
                                                onChange={e => setNewBanda(prev => ({ ...prev, admin_user: e.target.value }))}
                                                className="w-full bg-surface-input border border-surface-border rounded-xl px-4 py-3 text-gray-900 dark:text-white font-bold placeholder-gray-400 dark:placeholder-gray-700 focus:border-indigo-500 outline-none transition-all shadow-inner"
                                                placeholder="Usuario..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-500 dark:text-gray-500 uppercase mb-2 tracking-widest transition-colors">Password Inicial</label>
                                            <input
                                                type="text"
                                                value={newBanda.admin_password || ''}
                                                onChange={e => setNewBanda(prev => ({ ...prev, admin_password: e.target.value }))}
                                                className="w-full bg-surface-input border border-surface-border rounded-xl px-4 py-3 text-gray-900 dark:text-white font-bold placeholder-gray-400 dark:placeholder-gray-700 focus:border-indigo-500 outline-none transition-all shadow-inner"
                                                placeholder="Password..."
                                            />
                                        </div>
                                    </div>
                                    <p className="text-[9px] font-bold text-indigo-500 dark:text-indigo-400/60 uppercase tracking-widest transition-colors">Cualquier miembro podrá ser ascendido a administrador global de la banda después.</p>
                                </div>

                                 <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1 py-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-2xl text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest transition-all text-[10px]"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={creating}
                                        className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-white font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50 text-[10px]"
                                    >
                                        {creating ? 'Procesando...' : 'Registrar Banda'}
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

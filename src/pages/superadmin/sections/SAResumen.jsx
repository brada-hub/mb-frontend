import { motion } from 'framer-motion';
import { Activity, Crown, TrendingUp, Building2, Users, Calendar } from 'lucide-react';
import clsx from 'clsx';
import { useOutletContext } from 'react-router-dom';

export default function SAResumen() {
    const { stats, plans } = useOutletContext();
    
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Ingresos MRR', value: `$${stats?.ingresos_proyectados || 0}`, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { label: 'Bandas Activas', value: stats?.total_bandas || 0, icon: Building2, color: 'text-[#bc1b1b]', bg: 'bg-[#bc1b1b]/10' },
                    { label: 'Usuarios Totales', value: stats?.total_miembros || 0, icon: Users, color: 'text-[#ffbe0b]', bg: 'bg-[#ffbe0b]/10' },
                    { label: 'Nuevos (Mes)', value: `+${stats?.metricas_crecimiento?.nuevas_bandas_mes || 0}`, icon: Calendar, color: 'text-[#ffbe0b]', bg: 'bg-[#ffbe0b]/10' },
                ].map((stat, idx) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white dark:bg-surface-card border border-gray-100 dark:border-white/5 rounded-2xl sm:rounded-3xl p-4 sm:p-6 transition-colors shadow-sm hover:shadow-md"
                    >
                        <div className={clsx("w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 transition-colors", stat.bg)}>
                            <stat.icon className={clsx("w-5 h-5 sm:w-6 sm:h-6", stat.color)} />
                        </div>
                        <p className="text-xl sm:text-3xl font-black text-gray-900 dark:text-white transition-colors tracking-tight leading-none">{stat.value}</p>
                        <p className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1 leading-none">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-surface-card border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#bc1b1b]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="w-24 h-24 bg-[#bc1b1b]/10 rounded-full flex items-center justify-center mb-8 relative z-10 group-hover:scale-110 transition-transform duration-500">
                        <Activity className="w-10 h-10 text-[#bc1b1b]" />
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-tight mb-3 text-gray-900 dark:text-white relative z-10">Sistema Operativo</h3>
                    <p className="text-sm text-gray-500 font-medium max-w-sm relative z-10 leading-relaxed">
                        Todos los sistemas funcionan correctamente. No se detectan anomalías en el servicio de notificaciones ni en el almacenamiento.
                    </p>
                </div>
                
                <div className="bg-white dark:bg-surface-card border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-[#bc1b1b]/10 rounded-xl text-[#bc1b1b]">
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
                                        plan.nombre === 'PRO' ? 'bg-[#ffbe0b]' : plan.nombre === 'PREMIUM' ? 'bg-[#bc1b1b]' : 'bg-gray-400'
                                    )} />
                                    <span className="text-xs font-black uppercase tracking-widest text-gray-700 dark:text-gray-300">{plan.label}</span>
                                </div>
                                <span className="text-lg font-black text-gray-900 dark:text-white">{stats?.salud_suscripciones?.[plan.nombre] || 0}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

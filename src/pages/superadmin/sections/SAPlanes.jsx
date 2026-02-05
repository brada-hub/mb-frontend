import { Plus, Crown } from 'lucide-react';
import clsx from 'clsx';
import { useOutletContext } from 'react-router-dom';

export default function SAPlanes() {
    const { plans, handleOpenPlanModal } = useOutletContext();

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
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
                            "bg-white dark:bg-surface-card border-2 rounded-[2.5rem] p-8 transition-all hover:scale-[1.02] cursor-pointer group relative overflow-hidden shadow-sm hover:shadow-xl",
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
    );
}

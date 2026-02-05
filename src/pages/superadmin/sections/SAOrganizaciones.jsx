import { Building2, Plus, Eye, Settings, Crown, Users } from 'lucide-react';
import logoMb from '../../../assets/logo_mb.png';
import { useOutletContext } from 'react-router-dom';

export default function SAOrganizaciones() {
    const { bandas, handleOpenCreate, handleOpenEdit, handleImpersonate } = useOutletContext();

    return (
        <div className="bg-white dark:bg-surface-card border border-gray-100 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-sm transition-colors animate-in fade-in duration-500">
            <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight pl-2">Organizaciones</h2>
                <button
                    onClick={handleOpenCreate}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-brand-primary hover:bg-brand-dark text-white text-[10px] sm:text-xs font-black uppercase rounded-xl sm:rounded-2xl transition-all shadow-lg shadow-brand-primary/20 active:scale-95"
                >
                    <Plus className="w-3.5 h-3.5 sm:w-4 h-4" />
                    Nueva Org
                </button>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-white/5">
                {bandas.map((banda) => (
                    <div key={banda.id_banda} className="p-4 sm:p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group">
                        <div className="flex items-center gap-3 sm:gap-5 flex-1 min-w-0">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 overflow-hidden flex-shrink-0">
                                {banda.logo ? (
                                    <img src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/storage/${banda.logo}`} alt={banda.nombre} className="w-full h-full object-contain" />
                                ) : (
                                    <img src={logoMb} alt="MB" className="w-8 h-8 sm:w-10 sm:h-10 opacity-50 grayscale" />
                                )}
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-gray-900 dark:text-white font-black text-sm sm:text-lg truncate flex items-center gap-2 leading-tight">
                                    {banda.nombre}
                                    {!banda.estado && <span className="px-1.5 py-0.5 bg-red-500 text-white text-[8px] rounded-md">OFF</span>}
                                </h3>
                                <div className="flex items-center gap-3 sm:gap-4 mt-0.5 sm:mt-1 text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-1 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-white/5 px-1.5 py-0.5 rounded-md text-gray-600 dark:text-gray-300">
                                        <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {banda.plan}
                                    </span>
                                    <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 leading-none">
                                        <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {banda.miembros_count} M.
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                            <button
                                onClick={() => handleImpersonate(banda.id_banda)}
                                className="p-2 sm:p-3 hover:bg-brand-primary/10 hover:text-brand-primary rounded-lg sm:rounded-xl transition-colors text-gray-400"
                                title="Ingresar como Admin"
                            >
                                <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                            <button
                                onClick={() => handleOpenEdit(banda)}
                                className="group/btn p-2 sm:p-3 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg sm:rounded-xl transition-all text-gray-400 hover:text-gray-900 dark:hover:text-white relative"
                            >
                                <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-[8px] rounded opacity-0 group-hover/btn:opacity-100 whitespace-nowrap pointer-events-none transition-opacity font-black uppercase">Config. Organización</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

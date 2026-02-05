import { Shield, Clock, User, Activity } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

export default function SAAuditoria() {
    const { auditLogs } = useOutletContext();

    if (!auditLogs || auditLogs.length === 0) {
        return (
            <div className="bg-white dark:bg-surface-card border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-12 text-center animate-in fade-in duration-500 shadow-sm">
                <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Shield className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-black uppercase text-gray-900 dark:text-white mb-2">Sin actividad reciente</h3>
                <p className="text-gray-500 max-w-sm mx-auto">Los registros de auditoría aparecerán aquí conforme se realicen acciones críticas en el sistema.</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-surface-card border border-gray-100 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-sm animate-in fade-in duration-500">
            <div className="p-6 border-b border-gray-100 dark:border-white/5">
                <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Logs de Auditoría</h2>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-white/5">
                {auditLogs.map((log) => (
                    <div key={log.id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                <Activity className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">{log.action}</p>
                                <div className="flex items-center gap-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {log.user?.email || 'Sistema'}</span>
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(log.created_at).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

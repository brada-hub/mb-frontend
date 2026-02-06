import { motion } from 'framer-motion';
import clsx from 'clsx';
import { useOutletContext } from 'react-router-dom';

export default function SAAlmacenamiento() {
    const { storageReport } = useOutletContext();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {storageReport.map(report => (
                <div key={report.id_banda} className="bg-white dark:bg-surface-card border border-gray-100 dark:border-white/5 rounded-[2rem] p-6 shadow-sm shadow-black/5">
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
                        <div className="h-3 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden border border-black/5 dark:border-white/5">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(report.percent, 100)}%` }}
                                className={clsx("h-full rounded-full", report.percent > 90 ? "bg-[#bc1b1b]" : "bg-[#bc1b1b]")}
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

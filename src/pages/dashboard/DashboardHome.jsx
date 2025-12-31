import { Users, Calendar, DollarSign, Activity } from 'lucide-react';
import { clsx } from 'clsx';

const StatCard = ({ title, value, label, icon: Icon, color }) => {
    const LucideIcon = Icon;
    const colors = {
        indigo: 'bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500',
        purple: 'bg-purple-500/10 text-purple-400 group-hover:bg-purple-500',
        green: 'bg-green-500/10 text-green-400 group-hover:bg-green-500',
        pink: 'bg-pink-500/10 text-pink-400 group-hover:bg-pink-500'
    };

    return (
        <div className="bg-[#161b2c] border border-white/5 p-6 rounded-2xl flex items-start justify-between hover:border-indigo-500/30 transition-colors group">
            <div>
                <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
                <span className={clsx("text-xs font-medium px-2 py-1 rounded-full", colors[color].split(' ')[0], colors[color].split(' ')[1])}>
                    {label}
                </span>
            </div>
            <div className={clsx("p-3 rounded-xl transition-all group-hover:text-white", colors[color])}>
                <LucideIcon className="w-6 h-6" />
            </div>
        </div>
    );
};

export default function DashboardHome() {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Miembros Activos" value="124" label="+4 este mes" icon={Users} color="indigo" />
                <StatCard title="Próximos Eventos" value="8" label="Esta semana" icon={Calendar} color="purple" />
                <StatCard title="Ingresos (Mes)" value="$45k" label="+12% vs anterior" icon={DollarSign} color="green" />
                <StatCard title="Asistencia Promedio" value="92%" label="Último ensayo" icon={Activity} color="pink" />
            </div>

            {/* Placeholder for charts or lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#161b2c] border border-white/5 rounded-2xl p-6 h-80 flex flex-col items-center justify-center text-gray-500">
                    <p>Gráfico de Asistencia (Próximamente)</p>
                </div>
                <div className="bg-[#161b2c] border border-white/5 rounded-2xl p-6 h-80 flex flex-col items-center justify-center text-gray-500">
                    <p>Finanzas Recientes (Próximamente)</p>
                </div>
            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FileText, Download, Filter, Search, ChevronDown, 
    TrendingUp, Users, AlertTriangle, ArrowLeft,
    Calendar as CalendarIcon, FilterX, Printer
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { useToast } from '../../context/ToastContext';
import clsx from 'clsx';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import SmartDateInput from '../../components/ui/SmartDateInput';

export default function AsistenciaReporte() {
    const navigate = useNavigate();
    const { notify } = useToast();
    
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [secciones, setSecciones] = useState([]);
    
    // Filters
    const [filters, setFilters] = useState({
        start_date: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        id_seccion: ''
    });
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
        loadSecciones();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/asistencias/reporte-grupal', { params: filters });
            setData(res.data);
        } catch (error) {
            console.error(error);
            notify('Error al cargar el reporte grupal', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadSecciones = async () => {
        try {
            const res = await api.get('/secciones');
            setSecciones(res.data);
        } catch (e) { console.error(e); }
    };

    const handleExportCSV = () => {
        if (!data?.report) return;
        
        const headers = ["Músico", "Instrumento", "Sección", "Ensayos", "Presentes", "Faltas", "Justificados", "Rinde %"];
        const rows = data.report.map(r => [
            `${r.nombres} ${r.apellidos}`,
            r.instrumento,
            r.seccion,
            r.total_events,
            r.present_count,
            r.absent_count,
            r.justified_count,
            `${r.rate}%`
        ]);

        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Reporte_Asistencia_${filters.start_date}_a_${filters.end_date}.csv`);
        document.body.appendChild(link);
        link.click();
    };

    const filteredReport = data?.report?.filter(r => 
        (r.nombres + ' ' + r.apellidos).toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.instrumento.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/asistencia')}
                        className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter transition-colors">Reporte Grupal</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm transition-colors">Auditoría de rendimiento y constancia</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 px-5 py-2.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-gray-700 dark:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-surface-border"
                    >
                        <Download className="w-4 h-4" />
                        Exportar CSV
                    </button>
                    <button 
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#bc1b1b] hover:bg-[#7f1d1d] text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-[#bc1b1b]/20"
                    >
                        <Printer className="w-4 h-4" />
                        Imprimir
                    </button>
                </div>
            </div>

            {/* Quick Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-surface-card border border-surface-border p-6 rounded-[2rem] relative overflow-hidden group transition-colors">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                        <TrendingUp className="w-16 h-16 text-gray-900 dark:text-white" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2 transition-colors">Salud Grupal</p>
                    <h3 className={clsx("text-4xl font-black tracking-tighter", 
                        (data?.summary?.group_average || 0) >= 80 ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400"
                    )}>
                        {data?.summary?.group_average || 0}%
                    </h3>
                    <p className="text-[10px] text-gray-500 dark:text-gray-500 mt-2 font-bold uppercase transition-colors">Asistencia Media Total</p>
                </div>

                <div className="bg-surface-card border border-surface-border p-6 rounded-[2rem] relative overflow-hidden group transition-colors">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform text-red-500">
                        <AlertTriangle className="w-16 h-16" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2 transition-colors">Alertas de Bajo Ritmo</p>
                    <h3 className="text-4xl font-black text-red-600 dark:text-red-500 tracking-tighter transition-colors">
                        {data?.summary?.desertores_count || 0}
                    </h3>
                    <p className="text-[10px] text-gray-500 dark:text-gray-500 mt-2 font-bold uppercase transition-colors">Miembros con menos del 50%</p>
                </div>

                <div className="bg-surface-card border border-surface-border p-6 rounded-[2rem] relative overflow-hidden group transition-colors">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                        <Users className="w-16 h-16 text-gray-900 dark:text-white" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2 transition-colors">Total Auditados</p>
                    <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter transition-colors">
                        {data?.summary?.total_members_in_report || 0}
                    </h3>
                    <p className="text-[10px] text-gray-500 dark:text-gray-500 mt-2 font-bold uppercase transition-colors">Integrantes Activos</p>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-surface-card border border-surface-border p-4 rounded-3xl flex flex-col lg:flex-row gap-4 transition-colors">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <SmartDateInput 
                        value={filters.start_date}
                        onChange={(val) => setFilters(f => ({ ...f, start_date: val }))}
                    />
                    <SmartDateInput 
                        value={filters.end_date}
                        onChange={(val) => setFilters(f => ({ ...f, end_date: val }))}
                    />
                    <div className="relative">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <select 
                            className="w-full bg-surface-input border border-surface-border rounded-xl h-14 pl-11 pr-4 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:border-[#bc1b1b] transition-all appearance-none cursor-pointer"
                            value={filters.id_seccion}
                            onChange={(e) => setFilters(f => ({ ...f, id_seccion: e.target.value }))}
                        >
                            <option value="" className="bg-surface-card">Todas las Secciones</option>
                            {secciones.map(s => (
                                <option key={s.id_seccion} value={s.id_seccion} className="bg-surface-card">{s.seccion}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={loadData}
                        className="px-6 py-3 bg-[#bc1b1b] hover:bg-[#7f1d1d] text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                        Generar Reporte
                    </button>
                    <button 
                        onClick={() => {
                            setFilters({
                                start_date: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
                                end_date: new Date().toISOString().split('T')[0],
                                id_seccion: ''
                            });
                        }}
                        className="p-3 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-xl transition-all"
                    >
                        <FilterX className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* List & Search */}
            <div className="space-y-4">
                <div className="relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <input 
                        type="text"
                        placeholder="Buscar por nombre o instrumento..."
                        className="w-full bg-surface-card border border-surface-border rounded-[2rem] py-5 px-16 text-sm font-bold text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-[#bc1b1b]/50 transition-all shadow-2xl"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="bg-surface-card border border-surface-border rounded-[2.5rem] overflow-hidden shadow-2xl transition-colors">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-surface-border bg-black/5 dark:bg-black/20">
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest transition-colors">Músico</th>
                                    <th className="px-6 py-6 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest transition-colors">Sección</th>
                                    <th className="px-6 py-6 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest text-center transition-colors">Ratio</th>
                                    <th className="px-6 py-6 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest text-center transition-colors">Desglose</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest text-right whitespace-nowrap transition-colors">Porcentaje</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-border">
                                <AnimatePresence mode="wait">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5" className="px-8 py-12 text-center text-gray-500 dark:text-gray-400">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="w-12 h-12 border-4 border-[#bc1b1b]/20 border-t-[#bc1b1b] rounded-full animate-spin"></div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest pulse">Calculando rendimientos...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredReport?.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-8 py-20 text-center">
                                                <FileText className="w-16 h-16 text-gray-300 dark:text-gray-800 mx-auto mb-4" />
                                                <p className="text-gray-500 dark:text-gray-600 font-bold uppercase tracking-widest text-[10px]">No se encontraron resultados para el periodo</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredReport?.map((musico, idx) => (
                                            <motion.tr 
                                                key={musico.id_miembro}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.02 }}
                                                className="hover:bg-black/5 dark:hover:bg-white/[0.02] transition-colors group"
                                            >
                                                <td className="px-8 py-6">
                                                    <p className="text-sm font-black text-gray-900 dark:text-white group-hover:text-[#bc1b1b] transition-colors uppercase tracking-tight">
                                                        {musico.nombres} {musico.apellidos}
                                                    </p>
                                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5 transition-colors">{musico.instrumento}</p>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <span className="text-[10px] font-black text-[#bc1b1b] bg-[#bc1b1b]/10 px-3 py-1.5 rounded-lg border border-[#bc1b1b]/20 uppercase tracking-widest transition-colors">
                                                        {musico.seccion}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-6 text-center">
                                                    <p className="text-sm font-black text-gray-900 dark:text-white transition-colors">{musico.present_count} / {musico.total_events}</p>
                                                    <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mt-0.5 transition-colors">Asistencias</p>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <div className="flex justify-center gap-2">
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-[10px] font-black text-yellow-600 dark:text-yellow-400 transition-colors">{musico.justified_count}</span>
                                                            <span className="text-[7px] text-gray-500 dark:text-gray-600 font-bold uppercase tracking-tighter transition-colors">PER</span>
                                                        </div>
                                                        <div className="w-px h-6 bg-surface-border" />
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-[10px] font-black text-red-500 transition-colors">{musico.absent_count + musico.unmarked_count}</span>
                                                            <span className="text-[7px] text-gray-500 dark:text-gray-600 font-bold uppercase tracking-tighter transition-colors">FAL</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="inline-flex flex-col items-end">
                                                        <div className="flex items-center gap-2">
                                                            <span className={clsx("text-lg font-black tracking-tighter",
                                                                musico.rate >= 80 ? "text-green-600 dark:text-green-400" :
                                                                musico.rate >= 50 ? "text-yellow-600 dark:text-yellow-400" : "text-red-500"
                                                            )}>
                                                                {musico.rate}%
                                                            </span>
                                                            {musico.rate < 50 && musico.total_events >= 3 && <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />}
                                                        </div>
                                                        <div className="w-24 h-1.5 bg-surface-border rounded-full mt-1 overflow-hidden">
                                                            <motion.div 
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${musico.rate}%` }}
                                                                className={clsx("h-full rounded-full transition-all duration-1000",
                                                                    musico.rate >= 80 ? "bg-green-500" :
                                                                    musico.rate >= 50 ? "bg-yellow-500" : "bg-red-500"
                                                                )}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

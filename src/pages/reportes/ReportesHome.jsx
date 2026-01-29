import { useState, useEffect, Fragment } from 'react';
import { Flame, Download, Filter, Search, Medal, Trophy, TableProperties, LayoutGrid, Check, ChevronDown, Calendar, User, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import api from '../../api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export default function ReportesHome() {
    const { user } = useAuth();
    const { notify } = useToast();
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'matrix'
    const [rankings, setRankings] = useState([]);
    const [reportData, setReportData] = useState([]);
    const [matrixData, setMatrixData] = useState({ eventos: [], data: [] });
    const [summary, setSummary] = useState(null);
    const [filter, setFilter] = useState('');
    
    // Filters State
    const [showFilters, setShowFilters] = useState(false);
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });
    const [eventTypes, setEventTypes] = useState([]);
    const [selectedEventTypes, setSelectedEventTypes] = useState([]);
    const [minRate, setMinRate] = useState(0);

    const isAdminOrDirector = ['ADMIN', 'DIRECTOR', 'ADMINISTRADOR'].includes(user?.role?.toUpperCase());

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        setLoading(true);
        try {
            const [rankingsRes, typesRes] = await Promise.all([
                api.get('/asistencias/rankings'),
                api.get('/eventos/tipos')
            ]);
            setRankings(rankingsRes.data.rankings || []);
            setEventTypes(typesRes.data || []);
            
            // Initial load of report current year
            await loadReport();
        } catch (error) {
            console.error(error);
            notify('Error cargando datos iniciales', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadReport = async () => {
        setLoading(true);
        try {
            const params = {
                start_date: dateRange.start,
                end_date: dateRange.end,
                id_tipo_evento: selectedEventTypes.length > 0 ? selectedEventTypes.join(',') : undefined
            };
            
            if (viewMode === 'table') {
                const res = await api.get('/asistencias/reporte-grupal', { params });
                setReportData(res.data.report || []);
                setSummary(res.data.summary);
            } else {
                const res = await api.get('/asistencias/reporte-matrix', { params });
                setMatrixData(res.data);
            }
            
            notify('Reporte actualizado', 'success');
        } catch (error) {
            console.error(error);
            notify('Error actualizando reporte', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReport();
    }, [viewMode]);

    const toggleEventType = (id) => {
        setSelectedEventTypes(prev => 
            prev.includes(id) 
                ? prev.filter(i => i !== id)
                : [...prev, id]
        );
    };

    const handleDownloadReport = async () => {
        try {
            notify('Generando reporte PDF...', 'info');
            const params = {
                start_date: dateRange.start,
                end_date: dateRange.end,
                id_tipo_evento: selectedEventTypes.length > 0 ? selectedEventTypes.join(',') : undefined
            };
            const res = await api.get('/asistencias/reporte-grupal/pdf', { 
                params,
                responseType: 'blob' 
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Reporte_Asistencia_${dateRange.start}_${dateRange.end}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            notify('PDF descargado correctamente', 'success');
        } catch (error) {
            console.error(error);
            notify('Error al descargar PDF', 'error');
        }
    };

    const filteredMusicians = rankings.filter(m => 
        m.nombres.toLowerCase().includes(filter.toLowerCase()) || 
        m.apellidos.toLowerCase().includes(filter.toLowerCase()) ||
        m.instrumento.toLowerCase().includes(filter.toLowerCase())
    );

    const filteredReport = reportData.filter(item => 
        (item.nombres.toLowerCase().includes(filter.toLowerCase()) || 
         item.apellidos.toLowerCase().includes(filter.toLowerCase())) &&
        item.rate >= minRate
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight transition-colors">Reportes y Rankings</h1>
                    <p className="text-gray-500 text-xs font-medium uppercase tracking-widest mt-1 transition-colors">Análisis de rendimiento y constancia</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 p-1 rounded-2xl border border-surface-border">
                        <button 
                            onClick={() => setViewMode('table')}
                            className={clsx(
                                "px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest",
                                viewMode === 'table' ? "bg-white dark:bg-gray-800 text-indigo-600 shadow-lg" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                            )}
                        >
                            <TableProperties className="w-4 h-4" /> <span className="hidden sm:inline">Tabla</span>
                        </button>
                        <button 
                            onClick={() => setViewMode('matrix')}
                            className={clsx(
                                "px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest",
                                viewMode === 'matrix' ? "bg-white dark:bg-gray-800 text-indigo-600 shadow-lg" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                            )}
                        >
                            <LayoutGrid className="w-4 h-4" /> <span className="hidden sm:inline">Matriz</span>
                        </button>
                    </div>

                    <div className="w-px h-8 bg-surface-border mx-1 hidden md:block" />

                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setShowFilters(!showFilters)}
                            className={clsx(
                                "p-3 rounded-2xl transition-all border shrink-0",
                                showFilters 
                                    ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20" 
                                    : "bg-black/5 dark:bg-white/5 text-gray-500 border-surface-border hover:text-gray-900 dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10"
                            )}
                            title="Filtros"
                        >
                            <Filter className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={handleDownloadReport}
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl flex items-center gap-2 font-black uppercase tracking-widest text-[10px] transition-all shadow-lg shadow-indigo-600/20 active:scale-95 shrink-0"
                        >
                            <Download className="w-4 h-4" /> <span className="hidden sm:inline">Exportar PDF</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="bg-surface-card border border-surface-border rounded-3xl p-6 shadow-xl overflow-hidden transition-colors"
                >
                    <h3 className="text-gray-900 dark:text-white font-black uppercase text-sm mb-4 flex items-center gap-2 transition-colors">
                        <Filter className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Configuración de Reporte
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                        <div className="md:col-span-3 space-y-2">
                            <label className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-widest transition-colors flex items-center gap-2">
                                <Calendar className="w-3 h-3" /> Desde
                            </label>
                            <input 
                                type="date" 
                                value={dateRange.start}
                                onChange={e => setDateRange({...dateRange, start: e.target.value})}
                                className="w-full bg-surface-input border border-surface-border rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:border-indigo-500/50 outline-none text-sm font-medium transition-colors"
                            />
                        </div>
                        <div className="md:col-span-3 space-y-2">
                            <label className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-widest transition-colors flex items-center gap-2">
                                <Calendar className="w-3 h-3" /> Hasta
                            </label>
                            <input 
                                type="date" 
                                value={dateRange.end}
                                onChange={e => setDateRange({...dateRange, end: e.target.value})}
                                className="w-full bg-surface-input border border-surface-border rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:border-indigo-500/50 outline-none text-sm font-medium transition-colors"
                            />
                        </div>
                        <div className="md:col-span-4 space-y-2">
                            <label className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-widest transition-colors">Tipos de Evento</label>
                            <div className="flex flex-wrap gap-2 p-3 bg-surface-input border border-surface-border rounded-xl min-h-[46px]">
                                {eventTypes.length > 0 ? (
                                    eventTypes.map(t => (
                                        <button
                                            key={t.id_tipo_evento}
                                            onClick={() => toggleEventType(t.id_tipo_evento)}
                                            className={clsx(
                                                "px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all border",
                                                selectedEventTypes.includes(t.id_tipo_evento)
                                                    ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/20"
                                                    : "bg-white/5 dark:bg-black/20 border-surface-border text-gray-500 hover:text-gray-900 dark:hover:text-white"
                                            )}
                                        >
                                            {t.evento}
                                        </button>
                                    ))
                                ) : (
                                    <span className="text-[9px] text-gray-500 p-1">Cargando tipos...</span>
                                )}
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <button 
                                onClick={loadReport}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3.5 rounded-xl font-black uppercase tracking-widest text-[10px] w-full transition-all shadow-lg shadow-indigo-600/10 active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Check className="w-4 h-4" /> Aplicar
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Wall of Fame (Top 3 Only if filtered?) - Keeping Full for now as per request */}
            <div className="bg-surface-card border border-surface-border rounded-[2.5rem] overflow-hidden shadow-2xl transition-colors">
                <div className="p-8 border-b border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-500/10 rounded-2xl border border-orange-500/20">
                            <Flame className="w-6 h-6 text-orange-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter transition-colors">Wall of Fame <span className="opacity-50 text-sm not-italic ml-2">(Racha Actual)</span></h3>
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest transition-colors">Top Musicos Constantes</p>
                        </div>
                    </div>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Buscar músico..." 
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="w-full sm:w-64 bg-surface-input border border-surface-border rounded-xl py-3 pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all font-medium"
                        />
                    </div>
                </div>

                <div className="p-4 sm:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {loading ? (
                        [1,2,3].map(i => <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />)
                    ) : filteredMusicians.length > 0 ? (
                        filteredMusicians.slice(0, 6).map((m, idx) => (
                            <motion.div 
                                key={m.id_miembro}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                className={clsx(
                                    "relative p-6 rounded-3xl border transition-all hover:-translate-y-1 hover:shadow-xl group",
                                    idx === 0 ? "bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/20" :
                                    idx === 1 ? "bg-gradient-to-br from-gray-400/10 to-transparent border-gray-400/20" :
                                    idx === 2 ? "bg-gradient-to-br from-orange-700/10 to-transparent border-orange-700/20" :
                                    "bg-surface-card border-surface-border hover:border-indigo-500/30"
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={clsx(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black shadow-lg",
                                            idx === 0 ? "bg-yellow-500 text-black" :
                                            idx === 1 ? "bg-gray-300 text-black" :
                                            idx === 2 ? "bg-orange-700 text-white" :
                                            "bg-white/5 text-gray-500"
                                        )}>
                                            {idx <= 2 ? <Trophy className="w-6 h-6" /> : `#${idx + 1}`}
                                        </div>
                                        <div>
                                            <h4 className="text-gray-900 dark:text-white font-black uppercase text-sm transition-colors">{m.nombres} {m.apellidos}</h4>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest transition-colors">{m.instrumento}</p>
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="flex items-center gap-1 justify-end">
                                            <Flame className={clsx("w-4 h-4", idx <= 2 ? "text-orange-500 fill-orange-500" : "text-gray-600")} />
                                            <span className={clsx("text-2xl font-black tabular-nums", idx <= 2 ? "text-orange-400" : "text-gray-500")}>{m.streak}</span>
                                        </div>
                                        <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Racha</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center text-gray-500 font-medium transition-colors">
                            No se encontraron datos para los filtros aplicados.
                        </div>
                    )}
                </div>
            </div>

            {/* Detailed Report Table / Matrix */}
            <div className="bg-surface-card border border-surface-border rounded-[2.5rem] overflow-hidden shadow-2xl transition-colors">
                {viewMode === 'table' ? (
                    <>
                        <div className="p-8 border-b border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                                    <Trophy className="w-6 h-6 text-indigo-600 dark:text-indigo-500 transition-colors" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter transition-colors">Reporte Detallado</h3>
                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest transition-colors">
                                        {dateRange.start} - {dateRange.end}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold transition-colors">Asistencia Min.</span>
                                    <input 
                                        type="number" 
                                        min="0" max="100"
                                        value={minRate}
                                        onChange={e => setMinRate(Number(e.target.value))}
                                        className="w-20 bg-surface-input text-right border border-surface-border rounded-lg px-2 py-1 text-gray-900 dark:text-white focus:border-indigo-500/50 outline-none text-xs font-medium transition-colors"
                                    />
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-2xl font-black text-gray-900 dark:text-white transition-colors">{summary?.group_average || 0}%</span>
                                    <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest transition-colors">Promedio Grupal</span>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-black/5 dark:bg-white/5 border-b border-surface-border text-[10px] text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest transition-colors">
                                        <th className="p-6">Músico</th>
                                        <th className="p-6 text-center">Eventos</th>
                                        <th className="p-6 text-center">Asistencias</th>
                                        <th className="p-6 text-center">Faltas</th>
                                        <th className="p-6 text-center text-indigo-600 dark:text-indigo-400 transition-colors">Efectividad</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-surface-border">
                                    {filteredReport.length > 0 ? (
                                        filteredReport.map((row) => (
                                            <tr key={row.id_miembro} className="text-gray-900 dark:text-white hover:bg-black/[0.02] dark:hover:bg-white/5 transition-colors">
                                                <td className="p-6">
                                                    <div className="font-bold transition-colors">{row.nombres} {row.apellidos}</div>
                                                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider transition-colors">{row.instrumento}</div>
                                                </td>
                                                <td className="p-6 text-center font-medium text-gray-500 dark:text-gray-300 transition-colors">{row.total_events}</td>
                                                <td className="p-6 text-center font-medium text-green-600 dark:text-green-400 transition-colors">{row.present_count}</td>
                                                <td className="p-6 text-center font-medium text-red-600 dark:text-red-400 transition-colors">{row.absent_count}</td>
                                                <td className="p-6 text-center">
                                                    <div className="flex items-center justify-between gap-3 max-w-[120px] mx-auto">
                                                        <div className="flex-1 h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden transition-colors">
                                                            <div 
                                                                className={clsx("h-full rounded-full",
                                                                    row.rate >= 80 ? 'bg-green-500' : 
                                                                    row.rate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                                                )} 
                                                                style={{ width: `${row.rate}%` }}
                                                            />
                                                        </div>
                                                        <span className={clsx("text-sm font-black w-10 text-right",
                                                            row.rate >= 80 ? 'text-green-500' : 
                                                            row.rate >= 50 ? 'text-yellow-500' : 'text-red-500'
                                                        )}>{row.rate}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="p-12 text-center text-gray-500">
                                                No hay datos que coincidan con los filtros.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Matrix View Header */}
                        <div className="p-8 border-b border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                                    <LayoutGrid className="w-6 h-6 text-indigo-600 dark:text-indigo-500 transition-colors" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter transition-colors">Matriz de Asistencia</h3>
                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest transition-colors">Control diario por músico</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-4 px-4 py-2 bg-black/5 dark:bg-white/5 rounded-xl border border-surface-border">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                        <span className="text-[9px] font-black uppercase text-gray-500 tracking-wider">Presente (A)</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                                        <span className="text-[9px] font-black uppercase text-gray-500 tracking-wider">Permiso (P)</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-red-500" />
                                        <span className="text-[9px] font-black uppercase text-gray-500 tracking-wider">Falta (F)</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-black/5 dark:bg-white/5 border-b border-surface-border transition-colors">
                                        <th className="p-4 sm:p-6 text-[10px] text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest sticky left-0 bg-surface-card z-10 w-48 transition-colors">Músico</th>
                                        {matrixData.eventos.map(ev => (
                                            <th key={ev.id_evento} className="p-2 text-center min-w-[40px] border-l border-surface-border transition-colors" title={`${ev.evento} - ${ev.fecha}`}>
                                                <div className="text-[10px] font-black text-gray-900 dark:text-white transition-colors">{ev.dia}</div>
                                                <div className="text-[8px] text-gray-500 uppercase transition-colors">{ev.tipo.substring(0, 3)}</div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-surface-border">
                                    {matrixData.data.length > 0 ? (
                                        matrixData.data.map((group, gIdx) => (
                                            <Fragment key={gIdx}>
                                                {/* Instrument Group Header */}
                                                <tr className="bg-black/[0.02] dark:bg-white/[0.02] border-y border-surface-border transition-colors">
                                                    <td colSpan={matrixData.eventos.length + 1} className="p-3 px-6">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                                            <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] transition-colors">{group.instrumento}</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                                {group.miembros.map(m => (
                                                    <tr key={m.id_miembro} className="text-gray-900 dark:text-white hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors">
                                                        <td className="p-4 sm:p-6 border-r border-surface-border sticky left-0 bg-surface-card z-10 transition-colors">
                                                            <div className="font-bold text-xs leading-none transition-colors">{m.nombre_completo}</div>
                                                        </td>
                                                        {matrixData.eventos.map(ev => {
                                                            const asist = m.asistencias[ev.id_evento];
                                                            const status = asist?.estado || '-';
                                                            const isPresent = status === 'PUNTUAL' || status === 'RETRASO' || status === 'PRESENTE';
                                                            const isPermission = status === 'JUSTIFICADO';
                                                            const isAbsent = status === 'FALTA';
                                                            
                                                            return (
                                                                <td key={ev.id_evento} className="p-2 text-center border-l border-surface-border transition-colors">
                                                                    <div className={clsx(
                                                                        "w-7 h-7 mx-auto rounded-lg flex items-center justify-center text-[10px] font-black transition-all",
                                                                        isPresent ? "bg-green-500/10 text-green-600 border border-green-500/20" :
                                                                        isPermission ? "bg-blue-500/10 text-blue-600 border border-blue-600/20" :
                                                                        isAbsent ? "bg-red-500/10 text-red-600 border border-red-500/20" :
                                                                        "text-gray-300 dark:text-gray-700"
                                                                    )}>
                                                                        {isPresent ? 'A' : 
                                                                         isPermission ? 'P' : 
                                                                         isAbsent ? 'F' : '-'}
                                                                    </div>
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ))}
                                            </Fragment>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={matrixData.eventos.length + 1} className="p-12 text-center text-gray-500">
                                                Cargando matriz de asistencia o sin eventos en el rango...
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

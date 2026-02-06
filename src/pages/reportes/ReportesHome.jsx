import { useState, useEffect, Fragment, useMemo } from 'react';
import { Flame, Download, Filter, Search, Medal, Trophy, TableProperties, LayoutGrid, Check, ChevronDown, Calendar, User, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import api from '../../api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import SmartDateInput from '../../components/ui/SmartDateInput';

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
    
    const [secciones, setSecciones] = useState([]);
    const [instrumentos, setInstrumentos] = useState([]);
    const [selectedSeccion, setSelectedSeccion] = useState('');
    const [selectedInstrumento, setSelectedInstrumento] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

    const isAdminOrDirector = ['ADMIN', 'DIRECTOR', 'ADMINISTRADOR'].includes(user?.role?.toUpperCase());

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        setLoading(true);
        try {
            const [rankingsRes, typesRes, secRes, insRes] = await Promise.all([
                api.get('/asistencias/rankings'),
                api.get('/eventos/tipos'),
                api.get('/secciones'),
                api.get('/instrumentos')
            ]);
            setRankings(rankingsRes.data.rankings || []);
            setEventTypes(typesRes.data || []);
            setSecciones(secRes.data || []);
            setInstrumentos(insRes.data || []);
            
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
                id_tipo_evento: selectedEventTypes.length > 0 ? selectedEventTypes.join(',') : undefined,
                id_seccion: selectedSeccion || undefined,
                id_instrumento: selectedInstrumento || undefined
            };
            
            if (viewMode === 'table') {
                const res = await api.get('/asistencias/reporte-grupal', { params });
                setReportData(res.data.report || []);
                setSummary(res.data.summary);
            } else {
                const res = await api.get('/asistencias/reporte-matrix', { params });
                setMatrixData(res.data);
            }
            
        } catch (error) {
            console.error(error);
            notify('Error actualizando reporte', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReport();
    }, [viewMode, dateRange, selectedSeccion, selectedInstrumento, selectedEventTypes]);

    const toggleEventType = (id) => {
        setSelectedEventTypes(prev => 
            prev.includes(id) 
                ? prev.filter(i => i !== id)
                : [...prev, id]
        );
    };

    const handleMonthChange = (monthIdx) => {
        const year = new Date().getFullYear();
        const start = new Date(year, monthIdx, 1);
        const end = new Date(year, monthIdx + 1, 0);
        
        setSelectedMonth(monthIdx);
        // This will trigger loadReport via dateRange dependency
        setDateRange({
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0]
        });
    };

    const handleSeccionChange = (val) => {
        setSelectedSeccion(val);
        setSelectedInstrumento(''); // Reset instrument when section changes to trigger fresh load
    };

    const MESES = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const handleDownloadReport = async () => {
        try {
            notify('Generando reporte PDF...', 'info');
            const params = {
                start_date: dateRange.start,
                end_date: dateRange.end,
                id_tipo_evento: selectedEventTypes.length > 0 ? selectedEventTypes.join(',') : undefined,
                id_seccion: selectedSeccion || undefined,
                id_instrumento: selectedInstrumento || undefined
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

    const groupedReport = useMemo(() => {
        const orderMap = {
            'PLATILLO': 1, 'TAMBOR': 2, 'TIMBAL': 3, 'BOMBO': 4,
            'TROMBON': 5, 'CLARINETE': 6, 'BARITONO': 7, 'TROMPETA': 8, 'HELICON': 9
        };
        const groups = {};
        filteredReport.forEach(item => {
            const inst = item.instrumento || 'Sin Instrumento';
            if (!groups[inst]) groups[inst] = [];
            groups[inst].push(item);
        });
        return Object.entries(groups).sort(([a], [b]) => {
            return (orderMap[a.toUpperCase()] || 99) - (orderMap[b.toUpperCase()] || 99);
        });
    }, [filteredReport]);

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight transition-colors">Reportes y Rankings</h1>
                    <p className="text-gray-500 text-xs font-medium uppercase tracking-widest mt-1 transition-colors">Análisis de rendimiento y constancia</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 p-1 rounded-2xl border border-surface-border transition-colors">
                        <button 
                            onClick={() => setViewMode('table')}
                            className={clsx(
                                "px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest",
                                viewMode === 'table' ? "bg-[#bc1b1b] text-white shadow-lg" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                            )}
                        >
                            <TableProperties className="w-4 h-4" /> <span className="hidden sm:inline">Tabla Reporte</span>
                        </button>
                        <button 
                            onClick={() => setViewMode('matrix')}
                            className={clsx(
                                "px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest",
                                viewMode === 'matrix' ? "bg-[#bc1b1b] text-white shadow-lg" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                            )}
                        >
                            <LayoutGrid className="w-4 h-4" /> <span className="hidden sm:inline">Matriz Diaria</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters have been moved inside the report card for better context */}

            {/* Wall of Fame (Top 3 Only if filtered?) - Keeping Full for now as per request */}
            <div className="bg-surface-card border border-surface-border rounded-[2.5rem] overflow-hidden shadow-2xl transition-colors">
                <div className="p-8 border-b border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-500/10 rounded-2xl border border-orange-500/20">
                            <Flame className="w-6 h-6 text-orange-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter transition-colors">Ranking de Constancia <span className="opacity-50 text-sm not-italic ml-2">(Racha Actual)</span></h3>
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest transition-colors">Top Musicos con más asistencias seguidas</p>
                        </div>
                    </div>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 group-focus-within:text-[#bc1b1b] transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Buscar músico..." 
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="w-full sm:w-64 bg-surface-input border border-surface-border rounded-xl py-3 pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-[#bc1b1b]/50 transition-all font-medium"
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
                                    "bg-surface-card border-surface-border hover:border-[#bc1b1b]/30"
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
            <div className="bg-surface-card border border-surface-border rounded-[2.5rem] shadow-2xl transition-colors relative">
                {viewMode === 'table' ? (
                    <>
                        <div className="p-8 border-b border-surface-border flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-[#bc1b1b]/10 rounded-2xl border border-[#bc1b1b]/20">
                                    <Trophy className="w-6 h-6 text-[#bc1b1b] transition-colors" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter transition-colors">Reporte Detallado</h3>
                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest transition-colors">
                                        Distribución y Eficiencia por Músico
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => setShowFilters(!showFilters)}
                                        className={clsx(
                                            "flex items-center gap-2 px-4 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all border shrink-0",
                                            showFilters 
                                                ? "bg-[#bc1b1b] border-[#bc1b1b] text-white shadow-lg shadow-[#bc1b1b]/20" 
                                                : "bg-black/5 dark:bg-white/5 text-gray-500 border-surface-border hover:text-gray-900 dark:hover:text-white"
                                        )}
                                    >
                                        <Filter className="w-4 h-4" /> <span>{showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}</span>
                                    </button>
                                    <button 
                                        onClick={handleDownloadReport}
                                        className="p-2.5 bg-black/5 dark:bg-white/5 text-gray-500 border border-surface-border rounded-xl hover:text-[#bc1b1b] transition-all shrink-0"
                                        title="Exportar PDF"
                                    >
                                        <Download className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="hidden sm:block w-px h-10 bg-surface-border mx-2" />

                                <div className="flex items-center gap-6">
                                    <div className="flex flex-col items-end">
                                        <span className="text-[9px] text-gray-500 dark:text-gray-400 uppercase font-black tracking-widest transition-colors mb-1">Mínimo (%)</span>
                                        <input 
                                            type="number" 
                                            min="0" max="100"
                                            value={minRate}
                                            onChange={e => setMinRate(Number(e.target.value))}
                                            className="w-16 bg-surface-input text-right border border-surface-border rounded-lg px-2 py-1 text-gray-900 dark:text-white focus:border-[#bc1b1b]/50 outline-none text-[11px] font-black transition-colors"
                                        />
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-2xl font-black text-gray-900 dark:text-white transition-colors leading-none">{summary?.group_average || 0}%</span>
                                        <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest transition-colors mt-1">Global</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Integrated Filter Panel */}
                        <AnimatePresence>
                            {showFilters && (
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="border-b border-surface-border bg-black/5 dark:bg-white/[0.03] relative z-[50]"
                                >
                                    <div className="p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 items-end">
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest flex items-center gap-2"><Calendar className="w-3 h-3" /> Mes</label>
                                            <select value={selectedMonth} onChange={e => handleMonthChange(Number(e.target.value))} className="w-full bg-surface-card border border-surface-border rounded-xl px-4 py-2.5 text-xs font-bold text-gray-900 dark:text-white focus:border-[#bc1b1b] outline-none h-11 transition-colors">
                                                {MESES.map((mes, idx) => <option key={idx} value={idx}>{mes}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest flex items-center gap-2"><Clock className="w-3 h-3" /> Inicio</label>
                                            <SmartDateInput 
                                                value={dateRange.start} 
                                                onChange={val => setDateRange({...dateRange, start: val})} 
                                                className="!h-11"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest flex items-center gap-2"><Clock className="w-3 h-3" /> Fin</label>
                                            <SmartDateInput 
                                                value={dateRange.end} 
                                                onChange={val => setDateRange({...dateRange, end: val})} 
                                                className="!h-11"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest">Sección</label>
                                            <select value={selectedSeccion} onChange={e => handleSeccionChange(e.target.value)} className="w-full bg-surface-card border border-surface-border rounded-xl px-4 py-2.5 text-xs font-bold text-gray-900 dark:text-white h-11 transition-colors">
                                                <option value="">Todas</option>
                                                {secciones.map(s => <option key={s.id_seccion} value={s.id_seccion}>{s.seccion}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest">Instrumento</label>
                                            <select value={selectedInstrumento} onChange={e => setSelectedInstrumento(e.target.value)} className="w-full bg-surface-card border border-surface-border rounded-xl px-4 py-2.5 text-xs font-bold text-gray-900 dark:text-white h-11 transition-colors">
                                                <option value="">Todos</option>
                                                {instrumentos.filter(i => !selectedSeccion || i.id_seccion == selectedSeccion).map(i => <option key={i.id_instrumento} value={i.id_instrumento}>{i.instrumento}</option>)}
                                            </select>
                                        </div>
                                        <div className="flex items-center gap-2 h-11 px-4 bg-[#bc1b1b]/10 border border-[#bc1b1b]/20 rounded-xl">
                                            <div className="w-2 h-2 rounded-full bg-[#bc1b1b] animate-pulse" />
                                            <span className="text-[9px] font-black uppercase text-[#bc1b1b] tracking-widest">Auto-actualizando</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-black/5 dark:bg-white/5 border-b border-surface-border text-[10px] text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest transition-colors">
                                        <th className="p-6">Músico</th>
                                        <th className="p-6 text-center">Eventos</th>
                                        <th className="p-6 text-center">Asistencias</th>
                                        <th className="p-6 text-center">Faltas</th>
                                        <th className="p-6 text-center">Permisos</th>
                                        <th className="p-6 text-center text-[#bc1b1b] transition-colors">Efectividad</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-surface-border">
                                    {groupedReport.length > 0 ? (
                                        groupedReport.map(([instrumento, miembros]) => (
                                            <Fragment key={instrumento}>
                                                <tr className="bg-black/10 dark:bg-white/[0.03] transition-colors">
                                                    <td colSpan="6" className="p-4 px-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-[#ffbe0b] shadow-lg shadow-[#ffbe0b]/50" />
                                                            <span className="text-[11px] font-black uppercase text-gray-900 dark:text-white tracking-[0.2em]">{instrumento}</span>
                                                            <div className="flex-1 h-px bg-surface-border ml-4" />
                                                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{miembros.length} Miembros</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                                {miembros.map((row) => (
                                                    <tr key={row.id_miembro} className="text-gray-900 dark:text-white hover:bg-black/[0.02] dark:hover:bg-white/5 transition-colors group">
                                                        <td className="p-6">
                                                            <div className="font-bold transition-colors group-hover:text-[#bc1b1b]">{row.nombres} {row.apellidos}</div>
                                                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider transition-colors">{row.seccion}</div>
                                                        </td>
                                                        <td className="p-6 text-center font-medium text-gray-500 dark:text-gray-300 transition-colors uppercase tabular-nums tracking-tighter">{row.total_events}</td>
                                                        <td className="p-6 text-center font-medium text-green-600 dark:text-green-400 transition-colors uppercase tabular-nums tracking-tighter bg-green-500/5">{row.present_count}</td>
                                                        <td className="p-6 text-center font-medium text-[#bc1b1b] dark:text-[#bc1b1b] transition-colors uppercase tabular-nums tracking-tighter bg-[#bc1b1b]/5">{row.absent_count + row.unmarked_count}</td>
                                                        <td className="p-6 text-center font-medium text-[#ffbe0b] transition-colors uppercase tabular-nums tracking-tighter bg-[#ffbe0b]/5">{row.justified_count}</td>
                                                        <td className="p-6 text-center">
                                                            <div className="flex items-center justify-between gap-3 max-w-[120px] mx-auto">
                                                                <div className="flex-1 h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden transition-colors border border-surface-border">
                                                                    <div 
                                                                        className={clsx("h-full rounded-full transition-all duration-500",
                                                                            row.rate >= 80 ? 'bg-green-500' : 
                                                                            row.rate >= 50 ? 'bg-yellow-500' : 'bg-[#bc1b1b]'
                                                                        )} 
                                                                        style={{ width: `${row.rate}%` }}
                                                                    />
                                                                </div>
                                                                <span className={clsx("text-xs font-black w-10 text-right tabular-nums",
                                                                    row.rate >= 80 ? 'text-green-500' : 
                                                                    row.rate >= 50 ? 'text-yellow-500' : 'text-[#bc1b1b]'
                                                                )}>{row.rate}%</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </Fragment>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="p-12 text-center text-gray-400 italic">
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
                        <div className="p-8 border-b border-surface-border flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-[#ffbe0b]/10 rounded-2xl border border-[#ffbe0b]/20">
                                    <LayoutGrid className="w-6 h-6 text-[#ffbe0b] transition-colors" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter transition-colors">Matriz de Asistencia</h3>
                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest transition-colors">Control diario por músico</p>
                                </div>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => setShowFilters(!showFilters)}
                                        className={clsx(
                                            "flex items-center gap-2 px-4 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all border shrink-0",
                                            showFilters 
                                                ? "bg-[#bc1b1b] border-[#bc1b1b] text-white shadow-lg shadow-[#bc1b1b]/20" 
                                                : "bg-black/5 dark:bg-white/5 text-gray-500 border-surface-border hover:text-gray-900 dark:hover:text-white"
                                        )}
                                    >
                                        <Filter className="w-4 h-4" /> <span>{showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}</span>
                                    </button>
                                    <button 
                                        onClick={handleDownloadReport}
                                        className="p-2.5 bg-black/5 dark:bg-white/5 text-gray-500 border border-surface-border rounded-xl hover:text-[#bc1b1b] dark:hover:text-[#bc1b1b] transition-all shrink-0"
                                    >
                                        <Download className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="hidden sm:block w-px h-10 bg-surface-border mx-2" />

                                <div className="flex items-center gap-4 px-4 py-3 bg-black/5 dark:bg-white/[0.03] rounded-2xl border border-surface-border shadow-inner">
                                    <div className="flex items-center gap-1.5 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all">
                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                        <span className="text-[9px] font-black uppercase text-gray-500 tracking-wider">Presente</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all">
                                        <div className="w-2 h-2 rounded-full bg-[#ffbe0b]" />
                                        <span className="text-[9px] font-black uppercase text-gray-500 tracking-wider">Permiso</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all">
                                        <div className="w-2 h-2 rounded-full bg-[#bc1b1b]" />
                                        <span className="text-[9px] font-black uppercase text-gray-500 tracking-wider">Falta</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Integrated Filter Panel */}
                        <AnimatePresence>
                            {showFilters && (
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="border-b border-surface-border bg-black/5 dark:bg-white/[0.03] relative z-[50]"
                                >
                                    <div className="p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 items-end">
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest flex items-center gap-2"><Calendar className="w-3 h-3" /> Mes</label>
                                            <select value={selectedMonth} onChange={e => handleMonthChange(Number(e.target.value))} className="w-full bg-surface-card border border-surface-border rounded-xl px-4 py-2.5 text-xs font-bold text-gray-900 dark:text-white focus:border-[#bc1b1b] outline-none h-11 transition-colors">
                                                {MESES.map((mes, idx) => <option key={idx} value={idx}>{mes}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest flex items-center gap-2"><Clock className="w-3 h-3" /> Inicio</label>
                                            <SmartDateInput 
                                                value={dateRange.start} 
                                                onChange={val => setDateRange({...dateRange, start: val})} 
                                                className="!h-11"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest flex items-center gap-2"><Clock className="w-3 h-3" /> Fin</label>
                                            <SmartDateInput 
                                                value={dateRange.end} 
                                                onChange={val => setDateRange({...dateRange, end: val})} 
                                                className="!h-11"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest">Sección</label>
                                            <select value={selectedSeccion} onChange={e => handleSeccionChange(e.target.value)} className="w-full bg-surface-card border border-surface-border rounded-xl px-4 py-2.5 text-xs font-bold text-gray-900 dark:text-white h-11 transition-colors">
                                                <option value="">Todas</option>
                                                {secciones.map(s => <option key={s.id_seccion} value={s.id_seccion}>{s.seccion}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest">Instrumento</label>
                                            <select value={selectedInstrumento} onChange={e => setSelectedInstrumento(e.target.value)} className="w-full bg-surface-card border border-surface-border rounded-xl px-4 py-2.5 text-xs font-bold text-gray-900 dark:text-white h-11 transition-colors">
                                                <option value="">Todos</option>
                                                {instrumentos.filter(i => !selectedSeccion || i.id_seccion == selectedSeccion).map(i => <option key={i.id_instrumento} value={i.id_instrumento}>{i.instrumento}</option>)}
                                            </select>
                                        </div>
                                        <div className="flex items-center gap-2 h-11 px-4 bg-[#bc1b1b]/10 border border-[#bc1b1b]/20 rounded-xl">
                                            <div className="w-2 h-2 rounded-full bg-[#bc1b1b] animate-pulse" />
                                            <span className="text-[9px] font-black uppercase text-[#bc1b1b] tracking-widest">Auto-actualizando</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

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
                                                            <div className="w-1.5 h-1.5 rounded-full bg-[#ffbe0b]" />
                                                            <span className="text-[10px] font-black text-[#ffbe0b] uppercase tracking-[0.2em] transition-colors">{group.instrumento}</span>
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
                                                                        isPermission ? "bg-[#ffbe0b]/10 text-[#ffbe0b] border border-[#ffbe0b]/20" :
                                                                        isAbsent ? "bg-[#bc1b1b]/10 text-[#bc1b1b] border border-[#bc1b1b]/20" :
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

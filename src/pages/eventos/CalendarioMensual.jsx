import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Printer, Download, Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { clsx } from 'clsx';
import { useAuth } from '../../context/AuthContext';

export default function CalendarioMensual({ eventos, onBack, onEventClick, onDateClick }) {
    const { user } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay(); // 0 = Domingo

    const monthData = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const totalDays = daysInMonth(year, month);
        const startDay = firstDayOfMonth(year, month);
        
        let days = [];
        // Rellenar días vacíos antes del 1
        for (let i = 0; i < startDay; i++) {
            days.push(null);
        }
        // Días reales
        for (let i = 1; i <= totalDays; i++) {
            days.push(i);
        }
        return days;
    }, [currentDate]);

    const eventosDelMes = useMemo(() => {
        return eventos.filter(e => {
            // Failsafe: Si viene con tiempo '2026-01-02 00:00:00', tomamos solo la parte de fecha
            const fechaStr = e.fecha ? e.fecha.split(' ')[0] : '';
            const d = new Date(fechaStr + 'T12:00:00'); 
            return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
        });
    }, [eventos, currentDate]);

    const getEventosPorDia = (dia) => {
        if (!dia) return [];
        return eventosDelMes.filter(e => {
            const fechaStr = e.fecha ? e.fecha.split(' ')[0] : '';
            const d = new Date(fechaStr + 'T12:00:00');
            return d.getDate() === dia;
            // return parseInt(fechaStr.split('-')[2]) === dia; // Alternative direct mapping
        });
    };

    const handlePrint = () => {
        window.print();
    };

    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    const changeMonth = (offset) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setCurrentDate(newDate);
    };

    return (
        <div className="animate-in fade-in duration-500 w-full mb-10">
            {/* Controles de navegación (NO SE IMPRIMEN) */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 print:hidden">
                <div className="flex items-center gap-4 bg-white dark:bg-white/5 p-2 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none">
                    <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl text-gray-900 dark:text-white transition-colors">
                        <ChevronLeft />
                    </button>
                    <span className="text-xl font-bold uppercase tracking-widest text-gray-900 dark:text-white w-48 text-center transition-colors">
                        {meses[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </span>
                    <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl text-gray-900 dark:text-white transition-colors">
                        <ChevronRight />
                    </button>
                </div>

                <Button onClick={handlePrint} className="bg-brand-primary text-white hover:bg-brand-primary/90 px-6 shadow-xl shadow-brand-primary/20">
                    <Printer className="w-5 h-5 mr-2" />
                    Imprimir / PDF
                </Button>
            </div>

            {/* ÁREA IMPRIMIBLE: Estilo Sistema Dark */}
            <div id="printable-area" className="w-full bg-white dark:bg-[#1e2330] p-4 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden ring-1 ring-gray-200 dark:ring-white/5 transition-colors duration-500 print:m-0 print:p-4 print:rounded-none print:shadow-none print:w-full print:bg-white print:text-black print:ring-0">
                {/* Logo Marca de Agua */}
                <div className="absolute top-10 right-10 opacity-5 pointer-events-none print:opacity-10">
                    <div className="w-40 h-40 bg-indigo-500 rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10">
                    {/* Header Calendario */}
                    <div className="flex flex-col md:flex-row justify-between items-end mb-4 md:mb-8 border-b border-gray-200 dark:border-white/10 pb-4 print:mb-4 print:border-black/20 gap-4 transition-colors">
                        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
                            {/* Logo Banda */}
                            {user?.banda?.logo ? (
                                <img src={`/storage/${user.banda.logo}`} alt="Logo" className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-lg" />
                            ) : (
                                <div className="w-12 h-12 md:w-20 md:h-20 bg-indigo-600 rounded-xl flex items-center justify-center text-2xl md:text-4xl font-black text-white shadow-lg shadow-indigo-500/20 shrink-0">
                                    {user?.banda?.nombre?.charAt(0) || 'MB'}
                                </div>
                            )}
                            <div className="text-right md:text-left">
                                <h1 className="text-4xl md:text-7xl font-black text-gray-900 dark:text-white tracking-tighter print:text-black leading-none transition-colors">
                                    {meses[currentDate.getMonth()]}
                                </h1>
                                <p className="text-[10px] md:text-base text-indigo-500 dark:text-indigo-400 font-bold uppercase tracking-[0.2em] md:tracking-[0.4em] ml-1 opacity-80 print:text-gray-600">
                                    Rol de Actividades
                                </p>
                            </div>
                        </div>
                        <div className="hidden md:block text-right">
                            <span className="text-6xl md:text-8xl font-black text-gray-900/5 dark:text-white/5 leading-none block -mb-4 print:text-gray-200 transition-colors">
                                {currentDate.getFullYear()}
                            </span>
                        </div>
                    </div>

                    {/* Grilla Días Header */}
                    <div className="grid grid-cols-7 mb-2 text-center">
                        {diasSemana.map(d => (
                            <div key={d} className="py-2 md:py-3 font-black uppercase tracking-widest text-indigo-600/70 dark:text-indigo-300/70 text-[10px] md:text-xs mx-[1px] transition-colors">
                                <span className="hidden md:inline">{d}</span>
                                <span className="md:hidden">{d.charAt(0)}</span>
                            </div>
                        ))}
                    </div>

                {/* Cuerpo Calendario */}
                    <div className="grid grid-cols-7 auto-rows-[minmax(80px,_1fr)] md:auto-rows-[minmax(140px,_1fr)] gap-[1px] bg-gray-200 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden p-[1px] print:bg-gray-200 print:border-gray-300">
                        {monthData.map((dia, idx) => {
                            const eventsToday = getEventosPorDia(dia);
                            return (
                                <div 
                                    key={idx} 
                                    onClick={() => {
                                        if (dia && onDateClick) {
                                            const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
                                            const day = dia.toString().padStart(2, '0');
                                            const dateStr = `${currentDate.getFullYear()}-${month}-${day}`;
                                            onDateClick(dateStr);
                                        }
                                    }}
                                    className={clsx(
                                        "relative p-1 md:p-2 transition-all min-h-[80px] md:min-h-[140px] group overflow-hidden",
                                        dia ? "bg-white dark:bg-[#161b2c] hover:bg-gray-50 dark:hover:bg-[#1c2236] cursor-pointer print:bg-white" : "bg-gray-50 dark:bg-[#0f111a]"
                                    )}
                                >
                                    {dia && (
                                        <>
                                            <div className="flex justify-between items-start">
                                                <span className={clsx(
                                                    "text-lg md:text-2xl font-black leading-none transition-colors group-hover:text-indigo-500 dark:group-hover:text-indigo-400 print:text-black",
                                                    eventsToday.length > 0 ? "text-gray-900 dark:text-white" : "text-gray-300 dark:text-white/20"
                                                )}>
                                                    {dia}
                                                </span>
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                                                    <div className="w-5 h-5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                                        <Plus className="w-3 h-3" />
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-4 space-y-1">
                                                {eventsToday.map(ev => {
                                                    // Determine color based on event type
                                                    let borderColor = 'border-indigo-500';
                                                    let bgColor = 'bg-indigo-50 dark:bg-indigo-500/5 hover:bg-indigo-100 dark:hover:bg-indigo-500/10';
                                                    let textColor = 'text-indigo-900 dark:text-indigo-100';
                                                    let timeColor = 'text-indigo-600 dark:text-indigo-300';
                                                    
                                                    const type = ev.tipo?.evento?.toUpperCase();
                                                    if (type === 'CONTRATO') {
                                                        borderColor = 'border-purple-500';
                                                        bgColor = 'bg-purple-50 dark:bg-purple-500/5 hover:bg-purple-100 dark:hover:bg-purple-500/10';
                                                        textColor = 'text-purple-900 dark:text-purple-100';
                                                        timeColor = 'text-purple-600 dark:text-purple-300';
                                                    } else if (type === 'BANDIN') {
                                                        borderColor = 'border-orange-500';
                                                        bgColor = 'bg-orange-50 dark:bg-orange-500/5 hover:bg-orange-100 dark:hover:bg-orange-500/10';
                                                        textColor = 'text-orange-900 dark:text-orange-100';
                                                        timeColor = 'text-orange-600 dark:text-orange-300';
                                                    }

                                                    // ... logic already exists 
                                                    return (
                                                        <div 
                                                            key={ev.id_evento} 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (onEventClick) onEventClick(ev);
                                                            }}
                                                            className={clsx(
                                                                "flex flex-col border-l-2 pl-2 py-1.5 rounded-r-lg transition-all cursor-pointer text-left mb-1",
                                                                borderColor,
                                                                bgColor,
                                                                "group/event" // for hover effects
                                                            )}
                                                        >
                                                            <div className="flex justify-between items-baseline gap-1">
                                                                <span className={clsx("text-[9px] md:text-[10px] font-bold leading-tight uppercase line-clamp-2 tracking-wide print:text-black", textColor)}>
                                                                    {ev.evento}
                                                                </span>
                                                            </div>
                                                            <div className="flex flex-col mt-0.5 gap-0.5">
                                                                <span className={clsx("text-[8px] md:text-[9px] font-bold flex items-center gap-1 print:text-gray-600", timeColor)}>
                                                                    {ev.time} {ev.hora.substr(0, 5)} {ev.tipo?.evento && `• ${ev.tipo.evento}`}
                                                                </span>
                                                                {ev.direccion && (
                                                                    <span className="text-[7px] md:text-[8px] font-medium text-gray-500 truncate flex items-center gap-1 opacity-60 group-hover/event:opacity-100" title={ev.direccion}>
                                                                        {ev.direccion}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-4 text-center print:hidden">
                    <p className="text-xs text-gray-400 dark:text-white/60 font-medium italic">
                        * Los eventos pasados no se muestran. Este rol está sujeto a cambios.
                    </p>
                </div>
            </div>

            <style>
                {`
                @media print {
                    @page {
                         size: landscape;
                         margin: 0;
                    }
                    body * {
                        visibility: hidden;
                    }
                    #printable-area, #printable-area * {
                        visibility: visible;
                    }
                    #printable-area {
                        position: fixed;
                        left: 0;
                        top: 0;
                        width: 100vw;
                        height: 100vh;
                        margin: 0;
                        padding: 20px;
                        background: linear-gradient(135deg, #4dd0e1 0%, #00838f 100%) !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                        border-radius: 0;
                        box-shadow: none;
                    }
                }
                `}
            </style>
        </div>
    );
}

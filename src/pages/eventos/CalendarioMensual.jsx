import { useState, useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { clsx } from 'clsx';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import logoMb from '../../assets/logo.png';

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export default function CalendarioMensual({ eventos, onBack, onEventClick, onDateClick, canManage }) {
    const { user } = useAuth();
    const { notify } = useToast();
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date());
    const calendarRef = useRef(null);

    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const monthData = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const totalDays = daysInMonth(year, month);
        const startDay = firstDayOfMonth(year, month);
        
        let days = [];
        for (let i = 0; i < startDay; i++) days.push(null);
        for (let i = 1; i <= totalDays; i++) days.push(i);
        return days;
    }, [currentDate]);

    const eventosDelMes = useMemo(() => {
        return eventos.filter(e => {
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
        });
    };

    const [downloading, setDownloading] = useState(false);

    const handleDownloadImage = async () => {
        if (!calendarRef.current) return;
        setDownloading(true);
        try {
            const htmlToImage = await import('html-to-image');
            const dataUrl = await htmlToImage.toPng(calendarRef.current, {
                quality: 1,
                pixelRatio: 3,
                backgroundColor: '#0a0000',
                cacheBust: true,
            });
            const link = document.createElement('a');
            link.download = `Agenda-${MESES[currentDate.getMonth()]}-${currentDate.getFullYear()}.png`;
            link.href = dataUrl;
            link.click();
            notify("¡Imagen descargada!", "success");
        } catch (err) {
            console.error('Error exportando imagen:', err);
            notify("Error al exportar. Intenta de nuevo.", "error");
        } finally {
            setDownloading(false);
        }
    };

    const changeMonth = (offset) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setCurrentDate(newDate);
    };

    const apiBaseUrl = (import.meta.env.VITE_API_URL || '').replace('/api', '');

    return (
        <div className="animate-in fade-in duration-500 w-full mb-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 print:hidden">
                <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md p-2 rounded-2xl border border-[#bc1b1b]/20">
                    <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-[#bc1b1b]/20 rounded-xl text-white transition-colors">
                        <ChevronLeft />
                    </button>
                    <span className="text-xl font-black uppercase tracking-[0.2em] text-white w-48 text-center drop-shadow-[0_0_10px_rgba(188,27,27,0.5)]">
                        {MESES[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </span>
                    <button onClick={() => changeMonth(1)} className="p-2 hover:bg-[#bc1b1b]/20 rounded-xl text-white transition-colors">
                        <ChevronRight />
                    </button>
                </div>

                <Button 
                    onClick={handleDownloadImage} 
                    loading={downloading}
                    className="bg-gradient-to-r from-[#6e0d0d] to-[#ffbe0b] text-white hover:scale-105 px-8 py-6 rounded-2xl shadow-xl shadow-[#bc1b1b]/20 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
                >
                    <Download className="w-4 h-4 mr-2" />
                    {downloading ? 'Capturando Mística...' : 'Descargar Agenda de Gala'}
                </Button>
            </div>

            <div 
                ref={calendarRef}
                id="printable-area" 
                className="w-full bg-[#0a0000] p-4 sm:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-[#bc1b1b]/20 transition-all duration-500 print:m-0 print:p-4 print:rounded-none print:shadow-none print:w-full print:bg-[#0a0000]"
            >
                {/* FONDO JASPEADO ARTÍSTICO */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_#bc1b1b_0%,_transparent_50%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,_#ffbe0b_0%,_transparent_50%)]" />
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30" />
                </div>

                {/* LOGO MB GIGANTE AL CENTRO (FONDO) - MÁS VISIBLE */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.12] pointer-events-none scale-110 md:scale-125 select-none">
                    <div className="relative">
                        {/* Brillo de Calor Detrás del Estampado */}
                        <div className="absolute inset-0 blur-[100px] bg-[#bc1b1b]/20 scale-150" />
                        <img 
                            src={logoMb} 
                            alt="" 
                            className="relative w-full max-w-[500px] md:max-w-[750px] object-contain mix-blend-lighten filter drop-shadow-[0_0_30px_rgba(188,27,27,0.3)]" 
                        />
                    </div>
                </div>

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-6 md:mb-10 border-b border-[#bc1b1b]/30 pb-6 gap-4">
                        <div className="flex items-center gap-6 md:gap-10 w-full md:w-auto">
                            <img 
                                src={user?.banda?.logo ? `${apiBaseUrl}/storage/${user.banda.logo}` : logoMb} 
                                alt="Logo" 
                                crossOrigin="anonymous"
                                className="w-24 h-24 md:w-48 md:h-48 object-contain drop-shadow-[0_0_30px_rgba(255,190,11,0.3)] transition-transform hover:scale-110" 
                                onError={(e) => { e.target.src = logoMb; }}
                            />
                            <div className="text-left">
                                <h1 className="text-4xl md:text-9xl font-black text-white tracking-tighter leading-none italic uppercase bg-gradient-to-b from-white via-white to-gray-500 bg-clip-text text-transparent drop-shadow-2xl">
                                    {MESES[currentDate.getMonth()]}
                                </h1>
                                <div className="flex items-center gap-3 mt-2">
                                    <div className="h-[2px] w-12 bg-gradient-to-r from-[#bc1b1b] to-[#ffbe0b]"></div>
                                    <p className="text-xs md:text-xl text-[#ffbe0b] font-black uppercase tracking-[0.5em] drop-shadow-sm">
                                        Rol de Actividades
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:block text-right">
                            <span className="text-8xl md:text-[12rem] font-black text-white/[0.03] leading-none block -mb-8 select-none">
                                {currentDate.getFullYear()}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 mb-2 text-center">
                        {DIAS_SEMANA.map(d => (
                            <div key={d} className="py-2 md:py-4 font-black uppercase tracking-[0.3em] text-[#ffbe0b]/80 text-[9px] md:text-sm mx-[1px]">
                                {d.charAt(0)}{d.charAt(1)}{d.charAt(2)}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 auto-rows-[minmax(80px,_1fr)] md:auto-rows-[minmax(160px,_1fr)] gap-[2px] bg-[#bc1b1b]/10 border border-[#bc1b1b]/20 rounded-3xl overflow-hidden p-[2px]">
                        {monthData.map((dia, idx) => {
                            const eventsToday = getEventosPorDia(dia);
                            return (
                                <div 
                                    key={idx} 
                                    onClick={() => dia && onDateClick && onDateClick(`${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`)}
                                    className={clsx(
                                        "relative p-1 md:p-3 transition-all group overflow-hidden",
                                        dia ? "bg-black/60 backdrop-blur-sm hover:bg-[#bc1b1b]/10 cursor-pointer" : "bg-black/20"
                                    )}
                                >
                                    {dia && (
                                        <>
                                            <div className="flex justify-between items-start">
                                                <span className={clsx(
                                                    "text-lg md:text-3xl font-black leading-none transition-all group-hover:scale-110",
                                                    eventsToday.length > 0 ? "text-white italic underline decoration-[#ffbe0b]/50 underline-offset-4" : "text-white/10"
                                                )}>
                                                    {dia}
                                                </span>
                                            </div>
                                            
                                            <div className="mt-2 md:mt-6 space-y-1 md:space-y-2">
                                                {eventsToday.map(ev => {
                                                    const type = ev.tipo?.evento?.toUpperCase();
                                                    const isContract = type === 'CONTRATO';
                                                    
                                                    return (
                                                        <div 
                                                            key={ev.id_evento} 
                                                            onClick={(e) => { e.stopPropagation(); if (onEventClick) onEventClick(ev); }}
                                                            className={clsx(
                                                                "flex flex-col pl-2 md:pl-3 py-1 md:py-2 rounded-lg border-l-4 transition-all hover:translate-x-1 shadow-lg",
                                                                isContract 
                                                                    ? "border-[#ffbe0b] bg-[#ffbe0b]/10 shadow-[#ffbe0b]/5" 
                                                                    : "border-[#bc1b1b] bg-[#bc1b1b]/10 shadow-[#bc1b1b]/5"
                                                            )}
                                                        >
                                                            <span className={clsx(
                                                                "text-[8px] md:text-xs font-black uppercase leading-tight tracking-tight",
                                                                isContract ? "text-[#ffbe0b]" : "text-white"
                                                            )}>
                                                                {ev.evento}
                                                            </span>
                                                            <span className="text-[7px] md:text-[10px] font-bold text-gray-400 mt-1 flex items-center gap-1">
                                                                <span className={isContract ? "text-[#ffbe0b]/80" : "text-[#bc1b1b]"}>●</span>
                                                                {ev.hora.substr(0, 5)} {ev.tipo?.evento && <span className="opacity-50">• {ev.tipo.evento}</span>}
                                                            </span>
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

                <div className="mt-6 text-center italic opacity-40">
                    <p className="text-[10px] md:text-xs text-white uppercase tracking-[0.3em] font-bold">
                        Elite Performance System • Monster Band Engine
                    </p>
                </div>
            </div>

            <style>
                {`
                @media print {
                    @page { size: landscape; margin: 0; }
                    body * { visibility: hidden; }
                    #printable-area, #printable-area * { visibility: visible; }
                    #printable-area {
                        position: fixed; left: 0; top: 0; width: 100vw; height: 100vh;
                        margin: 0; padding: 40px; background: #0a0000 !important;
                        -webkit-print-color-adjust: exact; print-color-adjust: exact;
                    }
                }
                `}
            </style>
        </div>
    );
}

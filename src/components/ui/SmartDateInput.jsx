import { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { clsx } from 'clsx';
import { format, parse, isValid, getYear, getMonth, setYear, setMonth, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subMonths, addMonths } from 'date-fns';
import { es } from 'date-fns/locale';

export default function SmartDateInput({ value, onChange, label, error, name, max, min }) {
    const [inputValue, setInputValue] = useState('');
    const [showPicker, setShowPicker] = useState(false);
    const [viewDate, setViewDate] = useState(new Date());
    const [selectionMode, setSelectionMode] = useState('days'); // 'days', 'months', 'years'
    const containerRef = useRef(null);

    // Sync input value with external value (YYYY-MM-DD)
    useEffect(() => {
        if (value && isValid(new Date(value))) {
            const date = new Date(value + 'T12:00:00'); // Evitar problemas de timezone
            setInputValue(format(date, 'dd/MM/yyyy'));
            setViewDate(date);
        } else if (!value) {
            setInputValue('');
        }
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setShowPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleTextChange = (e) => {
        let val = e.target.value.replace(/\D/g, ''); // Solo números
        if (val.length > 8) val = val.slice(0, 8);
        
        // Aplicar máscara dd/mm/yyyy
        let formatted = val;
        if (val.length > 2) formatted = val.slice(0, 2) + '/' + val.slice(2);
        if (val.length > 4) formatted = val.slice(0, 2) + '/' + val.slice(2, 4) + '/' + val.slice(4);
        
        setInputValue(formatted);

        // Si tenemos 8 dígitos, validar y enviar al parent
        if (val.length === 8) {
            const parsedDate = parse(formatted, 'dd/MM/yyyy', new Date());
            if (isValid(parsedDate)) {
                const isoDate = format(parsedDate, 'yyyy-MM-dd');
                if ((!max || isoDate <= max) && (!min || isoDate >= min)) {
                    onChange(isoDate);
                }
            }
        } else if (val.length === 0) {
            onChange('');
        }
    };

    const handleDateSelect = (date) => {
        const isoDate = format(date, 'yyyy-MM-dd');
        onChange(isoDate);
        setShowPicker(false);
    };

    const renderDays = () => {
        const start = startOfMonth(viewDate);
        const end = endOfMonth(viewDate);
        const days = eachDayOfInterval({ start, end });
        
        // Rellenar días del mes anterior para alinear el grid
        const startDay = start.getDay(); // 0 = Sunday
        const padding = Array.from({ length: startDay }, (_, i) => i);

        const weekDays = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

        return (
            <div className="p-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {weekDays.map(d => (
                        <div key={d} className="text-[10px] font-black text-gray-500 text-center uppercase">{d}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {padding.map(i => <div key={`p-${i}`} className="h-8" />)}
                    {days.map(day => {
                        const isToday = isSameDay(new Date(), day);
                        const dayISO = format(day, 'yyyy-MM-dd');
                        const isFuture = max && dayISO > max;
                        const isPastLimit = min && dayISO < min;
                        const isSelected = value && isSameDay(new Date(value + 'T12:00:00'), day);
                        return (
                            <button
                                key={day.toString()}
                                type="button"
                                disabled={isFuture || isPastLimit}
                                onClick={() => handleDateSelect(day)}
                                className={clsx(
                                    "h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center",
                                    isSelected ? "bg-brand-primary text-white shadow-lg" : 
                                    isToday ? "border border-brand-primary text-brand-primary" : 
                                    "text-gray-300 hover:bg-white/10",
                                    (isFuture || isPastLimit) && "opacity-20 cursor-not-allowed"
                                )}
                            >
                                {format(day, 'd')}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderMonths = () => {
        const months = Array.from({ length: 12 }, (_, i) => new Date(2000, i, 1));
        return (
            <div className="p-4 grid grid-cols-3 gap-2 animate-in zoom-in-95 duration-200">
                {months.map((m, idx) => (
                    <button
                        key={idx}
                        type="button"
                        onClick={() => {
                            setViewDate(setMonth(viewDate, idx));
                            setSelectionMode('days');
                        }}
                        className={clsx(
                            "py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                            getMonth(viewDate) === idx ? "bg-brand-primary text-white" : "text-gray-400 hover:bg-white/5"
                        )}
                    >
                        {format(m, 'MMM', { locale: es })}
                    </button>
                ))}
            </div>
        );
    };

    const renderYears = () => {
        const currentYear = getYear(new Date());
        const startYear = currentYear - 100;
        const years = Array.from({ length: 121 }, (_, i) => currentYear - i); // Últimos 120 años
        
        return (
            <div className="p-4 h-64 overflow-y-auto custom-scrollbar grid grid-cols-3 gap-2 animate-in zoom-in-95 duration-200">
                {years.map(y => (
                    <button
                        key={y}
                        type="button"
                        onClick={() => {
                            setViewDate(setYear(viewDate, y));
                            setSelectionMode('days');
                        }}
                        className={clsx(
                            "py-3 rounded-xl text-xs font-black transition-all",
                            getYear(viewDate) === y ? "bg-brand-primary text-white" : "text-gray-400 hover:bg-white/5"
                        )}
                    >
                        {y}
                    </button>
                ))}
            </div>
        );
    };

    return (
        <div className="w-full space-y-2.5" ref={containerRef}>
            {label && (
                <div className="flex items-center gap-2.5 mb-2.5 px-1">
                    <Calendar className={clsx("w-5 h-5 transition-colors", error ? "text-red-400" : "text-gray-400")} />
                    <label className={clsx("text-sm font-bold tracking-tight", error ? "text-red-400" : "text-gray-300")}>
                        {label}
                    </label>
                </div>
            )}

            <div className="relative">
                <input
                    type="text"
                    name={name}
                    value={inputValue}
                    onChange={handleTextChange}
                    onFocus={() => setShowPicker(true)}
                    placeholder="DD/MM/AAAA"
                    className={clsx(
                        'flex h-14 w-full rounded-2xl bg-surface-input px-5 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 transition-all border outline-none font-mono',
                        error ? 'border-red-500/50 ring-2 ring-red-500/20' : 'border-white/5 focus:ring-brand-primary/30 focus:border-brand-primary/50'
                    )}
                />
                
                <button
                    type="button"
                    onClick={() => setShowPicker(!showPicker)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                    <Calendar className="w-5 h-5" />
                </button>

                {showPicker && (
                    <div className="absolute top-[calc(100%+10px)] left-0 w-80 bg-[#1e2538] border border-white/10 rounded-3xl shadow-2xl z-[100] overflow-hidden backdrop-blur-xl animate-in slide-in-from-top-2 duration-300">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
                            <button 
                                type="button" 
                                onClick={() => setViewDate(subMonths(viewDate, 1))}
                                className="p-1 hover:bg-white/10 rounded-lg text-gray-400"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            
                            <div className="flex gap-1">
                                <button 
                                    type="button"
                                    onClick={() => setSelectionMode(selectionMode === 'months' ? 'days' : 'months')}
                                    className="text-[10px] font-black uppercase text-white hover:text-brand-primary transition-colors px-2 py-1 rounded-md hover:bg-white/5"
                                >
                                    {format(viewDate, 'MMMM', { locale: es })}
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setSelectionMode(selectionMode === 'years' ? 'days' : 'years')}
                                    className="text-[10px] font-black uppercase text-white hover:text-brand-primary transition-colors px-2 py-1 rounded-md hover:bg-white/5"
                                >
                                    {format(viewDate, 'yyyy')}
                                </button>
                            </div>

                            <button 
                                type="button" 
                                onClick={() => setViewDate(addMonths(viewDate, 1))}
                                className="p-1 hover:bg-white/10 rounded-lg text-gray-400"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        {selectionMode === 'days' && renderDays()}
                        {selectionMode === 'months' && renderMonths()}
                        {selectionMode === 'years' && renderYears()}

                        {/* Footer / Shortcuts */}
                        <div className="p-3 bg-black/20 border-t border-white/5 flex justify-between items-center">
                            <button 
                                type="button" 
                                onClick={() => {
                                    handleDateSelect(new Date());
                                }}
                                className="text-[9px] font-black uppercase tracking-widest text-brand-primary"
                            >
                                Hoy
                            </button>
                            <button 
                                type="button" 
                                onClick={() => setShowPicker(false)}
                                className="text-[9px] font-black uppercase tracking-widest text-gray-500"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <p className="text-xs text-red-500 ml-1 font-bold">
                    {error}
                </p>
            )}
        </div>
    );
}

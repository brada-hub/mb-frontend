import { useRef, useEffect, useState, useMemo } from 'react';
import { format, startOfYear, endOfYear, eachDayOfInterval, isSameMonth, startOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import clsx from 'clsx';

export default function AttendanceHeatmap({ heatmapData }) {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [hoveredCell, setHoveredCell] = useState(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    const days = useMemo(() => {
        const yearStart = startOfYear(new Date());
        const yearEnd = endOfYear(new Date());
        return eachDayOfInterval({ start: yearStart, end: yearEnd });
    }, []);

    const dataMap = useMemo(() => {
        const map = {};
        if (heatmapData) {
            heatmapData.forEach(d => {
                map[d.date] = d;
            });
        }
        return map;
    }, [heatmapData]);

    const [dimensions, setDimensions] = useState({ cellSize: 12, gap: 4 });

    useEffect(() => {
        const updateDimensions = () => {
            const width = window.innerWidth;
            if (width < 640) {
                // Mobile: Fit 53 weeks in ~320px
                setDimensions({ cellSize: 4.5, gap: 1 });
            } else if (width < 1024) {
                // Tablet
                setDimensions({ cellSize: 8, gap: 2 });
            } else {
                // Desktop
                setDimensions({ cellSize: 12, gap: 4 });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    const { cellSize, gap } = dimensions;
    
    // Calculate month labels positions
    const monthLabels = useMemo(() => {
        const labels = [];
        let currentMonth = -1;
        
        days.forEach((day, idx) => {
            const m = day.getMonth();
            if (m !== currentMonth) {
                const col = Math.floor(idx / 7);
                labels.push({ 
                    name: format(day, "MMM", { locale: es }).toUpperCase(), 
                    col 
                });
                currentMonth = m;
            }
        });
        return labels;
    }, [days]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        
        const cols = Math.ceil(days.length / 7);
        const width = cols * (cellSize + gap);
        const height = 7 * (cellSize + gap);

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.scale(dpr, dpr);

        const colors = [
            "#ffffff0d", // white/5
            "rgba(20, 83, 45, 0.4)", // green-900/40
            "rgba(21, 128, 61, 0.6)", // green-700/60
            "#22c55e", // green-500
            "#39FF14" // ultra-green
        ];

        ctx.clearRect(0, 0, width, height);

        days.forEach((day, idx) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const data = dataMap[dateStr];
            const level = data?.level || 0;
            
            const col = Math.floor(idx / 7);
            const row = idx % 7;
            
            const x = col * (cellSize + gap);
            const y = row * (cellSize + gap);

            // Draw shadow for active cells
            if (level === 4) {
                ctx.shadowBlur = 8;
                ctx.shadowColor = "#39FF14";
            } else {
                ctx.shadowBlur = 0;
            }

            ctx.fillStyle = colors[level];
            
            // Round rect manually for older browsers or simplicity
            const radius = 2;
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + cellSize - radius, y);
            ctx.quadraticCurveTo(x + cellSize, y, x + cellSize, y + radius);
            ctx.lineTo(x + cellSize, y + cellSize - radius);
            ctx.quadraticCurveTo(x + cellSize, y + cellSize, x + cellSize - radius, y + cellSize);
            ctx.lineTo(x + radius, y + cellSize);
            ctx.quadraticCurveTo(x, y + cellSize, x, y + cellSize - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
            ctx.fill();
        });

    }, [days, dataMap]);

    const handleMouseMove = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const col = Math.floor(x / (cellSize + gap));
        const row = Math.floor(y / (cellSize + gap));
        
        if (col >= 0 && row >= 0 && row < 7) {
            const index = col * 7 + row;
            if (index < days.length) {
                const day = days[index];
                const dateStr = format(day, "yyyy-MM-dd");
                setHoveredCell({ day, data: dataMap[dateStr] });
                setTooltipPos({ x: e.clientX, y: e.clientY });
                return;
            }
        }
        setHoveredCell(null);
    };

    return (
        <div className="w-full overflow-hidden pb-4" ref={containerRef}>
            <div className="w-full flex flex-col items-center lg:items-start relative">
                {/* Tooltip renderizado una sola vez en el DOM */}
                {hoveredCell && (
                    <div 
                        className="fixed z-[100] pointer-events-none transition-transform duration-75"
                        style={{ 
                            left: tooltipPos.x, 
                            top: tooltipPos.y,
                            transform: 'translate(-50%, -110%)' 
                        }}
                    >
                        <div className="bg-[#111522] border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-xl min-w-[150px]">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5 pb-1 mb-1">
                                {format(hoveredCell.day, "EEEE d 'de' MMMM", { locale: es })}
                            </p>
                            {hoveredCell.data ? (
                                <div className="space-y-1">
                                    <p className="text-white font-bold text-xs">{hoveredCell.data.events}</p>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-1 bg-white/10 rounded-full w-20 overflow-hidden">
                                            <div 
                                                className="h-full bg-green-500 shadow-[0_0_5px_#39FF14]" 
                                                style={{ width: `${hoveredCell.data.percentage}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] font-black text-green-400">{hoveredCell.data.percentage}%</span>
                                    </div>
                                    <p className="text-[9px] text-gray-500">
                                        {hoveredCell.data.count} presentes de {hoveredCell.data.total} convocados
                                    </p>
                                </div>
                            ) : (
                                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Sin actividad registrada</p>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex text-[9px] text-gray-500 mb-2 pl-6 relative h-4">
                    {monthLabels.map((m, i) => (
                        <span 
                            key={i} 
                            className="absolute uppercase font-bold"
                            style={{ left: m.col * (cellSize + gap) + 24 }}
                        >
                            {m.name}
                        </span>
                    ))}
                </div>
                
                <div className="flex gap-1 sm:gap-2">
                    <div 
                        className="flex flex-col text-gray-600 font-bold uppercase pt-0.5"
                        style={{ 
                            gap: `${gap + (cellSize - 3)}px`, 
                            fontSize: cellSize < 6 ? '5px' : '8px',
                            width: cellSize < 6 ? '6px' : '16px'
                        }}
                    >
                        <span>L</span>
                        <span className="opacity-0">M</span>
                        <span>M</span>
                        <span className="opacity-0">J</span>
                        <span>V</span>
                        <span className="opacity-0">S</span>
                        <span>D</span>
                    </div>
                    <canvas 
                        ref={canvasRef}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={() => setHoveredCell(null)}
                        className="cursor-crosshair"
                    />
                </div>
            </div>
        </div>
    );
}

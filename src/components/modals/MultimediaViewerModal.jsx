import { X, Download, Maximize2, ZoomIn, ZoomOut, RotateCw, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { createPortal } from 'react-dom';
import { Button } from '../ui/Button';

const getCleanUrl = (url) => {
    if (!url) return '';
    // Convert full URLs to relative paths so they work through the Vite proxy (dev) or same-origin (prod)
    return url.replace(/^https?:\/\/[^/]+/, '');
};

export default function MultimediaViewerModal({ 
    isOpen, 
    onClose, 
    files: propFiles = [], 
    initialIndex = 0, 
    url: propUrl, 
    title: propTitle, 
    type: propType 
}) {
    // Garantizar que files siempre sea un array válido
    const files = (propFiles && propFiles.length > 0) 
        ? propFiles 
        : (propUrl ? [{ url: propUrl, title: propTitle, type: propType }] : []);
    
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [zoom, setZoom] = useState(100);
    const [rotation, setRotation] = useState(0);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [showUI, setShowUI] = useState(true);

    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(initialIndex);
            resetView();
            setShowUI(true);
        }
    }, [isOpen, initialIndex]);

    if (!isOpen || !files || files.length === 0) return null;

    // Archivo activo actual
    const currentFile = files[currentIndex] || files[0] || {};
    const url = getCleanUrl(currentFile.url);
    const title = currentFile.title;
    
    // Detectar tipo de archivo
    const isAudio = currentFile.type === 'audio' || url?.match(/\.(mp3|wav|ogg|m4a|aac)$/i);
    const isPdf = currentFile.type === 'pdf' || (url && url.toLowerCase().includes('.pdf'));
    const isImage = !isAudio && !isPdf;

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = url;
        link.download = title || 'archivo';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePreviuos = (e) => {
        e?.stopPropagation();
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            resetView();
        }
    };

    const handleNext = (e) => {
        e?.stopPropagation();
        if (currentIndex < files.length - 1) {
            setCurrentIndex(currentIndex + 1);
            resetView();
        }
    };

    const handleMouseDown = (e) => {
        if (!isImage || zoom <= 100) return;
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => setIsDragging(false);

    const resetView = () => {
        setZoom(100);
        setRotation(0);
        setPosition({ x: 0, y: 0 });
    };

    const toggleUI = () => setShowUI(!showUI);

    return createPortal(
        <div className="fixed inset-0 z-[10002] flex flex-col bg-black animate-in fade-in duration-300 overflow-hidden">
            {/* Header Control Panel */}
            <div className={clsx(
                "flex items-center justify-between p-2 sm:p-4 bg-black/60 border-b border-white/5 shrink-0 z-50 transition-all duration-300",
                !showUI && "-translate-y-full opacity-0"
            )}>
                <div className="flex items-center gap-2 sm:gap-4">
                    <button 
                        onClick={onClose}
                        className="p-2 sm:p-3 hover:bg-white/10 rounded-xl sm:rounded-2xl text-white/70 hover:text-white transition-all bg-white/5 border border-white/10"
                    >
                        <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                    <div>
                        <h3 className="text-[10px] sm:text-xs font-black text-white uppercase tracking-tight truncate max-w-[120px] sm:max-w-md">
                            {title || 'Visor Multimedia'}
                        </h3>
                        {files.length > 1 && (
                            <p className="text-[9px] sm:text-[10px] text-[#bc1b1b] font-black uppercase tracking-widest leading-none mt-1">
                                {currentIndex + 1} / {files.length}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-2">
                    {isImage && (
                        <div className="flex items-center bg-white/5 rounded-xl sm:rounded-2xl p-0.5 sm:p-1 gap-0.5 sm:gap-1 border border-white/10">
                            <button onClick={(e) => { e.stopPropagation(); setZoom(prev => Math.max(25, prev - 25)); }} className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-white"><ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
                            <span className="text-[9px] sm:text-[10px] font-black text-white w-8 sm:w-10 text-center">{zoom}%</span>
                            <button onClick={(e) => { e.stopPropagation(); setZoom(prev => Math.min(500, prev + 25)); }} className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-white"><ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
                            <button onClick={(e) => { e.stopPropagation(); resetView(); }} className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-white" title="Resetear vista"><Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
                        </div>
                    )}
                    <Button 
                        onClick={(e) => { e.stopPropagation(); handleDownload(); }}
                        variant="secondary" 
                        className="h-8 sm:h-10 rounded-xl sm:rounded-2xl px-3 sm:px-4 text-[9px] sm:text-[10px] font-black uppercase tracking-widest gap-2 bg-white/10 hover:bg-white/20 border-none text-white"
                    >
                        <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="hidden md:inline">Descargar</span>
                    </Button>
                </div>
            </div>

            {/* Viewer Area */}
            <div 
                className="flex-1 relative flex items-center justify-center overflow-hidden cursor-pointer"
                onClick={toggleUI}
            >
                {/* Navigation Buttons */}
                {files.length > 1 && (
                    <>
                        <button 
                            onClick={handlePreviuos}
                            disabled={currentIndex === 0}
                            className={clsx(
                                "absolute left-2 z-30 p-2 sm:p-4 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300",
                                (currentIndex === 0 || !showUI) ? "opacity-0 pointer-events-none" : "opacity-100"
                            )}
                        >
                            <ChevronLeft className="w-8 h-8 sm:w-12 sm:h-12" />
                        </button>
                        <button 
                            onClick={handleNext}
                            disabled={currentIndex === files.length - 1}
                            className={clsx(
                                "absolute right-2 z-30 p-2 sm:p-4 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300",
                                (currentIndex === files.length - 1 || !showUI) ? "opacity-0 pointer-events-none" : "opacity-100"
                            )}
                        >
                            <ChevronRight className="w-8 h-8 sm:w-12 sm:h-12" />
                        </button>
                    </>
                )}

                <div 
                    className={clsx(
                        "w-full h-full flex items-center justify-center relative touch-none select-none",
                        isDragging ? "cursor-grabbing" : zoom > 100 ? "cursor-grab" : "cursor-default"
                    )}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onClick={(e) => {
                        // Prevent toggleUI when dragging or zoomed
                        if (zoom > 100) e.stopPropagation();
                    }}
                >
                    {isAudio ? (
                        <div className="w-full max-w-lg px-8 py-12 bg-[#0a0a0a] rounded-[40px] border border-white/10 shadow-2xl flex flex-col items-center gap-8 animate-in zoom-in-95 duration-500" onClick={(e) => e.stopPropagation()}>
                            <div className="w-24 h-24 bg-[#bc1b1b]/20 rounded-full flex items-center justify-center text-[#bc1b1b] animate-pulse">
                                <Play className="w-10 h-10 fill-current ml-1" />
                            </div>
                            <div className="text-center">
                                <h4 className="text-white font-black uppercase tracking-tight text-xl mb-2">{title}</h4>
                                <p className="text-[#bc1b1b]/60 text-[10px] font-black uppercase tracking-[0.3em]">Reproductor de Audio</p>
                            </div>
                            <audio 
                                controls 
                                autoPlay
                                className="w-full h-12 custom-audio-player" 
                                src={url}
                            />
                        </div>
                    ) : isImage ? (
                        <div 
                            className="w-full h-full transition-transform duration-300 ease-out flex items-center justify-center"
                            style={{ 
                                transform: `translate(${position.x}px, ${position.y}px)`,
                            }}
                        >
                            <img 
                                src={url} 
                                alt={title}
                                className="w-full h-full object-contain pointer-events-none"
                                style={{ 
                                    transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                                }}
                            />
                        </div>
                    ) : (
                        <div className="w-full h-full bg-white rounded-lg shadow-2xl overflow-hidden md:max-w-5xl md:mx-4 md:my-8" onClick={(e) => e.stopPropagation()}>
                            <iframe 
                                src={`${url}#view=FitH`}
                                className="w-full h-full border-none"
                                title={title}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Tooltip */}
            <div className={clsx(
                "p-2 sm:p-4 bg-black/60 border-t border-white/5 flex items-center justify-between text-white/50 transition-all duration-300",
                !showUI && "translate-y-full opacity-0"
            )}>
                <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
                    {files.length > 1 ? `${currentIndex + 1} / ${files.length}` : 'Archivo Único'}
                </div>
                {isImage && (
                    <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
                        Toca para ocultar controles
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}

import { X, Download, Maximize, ZoomIn, ZoomOut, RotateCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { createPortal } from 'react-dom';
import { Button } from '../ui/Button';

export default function MultimediaViewerModal({ isOpen, onClose, files = [], initialIndex = 0 }) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [zoom, setZoom] = useState(100);
    const [rotation, setRotation] = useState(0);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(initialIndex);
            resetView();
        }
    }, [isOpen, initialIndex]);

    if (!isOpen || !files || files.length === 0) return null;

    const currentFile = files[currentIndex];
    const { url, title, type } = currentFile;
    const isImage = type === 'image' || type === 'imagen' || (url && !url.toLowerCase().includes('.pdf'));

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = url;
        link.download = title || 'archivo';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePreviuos = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            resetView();
        }
    };

    const handleNext = () => {
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

    return createPortal(
        <div className="fixed inset-0 z-[10002] flex flex-col bg-black/98 backdrop-blur-2xl animate-in fade-in duration-300 overflow-hidden">
            {/* Header Control Panel */}
            <div className="flex items-center justify-between p-4 bg-black/40 border-b border-white/5 shrink-0 z-20">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onClose}
                        className="p-3 hover:bg-white/10 rounded-2xl text-white/70 hover:text-white transition-all bg-white/5 border border-white/10"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <div className="hidden sm:block">
                        <h3 className="text-xs font-black text-white uppercase tracking-tight truncate max-w-[150px] md:max-w-md">
                            {title || 'Visor Multimedia'}
                        </h3>
                        {files.length > 1 && (
                            <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest leading-none mt-1">
                                Archivo {currentIndex + 1} de {files.length}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {isImage && (
                        <div className="flex items-center bg-white/5 rounded-2xl p-1 gap-1 border border-white/10">
                            <button onClick={() => setZoom(prev => Math.max(25, prev - 25))} className="p-2 hover:bg-white/10 rounded-xl text-white/50 hover:text-white"><ZoomOut className="w-4 h-4" /></button>
                            <span className="text-[10px] font-black text-white w-10 text-center">{zoom}%</span>
                            <button onClick={() => setZoom(prev => Math.min(500, prev + 25))} className="p-2 hover:bg-white/10 rounded-xl text-white/50 hover:text-white"><ZoomIn className="w-4 h-4" /></button>
                            <div className="w-px h-4 bg-white/10 mx-1 hidden md:block"></div>
                            <button onClick={() => setRotation(prev => (prev + 90) % 360)} className="p-2 hover:bg-white/10 rounded-xl text-white/50 hover:text-white hidden md:block"><RotateCw className="w-4 h-4" /></button>
                            <button onClick={resetView} className="p-2 hover:bg-white/10 rounded-xl text-white/50 hover:text-white" title="Resetear vista"><Maximize className="w-4 h-4" /></button>
                        </div>
                    )}
                    <Button 
                        onClick={handleDownload}
                        variant="secondary" 
                        className="h-10 rounded-2xl px-4 text-[10px] font-black uppercase tracking-widest gap-2 bg-white/10 hover:bg-white/20 border-none text-white"
                    >
                        <Download className="w-4 h-4" /> <span className="hidden md:inline">Descargar</span>
                    </Button>
                </div>
            </div>

            {/* Viewer Area */}
            <div className="flex-1 relative flex items-center justify-center overflow-hidden">
                {/* Navigation Buttons */}
                {files.length > 1 && (
                    <>
                        <button 
                            onClick={handlePreviuos}
                            disabled={currentIndex === 0}
                            className={clsx(
                                "absolute left-6 z-30 p-4 bg-black/40 hover:bg-indigo-600 rounded-full text-white transition-all shadow-2xl border border-white/10",
                                currentIndex === 0 ? "opacity-0 pointer-events-none" : "opacity-100"
                            )}
                        >
                            <ChevronLeft className="w-8 h-8" />
                        </button>
                        <button 
                            onClick={handleNext}
                            disabled={currentIndex === files.length - 1}
                            className={clsx(
                                "absolute right-6 z-30 p-4 bg-black/40 hover:bg-indigo-600 rounded-full text-white transition-all shadow-2xl border border-white/10",
                                currentIndex === files.length - 1 ? "opacity-0 pointer-events-none" : "opacity-100"
                            )}
                        >
                            <ChevronRight className="w-8 h-8" />
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
                >
                    {isImage ? (
                        <div 
                            className="transition-transform duration-300 ease-out flex items-center justify-center p-4"
                            style={{ 
                                transform: `translate(${position.x}px, ${position.y}px)`,
                            }}
                        >
                            <img 
                                src={url} 
                                alt={title}
                                className="max-w-full max-h-[85vh] object-contain shadow-2xl pointer-events-none"
                                style={{ 
                                    transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                                    filter: 'drop-shadow(0 0 50px rgba(0,0,0,0.8))'
                                }}
                            />
                        </div>
                    ) : (
                        <div className="w-full h-full bg-white rounded-lg shadow-2xl overflow-hidden max-w-5xl mx-4 my-8">
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
            <div className="p-4 bg-black/40 border-t border-white/5 flex items-center justify-between text-white/50">
                <div className="text-[10px] font-black uppercase tracking-widest">
                    {files.length > 1 ? `Desliza o usa las flechas • ${currentIndex + 1} / ${files.length}` : 'Visión de Archivo Único'}
                </div>
                {isImage && (
                    <div className="text-[10px] font-black uppercase tracking-widest hidden sm:block">
                        Pellizca o usa la rueda para Zoom
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}

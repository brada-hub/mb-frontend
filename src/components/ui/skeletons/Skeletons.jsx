import React from 'react';
import { clsx } from 'clsx';
// Mantenemos re-export por si acaso se usa en algún lado específico
export { SkeletonDashboard } from './SkeletonDashboard';

/**
 * ============================================================================
 * 1. COMPONENTE ATÓMICO (CORE)
 * ============================================================================
 * La base de toda la librería. Controla la animación y las formas primitivas.
 */
export const Skeleton = ({ variant = "rectangle", width, height, className = "" }) => {
    const baseClasses = "animate-pulse bg-gray-200 dark:bg-white/5";
    
    const variants = {
        circle: "rounded-full",
        rectangle: "rounded-xl", // Usamos XL para coincidir con tu estética "rounded"
        text: "rounded-lg h-4 w-full"
    };

    // Si pasas children, actúa como container pulsante. Si no, usa estilos.
    return (
        <div 
            className={clsx(baseClasses, variants[variant], className)}
            style={{ width, height }}
            aria-hidden="true"
        />
    );
};

/**
 * ============================================================================
 * 2. COMPONENTE WRAPPER
 * ============================================================================
 * Facilita el uso en las páginas: <SkeletonWrapper isLoading={...} skeleton={...}>
 */
export const SkeletonWrapper = ({ isLoading, skeleton, children, className = "" }) => {
    if (isLoading) {
        return <div className={className} aria-busy="true">{skeleton}</div>;
    }
    return <div className={`animate-in fade-in duration-500 ${className}`}>{children}</div>;
};

/**
 * ============================================================================
 * 3. SKELETONS ESPECÍFICOS DE SECCIÓN (UI MIRRORS)
 * ============================================================================
 */

// --- AGENDA / CALENDARIO ----------------------------------------------------
export const SkeletonCalendar = () => (
    <div className="space-y-6">
        {/* Header Navegación */}
        <div className="flex justify-between items-center h-12">
            <Skeleton variant="rectangle" width="250px" height="48px" className="rounded-2xl" />
            <div className="flex gap-3">
                 <Skeleton variant="rectangle" width="140px" height="48px" className="rounded-2xl" />
                 <Skeleton variant="rectangle" width="200px" height="48px" className="rounded-2xl" />
            </div>
        </div>

        {/* Panel Principal */}
        <div className="bg-[#1a1b26] rounded-[32px] overflow-hidden border border-white/5 relative min-h-[700px] flex flex-col shadow-2xl">
            {/* Banner Mes */}
            <div className="p-10 pb-6 flex justify-between items-end border-b border-white/5 bg-gradient-to-r from-brand-primary/5 to-transparent">
                 <div className="space-y-4">
                      <div className="flex items-center gap-6">
                           <Skeleton variant="rectangle" width="100px" height="60px" className="rounded-2xl opacity-50" />
                           <Skeleton variant="rectangle" width="300px" height="80px" className="rounded-3xl" /> 
                      </div>
                      <Skeleton variant="text" width="250px" className="ml-32 opacity-30" />
                 </div>
                 <Skeleton variant="rectangle" width="200px" height="120px" className="opacity-5 rounded-3xl" />
            </div>

            {/* Grid Días */}
            <div className="grid grid-cols-7 flex-1">
                {/* Cabecera Semanal */}
                {['D','L','M','M','J','V','S'].map((_, i) => (
                    <div key={`h-${i}`} className="py-6 flex justify-center border-b border-r border-white/5 last:border-r-0 bg-black/20">
                        <Skeleton variant="text" width="40%" className="opacity-30" />
                    </div>
                ))}
                
                {/* Celdas */}
                {[...Array(35)].map((_, i) => (
                    <div key={i} className="border-b border-r border-white/5 p-3 min-h-[100px] relative">
                         <Skeleton variant="text" width="20px" className="mb-2 opacity-30" />
                         {(i === 4 || i === 12 || i === 18 || i === 25) && (
                             <div className="mt-4">
                                <Skeleton variant="rectangle" width="100%" height="60px" className="opacity-40 bg-brand-primary/20" />
                             </div>
                         )}
                    </div>
                ))}
            </div>
        </div>
    </div>
);

// --- SECCIONES (Cards) ------------------------------------------------------
export const SkeletonSectionCard = () => (
    <div className="bg-[#1a1b26] border border-white/5 rounded-[40px] p-8 flex flex-col h-[400px] relative overflow-hidden">
        {/* Header Card */}
        <div className="flex items-center gap-5 mb-8">
            <Skeleton variant="rectangle" width="64px" height="64px" className="rounded-3xl shrink-0" />
            <div className="flex-1 space-y-2 py-1">
                <Skeleton variant="text" width="70%" height="24px" />
                <Skeleton variant="text" width="40%" className="opacity-50" />
            </div>
            <Skeleton variant="rectangle" width="48px" height="48px" className="rounded-2xl shrink-0" />
        </div>

        {/* Body */}
        <div className="mb-10 flex-grow space-y-3">
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="text" width="90%" />
            <Skeleton variant="text" width="60%" />
        </div>

        {/* Footer Actions */}
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
                <Skeleton variant="rectangle" height="48px" className="rounded-2xl" />
                <Skeleton variant="rectangle" height="48px" className="rounded-2xl" />
            </div>
            <Skeleton variant="rectangle" height="56px" className="rounded-2xl" />
        </div>
    </div>
);

// --- MIEMBROS (Tabla) -------------------------------------------------------
// Fila individual para uso flexible
export const MemberRowSkeleton = () => (
    <div className="hidden md:grid grid-cols-[1fr_1fr_100px_100px_90px_80px_80px_60px] gap-4 px-8 py-5 items-center border-b border-white/5">
        {/* Miembro */}
        <div className="flex items-center gap-4">
            <Skeleton variant="rectangle" width="40px" height="40px" className="rounded-xl shrink-0" />
            <div className="space-y-2 w-full max-w-[120px]">
                <Skeleton variant="text" width="100%" />
                <Skeleton variant="text" width="60%" className="opacity-50" />
            </div>
        </div>
        {/* Info */}
        <div className="space-y-2">
             <Skeleton variant="text" width="40px" height="10px" className="opacity-50" />
             <Skeleton variant="rectangle" width="100%" height="32px" className="bg-white/5" />
        </div>
        {/* Botones */}
        <Skeleton variant="rectangle" width="100%" height="36px" className="bg-white/5" />
        <Skeleton variant="rectangle" width="100%" height="36px" className="bg-white/5" />
        <Skeleton variant="rectangle" width="100%" height="36px" className="bg-white/5" />
        {/* Status */}
        <div className="flex justify-center"><Skeleton variant="rectangle" width="50px" height="24px" className="rounded-full" /></div>
        <div className="flex justify-center"><Skeleton variant="rectangle" width="40px" height="24px" className="rounded-full" /></div>
        <div className="flex justify-end"><Skeleton variant="rectangle" width="32px" height="32px" /></div>
    </div>
);

// Tabla completa (Wrapper)
export const SkeletonMemberTable = ({ rows = 8 }) => (
    <div className="bg-[#1a1b26] rounded-3xl border border-white/5 overflow-hidden pb-4">
        {/* Header */}
        <div className="hidden md:grid grid-cols-[1fr_1fr_100px_100px_90px_80px_80px_60px] gap-4 px-8 py-4 border-b border-white/5 bg-white/5">
            {[...Array(8)].map((_, i) => <Skeleton key={i} variant="text" width="100%" className="opacity-30" />)}
        </div>
        {/* Rows */}
        {[...Array(rows)].map((_, i) => <MemberRowSkeleton key={i} />)}
        
        {/* Mobile Fallback */}
        <div className="md:hidden p-4 space-y-4">
             {[...Array(4)].map((_, i) => (
                 <div key={i} className="flex gap-4 p-4 bg-white/5 rounded-2xl">
                     <Skeleton variant="rectangle" width="48px" height="48px" />
                     <div className="flex-1 space-y-2">
                         <Skeleton variant="text" width="60%" />
                         <Skeleton variant="text" width="40%" />
                     </div>
                 </div>
             ))}
        </div>
    </div>
);

// --- BIBLIOTECA: GÉNEROS (Columna Izquierda) --------------------------------
export const SkeletonGenreList = () => (
    <div className="flex flex-col gap-3 animate-in fade-in duration-300">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 rounded-[32px] bg-[#1a1b26] border border-white/5 relative p-6 flex flex-col justify-center overflow-hidden">
                <div className="space-y-3 relative z-10 w-[60%]">
                    <Skeleton variant="text" width="80%" height="24px" />
                    <Skeleton variant="rectangle" width="80px" height="20px" className="rounded-full opacity-50" />
                </div>
                {/* Decoración derecha */}
                <div className="absolute -right-4 top-0 bottom-0 w-36 flex items-center">
                    <Skeleton variant="rectangle" width="100%" height="80%" className="rotate-12 opacity-10 rounded-2xl" />
                </div>
            </div>
        ))}
    </div>
);

// --- BIBLIOTECA: REPERTORIO/TEMAS (Columna Derecha) -------------------------
export const SkeletonRepertoireGrid = () => (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 px-1">
        {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-[#1a1b26] border border-white/5 rounded-3xl p-6 h-[160px] flex flex-col justify-between">
                 {/* Top: Icon + Title + Arrow */}
                 <div className="flex items-start justify-between">
                     <div className="flex items-center gap-4 w-full">
                         <Skeleton variant="rectangle" width="48px" height="48px" className="rounded-2xl shrink-0" />
                         <div className="flex-1 space-y-2 min-w-0">
                             <Skeleton variant="text" width="90%" height="20px" />
                             <Skeleton variant="text" width="50%" height="12px" className="opacity-50" />
                         </div>
                     </div>
                     <Skeleton variant="rectangle" width="40px" height="40px" className="rounded-xl opacity-20 ml-2" />
                 </div>
                 
                 {/* Footer: Stats (Partituras | Guias) */}
                 <div className="flex items-center gap-4 pt-4 border-t border-white/5 mt-2">
                     <Skeleton variant="text" width="40%" height="12px" className="opacity-30" />
                     <div className="w-px h-3 bg-white/10"></div>
                     <Skeleton variant="text" width="40%" height="12px" className="opacity-30" />
                 </div>
            </div>
        ))}
    </div>
);

// --- ASISTENCIA (Split Panel) -----------------------------------------------
export const SkeletonAsistencia = () => (
    <div className="space-y-8 animate-in fade-in duration-300">
        <div className="flex items-center justify-between pb-2">
            <Skeleton variant="text" width="250px" height="32px" />
            <Skeleton variant="rectangle" width="120px" height="36px" className="rounded-xl opacity-20" />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            <div className="xl:col-span-4 space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-[#1a1b26] border border-white/5 rounded-[2rem] p-5 h-[140px] flex flex-col justify-between relative overflow-hidden">
                        <div className="flex justify-between items-start">
                             <Skeleton variant="rectangle" width="60px" height="20px" className="rounded-md opacity-30" />
                             <Skeleton variant="rectangle" width="50px" height="16px" className="rounded opacity-20" />
                        </div>
                        
                        <div className="space-y-2">
                            <Skeleton variant="text" width="80%" height="20px" />
                            <div className="flex items-center gap-3 mt-2">
                                <Skeleton variant="text" width="40px" height="12px" className="opacity-40" />
                                <Skeleton variant="text" width="40px" height="12px" className="opacity-40" />
                            </div>
                        </div>
                        
                         <div className="absolute bottom-5 right-5">
                             <Skeleton variant="circle" width="24px" height="24px" className="opacity-10" />
                         </div>
                    </div>
                ))}
            </div>
            <div className="xl:col-span-8">
                <div className="bg-[#1a1b26] border border-white/5 rounded-3xl h-[400px] flex flex-col items-center justify-center p-8 text-center opacity-50">
                    <Skeleton variant="rectangle" width="80px" height="80px" className="rounded-3xl opacity-10 mb-6" />
                    <Skeleton variant="text" width="60%" height="24px" className="opacity-20 mb-2" />
                    <Skeleton variant="text" width="40%" height="16px" className="opacity-10" />
                </div>
            </div>
        </div>
    </div>
);

// --- LISTA GENÉRICA (Notificaciones, Pagos) --------------------------------
export const SkeletonList = ({ items = 5 }) => (
    <div className="space-y-4">
        {[...Array(items)].map((_, i) => (
            <div key={i} className="bg-[#1a1b26] p-4 rounded-2xl border border-white/5 flex items-center space-x-4">
                <Skeleton variant="rectangle" width="48px" height="48px" className="rounded-xl" />
                <div className="flex-1 space-y-2">
                    <Skeleton variant="text" width="40%" />
                    <Skeleton variant="text" width="25%" className="opacity-50" />
                </div>
                <Skeleton variant="circle" width="32px" height="32px" className="opacity-30" />
            </div>
        ))}
    </div>
);

// --- FORMACIONES (Event Cards) ----------------------------------------------
export const SkeletonFormacionCard = () => (
    <div className="bg-[#1a1b26] border border-white/5 rounded-[2.5rem] p-6 h-[320px] flex flex-col justify-between relative overflow-hidden">
        {/* Top: Badges & Title */}
        <div>
            <div className="flex justify-between items-start mb-6">
                 <Skeleton variant="rectangle" width="80px" height="24px" className="rounded-full opacity-20" />
                 <Skeleton variant="text" width="40px" className="opacity-30" />
            </div>
            <Skeleton variant="text" width="80%" height="32px" className="mb-3" />
            <Skeleton variant="text" width="50%" height="14px" className="opacity-40" />
        </div>
        
        {/* Middle: Stats or Decoration */}
        <div className="flex-1 py-6 flex items-center">
             <Skeleton variant="rectangle" width="100%" height="40px" className="rounded-xl opacity-5" />
        </div>

        {/* Bottom: Progress Bar */}
        <div className="space-y-3 pt-6 border-t border-white/5">
            <div className="flex justify-between items-end">
                <Skeleton variant="text" width="100px" height="10px" className="opacity-30" />
                <Skeleton variant="text" width="30px" height="14px" className="opacity-50" />
            </div>
            <Skeleton variant="rectangle" width="100%" height="6px" className="rounded-full opacity-10" />
             <div className="flex justify-between pt-2">
                <Skeleton variant="text" width="50px" height="10px" className="opacity-30" />
            </div>
        </div>
    </div>
);

// Aliases para compatibilidad hacia atrás
export const SkeletonDetail = SkeletonAsistencia;
export const SkeletonTable = SkeletonMemberTable; // Alias por si alguien usa el nombre genérico

export default Skeleton;

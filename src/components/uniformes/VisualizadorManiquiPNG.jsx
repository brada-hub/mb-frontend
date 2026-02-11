import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * VisualizadorManiquiPNG
 * Reemplazo del Mannequin SVG por sistema de capas PNG.
 * Adapta el prop 'outfit' del UniformeManager antiguo.
 */

// Configuración de capas (Z-Index y nombre de archivo)
const LAYERS_CONFIG = [
    { id: 'maniqui', file: 'maniqui.png', z: 0, isBase: true },
    { id: 'camisa', file: 'camisa.png', z: 10 },
    { id: 'pantalon', file: 'pantalon.png', z: 20 },
    { id: 'zapatos', file: 'zapatos.png', z: 30 }, // Asumiendo que existe o se añadirá
    { id: 'chaleco', file: 'chaleco.png', z: 40 },
    { id: 'corbata', file: 'corbata.png', z: 50 },
    { id: 'gatito', file: 'moño.png', z: 55 }, // 'gatito' en el objeto outfit mapea a 'moño.png'
    { id: 'saco', file: 'saco.png', z: 60 } // Si existe saco, si no, se ignora
];

export default function VisualizadorManiquiPNG({ 
    outfit = {}, 
    scale = 1,
    className = "",
    showBase = true 
}) {
    // Función para verificar si una prenda debe mostrarse
    const shouldShow = (layerId) => {
        if (layerId === 'maniqui') return showBase;
        return outfit[layerId]?.on;
    };

    // Función para obtener el estilo de color
    // Usamos drop-shadow para teñir la imagen o hue-rotate si es más complejo
    // Para simplificar y asegurar compatibilidad, usaremos un filtro CSS simple
    // Nota: Colorear PNGs pre-existentes con hex exacto es complejo sin canvas/svg masks.
    // Aquí implementamos una aproximación visual usando filtros.
    const getColorFilter = (hexColor) => {
        if (!hexColor || hexColor === '#ffffff') return 'none';
        
        // Conversión simple a filtro CSS (aproximada para demo)
        // En producción idealmente usaríamos SVG filters para re-colorear exacto
        return `drop-shadow(0 0 0 ${hexColor})`; 
    };

    return (
        <div 
            className={`relative w-full h-full flex items-center justify-center ${className}`}
            style={{ transform: `scale(${scale})` }}
        >
            <div className="relative w-[300px] h-[600px]">
                {LAYERS_CONFIG.map((layer) => {
                    const isVisible = shouldShow(layer.id);
                    const color = outfit[layer.id]?.color;

                    return (
                        <AnimatePresence key={layer.id}>
                            {isVisible && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="absolute inset-0 w-full h-full pointer-events-none"
                                    style={{ zIndex: layer.z }}
                                >
                                    {/* Capa de Color (Masking Approach para mejor tintado) */}
                                    {/* Si el color no es blanco/default, intentamos colorear */}
                                    {color && color !== '#ffffff' && !layer.isBase && (
                                        <div 
                                            className="absolute inset-0 w-full h-full opacity-60 mix-blend-multiply"
                                            style={{
                                                backgroundColor: color,
                                                maskImage: `url(/prendas/${layer.file})`,
                                                WebkitMaskImage: `url(/prendas/${layer.file})`,
                                                maskSize: 'contain',
                                                WebkitMaskSize: 'contain',
                                                maskRepeat: 'no-repeat',
                                                WebkitMaskRepeat: 'no-repeat',
                                                maskPosition: 'center',
                                                WebkitMaskPosition: 'center'
                                            }}
                                        />
                                    )}

                                    {/* Imagen Base */}
                                    <img 
                                        src={`/prendas/${layer.file}`}
                                        alt={layer.id}
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                            e.target.style.display = 'none'; // ocultar si no existe imagen
                                        }}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    );
                })}
            </div>
        </div>
    );
}

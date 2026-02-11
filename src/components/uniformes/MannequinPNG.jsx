import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * MannequinPNG - Versión Robusta
 * - Oculta imágenes rotas automáticamente
 * - Se adapta al 100% del contenedor padre
 * - Usa filtros de color dinámicos
 */

const LAYERS = [
    { id: 'maniqui', file: 'maniqui.png', z: 0, required: true },
    { id: 'camisa', file: 'camisa.png', z: 10 },
    { id: 'pantalon', file: 'pantalon.png', z: 20 },
    { id: 'zapatos', file: 'zapatos.png', z: 30 },
    { id: 'chaleco', file: 'chaleco.png', z: 40 },
    { id: 'corbata', file: 'corbata.png', z: 50 },
    { id: 'gatito', file: 'moño.png', z: 55 },
    { id: 'saco', file: 'saco.png', z: 60 }
];

// Helper para convertir HEX a HSL (para calcular la rotación de hue)
const hexToHsl = (hex) => {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return { h: 0, s: 0, l: 100 };
    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; } 
    else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
};

export default function MannequinPNG({ 
    outfit = {}, 
    scale = 1,
    className = ""
}) {
    return (
        <div 
            className={`relative flex items-center justify-center ${className}`}
            style={{ 
                transform: `scale(${scale})`,
                width: '100%',  // Ocupar todo el ancho disponible
                height: '100%', // Ocupar todo el alto disponible
                minHeight: '500px' // Altura mínima para asegurar visibilidad
            }}
        >
            {LAYERS.map((layer) => {
                const isVisible = layer.required || (outfit[layer.id]?.on);
                const colorHex = outfit[layer.id]?.color;
                
                // Calculamos estilos de filtro si hay color seleccionado
                let filterStyle = {};
                if (colorHex && colorHex !== '#ffffff' && !layer.required) {
                    const { h, s, l } = hexToHsl(colorHex);
                    // Usamos sepia primero para dar "sustancia" de color a imágenes B/N, luego rotamos
                    // Brightness ajusta la luminosidad final
                    filterStyle = { 
                        filter: `sepia(1) saturate(${s}%) hue-rotate(${h - 35}deg) brightness(${l}%) contrast(1.1)` 
                    };
                }

                return (
                    <AnimatePresence key={layer.id}>
                        {isVisible && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none"
                                style={{ zIndex: layer.z }}
                            >
                                <img 
                                    src={`/prendas/${layer.file}`}
                                    alt="" // Alt vacío para no mostrar texto si falla
                                    className="max-w-full max-h-full object-contain"
                                    style={filterStyle}
                                    onError={(e) => {
                                        e.target.style.display = 'none'; // Desaparece si no existe la imagen (zapatos)
                                    }}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                );
            })}
        </div>
    );
}

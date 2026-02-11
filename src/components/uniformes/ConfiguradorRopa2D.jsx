import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * CONFIGURADOR DE ROPA 2D
 * 
 * Componente de capas con imágenes PNG que permite:
 * - Activar/desactivar prendas con toggle
 * - Cambiar colores dinámicamente con hue-rotate y brightness
 * - Apilar capas con z-index definido
 */

// Configuración de prendas con su z-index
const PRENDAS_CONFIG = [
    { id: 'maniqui', nombre: 'Maniquí', archivo: 'maniqui.png', zIndex: 0, toggleable: false },
    { id: 'camisa', nombre: 'Camisa', archivo: 'camisa.png', zIndex: 10, toggleable: true },
    { id: 'pantalon', nombre: 'Pantalón', archivo: 'pantalon.png', zIndex: 20, toggleable: true },
    { id: 'chaleco', nombre: 'Chaleco', archivo: 'chaleco.png', zIndex: 40, toggleable: true },
    { id: 'corbata', nombre: 'Corbata', archivo: 'corbata.png', zIndex: 50, toggleable: true },
    { id: 'moño', nombre: 'Moño', archivo: 'moño.png', zIndex: 55, toggleable: true },
];

// Presets de colores para demostración
const COLOR_PRESETS = [
    { nombre: 'Original', hue: 0, brightness: 100 },
    { nombre: 'Azul', hue: 200, brightness: 100 },
    { nombre: 'Rojo', hue: 340, brightness: 100 },
    { nombre: 'Verde', hue: 120, brightness: 100 },
    { nombre: 'Púrpura', hue: 280, brightness: 100 },
    { nombre: 'Dorado', hue: 40, brightness: 110 },
    { nombre: 'Negro', hue: 0, brightness: 30 },
    { nombre: 'Blanco', hue: 0, brightness: 150 },
];

/**
 * Hook personalizado para manejar el estado de las prendas
 */
function usePrendasState(initialPrendas = PRENDAS_CONFIG) {
    const [prendas, setPrendas] = useState(() => {
        const initialState = {};
        initialPrendas.forEach(prenda => {
            initialState[prenda.id] = {
                visible: true,
                hue: 0,
                brightness: 100,
            };
        });
        return initialState;
    });

    const togglePrenda = useCallback((id) => {
        setPrendas(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                visible: !prev[id].visible,
            }
        }));
    }, []);

    const setHue = useCallback((id, hue) => {
        setPrendas(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                hue: Number(hue),
            }
        }));
    }, []);

    const setBrightness = useCallback((id, brightness) => {
        setPrendas(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                brightness: Number(brightness),
            }
        }));
    }, []);

    const applyPreset = useCallback((id, preset) => {
        setPrendas(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                hue: preset.hue,
                brightness: preset.brightness,
            }
        }));
    }, []);

    const resetPrenda = useCallback((id) => {
        setPrendas(prev => ({
            ...prev,
            [id]: {
                visible: true,
                hue: 0,
                brightness: 100,
            }
        }));
    }, []);

    return {
        prendas,
        togglePrenda,
        setHue,
        setBrightness,
        applyPreset,
        resetPrenda,
    };
}

/**
 * Componente de capa de imagen individual
 */
function CapaImagen({ prenda, estado, zIndex }) {
    const filterStyle = estado.hue !== 0 || estado.brightness !== 100
        ? `hue-rotate(${estado.hue}deg) brightness(${estado.brightness / 100})`
        : 'none';

    return (
        <AnimatePresence>
            {estado.visible && (
                <motion.img
                    key={prenda.id}
                    src={`/prendas/${prenda.archivo}`}
                    alt={prenda.nombre}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                    style={{
                        zIndex,
                        filter: filterStyle,
                    }}
                    draggable={false}
                />
            )}
        </AnimatePresence>
    );
}

/**
 * Botón toggle para activar/desactivar prenda
 */
function ToggleButton({ prenda, isActive, onToggle }) {
    return (
        <button
            onClick={() => onToggle(prenda.id)}
            className={`
                relative flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm
                transition-all duration-300 ease-out w-full
                ${isActive 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30' 
                    : 'bg-gray-800/60 text-gray-400 hover:bg-gray-700/80 hover:text-gray-200'
                }
            `}
        >
            {/* Indicador visual */}
            <span className={`
                w-3 h-3 rounded-full transition-all duration-300
                ${isActive ? 'bg-white scale-100' : 'bg-gray-600 scale-75'}
            `} />
            
            <span className="flex-1 text-left">{prenda.nombre}</span>
            
            {/* Toggle switch visual */}
            <div className={`
                w-10 h-5 rounded-full transition-all duration-300 relative
                ${isActive ? 'bg-white/20' : 'bg-gray-700'}
            `}>
                <motion.div 
                    className={`
                        absolute top-0.5 w-4 h-4 rounded-full transition-colors duration-300
                        ${isActive ? 'bg-white' : 'bg-gray-500'}
                    `}
                    animate={{ left: isActive ? '22px' : '2px' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
            </div>
        </button>
    );
}

/**
 * Control de color para una prenda específica
 */
function ColorControl({ prenda, estado, onHueChange, onBrightnessChange, onPresetApply, onReset }) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-gray-800/40 rounded-xl p-4 space-y-3">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between text-white font-medium"
            >
                <span className="flex items-center gap-2">
                    <span 
                        className="w-4 h-4 rounded-full border-2 border-gray-600"
                        style={{ 
                            backgroundColor: `hsl(${estado.hue}, 60%, ${Math.min(estado.brightness, 100) * 0.5}%)` 
                        }}
                    />
                    {prenda.nombre}
                </span>
                <motion.svg
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </motion.svg>
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4 overflow-hidden"
                    >
                        {/* Presets de color */}
                        <div className="flex flex-wrap gap-2 pt-2">
                            {COLOR_PRESETS.map((preset) => (
                                <button
                                    key={preset.nombre}
                                    onClick={() => onPresetApply(prenda.id, preset)}
                                    className={`
                                        px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                                        ${estado.hue === preset.hue && estado.brightness === preset.brightness
                                            ? 'bg-indigo-500 text-white'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        }
                                    `}
                                >
                                    {preset.nombre}
                                </button>
                            ))}
                        </div>

                        {/* Slider de Hue */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Tono (Hue)</span>
                                <span className="text-white font-mono">{estado.hue}°</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="360"
                                value={estado.hue}
                                onChange={(e) => onHueChange(prenda.id, e.target.value)}
                                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                                style={{
                                    background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
                                }}
                            />
                        </div>

                        {/* Slider de Brightness */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Brillo</span>
                                <span className="text-white font-mono">{estado.brightness}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="200"
                                value={estado.brightness}
                                onChange={(e) => onBrightnessChange(prenda.id, e.target.value)}
                                className="w-full h-2 bg-gradient-to-r from-gray-900 via-gray-500 to-white rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        {/* Botón Reset */}
                        <button
                            onClick={() => onReset(prenda.id)}
                            className="w-full py-2 text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            ↺ Restaurar color original
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/**
 * Componente Principal del Configurador de Ropa 2D
 */
export default function ConfiguradorRopa2D({ 
    className = '',
    showControls = true,
    prendasConfig = PRENDAS_CONFIG,
}) {
    const {
        prendas,
        togglePrenda,
        setHue,
        setBrightness,
        applyPreset,
        resetPrenda,
    } = usePrendasState(prendasConfig);

    const prendasToggleables = prendasConfig.filter(p => p.toggleable);

    return (
        <div className={`flex flex-col lg:flex-row gap-8 ${className}`}>
            {/* Contenedor del Maniquí con Capas */}
            <div className="flex-1 flex items-center justify-center">
                <div 
                    className="relative w-full max-w-md aspect-[3/4] bg-gradient-to-b from-gray-900/50 to-gray-800/30 rounded-3xl overflow-hidden backdrop-blur-sm border border-gray-700/50 shadow-2xl"
                >
                    {/* Efecto de iluminación de fondo */}
                    <div className="absolute inset-0 bg-gradient-radial from-indigo-500/10 via-transparent to-transparent" />
                    
                    {/* Contenedor de capas con position relative */}
                    <div className="relative w-full h-full p-4">
                        {prendasConfig
                            .sort((a, b) => a.zIndex - b.zIndex)
                            .map((prenda) => (
                                <CapaImagen
                                    key={prenda.id}
                                    prenda={prenda}
                                    estado={prendas[prenda.id]}
                                    zIndex={prenda.zIndex}
                                />
                            ))
                        }
                    </div>

                    {/* Sombra del piso */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-black/20 rounded-full blur-md" />
                </div>
            </div>

            {/* Panel de Controles */}
            {showControls && (
                <div className="lg:w-80 space-y-6">
                    {/* Sección de Toggle de Prendas */}
                    <div className="bg-gray-900/70 backdrop-blur-xl rounded-2xl p-5 border border-gray-700/50 shadow-xl">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                                👕
                            </span>
                            Prendas
                        </h3>
                        <div className="space-y-2">
                            {prendasToggleables.map((prenda) => (
                                <ToggleButton
                                    key={prenda.id}
                                    prenda={prenda}
                                    isActive={prendas[prenda.id].visible}
                                    onToggle={togglePrenda}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Sección de Colores */}
                    <div className="bg-gray-900/70 backdrop-blur-xl rounded-2xl p-5 border border-gray-700/50 shadow-xl">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                                🎨
                            </span>
                            Colores
                        </h3>
                        <div className="space-y-3">
                            {prendasToggleables
                                .filter(p => prendas[p.id].visible)
                                .map((prenda) => (
                                    <ColorControl
                                        key={prenda.id}
                                        prenda={prenda}
                                        estado={prendas[prenda.id]}
                                        onHueChange={setHue}
                                        onBrightnessChange={setBrightness}
                                        onPresetApply={applyPreset}
                                        onReset={resetPrenda}
                                    />
                                ))
                            }
                            {prendasToggleables.filter(p => prendas[p.id].visible).length === 0 && (
                                <p className="text-gray-500 text-sm text-center py-4">
                                    Activa alguna prenda para modificar su color
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Exportar hook y configuraciones para uso externo
export { usePrendasState, PRENDAS_CONFIG, COLOR_PRESETS };

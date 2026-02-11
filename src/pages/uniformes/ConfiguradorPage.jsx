import React from 'react';
import { motion } from 'framer-motion';
import ConfiguradorRopa2D from '../../components/uniformes/ConfiguradorRopa2D';

/**
 * Página de demostración del Configurador de Ropa 2D
 */
export default function ConfiguradorPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
            {/* Fondo decorativo */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl" />
            </div>

            {/* Contenido principal */}
            <div className="relative z-10 container mx-auto px-4 py-8">
                {/* Header */}
                <motion.div 
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                        Configurador de Uniformes
                    </h1>
                    <p className="mt-4 text-gray-400 text-lg max-w-2xl mx-auto">
                        Personaliza el uniforme activando o desactivando prendas y cambiando sus colores en tiempo real
                    </p>
                </motion.div>

                {/* Configurador */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <ConfiguradorRopa2D className="max-w-6xl mx-auto" />
                </motion.div>

                {/* Instrucciones */}
                <motion.div 
                    className="mt-12 max-w-3xl mx-auto text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30">
                        <h3 className="text-lg font-semibold text-white mb-4">💡 Instrucciones</h3>
                        <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-400">
                            <div className="p-3 bg-gray-800/50 rounded-xl">
                                <span className="text-2xl mb-2 block">👆</span>
                                <strong className="text-gray-200 block mb-1">Toggle Prendas</strong>
                                Activa o desactiva cada prenda con los botones del panel
                            </div>
                            <div className="p-3 bg-gray-800/50 rounded-xl">
                                <span className="text-2xl mb-2 block">🎨</span>
                                <strong className="text-gray-200 block mb-1">Cambiar Color</strong>
                                Usa los presets o ajusta el tono y brillo manualmente
                            </div>
                            <div className="p-3 bg-gray-800/50 rounded-xl">
                                <span className="text-2xl mb-2 block">↺</span>
                                <strong className="text-gray-200 block mb-1">Restaurar</strong>
                                Puedes volver al color original en cualquier momento
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

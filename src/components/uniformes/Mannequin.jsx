import React from 'react';
import { motion } from 'framer-motion';
import { 
    BodyBase, 
    ShirtLayer, 
    PantsLayer, 
    JacketLayer, 
    TieLayer, 
    TieBowLayer,
    ShoesLayer, 
    VestLayer 
} from './layers/UniformLayers';

/**
 * Componente Mannequin PRO
 * Representación visual premium de un uniforme.
 */
export default function Mannequin({ 
    outfit = {}, 
    scale = 1,
    rotation = 0, // 0 to 1 (fake 3D)
    className = ""
}) {
    const wrapperStyle = {
        transform: `scale(${scale}) perspective(1000px) rotateY(${rotation * 20}deg)`,
        transformStyle: 'preserve-3d',
        transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
    };

    return (
        <div className={`relative ${className}`} style={wrapperStyle}>
            <svg 
                viewBox="100 50 200 500" 
                className="w-full h-full filter drop-shadow-2xl overflow-visible"
                xmlns="http://www.w3.org/2000/svg"
            >
                <BodyBase />
                
                {outfit.camisa?.on && <ShirtLayer color={outfit.camisa.color} />}
                {outfit.chaleco?.on && <VestLayer color={outfit.chaleco.color} />}
                {outfit.saco?.on && <JacketLayer color={outfit.saco.color} />}
                {outfit.corbata?.on && <TieLayer color={outfit.corbata.color} />}
                {outfit.gatito?.on && <TieBowLayer color={outfit.gatito.color} />}
                {outfit.pantalon?.on && <PantsLayer color={outfit.pantalon.color} />}
                {outfit.zapatos?.on && <ShoesLayer color={outfit.zapatos.color} />}
                
                {/* Visual Ground Shadow */}
                <ellipse cx="200" cy="520" rx="60" ry="10" fill="rgba(0,0,0,0.05)" />
            </svg>
        </div>
    );
}

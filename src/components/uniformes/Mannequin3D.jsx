import React from 'react';

/**
 * 2D Fashion Illustration Mannequin
 * Each garment is an independent SVG layer with customizable colors
 */
export default function Mannequin3D({ outfit = {}, activeLayer = 'camisa', autoRotate = false }) {
    
    // Default colors for each garment
    const colors = {
        skin: '#e8d4c4',
        hair: '#2d2d2d',
        camisa: outfit.camisa?.color || '#ffffff',
        chaleco: outfit.chaleco?.color || '#4a5568',
        saco: outfit.saco?.color || '#1a365d',
        corbata: outfit.corbata?.color || '#9b2c2c',
        pantalon: outfit.pantalon?.color || '#1a1a2e',
        zapatos: outfit.zapatos?.color || '#0d0d0d',
    };

    // Visibility states
    const show = {
        camisa: outfit.camisa?.on ?? true,
        chaleco: outfit.chaleco?.on ?? false,
        saco: outfit.saco?.on ?? true,
        corbata: outfit.corbata?.on ?? true,
        pantalon: outfit.pantalon?.on ?? true,
        zapatos: outfit.zapatos?.on ?? true,
    };

    // Highlight effect for active layer
    const getLayerStyle = (layer) => ({
        transition: 'all 0.3s ease',
        filter: activeLayer === layer ? 'drop-shadow(0 0 8px rgba(255,255,255,0.5))' : 'none',
        opacity: activeLayer === layer ? 1 : 0.95,
    });

    return (
        <div style={{
            width: '100%',
            height: '100%',
            minHeight: '600px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #0d0d0d 100%)',
            borderRadius: '12px',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Subtle background pattern */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.03) 1px, transparent 0)',
                backgroundSize: '32px 32px',
            }} />

            {/* Main SVG Illustration */}
            <svg
                viewBox="0 0 400 700"
                style={{
                    width: 'auto',
                    height: '90%',
                    maxWidth: '100%',
                    filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))',
                }}
            >
                <defs>
                    {/* Gradients for depth */}
                    <linearGradient id="skinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={colors.skin} />
                        <stop offset="100%" stopColor="#d4c4b4" />
                    </linearGradient>
                    <linearGradient id="shirtGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={colors.camisa} />
                        <stop offset="100%" stopColor={colors.camisa} stopOpacity="0.85" />
                    </linearGradient>
                    <linearGradient id="jacketGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={colors.saco} />
                        <stop offset="50%" stopColor={colors.saco} />
                        <stop offset="100%" stopColor="#0d1b2a" />
                    </linearGradient>
                    <linearGradient id="pantsGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={colors.pantalon} />
                        <stop offset="100%" stopColor="#0a0a15" />
                    </linearGradient>
                </defs>

                {/* ========== LAYER 0: BODY/SKIN ========== */}
                <g id="body">
                    {/* Head */}
                    <ellipse cx="200" cy="65" rx="45" ry="55" fill="url(#skinGradient)" />
                    {/* Hair */}
                    <path d="M155 50 Q155 20, 200 15 Q245 20, 245 50 Q240 35, 200 30 Q160 35, 155 50" fill={colors.hair} />
                    {/* Ears */}
                    <ellipse cx="152" cy="65" rx="8" ry="12" fill={colors.skin} />
                    <ellipse cx="248" cy="65" rx="8" ry="12" fill={colors.skin} />
                    {/* Neck */}
                    <rect x="185" y="115" width="30" height="35" rx="5" fill={colors.skin} />
                    
                    {/* Hands */}
                    <ellipse cx="95" cy="380" rx="18" ry="25" fill={colors.skin} />
                    <ellipse cx="305" cy="380" rx="18" ry="25" fill={colors.skin} />
                </g>

                {/* ========== LAYER 1: CAMISA (SHIRT) ========== */}
                {show.camisa && (
                    <g id="shirt" style={getLayerStyle('camisa')}>
                        {/* Shirt body */}
                        <path
                            d="M150 150 L145 320 L170 325 L175 380 L225 380 L230 325 L255 320 L250 150 Z"
                            fill="url(#shirtGradient)"
                            stroke={colors.camisa}
                            strokeWidth="1"
                        />
                        {/* Collar */}
                        <path
                            d="M175 150 L185 175 L200 165 L215 175 L225 150"
                            fill={colors.camisa}
                            stroke="#ddd"
                            strokeWidth="2"
                        />
                        {/* Button placket */}
                        <line x1="200" y1="170" x2="200" y2="320" stroke="rgba(0,0,0,0.1)" strokeWidth="2" />
                        {/* Buttons */}
                        <circle cx="200" cy="200" r="4" fill="rgba(0,0,0,0.15)" />
                        <circle cx="200" cy="240" r="4" fill="rgba(0,0,0,0.15)" />
                        <circle cx="200" cy="280" r="4" fill="rgba(0,0,0,0.15)" />
                        
                        {/* Sleeves */}
                        <path
                            d="M145 155 L100 175 L95 350 L115 355 L130 320 L145 320"
                            fill={colors.camisa}
                        />
                        <path
                            d="M255 155 L300 175 L305 350 L285 355 L270 320 L255 320"
                            fill={colors.camisa}
                        />
                        {/* Cuffs */}
                        <rect x="95" y="345" width="25" height="15" rx="3" fill="#f8f8f8" stroke="#ddd" />
                        <rect x="280" y="345" width="25" height="15" rx="3" fill="#f8f8f8" stroke="#ddd" />
                    </g>
                )}

                {/* ========== LAYER 2: CHALECO (VEST) ========== */}
                {show.chaleco && (
                    <g id="vest" style={getLayerStyle('chaleco')}>
                        <path
                            d="M155 155 L150 310 L175 315 L175 175 L190 185 L200 180 L210 185 L225 175 L225 315 L250 310 L245 155 Z"
                            fill={colors.chaleco}
                            stroke="rgba(0,0,0,0.2)"
                            strokeWidth="1"
                        />
                        {/* Vest buttons */}
                        <circle cx="210" cy="220" r="4" fill="rgba(255,255,255,0.3)" />
                        <circle cx="210" cy="255" r="4" fill="rgba(255,255,255,0.3)" />
                        <circle cx="210" cy="290" r="4" fill="rgba(255,255,255,0.3)" />
                        {/* V-neck line */}
                        <path d="M180 155 L200 200 L220 155" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
                    </g>
                )}

                {/* ========== LAYER 3: SACO (JACKET) ========== */}
                {show.saco && (
                    <g id="jacket" style={getLayerStyle('saco')}>
                        {/* Jacket body - open front */}
                        <path
                            d="M140 150 L135 380 L175 385 L180 340 L180 200 L175 155 L140 150"
                            fill="url(#jacketGradient)"
                        />
                        <path
                            d="M260 150 L265 380 L225 385 L220 340 L220 200 L225 155 L260 150"
                            fill="url(#jacketGradient)"
                        />
                        
                        {/* Lapels */}
                        <path
                            d="M175 155 L160 155 L175 220 L185 180 Z"
                            fill={colors.saco}
                            stroke="rgba(255,255,255,0.1)"
                        />
                        <path
                            d="M225 155 L240 155 L225 220 L215 180 Z"
                            fill={colors.saco}
                            stroke="rgba(255,255,255,0.1)"
                        />
                        
                        {/* Shoulder pads */}
                        <ellipse cx="142" cy="158" rx="15" ry="8" fill={colors.saco} />
                        <ellipse cx="258" cy="158" rx="15" ry="8" fill={colors.saco} />
                        
                        {/* Sleeves */}
                        <path
                            d="M127 155 L90 175 L85 355 L120 360 L135 320 L135 160"
                            fill={colors.saco}
                        />
                        <path
                            d="M273 155 L310 175 L315 355 L280 360 L265 320 L265 160"
                            fill={colors.saco}
                        />
                        
                        {/* Pocket details */}
                        <rect x="145" y="280" width="25" height="3" rx="1" fill="rgba(0,0,0,0.2)" />
                        <rect x="230" y="280" width="25" height="3" rx="1" fill="rgba(0,0,0,0.2)" />
                        
                        {/* Breast pocket */}
                        <rect x="230" y="200" width="18" height="2" rx="1" fill="rgba(0,0,0,0.2)" />
                    </g>
                )}

                {/* ========== LAYER 4: CORBATA (TIE) ========== */}
                {show.corbata && (
                    <g id="tie" style={getLayerStyle('corbata')}>
                        {/* Tie knot */}
                        <polygon
                            points="193,160 207,160 210,175 200,180 190,175"
                            fill={colors.corbata}
                        />
                        {/* Tie body */}
                        <polygon
                            points="192,175 208,175 215,335 200,350 185,335"
                            fill={colors.corbata}
                        />
                        {/* Tie highlight */}
                        <polygon
                            points="198,180 202,180 205,330 200,340 195,330"
                            fill="rgba(255,255,255,0.1)"
                        />
                    </g>
                )}

                {/* ========== LAYER 5: CINTURON (BELT) ========== */}
                <g id="belt">
                    <rect x="155" y="375" width="90" height="18" rx="2" fill="#1a1a1a" />
                    <rect x="192" y="377" width="16" height="14" rx="2" fill="#c9a227" stroke="#a88520" />
                </g>

                {/* ========== LAYER 6: PANTALON (PANTS) ========== */}
                {show.pantalon && (
                    <g id="pants" style={getLayerStyle('pantalon')}>
                        {/* Left leg */}
                        <path
                            d="M155 393 L145 650 L185 650 L200 400 Z"
                            fill="url(#pantsGradient)"
                        />
                        {/* Right leg */}
                        <path
                            d="M245 393 L255 650 L215 650 L200 400 Z"
                            fill="url(#pantsGradient)"
                        />
                        {/* Crease lines */}
                        <line x1="165" y1="420" x2="165" y2="640" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
                        <line x1="235" y1="420" x2="235" y2="640" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
                    </g>
                )}

                {/* ========== LAYER 7: ZAPATOS (SHOES) ========== */}
                {show.zapatos && (
                    <g id="shoes" style={getLayerStyle('zapatos')}>
                        {/* Left shoe */}
                        <path
                            d="M142 650 L140 670 L125 675 L120 685 L180 685 L185 670 L188 650 Z"
                            fill={colors.zapatos}
                        />
                        {/* Right shoe */}
                        <path
                            d="M258 650 L260 670 L275 675 L280 685 L220 685 L215 670 L212 650 Z"
                            fill={colors.zapatos}
                        />
                        {/* Shoe shine */}
                        <ellipse cx="155" cy="668" rx="15" ry="5" fill="rgba(255,255,255,0.15)" />
                        <ellipse cx="245" cy="668" rx="15" ry="5" fill="rgba(255,255,255,0.15)" />
                    </g>
                )}

                {/* Face details (minimal) */}
                <g id="face">
                    <ellipse cx="185" cy="60" rx="5" ry="3" fill="#2d2d2d" opacity="0.6" />
                    <ellipse cx="215" cy="60" rx="5" ry="3" fill="#2d2d2d" opacity="0.6" />
                    <path d="M195 85 Q200 90, 205 85" fill="none" stroke="#b8a090" strokeWidth="2" />
                </g>
            </svg>

            {/* Active layer indicator */}
            <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                color: 'rgba(255,255,255,0.6)',
                fontSize: '13px',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                background: 'rgba(0,0,0,0.4)',
                padding: '8px 20px',
                borderRadius: '20px',
                backdropFilter: 'blur(10px)',
            }}>
                {activeLayer === 'camisa' && '👔 Camisa'}
                {activeLayer === 'chaleco' && '🎽 Chaleco'}
                {activeLayer === 'saco' && '🧥 Saco'}
                {activeLayer === 'corbata' && '👔 Corbata'}
                {activeLayer === 'pantalon' && '👖 Pantalón'}
                {activeLayer === 'zapatos' && '👞 Zapatos'}
            </div>
        </div>
    );
}

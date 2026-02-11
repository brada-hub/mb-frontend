import React from 'react';
import { motion } from 'framer-motion';

export const BodyBase = () => (
    <g className="body-silhouette">
        {/* Simplified professional mannequin silhouette */}
        <path 
            d="M200 80c-15 0-25 12-25 25s10 25 25 25 25-12 25-25-10-25-25-25zm0 55c-25 0-45 15-55 35-15 30-15 80-15 80h140s0-50-15-80c-10-20-30-35-55-35zm-55 120s-5 60-5 130 5 130 5 130h110s5-60 5-130-5-130-5-130H145z" 
            fill="url(#bodyGradient)" 
        />
        <defs>
            <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#e5e7eb', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#d1d5db', stopOpacity: 1 }} />
            </linearGradient>
        </defs>
    </g>
);

export const ShirtLayer = ({ color = '#ffffff' }) => (
    <motion.g 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
    >
        <path 
            d="M200 135l-35 15-10 60 10 15h70l10-15-10-60-35-15z" 
            fill={color} 
            stroke="rgba(0,0,0,0.1)"
            strokeWidth="1"
        />
        {/* Collar */}
        <path d="M185 142l15 15 15-15" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="2" />
    </motion.g>
);

export const PantsLayer = ({ color = '#1a1a1a' }) => (
    <motion.g 
        initial={{ y: 20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
    >
        <path 
            d="M155 260h90l10 240H205l-5-100-5 100h-50l10-240z" 
            fill={color}
            stroke="rgba(0,0,0,0.2)"
            strokeWidth="1"
        />
    </motion.g>
);

export const JacketLayer = ({ color = '#1e3a8a' }) => (
    <motion.g 
        initial={{ x: -20, opacity: 0 }} 
        animate={{ x: 0, opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.7 }}
    >
        <path 
            d="M145 170c0 0-10 50-10 100s5 150 10 180l45-10v-270l-45 0z" 
            fill={color}
            stroke="rgba(0,0,0,0.2)"
        />
        <path 
            d="M255 170c0 0 10 50 10 100s-5 150-10 180l-45-10v-270l45 0z" 
            fill={color}
            stroke="rgba(0,0,0,0.2)"
        />
        {/* Lapels */}
        <path d="M145 170l55 100" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
        <path d="M255 170l-55 100" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
    </motion.g>
);

export const TieLayer = ({ color = '#991b1b' }) => (
    <motion.g 
        initial={{ scale: 0, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 12 }}
    >
        <path d="M195 155l5 5 5-5-5 100-5-100z" fill={color} />
        <path d="M195 155h10l-5 5-5-5z" fill="rgba(0,0,0,0.2)" />
    </motion.g>
);

export const TieBowLayer = ({ color = '#991b1b' }) => (
    <motion.g 
        initial={{ scale: 0, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 12 }}
    >
        <path d="M185 150l15 8 15-8v15l-15-8-15 8z" fill={color} />
        <rect x="197" y="152" width="6" height="10" rx="1" fill="rgba(0,0,0,0.2)" />
    </motion.g>
);

export const ShoesLayer = ({ color = '#000000' }) => (
    <motion.g 
        initial={{ y: 10, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
    >
        <path d="M155 500h40l5 10-45 0z" fill={color} />
        <path d="M205 500h40l5 10-45 0z" fill={color} />
    </motion.g>
);

export const VestLayer = ({ color = '#374151' }) => (
    <motion.g 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }}
    >
        <path d="M165 175l35 10 35-10v100h-70v-100z" fill={color} stroke="rgba(0,0,0,0.1)" />
        <circle cx="200" cy="200" r="1.5" fill="rgba(255,255,255,0.3)" />
        <circle cx="200" cy="220" r="1.5" fill="rgba(255,255,255,0.3)" />
        <circle cx="200" cy="240" r="1.5" fill="rgba(255,255,255,0.3)" />
    </motion.g>
);

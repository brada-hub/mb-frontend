import { Music } from 'lucide-react';

/**
 * Renderiza un icono de instrumento.
 * Por ahora usa el icono genérico de música para todos.
 */
export const InstrumentIcon = ({ className = "w-5 h-5" }) => {
    return <Music className={className} />;
};

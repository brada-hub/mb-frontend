import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

const Button = forwardRef(({ 
    className, 
    variant = 'primary', 
    size = 'default', 
    loading, 
    children, 
    ...props 
}, ref) => {
    const variants = {
        primary: 'bg-brand-primary text-white hover:bg-brand-dark shadow-lg shadow-brand-primary/20',
        secondary: 'bg-white/10 text-white hover:bg-white/15 backdrop-blur-md border border-white/10',
        ghost: 'text-gray-400 hover:text-white hover:bg-white/5',
        monster: 'bg-gradient-to-r from-monster-purple to-brand-primary text-white shadow-xl shadow-brand-primary/10',
        danger: 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white'
    };
    
    const sizes = {
        default: 'h-13 px-8 text-base', // Botón alto (min 52px) perfecto para dedos
        sm: 'h-10 px-4 text-sm',
        lg: 'h-15 px-10 text-lg font-bold',
        icon: 'h-12 w-12'
    };

    return (
        <button
            ref={ref}
            className={clsx(
                'inline-flex items-center justify-center rounded-2xl font-semibold transition-all duration-300 active:scale-95 disabled:pointer-events-none disabled:opacity-50',
                variants[variant],
                sizes[size],
                className
            )}
            disabled={loading}
            {...props}
        >
            {loading ? (
                <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    <span>Cargando...</span>
                </>
            ) : children}
        </button>
    );
});

Button.displayName = 'Button';

export { Button };

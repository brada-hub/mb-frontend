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
        primary: 'bg-brand-primary text-white hover:bg-brand-dark shadow-lg shadow-brand-primary/25 border border-transparent',
        secondary: 'bg-white/5 text-gray-200 hover:bg-white/10 hover:text-white backdrop-blur-md border border-white/10 shadow-sm',
        ghost: 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent',
        monster: 'bg-gradient-to-r from-monster-purple to-brand-primary text-white shadow-xl shadow-brand-primary/20 hover:shadow-brand-primary/40 border border-white/10',
        danger: 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white shadow-sm shadow-red-500/10'
    };
    
    const sizes = {
        default: 'h-11 px-6 text-sm', // 44px (Standard UI)
        sm: 'h-9 px-4 text-xs',       // 36px (Compact)
        lg: 'h-14 px-8 text-base',    // 56px (Mobile Touch / Hero)
        icon: 'h-11 w-11 flex-shrink-0'
    };

    return (
        <button
            ref={ref}
            className={clsx(
                'inline-flex items-center justify-center rounded-xl font-bold tracking-wide transition-all duration-300',
                'focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:ring-offset-2 focus:ring-offset-[#0f111a]',
                'active:scale-[0.97] hover:-translate-y-0.5',
                'disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none',
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

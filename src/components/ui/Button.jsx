import { forwardRef } from 'react';
import { cn } from '../../utils';
import { Loader2 } from 'lucide-react';

const Button = forwardRef(({ className, variant = 'primary', size = 'default', loading, children, ...props }, ref) => {
    const variants = {
        primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/30',
        secondary: 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-md border border-white/20',
        ghost: 'text-gray-300 hover:text-white hover:bg-white/5'
    };
    
    const sizes = {
        default: 'h-11 px-6 py-2',
        sm: 'h-9 px-3 text-sm',
        lg: 'h-14 px-8 text-lg'
    };

    return (
        <button
            ref={ref}
            className={cn(
                'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 active:scale-95 disabled:pointer-events-none disabled:opacity-50',
                variants[variant],
                sizes[size],
                className
            )}
            disabled={loading}
            {...props}
        >
            {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            {children}
        </button>
    );
});

export { Button };

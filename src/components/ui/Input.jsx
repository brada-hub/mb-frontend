import { forwardRef } from 'react';
import { cn } from '../../utils';

const Input = forwardRef(({ className, error, ...props }, ref) => {
    return (
        <div className="w-full">
            <input
                ref={ref}
                className={cn(
                    'flex h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-white placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 backdrop-blur-sm transition-all',
                    error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
                    className
                )}
                {...props}
            />
            {error && <span className="mt-1 text-sm text-red-400 ml-1">{error}</span>}
        </div>
    );
});

export { Input };

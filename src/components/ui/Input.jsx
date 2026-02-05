import { forwardRef, useState, useId } from 'react';
import { clsx } from 'clsx';
import { Eye, EyeOff } from 'lucide-react';

const Input = forwardRef(({ 
    label, 
    icon: Icon, 
    helperText, 
    error, 
    className, 
    type = 'text',
    onInput, // Usamos onInput para filtrar en tiempo real antes de que llegue al estado
    ...props 
}, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const generatedId = useId();
    
    const isTextArea = type === 'textarea';
    const isPassword = type === 'password';
    const InputComponent = isTextArea ? 'textarea' : 'input';
    
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : (isTextArea ? 'text' : type);

    const inputId = props.id || props.name || (label ? `input-${label.replace(/\s+/g, '-').toLowerCase()}` : generatedId);

    return (
        <div className="w-full space-y-2.5 group">
            {label && (
                <div className="flex items-center gap-2.5 mb-2.5 px-1 cursor-pointer" onClick={() => document.getElementById(inputId)?.focus()}>
                    {Icon && <Icon className={clsx(
                        "w-5 h-5 transition-colors",
                        error ? "text-red-400" : "text-gray-500 dark:text-gray-400 group-focus-within:text-brand-primary"
                    )} />}
                    <label 
                        htmlFor={inputId}
                        className={clsx(
                            "text-sm font-bold tracking-tight transition-colors cursor-pointer",
                            error ? "text-red-400" : "text-gray-700 dark:text-gray-300 group-focus-within:text-brand-primary"
                        )}
                    >
                        {label} {props.required && <span className="text-brand-primary">*</span>}
                    </label>
                </div>
            )}
            
            <div className="relative">
                {!label && Icon && (
                     <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Icon className={clsx("w-5 h-5", error ? "text-red-400" : "text-gray-500")} />
                     </div>
                )}

                <InputComponent
                    ref={ref}
                    id={inputId}
                    type={inputType}
                    onInput={onInput}
                    aria-label={props['aria-label'] || label || props.placeholder}
                    autoComplete={props.autoComplete || (isPassword ? 'current-password' : type === 'email' ? 'email' : 'off')}
                    className={clsx(
                        'flex w-full rounded-2xl bg-surface-input px-5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 transition-all border outline-none',
                        isTextArea ? 'min-h-[100px] py-4 resize-none' : 'h-11 sm:h-14',
                        // Left padding for start icon
                        !label && Icon && 'pl-12',
                        // Right padding for password toggle
                        isPassword && 'pr-12',
                        error 
                            ? 'border-red-500/50 ring-2 ring-red-500/20 focus:ring-red-500/40' 
                            : 'border-surface-border focus:ring-brand-primary/30 hover:border-gray-300 dark:hover:border-white/10 focus:border-brand-primary/50',
                        className
                    )}
                    {...props}
                />

                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors focus:outline-none"
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                )}
            </div>

            {helperText && !error && (
                <p className="text-[11px] text-gray-500 ml-1 font-bold uppercase tracking-wider">{helperText}</p>
            )}
            
            {error && (
                <p className="text-xs text-red-500 ml-1 font-bold animate-in fade-in slide-in-from-top-1">
                    {error}
                </p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export { Input };

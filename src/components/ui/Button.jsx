import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    className,
    ...props
}) {
    const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0f0f13] disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 focus:ring-blue-500",
        secondary: "bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/30 focus:ring-purple-500",
        outline: "border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white bg-transparent",
        ghost: "text-zinc-400 hover:text-white hover:bg-white/5",
        danger: "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30 focus:ring-red-500",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-5 py-2.5 text-base",
        lg: "px-6 py-3 text-lg",
        icon: "p-2",
    };

    return (
        <button
            className={cn(baseStyles, variants[variant], sizes[size], className)}
            {...props}
        >
            {children}
        </button>
    );
}

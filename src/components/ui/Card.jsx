import { cn } from './Button';

export function Card({ children, className, ...props }) {
    return (
        <div
            className={cn(
                "bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 shadow-xl",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

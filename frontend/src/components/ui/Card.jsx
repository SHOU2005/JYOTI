import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const Card = React.forwardRef(({ className, children, ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={twMerge(clsx("bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors", className))}
            {...props}
        >
            {children}
        </div>
    );
});

Card.displayName = 'Card';
export default Card;

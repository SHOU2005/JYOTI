import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const Input = React.forwardRef(({ className, label, error, ...props }, ref) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {label}
                </label>
            )}
            <input
                ref={ref}
                className={twMerge(clsx(
                    "block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm placeholder-gray-400 dark:placeholder-gray-500",
                    error && "border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500",
                    className
                ))}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';
export default Input;

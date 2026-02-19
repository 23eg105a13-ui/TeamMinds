import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const Button = ({ children, variant = 'primary', className, ...props }: any) => {
    const variants = {
        primary: "btn-primary",
        secondary: "btn-secondary"
    };
    return (
        <button className={cn(variants[variant as keyof typeof variants], className)} {...props}>
            {children}
        </button>
    );
};

export const GlassCard = ({ children, className, hover = false }: any) => {
    return (
        <div className={cn(hover ? "glass-card-hover" : "glass-card", "p-6", className)}>
            {children}
        </div>
    );
};

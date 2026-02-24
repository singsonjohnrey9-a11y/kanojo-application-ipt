import React from 'react';

export const Button = ({ children, variant = 'primary', size, loading, className = '', disabled, ...props }) => {
    const classes = [
        'btn',
        variant === 'primary' ? 'btn-primary' : variant === 'ghost' ? 'btn-ghost' : 'btn-secondary',
        size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '',
        className,
    ].filter(Boolean).join(' ');

    return (
        <button className={classes} disabled={disabled || loading} {...props}>
            {loading && <div className="spinner" />}
            {children}
        </button>
    );
};

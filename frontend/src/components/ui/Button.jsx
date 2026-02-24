import React from 'react';

export const Button = ({ children, variant = 'primary', className = '', ...props }) => {
    const baseClass = 'btn';
    const variantClass = variant === 'primary' ? 'btn-primary' : 'btn-secondary';

    return (
        <button className={`${baseClass} ${variantClass} ${className}`} {...props}>
            {children}
        </button>
    );
};

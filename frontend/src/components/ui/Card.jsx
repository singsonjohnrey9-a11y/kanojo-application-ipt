import React from 'react';

export const Card = ({ children, className = '', ...props }) => {
    return (
        <div className={`card ${className}`} {...props}>
            {children}
        </div>
    );
};

export const CardHeader = ({ children, className = '' }) => (
    <div className={`card-header ${className}`} style={{ marginBottom: '1rem' }}>
        {children}
    </div>
);

export const CardBody = ({ children, className = '' }) => (
    <div className={`card-body ${className}`}>
        {children}
    </div>
);

export const CardFooter = ({ children, className = '' }) => (
    <div className={`card-footer ${className}`} style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
        {children}
    </div>
);

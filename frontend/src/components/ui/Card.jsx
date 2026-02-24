import React from 'react';

export const Card = ({ children, className = '', ...props }) => (
    <div className={`card ${className}`} {...props}>{children}</div>
);

export const CardHeader = ({ children, className = '', style, ...props }) => (
    <div className={`card-header ${className}`} style={{ marginBottom: '1rem', ...style }} {...props}>{children}</div>
);

export const CardBody = ({ children, className = '', style, ...props }) => (
    <div className={`card-body ${className}`} style={style} {...props}>{children}</div>
);

export const CardFooter = ({ children, className = '', style, ...props }) => (
    <div className={`card-footer ${className}`} style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', ...style }} {...props}>{children}</div>
);

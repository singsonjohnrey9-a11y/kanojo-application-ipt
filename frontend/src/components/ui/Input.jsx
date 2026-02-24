import React from 'react';

export const Input = ({ label, id, error, ...props }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginBottom: '1rem' }}>
            {label && (
                <label htmlFor={id} style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)' }}>
                    {label}
                </label>
            )}
            <input id={id} className="input" {...props} />
            {error && (
                <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>{error}</span>
            )}
        </div>
    );
};

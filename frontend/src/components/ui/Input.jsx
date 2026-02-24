import React from 'react';

export const Input = ({ label, id, error, icon, style, ...props }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem', ...style }}>
        {label && (
            <label htmlFor={id} style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                {icon}{label}
            </label>
        )}
        <input id={id} className="input" {...props} />
        {error && <span style={{ fontSize: '0.72rem', color: 'var(--danger)' }}>{error}</span>}
    </div>
);

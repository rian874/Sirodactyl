import React, { memo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import isEqual from 'react-fast-compare';

interface Props {
    icon?: IconProp;
    title: string | React.ReactNode;
    className?: string;
    children: React.ReactNode;
}

const TitledGreyBox = ({ icon, title, children, className }: Props) => (
    <div
        className={className}
        style={{
            background: 'hsl(226, 28%, 17%)',
            borderRadius: '0.75rem',
            border: '1px solid hsl(228, 25%, 24%)',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.3)',
            overflow: 'hidden',
        }}
    >
        <div
            style={{
                background: 'hsl(228, 30%, 13%)',
                borderBottom: '1px solid hsl(228, 25%, 21%)',
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
            }}
        >
            {typeof title === 'string' ? (
                <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'hsl(220, 15%, 66%)', fontWeight: 600, margin: 0 }}>
                    {icon && <FontAwesomeIcon icon={icon} style={{ marginRight: '0.5rem', color: 'hsl(240, 60%, 65%)' }} />}
                    {title}
                </p>
            ) : (
                title
            )}
        </div>
        <div style={{ padding: '1rem' }}>{children}</div>
    </div>
);

export default memo(TitledGreyBox, isEqual);

import React from 'react';
import FlashMessageRender from '@/components/FlashMessageRender';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';

type Props = Readonly<
    React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
        title?: string;
        borderColor?: string;
        showFlashes?: string | boolean;
        showLoadingOverlay?: boolean;
    }
>;

const ContentBox = ({ title, borderColor, showFlashes, showLoadingOverlay, children, ...props }: Props) => (
    <div {...props}>
        {title && (
            <h2 style={{ color: 'hsl(220, 16%, 67%)', marginBottom: '1rem', paddingLeft: '0.25rem', fontSize: '1.5rem' }}>
                {title}
            </h2>
        )}
        {showFlashes && (
            <FlashMessageRender byKey={typeof showFlashes === 'string' ? showFlashes : undefined} style={{ marginBottom: '1rem' }} />
        )}
        <div style={{
            background: 'hsl(226, 28%, 17%)',
            border: `1px solid hsl(228, 25%, 24%)`,
            borderTop: borderColor ? `4px solid ${borderColor}` : undefined,
            borderRadius: '0.75rem',
            padding: '1.25rem',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.3)',
            position: 'relative',
        }}>
            <SpinnerOverlay visible={showLoadingOverlay || false} />
            {children}
        </div>
    </div>
);

export default ContentBox;

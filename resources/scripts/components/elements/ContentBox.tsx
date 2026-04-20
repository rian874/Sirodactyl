import React from 'react';
import FlashMessageRender from '@/components/FlashMessageRender';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import styled, { css } from 'styled-components/macro';
import tw from 'twin.macro';

type Props = Readonly<
    React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
        title?: string;
        borderColor?: string;
        showFlashes?: string | boolean;
        showLoadingOverlay?: boolean;
    }
>;

const BoxTitle = styled.h2`
    color: hsl(220, 16%, 67%);
    margin-bottom: 1rem;
    padding-left: 0.25rem;
    font-size: 1.5rem;
`;

const BoxInner = styled.div<{ $borderColor?: string }>`
    background: hsl(226, 28%, 17%);
    border: 1px solid hsl(228, 25%, 24%);
    border-radius: 0.75rem;
    padding: 1.25rem;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
    position: relative;

    ${({ $borderColor }) =>
        $borderColor &&
        css`
            border-top: 4px solid ${$borderColor};
        `};
`;

const ContentBox = ({ title, borderColor, showFlashes, showLoadingOverlay, children, ...props }: Props) => (
    <div {...props}>
        {title && <BoxTitle>{title}</BoxTitle>}
        {showFlashes && (
            <FlashMessageRender byKey={typeof showFlashes === 'string' ? showFlashes : undefined} css={tw`mb-4`} />
        )}
        <BoxInner $borderColor={borderColor}>
            <SpinnerOverlay visible={showLoadingOverlay || false} />
            {children}
        </BoxInner>
    </div>
);

export default ContentBox;

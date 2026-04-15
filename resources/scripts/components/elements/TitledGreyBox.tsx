import React, { memo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import isEqual from 'react-fast-compare';
import styled from 'styled-components/macro';

interface Props {
    icon?: IconProp;
    title: string | React.ReactNode;
    className?: string;
    children: React.ReactNode;
}

const BoxWrapper = styled.div`
    background: hsl(226, 28%, 17%);
    border-radius: 0.75rem;
    border: 1px solid hsl(228, 25%, 24%);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
    overflow: hidden;
`;

const BoxHeader = styled.div`
    background: hsl(228, 30%, 13%);
    border-bottom: 1px solid hsl(228, 25%, 21%);
    padding: 0.75rem 1rem;
`;

const BoxTitle = styled.p`
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: hsl(220, 15%, 66%);
    font-weight: 600;
    margin: 0;
`;

const BoxIcon = styled(FontAwesomeIcon)`
    margin-right: 0.5rem;
    color: hsl(240, 60%, 65%);
`;

const BoxContent = styled.div`
    padding: 1rem;
`;

const TitledGreyBox = ({ icon, title, children, className }: Props) => (
    <BoxWrapper className={className}>
        <BoxHeader>
            {typeof title === 'string' ? (
                <BoxTitle>
                    {icon && <BoxIcon icon={icon} />}
                    {title}
                </BoxTitle>
            ) : (
                title
            )}
        </BoxHeader>
        <BoxContent>{children}</BoxContent>
    </BoxWrapper>
);

export default memo(TitledGreyBox, isEqual);

import React, { forwardRef } from 'react';
import { Form } from 'formik';
import { breakpoint } from '@/theme';
import FlashMessageRender from '@/components/FlashMessageRender';
import styled from 'styled-components/macro';
import tw from 'twin.macro';

type Props = React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> & {
    title?: string;
};

const Container = styled.div`
    ${breakpoint('sm')`
        ${tw`w-4/5 mx-auto`}
    `};

    ${breakpoint('md')`
        ${tw`p-10`}
    `};

    ${breakpoint('lg')`
        ${tw`w-3/5`}
    `};

    ${breakpoint('xl')`
        ${tw`w-full`}
        max-width: 480px;
    `};
`;

const FormCard = styled.div`
    background: hsl(226, 28%, 17%);
    border: 1px solid hsl(228, 25%, 24%);
    border-radius: 1rem;
    padding: 2rem;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(99, 102, 241, 0.08);
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, hsl(240, 80%, 60%), hsl(270, 80%, 60%), hsl(240, 80%, 60%));
        background-size: 200% 100%;
    }
`;

export default forwardRef<HTMLFormElement, Props>(({ title, ...props }, ref) => (
    <Container>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <img
                src={'/assets/svgs/pterodactyl.svg'}
                style={{ width: '3rem', height: '3rem', margin: '0 auto 1rem' }}
                alt={'Logo'}
            />
            {title && (
                <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: 'hsl(220, 20%, 95%)',
                    letterSpacing: '-0.02em',
                    margin: 0,
                }}>
                    {title}
                </h2>
            )}
        </div>
        <FlashMessageRender css={tw`mb-4`} />
        <FormCard>
            <Form {...props} ref={ref}>
                {props.children}
            </Form>
        </FormCard>
        <p style={{ textAlign: 'center', color: 'hsl(220, 13%, 40%)', fontSize: '0.75rem', marginTop: '1.25rem' }}>
            &copy; 2015 - {new Date().getFullYear()}&nbsp;
            <a
                rel={'noopener nofollow noreferrer'}
                href={'https://pterodactyl.io'}
                target={'_blank'}
                style={{ color: 'hsl(220, 13%, 40%)', textDecoration: 'none' }}
                onMouseOver={(e) => (e.currentTarget.style.color = 'hsl(220, 20%, 70%)')}
                onMouseOut={(e) => (e.currentTarget.style.color = 'hsl(220, 13%, 40%)')}
            >
                Pterodactyl Software
            </a>
        </p>
    </Container>
));

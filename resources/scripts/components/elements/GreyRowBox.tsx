import styled from 'styled-components/macro';
import tw from 'twin.macro';

export default styled.div<{ $hoverable?: boolean }>`
    ${tw`flex rounded-lg no-underline text-neutral-200 items-center bg-neutral-800 p-4 border border-neutral-700 transition-all duration-200 overflow-hidden`};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);

    ${(props) =>
        props.$hoverable !== false &&
        `
        &:hover {
            border-color: hsl(224, 22%, 36%);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(99, 102, 241, 0.15);
            transform: translateY(-1px);
        }
    `};

    & .icon {
        ${tw`rounded-xl w-16 flex items-center justify-center p-3`};
        background: hsl(228, 30%, 14%);
        border: 1px solid hsl(228, 25%, 22%);
    }
`;

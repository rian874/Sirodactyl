import styled from 'styled-components/macro';
import tw, { theme } from 'twin.macro';

const SubNavigation = styled.div`
    ${tw`w-full bg-neutral-900/60 backdrop-blur-md border-b border-neutral-700/60 shadow overflow-x-auto`};

    & > div {
        ${tw`flex items-center text-sm mx-auto px-2`};
        max-width: 1200px;

        & > a,
        & > div {
            ${tw`inline-block py-3 px-4 text-neutral-300 no-underline whitespace-nowrap transition-all duration-150 rounded-lg`};

            &:not(:first-of-type) {
                ${tw`ml-2`};
            }

            &:hover {
                ${tw`text-neutral-100 bg-neutral-800/60`};
            }

            &:active,
            &.active {
                ${tw`text-cyan-200 bg-neutral-800/60`};
                box-shadow: inset 0 -2px ${theme`colors.cyan.500`.toString()};
            }
        }
    }
`;

export default SubNavigation;

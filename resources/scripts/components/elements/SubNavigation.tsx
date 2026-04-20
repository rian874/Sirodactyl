import styled from 'styled-components/macro';
import tw, { theme } from 'twin.macro';

const SubNavigation = styled.div`
    background: hsl(228, 30%, 12%);
    border-bottom: 1px solid hsl(228, 25%, 20%);
    ${tw`w-full overflow-x-auto`};
    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.03);

    & > div {
        ${tw`flex items-center text-sm mx-auto px-2`};
        max-width: 1200px;

        & > a,
        & > div {
            ${tw`inline-block py-3 px-4 no-underline whitespace-nowrap transition-all duration-150`};
            color: hsl(220, 14%, 55%);
            position: relative;

            &:not(:first-of-type) {
                ${tw`ml-1`};
            }

            &::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 0;
                height: 2px;
                background: linear-gradient(90deg, ${theme`colors.indigo.500`.toString()}, ${theme`colors.violet.500`.toString()});
                border-radius: 2px 2px 0 0;
                transition: width 200ms ease;
            }

            &:hover {
                color: hsl(220, 20%, 80%);
                background: rgba(255, 255, 255, 0.04);
                border-radius: 0.375rem 0.375rem 0 0;

                &::after {
                    width: 60%;
                }
            }

            &:active,
            &.active {
                color: hsl(220, 20%, 95%);

                &::after {
                    width: 60%;
                }
            }
        }
    }
`;

export default SubNavigation;

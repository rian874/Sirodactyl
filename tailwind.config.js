const colors = require('tailwindcss/colors');

const gray = {
    50: 'hsl(220, 33%, 97%)',
    100: 'hsl(220, 22%, 91%)',
    200: 'hsl(220, 20%, 82%)',
    300: 'hsl(220, 16%, 67%)',
    400: 'hsl(220, 13%, 54%)',
    500: 'hsl(220, 14%, 44%)',
    600: 'hsl(222, 17%, 36%)',
    700: 'hsl(224, 22%, 26%)',
    800: 'hsl(226, 28%, 17%)',
    900: 'hsl(228, 35%, 11%)',
};

module.exports = {
    content: [
        './resources/scripts/**/*.{js,ts,tsx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                header: ['"IBM Plex Sans"', '"Roboto"', 'system-ui', 'sans-serif'],
            },
            colors: {
                black: '#0d1117',
                // "primary" and "neutral" are deprecated, prefer the use of "blue" and "gray"
                // in new code.
                primary: colors.blue,
                gray: gray,
                neutral: gray,
                cyan: colors.cyan,
                indigo: colors.indigo,
                violet: colors.violet,
            },
            fontSize: {
                '2xs': '0.625rem',
            },
            transitionDuration: {
                250: '250ms',
            },
            borderColor: theme => ({
                default: theme('colors.neutral.400', 'currentColor'),
            }),
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
            },
        },
    },
    plugins: [
        require('@tailwindcss/line-clamp'),
        require('@tailwindcss/forms')({
            strategy: 'class',
        }),
    ]
};

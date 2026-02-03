/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            animation: {
                'slide-up': 'slideUp 0.2s ease-out forwards',
                'fade-in': 'fadeIn 0.2s ease-out forwards',
            },
            keyframes: {
                slideUp: {
                    '0%': { transform: 'translateY(10px) scale(0.95)', opacity: '0' },
                    '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                }
            }
        },
    },
    plugins: [],
}

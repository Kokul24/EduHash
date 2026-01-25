/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'edu-dark': '#0f172a',
                'edu-card': '#1e293b',
                'edu-primary': '#3b82f6', // Bright Blue
                'edu-accent': '#10b981',  // Emerald Green
                'edu-error': '#ef4444',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}

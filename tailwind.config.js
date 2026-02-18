/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                heading: ['Outfit', 'sans-serif'],
                body: ['Inter', 'sans-serif'],
            },
            // You can extend other theme properties here if needed based on previous css
        },
    },
    plugins: [],
}

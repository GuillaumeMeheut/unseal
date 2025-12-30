/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                // Cozy Minimalist Palette
                cream: "#FAF8F5",      // Warm off-white background
                sand: "#F5F0E8",       // Slightly darker for cards
                stone: "#E8E2D9",      // Borders and subtle dividers
                warmGray: "#9A948A",   // Muted text
                charcoal: "#3D3A36",   // Primary text
                terracotta: "#C4A484", // Warm accent (muted brown/beige)
                sage: "#A8B5A0",       // Secondary accent (soft green)
                blush: "#D4B5A0",      // Tertiary accent (soft rose)
            },
            fontFamily: {
                sans: ["System"],
            },
            borderRadius: {
                'xl': '16px',
                '2xl': '24px',
                '3xl': '32px',
            }
        },
    },
    plugins: [],
}

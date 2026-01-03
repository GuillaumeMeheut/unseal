/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                // Warm Twilight Palette - Gender-Neutral Romance
                midnight: "#1A1B2E",    // Deep navy background
                plum: "#252A40",        // Card/surface background
                grape: "#3A4158",       // Borders & subtle dividers
                lavender: "#8B92A8",    // Muted/secondary text
                snowWhite: "#FFFEF5",   // Primary text (warm ivory)
                coral: "#F59E0B",       // Primary accent (warm amber)
                mint: "#FBBF24",        // Secondary accent (soft gold)
                rose: "#FDE68A",        // Tertiary accent (pale gold/cream)
                gold: "#D97706",        // Highlight/emphasis
                indigo: "#EAB308",      // Interactive elements (warm gold)
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

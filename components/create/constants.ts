// All available message prompts
export const ALL_PROMPTS = [
    // Romantic
    "I've been thinking about you all day...",
    "Every moment with you feels magical...",
    "You make my heart skip a beat...",
    "I fall in love with you more each day...",
    // Supportive
    "I believe in you more than you know...",
    "You're stronger than you think...",
    "I'm so proud of who you are...",
    "Whatever happens, I'm here for you...",
    // Playful
    "Remember when we laughed until we cried?",
    "I can't stop smiling thinking about...",
    "You're my favorite human...",
    "Let's make more memories soon...",
    // Gratitude
    "Thank you for being you...",
    "I'm so grateful we found each other...",
    "You make my life so much better...",
    "I appreciate you more than words can say...",
    // Future
    "I can't wait to see you again...",
    "Looking forward to our next adventure...",
    "The future looks bright with you...",
    "Counting down the days until...",
];

export const QUICK_EMOJIS = ['💕', '✨', '🌙', '🔥', '💫', '🌸', '💝', '🥰'];

// Get 4 random prompts based on the day
export function getDailyPrompts(): string[] {
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

    // Simple seeded random shuffle
    const shuffled = [...ALL_PROMPTS];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(((seed * (i + 1) * 9301 + 49297) % 233280) / 233280 * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.slice(0, 4);
}

export type Step = 1 | 2 | 3;

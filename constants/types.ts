export interface Profile {
    id: string;
    username?: string;
    full_name?: string;
    avatar_url?: string;
    updated_at?: string;
}

export interface Message {
    id: string;
    sender: string;
    receiver: string;
    content: string;
    unlock_date: string; // ISO date string YYYY-MM-DD
    opened: boolean;
    created_at: string;
}

export interface Partnership {
    id: string;
    user_a: string;
    user_b: string;
    status: 'pending' | 'accepted';
    relationship_date: string | null;
    current_streak: number;
    last_streak_date: string | null;
    created_at: string;
}

export interface RelationshipStats {
    totalMessages: number;
    currentStreak: number;
    daysTogether: number;
    partnershipStartDate: string | null;
}

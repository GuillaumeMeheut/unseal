export interface Profile {
    id: string;
    username?: string;
    full_name?: string;
    avatar_url?: string;
    updated_at?: string;
}

export interface Partner {
    id: string;
    user_id: string;
    partner_id: string;
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

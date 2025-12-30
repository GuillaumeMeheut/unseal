import { format } from 'date-fns';
import { Message } from '../constants/types';
import { supabase } from './supabase';

// ==================== Messages API ====================

export const messagesApi = {
    /**
     * Fetches the earliest unlockable message for today that hasn't been opened
     */
    async getTodaysMessage(userId: string): Promise<Message | null> {
        const todayStr = format(new Date(), 'yyyy-MM-dd');

        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('receiver', userId)
            .lte('unlock_date', todayStr)
            .order('unlock_date', { ascending: true })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching today\'s message:', error);
            throw error;
        }

        return data || null;
    },

    /**
     * Fetches all messages where user is sender or receiver
     */
    async getUserMessages(userId: string): Promise<Message[]> {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .or(`receiver.eq.${userId},sender.eq.${userId}`)
            .order('unlock_date', { ascending: false });

        if (error) {
            console.error('Error fetching messages:', error);
            throw error;
        }

        return data || [];
    },

    /**
     * Fetches all unlock dates for messages sent by user to partner
     */
    async getMessageDatesForSender(userId: string, partnerId: string): Promise<string[]> {
        const { data, error } = await supabase
            .from('messages')
            .select('unlock_date')
            .eq('sender', userId)
            .eq('receiver', partnerId);

        if (error) {
            console.error('Error fetching message dates:', error);
            throw error;
        }

        return data?.map((m) => m.unlock_date) ?? [];
    },

    /**
     * Creates a new message
     */
    async createMessage(data: {
        senderId: string;
        receiverId: string;
        content: string;
        unlockDate: Date;
    }): Promise<Message> {
        const { data: message, error } = await supabase
            .from('messages')
            .insert({
                sender: data.senderId,
                receiver: data.receiverId,
                content: data.content,
                unlock_date: format(data.unlockDate, 'yyyy-MM-dd'),
                opened: false,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating message:', error);
            throw error;
        }

        return message;
    },

    /**
     * Marks a message as opened
     */
    async markAsOpened(messageId: string): Promise<void> {
        const { error } = await supabase
            .from('messages')
            .update({ opened: true })
            .eq('id', messageId);

        if (error) {
            console.error('Error marking message as opened:', error);
            throw error;
        }
    },
};

// ==================== Partners API ====================

export const partnersApi = {
    /**
     * Fetches the partner ID for a user
     */
    async getPartner(userId: string): Promise<string | null> {
        const { data, error } = await supabase
            .from('partners')
            .select('partner_id')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching partner:', error);
            throw error;
        }

        return data?.partner_id || null;
    },

    /**
     * Pairs user with a partner
     */
    async pairPartner(userId: string, partnerId: string): Promise<void> {
        const { error } = await supabase
            .from('partners')
            .upsert({ user_id: userId, partner_id: partnerId });

        if (error) {
            console.error('Error pairing partner:', error);
            throw error;
        }
    },
};

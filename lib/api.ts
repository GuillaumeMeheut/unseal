import { format } from 'date-fns';
import { Message, Partnership } from '../constants/types';
import { supabase } from './supabase';

// ==================== Messages API ====================

export const messagesApi = {
    /**
     * Fetches the message for today's date only
     */
    async getTodaysMessage(userId: string): Promise<Message | null> {
        const todayStr = format(new Date(), 'yyyy-MM-dd');

        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('receiver', userId)
            .eq('unlock_date', todayStr)
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
     * Creates a new message and updates streak
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

        // Update streak
        await partnershipsApi.updateStreak(data.senderId, data.receiverId);

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

// ==================== Partnerships API ====================

export const partnershipsApi = {
    /**
     * Get user's partnership (either as user_a or user_b)
     */
    async getPartnership(userId: string): Promise<Partnership | null> {
        const { data, error } = await supabase
            .from('partnerships')
            .select('*')
            .or(`user_a.eq.${userId},user_b.eq.${userId}`)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching partnership:', error);
            throw error;
        }

        return data || null;
    },

    /**
     * Get partner ID from partnership
     */
    async getPartnerId(userId: string): Promise<string | null> {
        const partnership = await partnershipsApi.getPartnership(userId);
        if (!partnership || partnership.status !== 'accepted') return null;

        return partnership.user_a === userId ? partnership.user_b : partnership.user_a;
    },

    /**
     * Get pending request for the user (where they are the receiver)
     */
    async getPendingRequest(userId: string): Promise<Partnership | null> {
        const { data, error } = await supabase
            .from('partnerships')
            .select('*')
            .eq('user_b', userId)
            .eq('status', 'pending')
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching pending request:', error);
            throw error;
        }

        return data || null;
    },

    /**
     * Get sent request by user (where they are the requester)
     */
    async getSentRequest(userId: string): Promise<Partnership | null> {
        const { data, error } = await supabase
            .from('partnerships')
            .select('*')
            .eq('user_a', userId)
            .eq('status', 'pending')
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching sent request:', error);
            throw error;
        }

        return data || null;
    },

    /**
     * Send a partnership request to another user
     */
    async sendRequest(fromUserId: string, toUserId: string): Promise<void> {
        // Check if partnership already exists
        const existing = await partnershipsApi.getPartnership(fromUserId);
        if (existing) {
            throw new Error('You already have a partnership');
        }

        const { error } = await supabase
            .from('partnerships')
            .insert({
                user_a: fromUserId,
                user_b: toUserId,
                status: 'pending',
            });

        if (error) {
            console.error('Error sending request:', error);
            throw error;
        }
    },

    /**
     * Accept a pending partnership request
     */
    async acceptRequest(userId: string, partnershipId: string, relationshipDate: Date): Promise<void> {
        const { error } = await supabase
            .from('partnerships')
            .update({
                status: 'accepted',
                relationship_date: format(relationshipDate, 'yyyy-MM-dd'),
            })
            .eq('id', partnershipId)
            .eq('user_b', userId); // Only the receiver can accept

        if (error) {
            console.error('Error accepting request:', error);
            throw error;
        }
    },

    /**
     * Cancel/decline a partnership request
     */
    async cancelRequest(userId: string, partnershipId: string): Promise<void> {
        const { error } = await supabase
            .from('partnerships')
            .delete()
            .eq('id', partnershipId)
            .or(`user_a.eq.${userId},user_b.eq.${userId}`);

        if (error) {
            console.error('Error canceling request:', error);
            throw error;
        }
    },

    /**
     * Get relationship statistics
     */
    async getRelationshipStats(userId: string): Promise<{
        totalMessages: number;
        currentStreak: number;
        relationshipDate: string | null;
    }> {
        const partnership = await partnershipsApi.getPartnership(userId);
        if (!partnership || partnership.status !== 'accepted') {
            return { totalMessages: 0, currentStreak: 0, relationshipDate: null };
        }

        const partnerId = partnership.user_a === userId ? partnership.user_b : partnership.user_a;

        // Fetch total message count
        const { count, error: countError } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .or(`and(sender.eq.${userId},receiver.eq.${partnerId}),and(sender.eq.${partnerId},receiver.eq.${userId})`);

        if (countError) {
            console.error('Error fetching message count:', countError);
            throw countError;
        }

        return {
            totalMessages: count ?? 0,
            currentStreak: partnership.current_streak ?? 0,
            relationshipDate: partnership.relationship_date ?? null,
        };
    },

    /**
     * Update streak (Snapchat-style: both must send daily)
     */
    async updateStreak(userId: string, partnerId: string): Promise<void> {
        const todayStr = format(new Date(), 'yyyy-MM-dd');

        // Check if both users sent a message today
        const { data: todayMessages, error: checkError } = await supabase
            .from('messages')
            .select('sender')
            .or(`and(sender.eq.${userId},receiver.eq.${partnerId}),and(sender.eq.${partnerId},receiver.eq.${userId})`)
            .gte('created_at', `${todayStr}T00:00:00`)
            .lte('created_at', `${todayStr}T23:59:59`);

        if (checkError) {
            console.error('Error checking today messages:', checkError);
            return;
        }

        const userSentToday = todayMessages?.some(m => m.sender === userId);
        const partnerSentToday = todayMessages?.some(m => m.sender === partnerId);

        if (userSentToday && partnerSentToday) {
            const yesterdayStr = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');

            // Get current partnership
            const { data: partnership } = await supabase
                .from('partnerships')
                .select('id, current_streak, last_streak_date')
                .or(`user_a.eq.${userId},user_b.eq.${userId}`)
                .eq('status', 'accepted')
                .single();

            if (partnership) {
                const lastDate = partnership.last_streak_date;
                let newStreak = 1;

                if (lastDate === yesterdayStr) {
                    newStreak = (partnership.current_streak || 0) + 1;
                } else if (lastDate === todayStr) {
                    newStreak = partnership.current_streak || 1;
                }

                await supabase
                    .from('partnerships')
                    .update({ current_streak: newStreak, last_streak_date: todayStr })
                    .eq('id', partnership.id);
            }
        }
    },
};


import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { parseISO } from 'date-fns';
import { useAuth } from '../context/AuthProvider';
import { messagesApi, partnersApi } from '../lib/api';

// ==================== Query Keys ====================

export const queryKeys = {
    todaysMessage: (userId: string) => ['todaysMessage', userId] as const,
    messages: (userId: string) => ['messages', userId] as const,
    partner: (userId: string) => ['partner', userId] as const,
    messageDates: (userId: string, partnerId: string) => ['messageDates', userId, partnerId] as const,
};

// ==================== Query Hooks ====================

/**
 * Fetches today's unlockable message for the current user
 */
export function useTodaysMessage() {
    const { user } = useAuth();

    return useQuery({
        queryKey: queryKeys.todaysMessage(user?.id ?? ''),
        queryFn: () => messagesApi.getTodaysMessage(user!.id),
        enabled: !!user?.id,
    });
}

/**
 * Fetches all messages for the current user (sent and received)
 */
export function useMessages() {
    const { user } = useAuth();

    return useQuery({
        queryKey: queryKeys.messages(user?.id ?? ''),
        queryFn: () => messagesApi.getUserMessages(user!.id),
        enabled: !!user?.id,
    });
}

/**
 * Fetches the partner ID for the current user
 */
export function usePartner() {
    const { user } = useAuth();

    return useQuery({
        queryKey: queryKeys.partner(user?.id ?? ''),
        queryFn: () => partnersApi.getPartner(user!.id),
        enabled: !!user?.id,
    });
}

/**
 * Fetches dates that already have messages for the current user's partner
 */
export function useExistingMessageDates() {
    const { user } = useAuth();
    const { data: partnerId } = usePartner();

    return useQuery({
        queryKey: queryKeys.messageDates(user?.id ?? '', partnerId ?? ''),
        queryFn: async () => {
            if (!partnerId) return [];
            const dates = await messagesApi.getMessageDatesForSender(user!.id, partnerId);
            return dates.map((d) => parseISO(d));
        },
        enabled: !!user?.id && !!partnerId,
    });
}

// ==================== Mutation Hooks ====================

/**
 * Marks a message as opened
 */
export function useMarkMessageOpened() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: (messageId: string) => messagesApi.markAsOpened(messageId),
        onSuccess: () => {
            // Invalidate related queries
            if (user?.id) {
                queryClient.invalidateQueries({ queryKey: queryKeys.todaysMessage(user.id) });
                queryClient.invalidateQueries({ queryKey: queryKeys.messages(user.id) });
            }
        },
    });
}

/**
 * Creates a new message
 */
export function useCreateMessage() {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const { data: partnerId } = usePartner();

    return useMutation({
        mutationFn: async (data: { content: string; unlockDate: Date }) => {
            if (!user?.id || !partnerId) {
                throw new Error('User or partner not found');
            }
            return messagesApi.createMessage({
                senderId: user.id,
                receiverId: partnerId,
                content: data.content,
                unlockDate: data.unlockDate,
            });
        },
        onSuccess: () => {
            // Invalidate related queries
            if (user?.id && partnerId) {
                queryClient.invalidateQueries({ queryKey: queryKeys.messages(user.id) });
                queryClient.invalidateQueries({ queryKey: queryKeys.messageDates(user.id, partnerId) });
            }
        },
    });
}

/**
 * Pairs the current user with a partner
 */
export function usePairPartner() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: (partnerId: string) => {
            if (!user?.id) {
                throw new Error('User not found');
            }
            return partnersApi.pairPartner(user.id, partnerId);
        },
        onSuccess: () => {
            // Invalidate partner query
            if (user?.id) {
                queryClient.invalidateQueries({ queryKey: queryKeys.partner(user.id) });
            }
        },
    });
}

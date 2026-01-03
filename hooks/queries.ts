import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { parseISO } from 'date-fns';
import { useAuth } from '../context/AuthProvider';
import { messagesApi, partnershipsApi } from '../lib/api';

// ==================== Query Keys ====================

export const queryKeys = {
    todaysMessage: (userId: string) => ['todaysMessage', userId] as const,
    messages: (userId: string) => ['messages', userId] as const,
    partnership: (userId: string) => ['partnership', userId] as const,
    pendingRequest: (userId: string) => ['pendingRequest', userId] as const,
    sentRequest: (userId: string) => ['sentRequest', userId] as const,
    messageDates: (userId: string, partnerId: string) => ['messageDates', userId, partnerId] as const,
    relationshipStats: (userId: string) => ['relationshipStats', userId] as const,
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
 * Fetches the partner ID for the current user (only if partnership is accepted)
 */
export function usePartner() {
    const { user } = useAuth();

    return useQuery({
        queryKey: queryKeys.partnership(user?.id ?? ''),
        queryFn: () => partnershipsApi.getPartnerId(user!.id),
        enabled: !!user?.id,
    });
}

/**
 * Fetches the full partnership object
 */
export function usePartnership() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['fullPartnership', user?.id] as const,
        queryFn: () => partnershipsApi.getPartnership(user!.id),
        enabled: !!user?.id,
    });
}

/**
 * Fetches pending partnership request (where user is the receiver)
 */
export function usePendingRequest() {
    const { user } = useAuth();

    return useQuery({
        queryKey: queryKeys.pendingRequest(user?.id ?? ''),
        queryFn: () => partnershipsApi.getPendingRequest(user!.id),
        enabled: !!user?.id,
    });
}

/**
 * Fetches sent partnership request (where user is the requester)
 */
export function useSentRequest() {
    const { user } = useAuth();

    return useQuery({
        queryKey: queryKeys.sentRequest(user?.id ?? ''),
        queryFn: () => partnershipsApi.getSentRequest(user!.id),
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
            if (user?.id && partnerId) {
                queryClient.invalidateQueries({ queryKey: queryKeys.messages(user.id) });
                queryClient.invalidateQueries({ queryKey: queryKeys.messageDates(user.id, partnerId) });
                queryClient.invalidateQueries({ queryKey: queryKeys.relationshipStats(user.id) });
            }
        },
    });
}

/**
 * Sends a partnership request
 */
export function useSendPartnerRequest() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: (toUserId: string) => {
            if (!user?.id) throw new Error('User not found');
            return partnershipsApi.sendRequest(user.id, toUserId);
        },
        onSuccess: () => {
            if (user?.id) {
                queryClient.invalidateQueries({ queryKey: queryKeys.sentRequest(user.id) });
                queryClient.invalidateQueries({ queryKey: queryKeys.partnership(user.id) });
            }
        },
    });
}

/**
 * Accepts a pending partnership request
 */
export function useAcceptPartnerRequest() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: (data: { partnershipId: string; relationshipDate: Date }) => {
            if (!user?.id) throw new Error('User not found');
            return partnershipsApi.acceptRequest(user.id, data.partnershipId, data.relationshipDate);
        },
        onSuccess: () => {
            if (user?.id) {
                queryClient.invalidateQueries({ queryKey: queryKeys.pendingRequest(user.id) });
                queryClient.invalidateQueries({ queryKey: queryKeys.partnership(user.id) });
                queryClient.invalidateQueries({ queryKey: queryKeys.relationshipStats(user.id) });
            }
        },
    });
}

/**
 * Cancels/declines a partnership request
 */
export function useCancelPartnerRequest() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: (partnershipId: string) => {
            if (!user?.id) throw new Error('User not found');
            return partnershipsApi.cancelRequest(user.id, partnershipId);
        },
        onSuccess: () => {
            if (user?.id) {
                queryClient.invalidateQueries({ queryKey: queryKeys.pendingRequest(user.id) });
                queryClient.invalidateQueries({ queryKey: queryKeys.sentRequest(user.id) });
                queryClient.invalidateQueries({ queryKey: queryKeys.partnership(user.id) });
            }
        },
    });
}

/**
 * Fetches relationship statistics
 */
export function useRelationshipStats() {
    const { user } = useAuth();
    const { data: partnerId } = usePartner();

    return useQuery({
        queryKey: queryKeys.relationshipStats(user?.id ?? ''),
        queryFn: async () => {
            const stats = await partnershipsApi.getRelationshipStats(user!.id);

            // Calculate days together from relationship date
            let daysTogether = 0;
            if (stats.relationshipDate) {
                const startDate = new Date(stats.relationshipDate);
                const today = new Date();
                daysTogether = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            }

            return {
                ...stats,
                daysTogether,
            };
        },
        enabled: !!user?.id && !!partnerId,
    });
}

// Legacy export for backwards compatibility
export const usePairPartner = useSendPartnerRequest;

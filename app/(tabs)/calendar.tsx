import clsx from 'clsx';
import { format, isFuture, isSameDay, isToday, startOfDay } from 'date-fns';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CalendarPicker from '../../components/CalendarPicker';
import { Message } from '../../constants/types';
import { useAuth } from '../../context/AuthProvider';
import { useMessages } from '../../hooks/queries';

export default function Calendar() {
    const { user } = useAuth();
    const { data: messages = [], isLoading: loading, refetch } = useMessages();
    const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));

    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [refetch])
    );

    // Get all dates that have messages
    const messageDates = useMemo(() => {
        return messages.map(msg => startOfDay(new Date(msg.unlock_date)));
    }, [messages]);

    // Filter messages for the selected date
    const messagesForSelectedDate = useMemo(() => {
        return messages.filter(msg =>
            isSameDay(new Date(msg.unlock_date), selectedDate)
        );
    }, [messages, selectedDate]);

    const handleDateSelect = (date: Date) => {
        setSelectedDate(startOfDay(date));
    };

    const renderMessageCard = (item: Message) => {
        const isMeSender = item.sender === user?.id;
        const unlockDate = new Date(item.unlock_date);
        const locked = isFuture(unlockDate) && !isToday(unlockDate);
        const unlockingToday = isToday(unlockDate);
        const isUnlocked = item.opened || !locked;

        return (
            <View
                key={item.id}
                className={clsx(
                    "p-5 rounded-2xl mb-3 border-l-4",
                    isMeSender
                        ? "bg-plum border-mint"
                        : isUnlocked
                            ? "bg-plum border-coral"
                            : "bg-plum/60 border-coral/40 opacity-80"
                )}
            >
                <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-lavender text-sm font-medium tracking-wide">
                        {format(unlockDate, 'MMM d, yyyy')}
                    </Text>
                    <View className={clsx(
                        "px-2 py-1 rounded-full",
                        isMeSender ? "bg-mint/20" : "bg-coral/20"
                    )}>
                        <Text className={clsx(
                            "text-xs uppercase tracking-wide font-medium",
                            isMeSender ? "text-mint" : "text-coral"
                        )}>
                            {isMeSender ? "Sent" : "Received"}
                        </Text>
                    </View>
                </View>

                <View>
                    {isMeSender ? (
                        // Sender can always see their own message
                        <Text className="text-snowWhite leading-6">{item.content}</Text>
                    ) : (
                        // Receiver sees different states
                        item.opened ? (
                            // Message has been opened - show content
                            <Text className="text-snowWhite leading-6">{item.content}</Text>
                        ) : locked ? (
                            // Message is still locked
                            <View>
                                <Text className="text-lavender italic">A surprise is waiting...</Text>
                                <Text className="text-lavender/60 text-xs mt-1">Will unlock on {format(unlockDate, 'MMM d')}</Text>
                            </View>
                        ) : (
                            // Message is unlocked but not yet opened
                            <View>
                                <Text className="text-coral text-sm font-medium mb-2">
                                    {unlockingToday ? "Ready to open today!" : "Ready to open"}
                                </Text>
                                <Text className="text-lavender italic">
                                    {unlockingToday ? "Go to Today tab to reveal" : "You missed this one..."}
                                </Text>
                            </View>
                        )
                    )}
                </View>

                <View className="mt-3 pt-3 border-t border-grape">
                    <Text className="text-xs text-lavender">
                        {item.opened ? "Opened ✓" : (locked ? "🔒 Locked" : '')}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-midnight">
            <ScrollView
                className="flex-1 px-6 pt-6"
                showsVerticalScrollIndicator={false}
            >
                <Text className="text-3xl font-light text-snowWhite mb-2">Timeline</Text>
                <Text className="text-lavender mb-6">Your sealed moments</Text>

                {loading ? (
                    <ActivityIndicator size="large" color="#FF6B6B" />
                ) : (
                    <>
                        {/* Calendar Picker */}
                        <CalendarPicker
                            selectedDate={selectedDate}
                            onDateSelect={handleDateSelect}
                            messageDates={messageDates}
                            className="mb-6"
                        />

                        {/* Selected Date Header */}
                        <View className="mb-4">
                            <Text className="text-lg font-medium text-snowWhite">
                                {isToday(selectedDate)
                                    ? "Today"
                                    : format(selectedDate, 'EEEE, MMMM d')}
                            </Text>
                            <Text className="text-lavender text-sm mt-1">
                                {messagesForSelectedDate.length === 0
                                    ? "No messages for this date"
                                    : `${messagesForSelectedDate.length} message${messagesForSelectedDate.length > 1 ? 's' : ''}`}
                            </Text>
                        </View>

                        {/* Messages for Selected Date */}
                        <View className="pb-8">
                            {messagesForSelectedDate.length > 0 ? (
                                messagesForSelectedDate.map(renderMessageCard)
                            ) : (
                                <View className="bg-plum rounded-2xl p-6 items-center border border-grape">
                                    <Text className="text-lavender text-center">
                                        No messages sealed for this date
                                    </Text>
                                    <Text className="text-lavender/60 text-sm text-center mt-2">
                                        Tap on a highlighted date to view messages
                                    </Text>
                                </View>
                            )}
                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}


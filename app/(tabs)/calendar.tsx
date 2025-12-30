import clsx from 'clsx';
import { format, isFuture, isToday } from 'date-fns';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Message } from '../../constants/types';
import { useAuth } from '../../context/AuthProvider';
import { useMessages } from '../../hooks/queries';

export default function Calendar() {
    const { user } = useAuth();
    const { data: messages = [], isLoading: loading, refetch } = useMessages();

    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [refetch])
    );

    const renderItem = ({ item }: { item: Message }) => {
        const isMeSender = item.sender === user?.id;
        const unlockDate = new Date(item.unlock_date);
        const locked = isFuture(unlockDate) && !isToday(unlockDate);
        const unlockingToday = isToday(unlockDate);
        const isUnlocked = item.opened || !locked;

        return (
            <View className={clsx(
                "p-5 rounded-2xl mb-3 border",
                isUnlocked ? "bg-sand border-stone" : "bg-cream border-stone opacity-60"
            )}>
                <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-warmGray text-sm font-medium tracking-wide">
                        {format(unlockDate, 'MMM d, yyyy')}
                    </Text>
                    <Text className="text-xs text-warmGray uppercase tracking-wide">
                        {isMeSender ? "Sent" : "Received"}
                    </Text>
                </View>

                <View>
                    {isMeSender ? (
                        <Text className="text-charcoal leading-6">{item.content}</Text>
                    ) : (
                        locked ? (
                            <Text className="text-warmGray italic">Sealed until the date</Text>
                        ) : (
                            <View>
                                {unlockingToday && !item.opened && (
                                    <Text className="text-terracotta text-sm font-medium mb-2">Ready to open</Text>
                                )}
                                <Text className="text-charcoal leading-6">
                                    {item.opened ? item.content : "Go to Today to reveal"}
                                </Text>
                            </View>
                        )
                    )}
                </View>

                <View className="mt-3 pt-3 border-t border-stone">
                    <Text className="text-xs text-warmGray">
                        {item.opened ? "Opened" : (locked ? "Locked" : "Ready")}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-cream px-8 pt-8">
            <Text className="text-3xl font-light text-charcoal mb-2">Timeline</Text>
            <Text className="text-warmGray mb-8">Your sealed moments</Text>

            {loading ? (
                <ActivityIndicator size="large" color="#C4A484" />
            ) : (
                <FlatList
                    data={messages}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <Text className="text-center text-warmGray mt-10">No messages yet</Text>
                    }
                />
            )}
        </SafeAreaView>
    );
}

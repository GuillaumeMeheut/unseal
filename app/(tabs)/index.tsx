import { format } from 'date-fns';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, Alert, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScratchCard from '../../components/ScratchCard';
import { useMarkMessageOpened, useTodaysMessage } from '../../hooks/queries';

export default function DailyUnlock() {
  const { data: todaysMessage, isLoading: loading, refetch } = useTodaysMessage();
  const { mutateAsync: markOpened } = useMarkMessageOpened();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleReveal = async () => {
    if (!todaysMessage) return;
    try {
      await markOpened(todaysMessage.id);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-cream px-8 pt-8">
      <Text className="text-3xl font-light text-charcoal mb-2">Today</Text>
      <Text className="text-warmGray mb-10">
        {todaysMessage ? 'Something special awaits' : 'Check back later'}
      </Text>

      <View className="flex-1 justify-center">
        {loading ? (
          <ActivityIndicator size="large" color="#C4A484" />
        ) : todaysMessage ? (
          <View className="w-full">
            {todaysMessage.opened ? (
              <View className="w-full h-[280px] bg-sand rounded-2xl p-8 items-center justify-center border border-stone">
                <Text className="text-warmGray text-sm font-medium tracking-wide uppercase mb-4">
                  {format(new Date(todaysMessage.unlock_date), 'MMMM d, yyyy')}
                </Text>
                <Text className="text-xl text-charcoal text-center font-light leading-8">
                  {todaysMessage.content}
                </Text>
              </View>
            ) : (
              <ScratchCard onReveal={handleReveal}>
                <View className="w-full h-full bg-sand rounded-2xl p-8 items-center justify-center border border-stone">
                  <Text className="text-warmGray text-sm font-medium tracking-wide uppercase mb-4">
                    {format(new Date(todaysMessage.unlock_date), 'MMMM d, yyyy')}
                  </Text>
                  <Text className="text-xl text-charcoal text-center font-light leading-8">
                    {todaysMessage.content}
                  </Text>
                </View>
              </ScratchCard>
            )}
          </View>
        ) : (
          <View className="items-center">
            <View className="w-16 h-16 bg-sand rounded-2xl mb-6 items-center justify-center border border-stone">
              <View className="w-6 h-6 bg-stone rounded-lg" />
            </View>
            <Text className="text-lg text-charcoal font-light mb-2">Nothing today</Text>
            <Text className="text-center text-warmGray leading-6">
              Your partner hasn't sent you{'\n'}an unlocked message yet.
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

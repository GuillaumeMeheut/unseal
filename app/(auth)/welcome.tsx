import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';

export default function Welcome() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-cream px-8 pt-16 pb-12">
            <View className="flex-1 justify-center">
                {/* Minimal Logo Mark */}
                <View className="w-20 h-20 bg-sand rounded-3xl mb-12 items-center justify-center border border-stone">
                    <View className="w-8 h-8 bg-terracotta rounded-xl opacity-80" />
                </View>

                <Text className="text-5xl font-light text-charcoal tracking-tight mb-3">
                    Unseal
                </Text>
                <Text className="text-lg text-warmGray leading-7">
                    Messages that open{'\n'}when the moment is right.
                </Text>
            </View>

            <View className="w-full">
                <Button
                    title="Get Started"
                    onPress={() => router.push('/(auth)/login')}
                />
            </View>
        </SafeAreaView>
    );
}

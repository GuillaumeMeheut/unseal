import { format } from 'date-fns';
import { useEffect } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated, {
    FadeIn,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';

interface Step3ReviewSealProps {
    date: Date;
    content: string;
}

export function Step3ReviewSeal({ date, content }: Step3ReviewSealProps) {
    const cardScale = useSharedValue(0.95);
    const cardOpacity = useSharedValue(0);

    useEffect(() => {
        cardScale.value = withSpring(1, { damping: 12 });
        cardOpacity.value = withTiming(1, { duration: 400 });
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: cardScale.value }],
        opacity: cardOpacity.value,
    }));

    return (
        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
            <View className="pt-4 pb-6">
                <Text className="text-3xl font-light text-snowWhite mb-2">
                    Ready to seal?
                </Text>
                <Text className="text-lavender mb-8">
                    Review your message before sealing
                </Text>

                <Animated.View
                    style={animatedStyle}
                    className="bg-plum rounded-3xl border border-grape overflow-hidden"
                >
                    {/* Envelope Header */}
                    <View className="bg-coral/10 p-4 border-b border-grape">
                        <View className="flex-row items-center gap-3">
                            <View className="w-12 h-12 rounded-full bg-coral items-center justify-center">
                                <Text className="text-2xl">💌</Text>
                            </View>
                            <View>
                                <Text className="text-snowWhite font-medium">Sealed message</Text>
                                <Text className="text-lavender text-sm">
                                    Opens on {format(date, 'MMM d, yyyy')}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Message Content */}
                    <View className="p-6">
                        <Text className="text-snowWhite text-lg leading-7">
                            {content || "No message written yet..."}
                        </Text>
                    </View>

                    {/* Footer */}
                    <View className="px-6 pb-6">
                        <View className="h-px bg-grape mb-4" />
                        <Text className="text-lavender text-sm text-center">
                            This message will be locked until the unlock date
                        </Text>
                    </View>
                </Animated.View>

                {!content.trim() && (
                    <Animated.View
                        entering={FadeIn.delay(200)}
                        className="mt-4 p-4 bg-coral/10 rounded-xl border border-coral/30"
                    >
                        <Text className="text-coral text-center">
                            ⚠️ Don't forget to write your message!
                        </Text>
                    </Animated.View>
                )}
            </View>
        </ScrollView>
    );
}

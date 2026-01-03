import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { QUICK_EMOJIS } from './constants';

interface Step2MessageCompositionProps {
    content: string;
    onContentChange: (text: string) => void;
    dailyPrompts: string[];
    onPromptSelect: (prompt: string) => void;
    onEmojiAdd: (emoji: string) => void;
}

export function Step2MessageComposition({
    content,
    onContentChange,
    dailyPrompts,
    onPromptSelect,
    onEmojiAdd
}: Step2MessageCompositionProps) {
    return (
        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
            <View className="pt-4 pb-6">
                <Text className="text-3xl font-light text-snowWhite mb-2">
                    Write your message
                </Text>
                <Text className="text-lavender mb-6">
                    What would you like to say?
                </Text>

                {/* Message Input */}
                <View className="bg-plum rounded-2xl border border-grape mb-6">
                    <TextInput
                        value={content}
                        onChangeText={onContentChange}
                        placeholder="Start typing your message..."
                        placeholderTextColor="#8B92A8"
                        multiline
                        numberOfLines={6}
                        className="p-4 text-snowWhite text-base min-h-[160px]"
                        textAlignVertical="top"
                        style={{ fontSize: 16, lineHeight: 24 }}
                    />
                    <View className="px-4 pb-3 flex-row justify-between items-center border-t border-grape pt-3">
                        <Text className="text-lavender text-sm">
                            {content.length} characters
                        </Text>
                        <View className="flex-row gap-2">
                            {QUICK_EMOJIS.slice(0, 4).map((emoji) => (
                                <Pressable
                                    key={emoji}
                                    onPress={() => onEmojiAdd(emoji)}
                                    className="w-8 h-8 items-center justify-center"
                                >
                                    <Text className="text-xl">{emoji}</Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Daily Prompts */}
                <View className="mb-4">
                    <Text className="text-lavender text-sm font-medium mb-3 tracking-wide uppercase">
                        Today's inspiration ✨
                    </Text>
                    <View className="gap-2">
                        {dailyPrompts.map((prompt, index) => (
                            <PromptChip
                                key={index}
                                prompt={prompt}
                                onPress={() => onPromptSelect(prompt)}
                                isSelected={content === prompt}
                            />
                        ))}
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

// Prompt Chip Component
interface PromptChipProps {
    prompt: string;
    onPress: () => void;
    isSelected: boolean;
}

function PromptChip({ prompt, onPress, isSelected }: PromptChipProps) {
    const scale = useSharedValue(1);

    const handlePressIn = () => {
        scale.value = withSpring(0.97, { damping: 15 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 10 });
        onPress();
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
            <Animated.View
                style={animatedStyle}
                className={`p-4 rounded-xl ${isSelected
                        ? 'bg-coral/20 border-coral'
                        : 'bg-plum border-grape'
                    } border`}
            >
                <Text className={`text-base ${isSelected ? 'text-coral' : 'text-snowWhite'}`}>
                    "{prompt}"
                </Text>
            </Animated.View>
        </Pressable>
    );
}

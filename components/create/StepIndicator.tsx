import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
    SharedValue,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
} from 'react-native-reanimated';

interface StepIndicatorProps {
    step: number;
    currentStep: number;
    label: string;
}

export function StepIndicator({ step, currentStep, label }: StepIndicatorProps) {
    const isActive = currentStep >= step;
    const isCurrent = currentStep === step;
    const scale = useSharedValue(1);

    useEffect(() => {
        if (isCurrent) {
            scale.value = withSequence(
                withSpring(1.2, { damping: 8 }),
                withSpring(1, { damping: 10 })
            );
        }
    }, [isCurrent]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <View className="items-center">
            <Animated.View
                style={animatedStyle}
                className={`w-8 h-8 rounded-full items-center justify-center ${isActive ? 'bg-coral' : 'bg-grape'
                    }`}
            >
                <Text className={`text-sm font-semibold ${isActive ? 'text-midnight' : 'text-lavender'}`}>
                    {step}
                </Text>
            </Animated.View>
            <Text className={`text-xs mt-1 ${isCurrent ? 'text-coral' : 'text-lavender'}`}>
                {label}
            </Text>
        </View>
    );
}

interface ProgressBarProps {
    progress: SharedValue<number>;
}

export function ProgressBar({ progress }: ProgressBarProps) {
    const animatedStyle = useAnimatedStyle(() => ({
        width: `${progress.value * 100}%`,
    }));

    return (
        <Animated.View
            style={animatedStyle}
            className="h-full bg-coral rounded-full"
        />
    );
}

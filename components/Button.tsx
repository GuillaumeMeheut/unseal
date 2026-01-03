import clsx from 'clsx';
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

interface ButtonProps {
    onPress: () => void;
    title: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    className?: string;
    isLoading?: boolean;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function Button({ onPress, title, variant = 'primary', className, isLoading }: ButtonProps) {
    const scale = useSharedValue(1);

    const handlePressIn = () => {
        scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 400 });
        onPress();
    };

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    const baseStyles = "py-4 px-8 rounded-2xl items-center justify-center";

    const variants = {
        primary: "bg-coral",
        secondary: "bg-plum border border-grape",
        outline: "border border-lavender bg-transparent",
        ghost: "bg-transparent",
    };

    const textStyles = {
        primary: "text-midnight font-semibold text-base tracking-wide",
        secondary: "text-snowWhite font-medium text-base",
        outline: "text-lavender font-medium text-base",
        ghost: "text-lavender font-medium text-base",
    };

    return (
        <AnimatedTouchableOpacity
            activeOpacity={0.9}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={isLoading}
            className={clsx(baseStyles, variants[variant], className, isLoading && "opacity-60")}
            style={animatedStyle}
        >
            {isLoading ? (
                <ActivityIndicator color={variant === 'primary' ? '#1A1625' : '#F8F7FF'} />
            ) : (
                <Text className={clsx(textStyles[variant])}>{title}</Text>
            )}
        </AnimatedTouchableOpacity>
    );
}


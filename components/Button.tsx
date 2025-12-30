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
        primary: "bg-charcoal",
        secondary: "bg-sand border border-stone",
        outline: "border border-charcoal bg-transparent",
        ghost: "bg-transparent",
    };

    const textStyles = {
        primary: "text-cream font-medium text-base tracking-wide",
        secondary: "text-charcoal font-medium text-base",
        outline: "text-charcoal font-medium text-base",
        ghost: "text-warmGray font-medium text-base",
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
                <ActivityIndicator color={variant === 'primary' ? '#FAF8F5' : '#3D3A36'} />
            ) : (
                <Text className={clsx(textStyles[variant])}>{title}</Text>
            )}
        </AnimatedTouchableOpacity>
    );
}

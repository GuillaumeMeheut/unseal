import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

interface ScratchCardProps {
    children: React.ReactNode;
    onReveal?: () => void;
    style?: any;
}

export default function ScratchCard({ children, onReveal, style }: ScratchCardProps) {
    const [isRevealed, setIsRevealed] = useState(false);
    const opacity = useSharedValue(1);
    const totalDistance = useSharedValue(0);
    const REVEAL_THRESHOLD = 400;

    const panGesture = Gesture.Pan()
        .onChange((event) => {
            if (isRevealed) return;

            const distance = Math.sqrt(event.changeX ** 2 + event.changeY ** 2);
            totalDistance.value += distance;

            const newOpacity = Math.max(0, 1 - totalDistance.value / REVEAL_THRESHOLD);
            opacity.value = newOpacity;

            if (totalDistance.value > REVEAL_THRESHOLD && !isRevealed) {
                runOnJS(handleReveal)();
            }
        });

    function handleReveal() {
        setIsRevealed(true);
        if (onReveal) onReveal();
        opacity.value = withTiming(0, { duration: 400 });
    }

    const overlayStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
        };
    });

    return (
        <View style={[styles.container, style]}>
            <View style={styles.hiddenContent}>
                {children}
            </View>

            {!isRevealed && (
                <GestureDetector gesture={panGesture}>
                    <Animated.View style={[styles.overlay, overlayStyle]}>
                        <View style={styles.overlayContent}>
                            <Text style={styles.overlayText}>Swipe to reveal</Text>
                        </View>
                    </Animated.View>
                </GestureDetector>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 280,
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
    },
    hiddenContent: {
        width: '100%',
        height: '100%',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#C4A484',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
    },
    overlayContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    overlayText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#FAF8F5',
        letterSpacing: 1,
    }
});

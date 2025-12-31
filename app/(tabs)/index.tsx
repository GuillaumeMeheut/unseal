import { format } from 'date-fns';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMarkMessageOpened, useTodaysMessage } from '../../hooks/queries';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SEAL_SIZE = 80;
const ENVELOPE_HEIGHT = 320;
const PARTICLE_COUNT = 12;

// Floating heart particle component
function FloatingParticle({ delay, x, y }: { delay: number; x: number; y: number }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    const randomX = (Math.random() - 0.5) * 120;
    const randomRotation = (Math.random() - 0.5) * 60;

    opacity.value = withDelay(delay, withSequence(
      withTiming(1, { duration: 300 }),
      withDelay(800, withTiming(0, { duration: 600 }))
    ));
    translateY.value = withDelay(delay, withTiming(-180 - Math.random() * 80, {
      duration: 1600,
      easing: Easing.out(Easing.cubic)
    }));
    translateX.value = withDelay(delay, withTiming(randomX, {
      duration: 1600,
      easing: Easing.out(Easing.cubic)
    }));
    scale.value = withDelay(delay, withSequence(
      withSpring(1 + Math.random() * 0.5, { damping: 8 }),
      withDelay(600, withTiming(0.3, { duration: 600 }))
    ));
    rotation.value = withDelay(delay, withTiming(randomRotation, { duration: 1600 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const hearts = ['💕', '✨', '💗', '💝', '🌸', '💖'];
  const heart = hearts[Math.floor(Math.random() * hearts.length)];

  return (
    <Animated.View style={[{ position: 'absolute', left: x, top: y }, animatedStyle]}>
      <Text style={{ fontSize: 24 }}>{heart}</Text>
    </Animated.View>
  );
}

// Glowing seal component
function WaxSeal({ onPress, isPressed }: { onPress: () => void; isPressed: boolean }) {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0.3);
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Subtle pulsing glow animation
    glow.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    // Subtle floating rotation
    rotation.value = withRepeat(
      withSequence(
        withTiming(3, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-3, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  useEffect(() => {
    if (isPressed) {
      scale.value = withSpring(0.9, { damping: 15 });
    } else {
      scale.value = withSpring(1, { damping: 8, stiffness: 200 });
    }
  }, [isPressed]);

  const sealStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [{ scale: 1.4 }],
  }));

  return (
    <Pressable onPress={onPress}>
      <View style={styles.sealContainer}>
        <Animated.View style={[styles.sealGlow, glowStyle]} />
        <Animated.View style={[styles.seal, sealStyle]}>
          <Text style={styles.sealIcon}>💌</Text>
        </Animated.View>
      </View>
    </Pressable>
  );
}

// Progress ring for hold-to-reveal
function ProgressRing({ progress }: { progress: { value: number } }) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(progress.value, [0, 1], [1, 1.15]) }],
    opacity: interpolate(progress.value, [0, 0.1, 1], [0, 1, 1]),
  }));

  return (
    <Animated.View style={[styles.progressRing, animatedStyle]}>
      <View style={styles.progressRingInner} />
    </Animated.View>
  );
}

export default function DailyUnlock() {
  const { data: todaysMessage, isLoading: loading, refetch } = useTodaysMessage();
  const { mutateAsync: markOpened } = useMarkMessageOpened();

  const [isRevealing, setIsRevealing] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Animation values
  const envelopeScale = useSharedValue(1);
  const flapRotation = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(40);
  const holdProgress = useSharedValue(0);
  const shimmer = useSharedValue(0);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  // Shimmer animation for the envelope
  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const handlePressIn = () => {
    if (todaysMessage?.opened || isRevealing) return;
    setIsPressed(true);
    holdProgress.value = withTiming(1, { duration: 1200 });

    pressTimerRef.current = setTimeout(() => {
      handleReveal();
    }, 1200);
  };

  const handlePressOut = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
    }
    setIsPressed(false);
    if (!isRevealing) {
      holdProgress.value = withTiming(0, { duration: 200 });
    }
  };

  const handleReveal = async () => {
    if (!todaysMessage || isRevealing) return;

    setIsRevealing(true);
    setShowParticles(true);

    // Envelope opening animation sequence
    envelopeScale.value = withSpring(1.05, { damping: 12 });

    // Flap opens up
    flapRotation.value = withSequence(
      withSpring(-180, { damping: 15, stiffness: 100 })
    );

    // Content slides up and fades in
    setTimeout(() => {
      contentOpacity.value = withSpring(1, { damping: 20 });
      contentTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });
    }, 400);

    // Mark as opened in backend
    try {
      await markOpened(todaysMessage.id);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  const handleSealPress = () => {
    // Quick tap reveals with nice animation
    handleReveal();
  };

  // Animated styles
  const envelopeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: envelopeScale.value }],
  }));

  const flapStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 800 },
      { rotateX: `${flapRotation.value}deg` },
    ],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(shimmer.value, [0, 1], [-200, 400]) }],
  }));

  // Generate particles positions
  const particlePositions = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    x: SCREEN_WIDTH / 2 - 50 + (Math.random() - 0.5) * 100,
    y: ENVELOPE_HEIGHT / 2,
    delay: i * 80,
  }));

  const isMessageOpened = todaysMessage?.opened || (isRevealing && contentOpacity.value > 0.5);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>
          {getGreeting()},
        </Text>
        <Text style={styles.title}>
          {todaysMessage && !todaysMessage.opened
            ? "A message awaits ✨"
            : todaysMessage?.opened
              ? "Today's love note 💕"
              : "Nothing new today"
          }
        </Text>
      </View>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#C4A484" />
            <Text style={styles.loadingText}>Checking for messages...</Text>
          </View>
        ) : todaysMessage ? (
          <View style={styles.envelopeContainer}>
            {/* Floating particles on reveal */}
            {showParticles && particlePositions.map((pos, i) => (
              <FloatingParticle key={i} delay={pos.delay} x={pos.x - SCREEN_WIDTH / 2 + 50} y={pos.y} />
            ))}

            <Pressable
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              disabled={todaysMessage.opened || isRevealing}
            >
              <Animated.View style={[styles.envelope, envelopeStyle]}>
                {/* Shimmer overlay */}
                {!todaysMessage.opened && !isRevealing && (
                  <Animated.View style={[styles.shimmer, shimmerStyle]} />
                )}

                {/* Envelope flap (for unopened) */}
                {!todaysMessage.opened && !isRevealing && (
                  <Animated.View style={[styles.flap, flapStyle]}>
                    <View style={styles.flapInner} />
                  </Animated.View>
                )}

                {/* Message content */}
                {todaysMessage.opened ? (
                  // Already opened - show without animation
                  <View style={styles.messageContent}>
                    <Text style={styles.dateLabel}>
                      {format(new Date(todaysMessage.unlock_date), 'MMMM d, yyyy')}
                    </Text>
                    <View style={styles.divider} />
                    <Text style={styles.messageText}>
                      {todaysMessage.content}
                    </Text>
                  </View>
                ) : isRevealing ? (
                  // Currently revealing - show with animation
                  <Animated.View style={[styles.messageContent, contentStyle]}>
                    <Text style={styles.dateLabel}>
                      {format(new Date(todaysMessage.unlock_date), 'MMMM d, yyyy')}
                    </Text>
                    <View style={styles.divider} />
                    <Text style={styles.messageText}>
                      {todaysMessage.content}
                    </Text>
                  </Animated.View>
                ) : (
                  // Not opened yet - show seal
                  <View style={styles.sealWrapper}>
                    <WaxSeal onPress={handleSealPress} isPressed={isPressed} />
                    <ProgressRing progress={holdProgress} />
                  </View>
                )}
              </Animated.View>
            </Pressable>

            {/* Instruction text */}
            {!todaysMessage.opened && !isRevealing && (
              <Text style={styles.instructionText}>
                Hold to unseal your message
              </Text>
            )}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyEnvelope}>
              <Text style={styles.emptyIcon}>📭</Text>
            </View>
            <Text style={styles.emptyTitle}>No message today</Text>
            <Text style={styles.emptySubtitle}>
              Your partner hasn't sent you{'\n'}a message for today yet.
            </Text>
            <Text style={styles.emptyHint}>
              Why not send them one? 💕
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  header: {
    paddingHorizontal: 32,
    paddingTop: 24,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 16,
    color: '#9A948A',
    fontWeight: '400',
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    color: '#3D3A36',
    fontWeight: '300',
    letterSpacing: -0.5,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#9A948A',
  },
  envelopeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  envelope: {
    width: SCREEN_WIDTH - 48,
    minHeight: ENVELOPE_HEIGHT,
    backgroundColor: '#F5F0E8',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#C4A484',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E8E2D9',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 100,
    backgroundColor: 'rgba(255,255,255,0.4)',
    transform: [{ skewX: '-20deg' }],
  },
  flap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    zIndex: 10,
    transformOrigin: 'top',
  },
  flapInner: {
    flex: 1,
    backgroundColor: '#E8E2D9',
    borderBottomLeftRadius: 80,
    borderBottomRightRadius: 80,
  },
  sealWrapper: {
    flex: 1,
    height: ENVELOPE_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sealContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sealGlow: {
    position: 'absolute',
    width: SEAL_SIZE + 40,
    height: SEAL_SIZE + 40,
    borderRadius: (SEAL_SIZE + 40) / 2,
    backgroundColor: '#D4B5A0',
  },
  seal: {
    width: SEAL_SIZE,
    height: SEAL_SIZE,
    borderRadius: SEAL_SIZE / 2,
    backgroundColor: '#C4A484',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3D3A36',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  sealIcon: {
    fontSize: 36,
  },
  progressRing: {
    position: 'absolute',
    width: SEAL_SIZE + 30,
    height: SEAL_SIZE + 30,
    borderRadius: (SEAL_SIZE + 30) / 2,
    borderWidth: 3,
    borderColor: '#A8B5A0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRingInner: {
    width: SEAL_SIZE + 20,
    height: SEAL_SIZE + 20,
    borderRadius: (SEAL_SIZE + 20) / 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  messageContent: {
    padding: 32,
    paddingTop: 40,
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 12,
    color: '#9A948A',
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  divider: {
    width: 40,
    height: 2,
    backgroundColor: '#E8E2D9',
    borderRadius: 1,
    marginBottom: 24,
  },
  messageText: {
    fontSize: 20,
    color: '#3D3A36',
    textAlign: 'center',
    fontWeight: '300',
    lineHeight: 32,
    letterSpacing: 0.3,
  },
  loveSignature: {
    marginTop: 32,
  },
  signatureEmoji: {
    fontSize: 28,
  },
  instructionText: {
    marginTop: 32,
    fontSize: 14,
    color: '#9A948A',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyEnvelope: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: '#F5F0E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E8E2D9',
  },
  emptyIcon: {
    fontSize: 44,
  },
  emptyTitle: {
    fontSize: 22,
    color: '#3D3A36',
    fontWeight: '300',
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#9A948A',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  emptyHint: {
    fontSize: 14,
    color: '#C4A484',
    fontWeight: '500',
  },
});

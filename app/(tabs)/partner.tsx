import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    Share,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthProvider';
import {
    useAcceptPartnerRequest,
    useCancelPartnerRequest,
    usePartner,
    usePendingRequest,
    useRelationshipStats,
    useSentRequest,
} from '../../hooks/queries';

export default function PartnerScreen() {
    const { user } = useAuth();
    const { data: partnerId, isLoading: isLoadingPartner } = usePartner();
    const { data: pendingRequest, isLoading: isLoadingPending } = usePendingRequest();
    const { data: sentRequest, isLoading: isLoadingSent } = useSentRequest();
    const { data: stats, isLoading: isLoadingStats } = useRelationshipStats();
    const { mutateAsync: acceptRequest, isPending: isAccepting } = useAcceptPartnerRequest();
    const { mutateAsync: cancelRequest, isPending: isCanceling } = useCancelPartnerRequest();
    const router = useRouter();

    const [relationshipDate, setRelationshipDate] = useState<Date>(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    const myCode = user?.id;

    const handleShare = async () => {
        if (myCode) {
            await Share.share({
                message: `Join me on Unseal! Use my code to connect: ${myCode}`,
            });
        }
    };

    const handleCopyCode = async () => {
        if (myCode) {
            await Clipboard.setStringAsync(myCode);
            Alert.alert('Copied!', 'Invite code copied to clipboard');
        }
    };

    const handleAccept = async () => {
        if (!pendingRequest) return;
        try {
            await acceptRequest({
                partnershipId: pendingRequest.id,
                relationshipDate,
            });
            Alert.alert('Connected! 💕', "You're now partners!");
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    const handleDecline = async () => {
        if (!pendingRequest) return;
        Alert.alert(
            'Decline Request',
            'Are you sure you want to decline this request?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Decline',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await cancelRequest(pendingRequest.id);
                        } catch (error: any) {
                            Alert.alert('Error', error.message);
                        }
                    },
                },
            ]
        );
    };

    const handleCancelSent = async () => {
        if (!sentRequest) return;
        Alert.alert(
            'Cancel Request',
            'Are you sure you want to cancel your request?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await cancelRequest(sentRequest.id);
                        } catch (error: any) {
                            Alert.alert('Error', error.message);
                        }
                    },
                },
            ]
        );
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (isLoadingPartner || isLoadingPending || isLoadingSent) {
        return (
            <SafeAreaView className="flex-1 bg-midnight items-center justify-center">
                <ActivityIndicator color="#FF6B6B" size="large" />
            </SafeAreaView>
        );
    }

    // ----- PENDING REQUEST STATE (user received a request) -----
    if (pendingRequest) {
        return (
            <SafeAreaView className="flex-1 bg-midnight">
                <ScrollView
                    contentContainerClassName="flex-grow px-6 pt-6 pb-8"
                    showsVerticalScrollIndicator={false}
                >
                    <Animated.View entering={FadeInDown.delay(100).duration(500)}>
                        <Text className="text-3xl font-light text-snowWhite mb-2">
                            Partner Request
                        </Text>
                        <Text className="text-lavender mb-8 leading-6">
                            Someone wants to connect with you!
                        </Text>
                    </Animated.View>

                    <Animated.View
                        entering={FadeInUp.delay(200).duration(500)}
                        className="bg-plum p-6 rounded-3xl border border-grape mb-5"
                    >
                        <View className="items-center mb-6">
                            <View className="w-20 h-20 rounded-full bg-rose/20 items-center justify-center mb-4">
                                <Ionicons name="heart" size={40} color="#FF8FA3" />
                            </View>
                            <Text className="text-snowWhite text-lg font-medium">
                                Partnership Request
                            </Text>
                            <Text className="text-lavender text-sm mt-1">
                                Accept to start your journey
                            </Text>
                        </View>

                        <View className="mb-4">
                            <Text className="text-lavender text-sm font-medium mb-3 tracking-wide uppercase">
                                Since when are you together? 💕
                            </Text>
                            <TouchableOpacity
                                onPress={() => setShowDatePicker(true)}
                                className="bg-grape p-4 rounded-xl"
                            >
                                <Text className="text-snowWhite text-center">
                                    {formatDate(relationshipDate)}
                                </Text>
                            </TouchableOpacity>
                            {showDatePicker && (
                                <DateTimePicker
                                    value={relationshipDate}
                                    mode="date"
                                    display="spinner"
                                    maximumDate={new Date()}
                                    onChange={(event, selectedDate) => {
                                        setShowDatePicker(Platform.OS === 'ios');
                                        if (selectedDate) {
                                            setRelationshipDate(selectedDate);
                                        }
                                    }}
                                />
                            )}
                        </View>

                        <View className="gap-3">
                            <Button
                                title="Accept"
                                variant="primary"
                                onPress={handleAccept}
                                isLoading={isAccepting}
                            />
                            <Button
                                title="Decline"
                                variant="ghost"
                                onPress={handleDecline}
                                isLoading={isCanceling}
                            />
                        </View>
                    </Animated.View>
                </ScrollView>
            </SafeAreaView>
        );
    }

    // ----- SENT REQUEST STATE (waiting for partner) -----
    if (sentRequest) {
        return (
            <SafeAreaView className="flex-1 bg-midnight">
                <ScrollView
                    contentContainerClassName="flex-grow px-6 pt-6 pb-8"
                    showsVerticalScrollIndicator={false}
                >
                    <Animated.View entering={FadeInDown.delay(100).duration(500)}>
                        <Text className="text-3xl font-light text-snowWhite mb-2">
                            Partner
                        </Text>
                        <Text className="text-lavender mb-8 leading-6">
                            Waiting for your partner to accept...
                        </Text>
                    </Animated.View>

                    <Animated.View
                        entering={FadeInUp.delay(200).duration(500)}
                        className="bg-plum p-6 rounded-3xl border border-grape mb-5 items-center"
                    >
                        <Text className="text-6xl mb-4">⏳</Text>
                        <Text className="text-snowWhite text-lg font-medium">
                            Request Pending
                        </Text>
                        <Text className="text-lavender text-center text-sm mt-2">
                            Ask your partner to check their Partner tab
                        </Text>
                        <Button
                            title="Cancel Request"
                            variant="ghost"
                            onPress={handleCancelSent}
                            isLoading={isCanceling}
                            className="mt-4"
                        />
                    </Animated.View>
                </ScrollView>
            </SafeAreaView>
        );
    }

    // ----- NOT PAIRED STATE -----
    if (!partnerId) {
        return (
            <SafeAreaView className="flex-1 bg-midnight">
                <ScrollView
                    contentContainerClassName="flex-grow px-6 pt-6 pb-8"
                    showsVerticalScrollIndicator={false}
                >
                    <Animated.View entering={FadeInDown.delay(100).duration(500)}>
                        <Text className="text-3xl font-light text-snowWhite mb-2">
                            Partner
                        </Text>
                        <Text className="text-lavender mb-8 leading-6">
                            Connect with your special someone to start{'\n'}exchanging sealed messages.
                        </Text>
                    </Animated.View>

                    {/* Your Code Card */}
                    <Animated.View
                        entering={FadeInUp.delay(200).duration(500)}
                        className="bg-plum p-6 rounded-3xl border border-grape mb-5 shadow-sm"
                    >
                        <View className="flex-row items-center mb-4">
                            <View className="w-10 h-10 rounded-full bg-mint/20 items-center justify-center mr-3">
                                <Ionicons name="heart" size={20} color="#4ECDC4" />
                            </View>
                            <Text className="text-lavender text-sm font-medium tracking-wide uppercase">
                                Your Invite Code
                            </Text>
                        </View>
                        <TouchableOpacity onPress={handleCopyCode} activeOpacity={0.7}>
                            <Text className="text-snowWhite font-mono text-xs mb-4 bg-grape/80 p-4 rounded-xl overflow-hidden">
                                {myCode || 'Loading...'}
                            </Text>
                            <Text className="text-lavender text-xs text-center -mt-2 mb-2">Tap to copy</Text>
                        </TouchableOpacity>
                        <Button
                            title="Share Invite"
                            variant="secondary"
                            onPress={handleShare}
                        />
                    </Animated.View>

                    {/* Connect Button */}
                    <Animated.View entering={FadeInUp.delay(300).duration(500)}>
                        <Button
                            title="Connect with Partner"
                            variant="primary"
                            onPress={() => router.push('/(onboarding)/pairing')}
                        />
                    </Animated.View>
                </ScrollView>
            </SafeAreaView>
        );
    }

    // ----- PAIRED STATE -----
    return (
        <SafeAreaView className="flex-1 bg-midnight">
            <ScrollView
                contentContainerClassName="flex-grow px-6 pt-6 pb-8"
                showsVerticalScrollIndicator={false}
            >
                <Animated.View entering={FadeInDown.delay(100).duration(500)}>
                    <Text className="text-3xl font-light text-snowWhite mb-2">
                        Partner
                    </Text>
                    <Text className="text-lavender mb-6 leading-6">
                        You're connected! Here's your journey together.
                    </Text>
                </Animated.View>

                {/* Connection Status Card */}
                <Animated.View
                    entering={FadeInUp.delay(200).duration(500)}
                    className="bg-plum p-6 rounded-3xl border border-grape mb-5 shadow-sm"
                >
                    <View className="flex-row items-center justify-center mb-4">
                        <View className="w-14 h-14 rounded-full bg-mint/20 items-center justify-center">
                            <Ionicons name="person" size={24} color="#4ECDC4" />
                        </View>
                        <View className="mx-4">
                            <View className="w-12 h-0.5 bg-coral" />
                            <View className="items-center -mt-2">
                                <Ionicons name="heart" size={16} color="#FF6B6B" />
                            </View>
                        </View>
                        <View className="w-14 h-14 rounded-full bg-rose/20 items-center justify-center">
                            <Ionicons name="person" size={24} color="#FF8FA3" />
                        </View>
                    </View>
                    <Text className="text-snowWhite text-center font-medium text-lg">
                        Connected 💕
                    </Text>
                    <Text className="text-lavender text-center text-sm mt-1">
                        Sharing sealed moments together
                    </Text>
                </Animated.View>

                {/* Stats Grid */}
                {isLoadingStats ? (
                    <View className="py-8 items-center">
                        <ActivityIndicator color="#FF6B6B" />
                    </View>
                ) : (
                    <Animated.View entering={FadeInUp.delay(300).duration(500)}>
                        <View className="flex-row mb-4">
                            {/* Total Messages */}
                            <View className="flex-1 bg-plum p-5 rounded-2xl border border-grape mr-2">
                                <View className="w-10 h-10 rounded-full bg-coral/20 items-center justify-center mb-3">
                                    <Ionicons name="mail" size={20} color="#FF6B6B" />
                                </View>
                                <Text className="text-3xl font-semibold text-snowWhite">
                                    {stats?.totalMessages ?? 0}
                                </Text>
                                <Text className="text-lavender text-sm mt-1">
                                    Messages
                                </Text>
                            </View>

                            {/* Current Streak */}
                            <View className="flex-1 bg-plum p-5 rounded-2xl border border-grape ml-2">
                                <View className="w-10 h-10 rounded-full bg-gold/20 items-center justify-center mb-3">
                                    <Ionicons name="flame" size={20} color="#FFD93D" />
                                </View>
                                <Text className="text-3xl font-semibold text-snowWhite">
                                    {stats?.currentStreak ?? 0}
                                </Text>
                                <Text className="text-lavender text-sm mt-1">
                                    Day Streak 🔥
                                </Text>
                            </View>
                        </View>

                        {/* Days Together */}
                        <View className="bg-plum p-5 rounded-2xl border border-grape mb-6">
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 rounded-full bg-mint/20 items-center justify-center mr-4">
                                    <Ionicons name="calendar-outline" size={20} color="#4ECDC4" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-lavender text-sm">
                                        Days Together
                                    </Text>
                                    <Text className="text-2xl font-semibold text-snowWhite">
                                        {stats?.daysTogether ?? 0}
                                    </Text>
                                </View>
                                <Ionicons name="sparkles" size={24} color="#FFD93D" />
                            </View>
                        </View>
                    </Animated.View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}


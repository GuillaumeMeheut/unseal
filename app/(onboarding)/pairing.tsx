import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Share,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthProvider';
import { useSendPartnerRequest, useSentRequest } from '../../hooks/queries';

export default function Pairing() {
    const router = useRouter();
    const { user } = useAuth();
    const [partnerCode, setPartnerCode] = useState('');

    const { mutateAsync: sendRequest, isPending: loading } = useSendPartnerRequest();
    const { data: sentRequest } = useSentRequest();

    const myCode = user?.id;

    const handleShareCode = async () => {
        if (myCode) {
            try {
                await Share.share({
                    message: `Join me on Unseal! Use my code to connect: ${myCode}`,
                });
            } catch (error: any) {
                Alert.alert(error.message);
            }
        }
    };

    const handleCopyCode = async () => {
        if (myCode) {
            await Clipboard.setStringAsync(myCode);
            Alert.alert('Copied!', 'Invite code copied to clipboard');
        }
    };

    const handleSendRequest = async () => {
        if (!partnerCode.trim()) {
            Alert.alert("Missing code", "Please enter your partner's code");
            return;
        }

        if (partnerCode.trim() === myCode) {
            Alert.alert("Oops", "You cannot pair with yourself");
            return;
        }

        try {
            await sendRequest(partnerCode.trim());
            Alert.alert("Request Sent! 💕", "Waiting for your partner to accept");
        } catch (error: any) {
            Alert.alert("Error", error.message);
        }
    };

    // If already sent a request, show waiting state
    if (sentRequest) {
        return (
            <SafeAreaView className="flex-1 bg-midnight px-8 pt-8">
                <ScrollView
                    contentContainerClassName="flex-grow justify-center"
                    showsVerticalScrollIndicator={false}
                >
                    <Text className="text-3xl font-light text-snowWhite mb-2">
                        Request Sent
                    </Text>
                    <Text className="text-lavender mb-12 leading-6">
                        Waiting for your partner to accept your request...
                    </Text>

                    <View className="bg-plum p-6 rounded-2xl border border-grape items-center">
                        <Text className="text-6xl mb-4">⏳</Text>
                        <Text className="text-snowWhite text-center font-medium">
                            Pending Acceptance
                        </Text>
                        <Text className="text-lavender text-center text-sm mt-2">
                            Ask your partner to check their Partner tab
                        </Text>
                    </View>

                    <Button
                        title="Go to Home"
                        variant="ghost"
                        className="mt-8"
                        onPress={() => router.replace('/(tabs)')}
                    />
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-midnight px-8 pt-8">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView
                    contentContainerClassName="flex-grow justify-center"
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <Text className="text-3xl font-light text-snowWhite mb-2">
                        Find your person
                    </Text>
                    <Text className="text-lavender mb-12 leading-6">
                        Connect with someone special to start{'\n'}sending sealed messages.
                    </Text>

                    <View className="bg-plum p-6 rounded-2xl border border-grape mb-6">
                        <Text className="text-lavender text-sm font-medium mb-3 tracking-wide uppercase">
                            Your Code
                        </Text>
                        <TouchableOpacity onPress={handleCopyCode} activeOpacity={0.7}>
                            <Text className="text-snowWhite font-mono text-sm mb-4 bg-grape p-3 rounded-xl">
                                {myCode || 'Loading...'}
                            </Text>
                            <Text className="text-lavender text-xs text-center -mt-2 mb-2">Tap to copy</Text>
                        </TouchableOpacity>
                        <Button title="Share" variant="secondary" onPress={handleShareCode} />
                    </View>

                    <View className="bg-plum p-6 rounded-2xl border border-grape">
                        <Text className="text-lavender text-sm font-medium mb-3 tracking-wide uppercase">
                            Partner's Code
                        </Text>
                        <TextInput
                            placeholder="Paste code here"
                            value={partnerCode}
                            onChangeText={setPartnerCode}
                            autoCapitalize="none"
                            placeholderTextColor="#9B8AA8"
                            className="mb-4 bg-grape p-3 rounded-xl text-snowWhite"
                        />
                        <Button
                            title="Send Request"
                            onPress={handleSendRequest}
                            isLoading={loading}
                        />
                    </View>

                    <Button
                        title="Skip for now"
                        variant="ghost"
                        className="mt-8"
                        onPress={() => router.replace('/(tabs)')}
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}


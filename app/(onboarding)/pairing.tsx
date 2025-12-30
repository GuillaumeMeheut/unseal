import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Share, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthProvider';
import { usePairPartner } from '../../hooks/queries';

export default function Pairing() {
    const router = useRouter();
    const { user } = useAuth();
    const [partnerCode, setPartnerCode] = useState('');

    const { mutateAsync: pairPartner, isPending: loading } = usePairPartner();

    const myCode = user?.id;

    const handleCopyCode = async () => {
        if (myCode) {
            try {
                await Share.share({
                    message: `${myCode}`,
                });
            } catch (error: any) {
                Alert.alert(error.message);
            }
        }
    };

    const handlePair = async () => {
        if (!partnerCode) {
            Alert.alert("Missing code", "Please enter your partner's code");
            return;
        }

        if (partnerCode === myCode) {
            Alert.alert("Oops", "You cannot pair with yourself");
            return;
        }

        try {
            await pairPartner(partnerCode);
            Alert.alert("Connected", "You're now linked with your partner");
            router.replace('/(tabs)');
        } catch (error: any) {
            Alert.alert("Error", error.message);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-cream px-8 pt-8">
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
                    <Text className="text-3xl font-light text-charcoal mb-2">
                        Find your person
                    </Text>
                    <Text className="text-warmGray mb-12 leading-6">
                        Connect with someone special to start{'\n'}sending sealed messages.
                    </Text>

                    <View className="bg-sand p-6 rounded-2xl border border-stone mb-6">
                        <Text className="text-warmGray text-sm font-medium mb-3 tracking-wide uppercase">
                            Your Code
                        </Text>
                        <Text className="text-charcoal font-mono text-sm mb-4 bg-cream p-3 rounded-xl">
                            {myCode || 'Loading...'}
                        </Text>
                        <Button title="Share" variant="secondary" onPress={handleCopyCode} />
                    </View>

                    <View className="bg-sand p-6 rounded-2xl border border-stone">
                        <Text className="text-warmGray text-sm font-medium mb-3 tracking-wide uppercase">
                            Partner's Code
                        </Text>
                        <TextInput
                            placeholder="Paste code here"
                            value={partnerCode}
                            onChangeText={setPartnerCode}
                            autoCapitalize="none"
                            className="mb-0"
                        />
                        <Button title="Connect" onPress={handlePair} isLoading={loading} className="mt-4" />
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

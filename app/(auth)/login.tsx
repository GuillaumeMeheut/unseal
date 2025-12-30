import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { supabase } from '../../lib/supabase';

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const signInWithEmail = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) Alert.alert("Error", error.message);
        setLoading(false);
    };

    const signUpWithEmail = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) Alert.alert("Error", error.message);
        else Alert.alert("Check your inbox", "We sent you a verification email.");
        setLoading(false);
    };

    const handleOAuthLogin = async (provider: 'google' | 'apple') => {
        Alert.alert("Coming Soon", `${provider} login requires configured Supabase keys.`);
    };

    return (
        <SafeAreaView className="flex-1 bg-cream px-8 pt-8">
            <View className="flex-1 justify-center">
                <Text className="text-3xl font-light text-charcoal mb-2">
                    Welcome back
                </Text>
                <Text className="text-warmGray mb-10">
                    Sign in to continue
                </Text>

                <Input
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
                <Input
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <View className="flex-row gap-3 mt-2">
                    <View className="flex-1">
                        <Button
                            title="Sign In"
                            onPress={signInWithEmail}
                            isLoading={loading}
                        />
                    </View>
                    <View className="flex-1">
                        <Button
                            title="Sign Up"
                            variant="secondary"
                            onPress={signUpWithEmail}
                            isLoading={loading}
                        />
                    </View>
                </View>

                <View className="mt-10">
                    <View className="flex-row items-center mb-6">
                        <View className="flex-1 h-px bg-stone" />
                        <Text className="mx-4 text-warmGray text-sm">or</Text>
                        <View className="flex-1 h-px bg-stone" />
                    </View>

                    <Button
                        title="Continue with Apple"
                        variant="outline"
                        className="mb-3"
                        onPress={() => handleOAuthLogin('apple')}
                    />
                    <Button
                        title="Continue with Google"
                        variant="outline"
                        onPress={() => handleOAuthLogin('google')}
                    />
                </View>

                <Button
                    title="Back"
                    variant="ghost"
                    onPress={() => router.back()}
                    className="mt-8"
                />
            </View>
        </SafeAreaView>
    );
}

import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthProvider';
import { usePartner } from '../../hooks/queries';
import { supabase } from '../../lib/supabase';

export default function Settings() {
    const router = useRouter();
    const { user } = useAuth();
    const { data: partnerId } = usePartner();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.replace('/(auth)/welcome');
    };

    return (
        <SafeAreaView className="flex-1 bg-midnight px-8 pt-8">
            <Text className="text-3xl font-light text-snowWhite mb-10">Settings</Text>

            <View className="bg-plum p-6 rounded-2xl border border-grape mb-6">
                <View className="mb-6">
                    <Text className="text-lavender text-sm font-medium tracking-wide uppercase mb-2">
                        Account
                    </Text>
                    <Text className="text-snowWhite">{user?.email}</Text>
                </View>

                <View>
                    <Text className="text-lavender text-sm font-medium tracking-wide uppercase mb-2">
                        Partner
                    </Text>
                    <Text className={partnerId ? "text-mint" : "text-lavender"}>
                        {partnerId ? "Connected ✓" : "Not connected"}
                    </Text>
                </View>
            </View>

            <View className="gap-3">
                <Button
                    title="Change partner"
                    variant="secondary"
                    onPress={() => router.push('/(onboarding)/pairing')}
                />
                <Button
                    title="Sign out"
                    variant="outline"
                    onPress={handleLogout}
                />
            </View>

            <View className="flex-1 justify-end items-center pb-4">
                <Text className="text-lavender text-xs">Unseal v1.0.0</Text>
            </View>
        </SafeAreaView>
    );
}


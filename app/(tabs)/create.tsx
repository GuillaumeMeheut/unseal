import { addDays } from 'date-fns';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import CalendarPicker from '../../components/CalendarPicker';
import Input from '../../components/Input';
import { useCreateMessage, useExistingMessageDates, usePartner } from '../../hooks/queries';

export default function CreateMessage() {
    const router = useRouter();
    const [content, setContent] = useState('');
    const [date, setDate] = useState(addDays(new Date(), 1));

    const { data: partnerId } = usePartner();
    const { data: existingMessageDates = [] } = useExistingMessageDates();
    const { mutateAsync: createMessage, isPending: loading } = useCreateMessage();

    const handleDateSelect = (selectedDate: Date) => {
        setDate(selectedDate);
    };

    const handleSend = async () => {
        if (!content.trim()) {
            Alert.alert("Missing message", "Write something for your person");
            return;
        }

        if (!partnerId) {
            Alert.alert("No partner", "Connect with someone first");
            return;
        }

        try {
            await createMessage({ content, unlockDate: date });
            Alert.alert("Sealed", "Your message will open on the chosen date");
            setContent('');
            setDate(addDays(new Date(), 1));
            router.push('/(tabs)/calendar');
        } catch (error: any) {
            Alert.alert("Error", error.message);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-cream">
            <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
                <View className="pt-6 pb-4">
                    <Text className="text-3xl font-light text-charcoal mb-2">New message</Text>
                    <Text className="text-warmGray mb-6">Write something meaningful</Text>

                    <Input
                        label="Message"
                        multiline
                        numberOfLines={4}
                        className="h-28"
                        textAlignVertical="top"
                        value={content}
                        onChangeText={setContent}
                        placeholder="What would you like to say..."
                    />

                    <View className="mt-6">
                        <Text className="text-warmGray text-sm font-medium mb-3 tracking-wide uppercase">
                            Select unlock date
                        </Text>
                        <CalendarPicker
                            selectedDate={date}
                            onDateSelect={handleDateSelect}
                            minDate={new Date()}
                            disabledDates={existingMessageDates}
                        />
                    </View>
                </View>
            </ScrollView>

            <View className="px-6 pb-4">
                <Button title="Seal message" onPress={handleSend} isLoading={loading} />
            </View>
        </SafeAreaView>
    );
}

import { format } from 'date-fns';
import { ScrollView, Text, View } from 'react-native';
import CalendarPicker from '../CalendarPicker';

interface Step1DateSelectionProps {
    date: Date;
    onDateSelect: (date: Date) => void;
    existingMessageDates: Date[];
}

export function Step1DateSelection({
    date,
    onDateSelect,
    existingMessageDates
}: Step1DateSelectionProps) {
    return (
        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
            <View className="pt-4 pb-6">
                <Text className="text-3xl font-light text-snowWhite mb-2">
                    When should they{'\n'}receive this?
                </Text>
                <Text className="text-lavender mb-6">
                    Pick a special date for your message to unlock
                </Text>

                <CalendarPicker
                    selectedDate={date}
                    onDateSelect={onDateSelect}
                    minDate={new Date()}
                    disabledDates={existingMessageDates}
                />

                <View className="mt-6 bg-plum rounded-2xl p-4 border border-grape">
                    <Text className="text-lavender text-sm mb-1">Selected date</Text>
                    <Text className="text-snowWhite text-xl font-light">
                        {format(date, 'EEEE, MMMM d, yyyy')}
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}

import { addDays } from 'date-fns';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
import Animated, {
    FadeOut,
    SlideInLeft,
    SlideInRight,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import {
    getDailyPrompts,
    ProgressBar,
    Step,
    Step1DateSelection,
    Step2MessageComposition,
    Step3ReviewSeal,
    StepIndicator,
} from '../../components/create';
import { useCreateMessage, useExistingMessageDates, usePartner } from '../../hooks/queries';

export default function CreateMessage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>(1);
    const [direction, setDirection] = useState<'forward' | 'back'>('forward');
    const [content, setContent] = useState('');
    const [date, setDate] = useState(addDays(new Date(), 1));
    const [dailyPrompts] = useState(getDailyPrompts);

    const { data: partnerId } = usePartner();
    const { data: existingMessageDates = [] } = useExistingMessageDates();
    const { mutateAsync: createMessage, isPending: loading } = useCreateMessage();

    // Animation values for progress bars
    const progressWidth2 = useSharedValue(0);
    const progressWidth3 = useSharedValue(0);

    useEffect(() => {
        progressWidth2.value = withTiming(step >= 2 ? 1 : 0, { duration: 300 });
        progressWidth3.value = withTiming(step >= 3 ? 1 : 0, { duration: 300 });
    }, [step]);

    const handleDateSelect = (selectedDate: Date) => {
        setDate(selectedDate);
    };

    const handlePromptSelect = (prompt: string) => {
        setContent(prompt);
    };

    const handleEmojiAdd = (emoji: string) => {
        setContent(prev => prev + ' ' + emoji);
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
            Alert.alert("Sealed ✨", "Your message will open on the chosen date");
            setContent('');
            setDate(addDays(new Date(), 1));
            setStep(1);
            router.push('/(tabs)/calendar');
        } catch (error: any) {
            Alert.alert("Error", error.message);
        }
    };

    const nextStep = () => {
        if (step < 3) {
            setDirection('forward');
            setStep((step + 1) as Step);
        }
    };

    const prevStep = () => {
        if (step > 1) {
            setDirection('back');
            setStep((step - 1) as Step);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-midnight">
            {/* Progress Indicator */}
            <View className="px-6 pt-4 pb-2">
                <View className="flex-row items-center justify-between mb-6">
                    <StepIndicator step={1} currentStep={step} label="Date" />
                    <View className="flex-1 h-0.5 bg-grape mx-2">
                        <ProgressBar progress={progressWidth2} />
                    </View>
                    <StepIndicator step={2} currentStep={step} label="Message" />
                    <View className="flex-1 h-0.5 bg-grape mx-2">
                        <ProgressBar progress={progressWidth3} />
                    </View>
                    <StepIndicator step={3} currentStep={step} label="Seal" />
                </View>
            </View>

            {/* Step Content */}
            <View className="flex-1">
                {step === 1 && (
                    <Animated.View
                        entering={direction === 'forward' ? SlideInRight.duration(300) : SlideInLeft.duration(300)}
                        exiting={FadeOut.duration(150)}
                        className="flex-1"
                    >
                        <Step1DateSelection
                            date={date}
                            onDateSelect={handleDateSelect}
                            existingMessageDates={existingMessageDates}
                        />
                    </Animated.View>
                )}

                {step === 2 && (
                    <Animated.View
                        entering={direction === 'forward' ? SlideInRight.duration(300) : SlideInLeft.duration(300)}
                        exiting={FadeOut.duration(150)}
                        className="flex-1"
                    >
                        <Step2MessageComposition
                            content={content}
                            onContentChange={setContent}
                            dailyPrompts={dailyPrompts}
                            onPromptSelect={handlePromptSelect}
                            onEmojiAdd={handleEmojiAdd}
                        />
                    </Animated.View>
                )}

                {step === 3 && (
                    <Animated.View
                        entering={direction === 'forward' ? SlideInRight.duration(300) : SlideInLeft.duration(300)}
                        exiting={FadeOut.duration(150)}
                        className="flex-1"
                    >
                        <Step3ReviewSeal date={date} content={content} />
                    </Animated.View>
                )}
            </View>

            {/* Navigation Buttons */}
            <View className="px-6 pb-4">
                <View className="flex-row gap-3">
                    {step > 1 && (
                        <View className="flex-1">
                            <Button
                                title="Back"
                                onPress={prevStep}
                                variant="ghost"
                            />
                        </View>
                    )}
                    <View className="flex-1">
                        {step === 1 && (
                            <Button
                                title="Choose date →"
                                onPress={nextStep}
                            />
                        )}
                        {step === 2 && (
                            <Button
                                title="Review →"
                                onPress={nextStep}
                            />
                        )}
                        {step === 3 && (
                            <Button
                                title="Seal message ✨"
                                onPress={handleSend}
                                isLoading={loading}
                            />
                        )}
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

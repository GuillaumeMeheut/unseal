import clsx from 'clsx';
import {
    addDays,
    addMonths,
    eachDayOfInterval,
    endOfMonth,
    endOfWeek,
    format,
    isAfter,
    isBefore,
    isSameDay,
    isSameMonth,
    isToday,
    startOfMonth,
    startOfWeek,
} from 'date-fns';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
    FadeIn,
    FadeOut,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

interface CalendarPickerProps {
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
    minDate?: Date;
    maxDate?: Date;
    disabledDates?: Date[];
    messageDates?: Date[];
    className?: string;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function DayCell({
    date,
    isSelected,
    isCurrentMonth,
    isDisabled,
    hasMessage,
    onPress,
}: {
    date: Date;
    isSelected: boolean;
    isCurrentMonth: boolean;
    isDisabled: boolean;
    hasMessage: boolean;
    onPress: () => void;
}) {
    const scale = useSharedValue(1);
    const today = isToday(date);

    const handlePressIn = () => {
        if (!isDisabled) {
            scale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
        }
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <AnimatedPressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={isDisabled}
            style={animatedStyle}
            className={clsx(
                'w-10 h-10 rounded-full items-center justify-center mx-auto',
                isSelected && 'bg-indigo',
                !isSelected && today && 'border-2 border-gold',
                !isSelected && !today && !isDisabled && 'bg-transparent',
                hasMessage && !isSelected && 'bg-coral/20'
            )}
        >
            <Text
                className={clsx(
                    'text-base',
                    isSelected && 'text-snowWhite font-semibold',
                    !isSelected && isCurrentMonth && !isDisabled && 'text-snowWhite',
                    !isSelected && !isCurrentMonth && 'text-lavender/40',
                    isDisabled && !hasMessage && 'text-lavender/40',
                    hasMessage && isDisabled && 'text-lavender'
                )}
            >
                {format(date, 'd')}
            </Text>
            {hasMessage && !isSelected && (
                <View className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-coral" />
            )}
        </AnimatedPressable>
    );
}

export default function CalendarPicker({
    selectedDate,
    onDateSelect,
    minDate,
    maxDate,
    disabledDates = [],
    messageDates = [],
    className,
}: CalendarPickerProps) {
    const [currentMonth, setCurrentMonth] = useState(startOfMonth(selectedDate));

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    const goToPreviousMonth = () => {
        setCurrentMonth(addMonths(currentMonth, -1));
    };

    const goToNextMonth = () => {
        setCurrentMonth(addMonths(currentMonth, 1));
    };

    const isDateDisabled = (date: Date) => {
        if (minDate && isBefore(date, addDays(minDate, -1))) return true;
        if (maxDate && isAfter(date, maxDate)) return true;
        return disabledDates.some((d) => isSameDay(d, date));
    };

    const hasMessageOnDate = (date: Date) => {
        return messageDates.some((d) => isSameDay(d, date)) || disabledDates.some((d) => isSameDay(d, date));
    };

    const handleDateSelect = (date: Date) => {
        if (!isDateDisabled(date)) {
            onDateSelect(date);
        }
    };

    // Check if previous month navigation should be disabled
    const isPrevMonthDisabled = minDate
        ? isBefore(endOfMonth(addMonths(currentMonth, -1)), minDate)
        : false;

    return (
        <View className={clsx('bg-plum rounded-2xl p-4 border border-grape', className)}>
            {/* Header with month navigation */}
            <View className="flex-row items-center justify-between mb-4">
                <Pressable
                    onPress={goToPreviousMonth}
                    disabled={isPrevMonthDisabled}
                    className={clsx(
                        'w-10 h-10 rounded-full items-center justify-center',
                        isPrevMonthDisabled && 'opacity-30'
                    )}
                >
                    <Text className="text-snowWhite text-xl">‹</Text>
                </Pressable>

                <Animated.View key={format(currentMonth, 'yyyy-MM')} entering={FadeIn.duration(200)} exiting={FadeOut.duration(100)}>
                    <Text className="text-snowWhite text-lg font-medium">
                        {format(currentMonth, 'MMMM yyyy')}
                    </Text>
                </Animated.View>

                <Pressable
                    onPress={goToNextMonth}
                    className="w-10 h-10 rounded-full items-center justify-center"
                >
                    <Text className="text-snowWhite text-xl">›</Text>
                </Pressable>
            </View>

            {/* Weekday headers */}
            <View className="flex-row mb-2">
                {WEEKDAYS.map((day) => (
                    <View key={day} className="flex-1 items-center">
                        <Text className="text-lavender text-xs font-medium uppercase tracking-wide">
                            {day}
                        </Text>
                    </View>
                ))}
            </View>

            {/* Calendar grid */}
            <Animated.View key={format(currentMonth, 'yyyy-MM') + '-grid'} entering={FadeIn.duration(200)}>
                <View className="flex-row flex-wrap">
                    {days.map((day, index) => (
                        <View key={day.toISOString()} className="w-[14.28%] py-1">
                            <DayCell
                                date={day}
                                isSelected={isSameDay(day, selectedDate)}
                                isCurrentMonth={isSameMonth(day, currentMonth)}
                                isDisabled={isDateDisabled(day)}
                                hasMessage={hasMessageOnDate(day)}
                                onPress={() => handleDateSelect(day)}
                            />
                        </View>
                    ))}
                </View>
            </Animated.View>

            {/* Legend */}
            <View className="flex-row items-center justify-center mt-4 space-x-4">
                <View className="flex-row items-center">
                    <View className="w-3 h-3 rounded-full bg-coral/30 mr-1" />
                    <Text className="text-lavender text-xs">Has message</Text>
                </View>
                <View className="flex-row items-center ml-4">
                    <View className="w-3 h-3 rounded-full border-2 border-gold mr-1" />
                    <Text className="text-lavender text-xs">Today</Text>
                </View>
            </View>
        </View>
    );
}


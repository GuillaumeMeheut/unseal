import clsx from 'clsx';
import { Text, TextInput, TextInputProps, View } from 'react-native';

interface InputProps extends TextInputProps {
    label?: string;
    className?: string;
    error?: string;
}

export default function Input({ label, className, error, ...props }: InputProps) {
    return (
        <View className={clsx("w-full mb-5", className)}>
            {label && (
                <Text className="text-lavender text-sm font-medium mb-2 tracking-wide uppercase">
                    {label}
                </Text>
            )}
            <TextInput
                placeholderTextColor="#9B8AA8"
                className="w-full bg-plum p-4 rounded-xl text-snowWhite border border-grape"
                {...props}
            />
            {error && <Text className="text-coral text-sm mt-2">{error}</Text>}
        </View>
    );
}


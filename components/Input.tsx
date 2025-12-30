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
                <Text className="text-warmGray text-sm font-medium mb-2 tracking-wide uppercase">
                    {label}
                </Text>
            )}
            <TextInput
                placeholderTextColor="#9A948A"
                className="w-full bg-sand p-4 rounded-xl text-charcoal border border-stone"
                {...props}
            />
            {error && <Text className="text-terracotta text-sm mt-2">{error}</Text>}
        </View>
    );
}

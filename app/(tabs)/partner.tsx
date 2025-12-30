import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PartnerScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Partner</Text>
                <Text style={styles.subtitle}>Connect with your partner</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAF8F5',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '600',
        color: '#3D3A36',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#9A948A',
        textAlign: 'center',
    },
});

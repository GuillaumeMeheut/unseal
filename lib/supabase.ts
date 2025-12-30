import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import * as aesjs from 'aes-js';
import * as SecureStore from 'expo-secure-store';
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

// Supabase configuration
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * LargeSecureStore implementation to handle Supabase sessions that exceed
 * SecureStore's 2048-byte limit. This encrypts data with AES-256-CTR and
 * stores it in AsyncStorage, while keeping the encryption key in SecureStore.
 * 
 * Reference: https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native
 */
class LargeSecureStore {
    private async _encrypt(key: string, value: string): Promise<string> {
        const encryptionKey = await this._getOrCreateEncryptionKey();

        const keyBytes = aesjs.utils.utf8.toBytes(encryptionKey);
        const valueBytes = aesjs.utils.utf8.toBytes(value);

        // AES-256-CTR mode with zero IV (key is random, so IV=0 is acceptable)
        const aesCtr = new aesjs.ModeOfOperation.ctr(keyBytes, new aesjs.Counter(1));
        const encryptedBytes = aesCtr.encrypt(valueBytes);

        return aesjs.utils.hex.fromBytes(encryptedBytes);
    }

    private async _decrypt(key: string, value: string): Promise<string> {
        const encryptionKey = await this._getOrCreateEncryptionKey();

        const keyBytes = aesjs.utils.utf8.toBytes(encryptionKey);
        const encryptedBytes = aesjs.utils.hex.toBytes(value);

        const aesCtr = new aesjs.ModeOfOperation.ctr(keyBytes, new aesjs.Counter(1));
        const decryptedBytes = aesCtr.decrypt(encryptedBytes);

        return aesjs.utils.utf8.fromBytes(decryptedBytes);
    }

    private async _getOrCreateEncryptionKey(): Promise<string> {
        const ENCRYPTION_KEY_NAME = 'supabase_encryption_key';

        let encryptionKey = await SecureStore.getItemAsync(ENCRYPTION_KEY_NAME);

        if (!encryptionKey) {
            // Generate a random 256-bit (32 bytes = 32 characters) key
            const randomBytes = new Uint8Array(32);
            crypto.getRandomValues(randomBytes);

            // Convert to a 32-character string for AES-256
            encryptionKey = Array.from(randomBytes)
                .map((byte) => String.fromCharCode((byte % 94) + 33)) // Printable ASCII chars
                .join('');

            await SecureStore.setItemAsync(ENCRYPTION_KEY_NAME, encryptionKey);
        }

        return encryptionKey;
    }

    async getItem(key: string): Promise<string | null> {
        const encrypted = await AsyncStorage.getItem(key);
        if (!encrypted) {
            return null;
        }

        try {
            return await this._decrypt(key, encrypted);
        } catch (error) {
            console.error('Failed to decrypt stored session:', error);
            // If decryption fails, remove the corrupted data
            await AsyncStorage.removeItem(key);
            return null;
        }
    }

    async setItem(key: string, value: string): Promise<void> {
        const encrypted = await this._encrypt(key, value);
        await AsyncStorage.setItem(key, encrypted);
    }

    async removeItem(key: string): Promise<void> {
        await AsyncStorage.removeItem(key);
    }
}

const largeSecureStore = new LargeSecureStore();

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: largeSecureStore,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

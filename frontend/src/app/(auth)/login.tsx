import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

import { loginWithTu } from '../../features/auth/services/authService';

export default function LoginScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleLogin = async () => {
        if (loading) return;

        setErrorMessage('');

        if (!username.trim()) {
            setErrorMessage('Please enter your TU account.');
            return;
        }

        if (!password) {
            setErrorMessage('Please enter your password.');
            return;
        }

        try {
            setLoading(true);

            const result = await loginWithTu(
                username,
                password
            );

            if (!result.success) {
                setErrorMessage(result.message);
                return;
            }

            // TEMPORARY
            // ตอน backend + onboarding พร้อมแล้ว
            // ตรงนี้จะ router.replace(...) ไป onboarding

            Alert.alert(
                'Login successful',
                'Mock TU authentication is working.'
            );
        } catch (error) {
            console.error('Login error:', error);

            setErrorMessage(
                'Something went wrong. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient
            colors={['#FF7F87', '#FFA36F', '#FFE4BA']}
            style={styles.background}
        >

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={
                    Platform.OS === 'ios'
                        ? 'padding'
                        : undefined
                }
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.container}>

                        <Image
                            source={require('../../../assets/images/talktu-logo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="xxxxx @ dome.tu.ac.th"
                            placeholderTextColor="#AAAAAA"
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                            autoCorrect={false}
                            editable={!loading}
                        />

                        {errorMessage ? (
                            <Text style={styles.errorText}>
                                {errorMessage}
                            </Text>
                        ) : null}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },

    background: {
        flex: 1,
    },

    scrollContent: {
        flexGrow: 1,
    },

    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 28,
        paddingVertical: 48,
    },

    logo: {
        width: 190,
        height: 110,
        alignSelf: 'center',
        marginBottom: 28,
    },

    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 8,
    },

    subtitle: {
        fontSize: 15,
        color: '#FFFFFF',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 28,
    },

    formCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.96)',
        borderRadius: 24,
        padding: 22,
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.14,
        shadowRadius: 8,
        elevation: 5,
    },

    label: {
        fontSize: 14,
        fontWeight: '700',
        color: '#222222',
        marginBottom: 7,
    },

    input: {
        height: 52,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E1E1E1',
        borderRadius: 14,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#111111',
        marginBottom: 18,
    },

    errorText: {
        color: '#C62828',
        fontSize: 14,
        marginBottom: 14,
    },

    footer: {
        marginTop: 24,
        textAlign: 'center',
        fontSize: 13,
        fontWeight: '600',
        color: '#FFFFFF',
    },

    ageNotice: {
        marginTop: 5,
        textAlign: 'center',
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.85)',
    },
});
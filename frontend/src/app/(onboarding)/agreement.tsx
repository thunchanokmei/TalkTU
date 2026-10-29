import { useState } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

export default function AgreementScreen() {
    const router = useRouter();

    const [termsAccepted, setTermsAccepted] = useState(false);
    const [guidelinesAccepted, setGuidelinesAccepted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const canContinue = termsAccepted && guidelinesAccepted;

    const handleContinue = async () => {
        if (!canContinue || isSubmitting) return;

        setIsSubmitting(true);
        setErrorMessage('');

        try {
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError || !user) {
                throw userError ?? new Error('Unable to identify the current user.');
            }

            const {
                data: accepted,
                error: acceptError,
            } = await supabase.rpc('accept_current_policies');

            if (acceptError) {
                throw acceptError;
            }

            if (accepted !== true) {
                throw new Error('Policy acceptance was not saved.');
            }

            const {
                data: profile,
                error: profileError,
            } = await supabase
                .from('profiles')
                .select('onboarding_completed')
                .eq('id', user.id)
                .single();

            if (profileError) {
                throw profileError;
            }

            if (profile.onboarding_completed === true) {
                router.replace('/swipe');
                return;
            }

            router.replace('/name');
        } catch (error) {
            console.error('Policy acceptance error:', error);

            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : 'Unable to save your acceptance. Please try again.',
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.title}>Before you start</Text>

                <Text style={styles.description}>
                    Please review TalkTU&apos;s policies before creating your profile.
                </Text>

                <View style={styles.card}>
                    <TouchableOpacity
                        style={styles.checkRow}
                        onPress={() => setTermsAccepted((current) => !current)}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: termsAccepted }}
                    >
                        <View
                            style={[
                                styles.checkbox,
                                termsAccepted && styles.checkboxChecked,
                            ]}
                        >
                            {termsAccepted && (
                                <Text style={styles.checkmark}>✓</Text>
                            )}
                        </View>

                        <Text style={styles.checkText}>
                            I have read and agree to the{' '}
                            <Text
                                style={styles.link}
                                onPress={() => router.push('/terms-of-service')}
                            >
                                Terms of Service
                            </Text>
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.checkRow}
                        onPress={() =>
                            setGuidelinesAccepted((current) => !current)
                        }
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: guidelinesAccepted }}
                    >
                        <View
                            style={[
                                styles.checkbox,
                                guidelinesAccepted && styles.checkboxChecked,
                            ]}
                        >
                            {guidelinesAccepted && (
                                <Text style={styles.checkmark}>✓</Text>
                            )}
                        </View>

                        <Text style={styles.checkText}>
                            I have read and agree to the{' '}
                            <Text
                                style={styles.link}
                                onPress={() => router.push('/community-guidelines')}
                            >
                                Community Guidelines
                            </Text>
                        </Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.privacyText}>
                    You can also review our{' '}
                    <Text
                        style={styles.link}
                        onPress={() => router.push('/privacy-policy')}
                    >
                        Privacy Policy
                    </Text>
                    .
                </Text>

                <TouchableOpacity
                    style={[
                        styles.startButton,
                        (!canContinue || isSubmitting) &&
                        styles.startButtonDisabled,
                    ]}
                    onPress={handleContinue}
                    disabled={!canContinue || isSubmitting}
                    accessibilityRole="button"
                    accessibilityState={{
                        disabled: !canContinue || isSubmitting,
                    }}
                >
                    <Text
                        style={[
                            styles.startButtonText,
                            (!canContinue || isSubmitting) &&
                            styles.startButtonTextDisabled,
                        ]}
                    >
                        {isSubmitting ? 'SAVING...' : 'START'}
                    </Text>
            </TouchableOpacity>
            {errorMessage ? (
                <Text style={styles.errorText}>
                    {errorMessage}
                </Text>
            ) : null}

            <Text style={styles.notice}>
                You must accept both policies before continuing.
            </Text>
        </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF5F0',
    },

    content: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingVertical: 48,
        justifyContent: 'center',
    },

    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#222222',
        textAlign: 'center',
        marginBottom: 12,
    },

    description: {
        fontSize: 16,
        lineHeight: 24,
        color: '#666666',
        textAlign: 'center',
        marginBottom: 32,
    },

    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 20,
        marginBottom: 24,
    },

    checkRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginVertical: 12,
    },

    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#CCCCCC',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        marginTop: 1,
    },

    checkboxChecked: {
        backgroundColor: '#FF8F8F',
        borderColor: '#FF8F8F',
    },

    checkmark: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },

    checkText: {
        flex: 1,
        fontSize: 15,
        lineHeight: 22,
        color: '#444444',
    },

    link: {
        color: '#E96F78',
        fontWeight: '700',
        textDecorationLine: 'underline',
    },

    privacyText: {
        fontSize: 14,
        lineHeight: 21,
        color: '#777777',
        textAlign: 'center',
        marginBottom: 30,
    },

    startButton: {
        width: '100%',
        minHeight: 54,
        borderRadius: 16,
        backgroundColor: '#FF8F8F',
        alignItems: 'center',
        justifyContent: 'center',
    },

    startButtonDisabled: {
        backgroundColor: '#E3E3E3',
    },

    startButtonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
    },

    startButtonTextDisabled: {
        color: '#999999',
    },

    notice: {
        fontSize: 12,
        color: '#999999',
        textAlign: 'center',
        marginTop: 14,
    },

    errorText: {
        marginTop: 12,
        color: '#D33A3A',
        fontSize: 13,
        lineHeight: 19,
        textAlign: 'center',
    },
});
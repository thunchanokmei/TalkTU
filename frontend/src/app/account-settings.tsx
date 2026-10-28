
import { useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import {
    Alert,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import BottomNavigation from '../components/navigation/BottomNavigation';
import { supabase } from '../lib/supabase';
import * as Clipboard from 'expo-clipboard';

export default function AccountSettingsScreen() {
    const router = useRouter();
    const deletingAccountRef = useRef(false);
    const [copiedValue, setCopiedValue] = useState<string | null>(null);

    const handleCopy = async (value: string) => {
        try {
            await Clipboard.setStringAsync(value);
            setCopiedValue(value);
        } catch (error) {
            console.error('Unable to copy contact:', error);
        }
    };

    const deleteAccount = async () => {
        if (deletingAccountRef.current) return;

        deletingAccountRef.current = true;
        let requestAccepted = false;

        try {
            const { data, error } = await supabase.functions.invoke(
                'delete-account',
                { body: {} },
            );

            if (error || data?.success !== true || data?.status !== 'pending') {
                throw error ?? new Error('Account deletion was not confirmed');
            }

            requestAccepted = true;
        } catch (error) {
            console.error('Unable to request account deletion:', error);

            const message =
                'Unable to request account deletion. Please try again.';

            if (Platform.OS === 'web') {
                window.alert(message);
            } else {
                Alert.alert('Delete Account Failed', message);
            }

            return;
        } finally {
            if (!requestAccepted) {
                deletingAccountRef.current = false;
            }
        }

        try {
            const { error } = await supabase.auth.signOut({ scope: 'local' });

            if (error) {
                console.error('Unable to clear local session:', error);
            }
        } catch (error) {
            console.error('Unable to clear local session:', error);
        }

        router.replace({
            pathname: '/(auth)/login',
            params: {
                toast: 'account-deletion-requested',
            },
        });
    };

    const handleDeleteAccount = () => {
        const title = 'Delete your account?';
        const message =
            'This will permanently delete your account and associated data. This action cannot be undone.';

        if (Platform.OS === 'web') {
            const confirmed = window.confirm(`${title}\n\n${message}`);

            if (confirmed) {
                void deleteAccount();
            }

            return;
        }

        Alert.alert(title, message, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete Account',
                style: 'destructive',
                onPress: () => {
                    void deleteAccount();
                },
            },
        ]);
    };

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error('Unable to log out:', error);
            return;
        }

        router.replace('/(auth)/login');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => {
                        if (router.canGoBack()) {
                            router.back();
                        } else {
                            router.replace('/profile');
                        }
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Go back"
                >
                    <Text style={styles.backButton}>←</Text>
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Account Settings</Text>

                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.sectionTitle}>Account</Text>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Legal & Safety</Text>

                    <TouchableOpacity
                        style={styles.settingRow}
                        onPress={() => router.push('/privacy-policy')}
                        accessibilityRole="button"
                    >
                        <Text style={styles.settingText}>Privacy Policy</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.settingRow}
                        onPress={() => router.push('/terms-of-service')}
                        accessibilityRole="button"
                    >
                        <Text style={styles.settingText}>Terms of Service</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.settingRow}
                        onPress={() => router.push('/community-guidelines')}
                        accessibilityRole="button"
                    >
                        <Text style={styles.settingText}>Community Guidelines</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.settingRow}
                        onPress={() => router.push('/account-deletion')}
                        accessibilityRole="button"
                    >
                        <Text style={styles.settingText}>Account Deletion Information</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={handleLogout}
                    accessibilityRole="button"
                >
                    <Text style={styles.menuText}>Log out</Text>
                    <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={handleDeleteAccount}
                    accessibilityRole="button"
                >
                    <Text style={styles.deleteText}>Delete Account</Text>
                    <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>

                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>Contact us</Text>
                <Text style={styles.description}>
                    Questions, feedback, or support? Reach out to us!
                </Text>

                {[
                    { label: 'Instagram', value: 'talktu.team' },
                    { label: 'LINE', value: '@927qejxh' },
                    { label: 'Gmail', value: 'talktu.team@gmail.com' },
                ].map((contact) => (
                    <View key={contact.label} style={styles.contactItem}>
                        <View style={styles.contactInfo}>
                            <Text style={styles.contactLabel}>{contact.label}</Text>
                            <Text style={styles.contactValue}>{contact.value}</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.copyButton}
                            onPress={() => void handleCopy(contact.value)}
                            accessibilityRole="button"
                            accessibilityLabel={`Copy ${contact.label}`}
                        >
                            <Text
                                style={[
                                    styles.copyButtonText,
                                    copiedValue === contact.value && styles.copiedText,
                                ]}
                            >
                                {copiedValue === contact.value ? '✓ Copied!' : 'Copy'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>

            <BottomNavigation />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        minHeight: 56,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        fontSize: 28,
        color: '#222',
        width: 32,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#222',
    },
    headerSpacer: {
        width: 32,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 32,
    },
    
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#222',
        marginBottom: 12,
    },
    
    menuItem: {
        minHeight: 52,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#ddd',
    },
    menuText: {
        fontSize: 16,
        color: '#222',
    },
    deleteText: {
        fontSize: 16,
        color: '#d33',
    },
    chevron: {
        fontSize: 24,
        color: '#888',
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 28,
    },
    description: {
        color: '#777',
        marginBottom: 16,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    contactInfo: {
        flex: 1,
    },
    contactLabel: {
        fontWeight: '600',
        color: '#222',
    },
    contactValue: {
        color: '#777',
        marginTop: 3,
    },
    copyButton: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 8,
    },
    copyButtonText: {
        fontWeight: '600',
        color: '#222',
    },
    copiedText: {
        color: '#16a34a',
    },

    section: {
        width: '100%',
        marginBottom: 24,
    },


    settingRow: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 14,
        marginBottom: 10,
    },

    settingText: {
        fontSize: 15,
        color: '#333333',
    },
});

import { useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import {
    SafeAreaProvider,
    SafeAreaView,
} from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { supabase } from '../lib/supabase';
import * as Clipboard from 'expo-clipboard';

const THEME_GRADIENT = ['#FF8D88', '#FFAF79', '#FFD86E'] as const;

const softShadow = Platform.select({
    ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.18,
        shadowRadius: 6,
    },
    android: {
        elevation: 5,
    },
});

// fullScreenModal screens need their own SafeAreaProvider,
// otherwise the top inset can come back as 0 and the header
// overlaps the status bar.
export default function AccountSettingsScreen() {
    return (
        <SafeAreaProvider>
            <AccountSettingsContent />
        </SafeAreaProvider>
    );
}

function AccountSettingsContent() {
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

    const performLogout = async () => {
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error('Unable to log out:', error);
            return;
        }
        router.dismissAll();
        router.replace('/(auth)/login');
    };

    const handleLogout = () => {
        const title = 'Log out?';
        const message = 'Are you sure you want to log out?';

        if (Platform.OS === 'web') {
            const confirmed = window.confirm(`${title}\n\n${message}`);

            if (confirmed) {
                void performLogout();
            }

            return;
        }

        Alert.alert(title, message, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Log out',
                style: 'destructive',
                onPress: () => {
                    void performLogout();
                },
            },
        ]);
    };

    return (
        <SafeAreaView
            style={styles.container}
            edges={['top', 'bottom', 'left', 'right']}
        >
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.headerShadow}
                    onPress={() => {
                        if (router.canGoBack()) {
                            router.back();
                        } else {
                            router.replace('/profile');
                        }
                    }}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel="Go back"
                >
                    <LinearGradient
                        colors={THEME_GRADIENT}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={styles.circleButton}
                    >
                        <Ionicons
                            name="chevron-back"
                            size={26}
                            color="#FFFFFF"
                        />
                    </LinearGradient>
                </TouchableOpacity>

                <View pointerEvents="none" style={styles.titleWrap}>
                    <Text style={styles.headerTitle}>Account Settings</Text>
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >

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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        height: 72,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerShadow: {
        borderRadius: 24,
        backgroundColor: '#FFAF79',
        ...softShadow,
    },
    circleButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    titleWrap: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#222',
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

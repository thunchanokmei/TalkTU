import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useRouter } from 'expo-router';

import {
    AppMode,
    DatingInterest,
    getDatingPreferences,
    getMode,
    saveDatingPreferences,
    saveMode,
} from '../features/onboarding/services/onboardingService';

export default function SettingsScreen() {
    const router = useRouter();

    const [mode, setMode] =
        useState<AppMode | null>(null);

    const [interest, setInterest] =
        useState<DatingInterest | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [saveSuccess, setSaveSuccess] =
        useState(false);

    const [errorMessage, setErrorMessage] =
        useState('');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);

            const [
                savedMode,
                savedInterests,
            ] = await Promise.all([
                getMode(),
                getDatingPreferences(),
            ]);

            setMode(savedMode);
            setInterest(savedInterests[0] ?? null);
        } catch (error) {
            console.error(
                'Load settings error:',
                error
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setErrorMessage('');
            setSaveSuccess(false);

            if (!mode) {
                setErrorMessage(
                    'Please select what you are looking for.'
                );
                return;
            }

            if (mode === 'date' && !interest) {
                setErrorMessage(
                    'Please select who you are interested in.'
                );
                return;
            }

            setSaving(true);

            await saveMode(mode);

            if (mode === 'date' && interest) {
                await saveDatingPreferences(
                    [interest]
                );
            }

            setSaveSuccess(true);
        } catch (error) {
            console.error(
                'Save settings error:',
                error
            );

            setErrorMessage(
                'Unable to save settings. Please try again.'
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.center}>
                    <ActivityIndicator size="large" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                >
                    <Text style={styles.back}>←</Text>
                </TouchableOpacity>

                <Text style={styles.title}>
                    Settings
                </Text>

                <View style={styles.headerSpace} />
            </View>

            <View style={styles.content}>
                <Text style={styles.sectionTitle}>
                    What are you looking for?
                </Text>

                <TouchableOpacity
                    style={[
                        styles.option,
                        mode === 'date' && styles.optionSelected,
                    ]}
                    onPress={() => setMode('date')}
                >
                    <Text style={styles.optionText}>Date</Text>

                    <View
                        style={[
                            styles.circle,
                            mode === 'date' && styles.circleSelected,
                        ]}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.option,
                        mode === 'friends' && styles.optionSelected,
                    ]}
                    onPress={() => setMode('friends')}
                >
                    <Text style={styles.optionText}>Friends</Text>

                    <View
                        style={[
                            styles.circle,
                            mode === 'friends' && styles.circleSelected,
                        ]}
                    />
                </TouchableOpacity>

                {mode === 'date' && (
                    <>
                        <Text style={styles.sectionTitle}>
                            Who are you interested in?
                        </Text>

                        <TouchableOpacity
                            style={[
                                styles.option,
                                interest === 'men' && styles.optionSelected,
                            ]}
                            onPress={() => setInterest('men')}
                        >
                            <Text style={styles.optionText}>Men</Text>

                            <View
                                style={[
                                    styles.circle,
                                    interest === 'men' && styles.circleSelected,
                                ]}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.option,
                                interest === 'women' && styles.optionSelected,
                            ]}
                            onPress={() => setInterest('women')}
                        >
                            <Text style={styles.optionText}>Women</Text>

                            <View
                                style={[
                                    styles.circle,
                                    interest === 'women' && styles.circleSelected,
                                ]}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.option,
                                interest === 'beyond_binary' &&
                                styles.optionSelected,
                            ]}
                            onPress={() => setInterest('beyond_binary')}
                        >
                            <Text style={styles.optionText}>
                                Beyond Binary
                            </Text>

                            <View
                                style={[
                                    styles.circle,
                                    interest === 'beyond_binary' &&
                                    styles.circleSelected,
                                ]}
                            />
                        </TouchableOpacity>
                    </>
                )}
            </View>

            {errorMessage ? (
                <Text style={styles.errorText}>
                    {errorMessage}
                </Text>
            ) : null}

            {saveSuccess ? (
                <Text style={styles.successText}>
                    Settings saved successfully!
                </Text>
            ) : null}

            <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
                disabled={saving}
            >
                <Text style={styles.saveButtonText}>
                    {saving ? 'Saving...' : 'Save'}
                </Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },

    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },

    back: {
        fontSize: 36,
    },

    title: {
        fontSize: 22,
        fontWeight: '700',
    },

    headerSpace: {
        width: 24,
    },

    content: {
        padding: 24,
    },

    sectionTitle: {
        marginTop: 24,
        marginBottom: 8,
        fontSize: 18,
        fontWeight: '700',
    },

    option: {
        minHeight: 48,
        marginBottom: 10,
        paddingHorizontal: 16,
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F5F5F5',
    },

    optionSelected: {
        backgroundColor: '#FFF0E8',
    },

    optionText: {
        fontSize: 16,
        fontWeight: '500',
    },

    circle: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#E0E0E0',
    },

    circleSelected: {
        backgroundColor: '#F19068',
    },

    saveButton: {
        marginTop: 24,
        minHeight: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF0E8',
    },

    saveButtonText: {
        fontSize: 16,
        fontWeight: '700',
    },

    successText: {
        marginTop: 16,
        color: 'green',
    },

    errorText: {
        marginTop: 16,
        color: '#C62828',
    },
});
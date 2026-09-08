import { useState } from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { saveMode } from '../../features/onboarding/services/onboardingService';

type Mode = 'date' | 'friends';

export default function ModeScreen() {
    const { width, height } = useWindowDimensions();
    const shortSide = Math.min(width, height);

    const [mode, setMode] = useState<Mode | null>(null);

    const backButtonWidth = Math.max(
        42,
        Math.min(shortSide * 0.12, 64)
    );

    const backButtonHeight = Math.max(
        28,
        Math.min(shortSide * 0.072, 38)
    );

    const titleSize = Math.max(
        20,
        Math.min(shortSide * 0.055, 30)
    );

    const handleBack = () => {
        router.replace('/gender');
    };

    const handleContinue =
        async () => {
            if (!mode) return;

            try {
                await saveMode(mode);

                if (mode === 'date') {
                    router.push(
                        '/interested-in'
                    );
                    return;
                }

                // Friends ไม่ต้องเลือก dating preference
                router.push('/bio1');
            } catch (error) {
                console.error(
                    'Save mode error:',
                    error
                );
            }
        };

    return (
        <LinearGradient
            colors={['#FF7F87', '#FFA577', '#FFE8C8']}
            locations={[0, 0.45, 1]}
            style={styles.screen}
        >
            <Pressable
                style={[
                    styles.backButton,
                    {
                        top: Math.max(20, height * 0.04),
                        left: Math.max(20, width * 0.07),
                        width: backButtonWidth,
                        height: backButtonHeight,
                    },
                ]}
                onPress={handleBack}
            >
                <LinearGradient
                    colors={['#FFE98F', '#FFB873']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.backGradient}
                >
                    <Text style={styles.backText}>
                        {'<<'}
                    </Text>
                </LinearGradient>
            </Pressable>

            <View
                style={[
                    styles.content,
                    {
                        paddingHorizontal: Math.max(
                            24,
                            width * 0.1
                        ),
                        paddingTop: Math.max(
                            110,
                            height * 0.18
                        ),
                    },
                ]}
            >
                <Text
                    style={[
                        styles.title,
                        {
                            fontSize: titleSize,
                            lineHeight: titleSize * 1.12,
                        },
                    ]}
                >
                    What you{'\n'}looking for?
                </Text>

                <ChoiceRow
                    label="Date"
                    selected={mode === 'date'}
                    onPress={() => setMode('date')}
                />

                <ChoiceRow
                    label="Friends"
                    selected={mode === 'friends'}
                    onPress={() => setMode('friends')}
                />

                {mode ? (
                    <Pressable
                        style={styles.goButton}
                        onPress={handleContinue}
                    >
                        <Text style={styles.goText}>
                            go!
                        </Text>
                    </Pressable>
                ) : null}
            </View>
        </LinearGradient>
    );
}

function ChoiceRow({
    label,
    selected,
    onPress,
}: {
    label: string;
    selected: boolean;
    onPress: () => void;
}) {
    return (
        <Pressable
            style={styles.choice}
            onPress={onPress}
        >
            <Text style={styles.choiceText}>
                {label}
            </Text>

            <View
                style={[
                    styles.circle,
                    selected && styles.circleSelected,
                ]}
            />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },

    content: {
        flex: 1,
    },

    backButton: {
        position: 'absolute',
        borderRadius: 999,
        overflow: 'hidden',
        zIndex: 20,
    },

    backGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 999,
    },

    backText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#222222',
    },

    title: {
        color: '#FFFFFF',
        fontWeight: '600',
        marginBottom: 30,

        textShadowColor:
            'rgba(75, 50, 45, 0.35)',

        textShadowOffset: {
            width: 1,
            height: 2,
        },

        textShadowRadius: 2,
    },

    choice: {
        width: '100%',
        minHeight: 44,

        backgroundColor: '#FFFFFF',

        borderRadius: 14,

        paddingHorizontal: 16,
        marginBottom: 10,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    choiceText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#222222',
    },

    circle: {
        width: 16,
        height: 16,

        borderRadius: 999,

        backgroundColor: '#F2D3C3',
    },

    circleSelected: {
        backgroundColor: '#F19068',
    },

    goButton: {
        alignSelf: 'flex-end',

        marginTop: 10,
        paddingHorizontal: 18,

        minHeight: 34,

        borderRadius: 12,

        backgroundColor: '#FFF6AE',

        justifyContent: 'center',
        alignItems: 'center',
    },

    goText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111111',
    },
});
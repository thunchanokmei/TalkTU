import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    useWindowDimensions,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { supabase } from '@/lib/supabase';
import OnboardingGoButton from '../components/navigation/OnboardingGoButton';
import { completeOnboarding } from '../features/onboarding/services/onboardingService';

type FoodSpotCategory = 'cafeteria' | 'savory' | 'dessert_drink';

type FavoriteFoodSpot = {
    id: number;
    name: string;
    category: FoodSpotCategory;
};

type CampusLocation = {
    id: number;
    name: string;
};

const placeOptions = [
    'หอสมุดป๋วย',
    'SC3',
    'อินเตอร์โซน',
    'เชียงราก 1',
    'กรีน',
    'TU fitness',
    'ยิม 7',
    'หอใน',
    'เชียงราก 2',
    'SC1',
    'โรงอาหาร JC',
    'สวนป๋วย 100 ปี',
    'ศกร.',
];

const THEME_GRADIENT = ['#FF8D88', '#FFAF79', '#FFD86E'] as const;
const TITLE_PINK = '#F08A8E';

function FadeInView({
    children,
    delay = 0,
    style,
}: {
    children: React.ReactNode;
    delay?: number;
    style?: any;
}) {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(16)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 420,
                delay,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 420,
                delay,
                useNativeDriver: true,
            }),
        ]).start();
    }, [delay, opacity, translateY]);

    return (
        <Animated.View
            style={[
                style,
                {
                    opacity,
                    transform: [{ translateY }],
                },
            ]}
        >
            {children}
        </Animated.View>
    );
}

function SelectableChip({
    label,
    selected,
    onPress,
}: {
    label: string;
    selected: boolean;
    onPress: () => void;
}) {
    const scale = useRef(new Animated.Value(1)).current;

    function animateScale(toValue: number) {
        Animated.spring(scale, {
            toValue,
            useNativeDriver: true,
            speed: 30,
            bounciness: 5,
        }).start();
    }

    return (
        <Animated.View style={{ transform: [{ scale }] }}>
            <Pressable
                style={[
                    styles.chip,
                    selected && styles.chipSelected,
                ]}
                onPress={onPress}
                onPressIn={() => animateScale(0.95)}
                onPressOut={() => animateScale(1)}
            >
                <Text
                    style={[
                        styles.chipText,
                        selected && styles.chipTextSelected,
                    ]}
                >
                    {label}
                </Text>
            </Pressable>
        </Animated.View>
    );
}

export default function Bio2Screen() {
    const router = useRouter();
    const { width } = useWindowDimensions();

    const pagePadding = Math.max(14, Math.min(width * 0.045, 24));

    const [afterClass, setAfterClass] = useState('');
    const [favoriteSpot, setFavoriteSpot] = useState('');
    const [foodSpots, setFoodSpots] = useState<FavoriteFoodSpot[]>([]);
    const [selectedFoodSpotIds, setSelectedFoodSpotIds] = useState<number[]>([]);
    const [campusLocations, setCampusLocations] = useState<CampusLocation[]>([]);
    const [selectedLocationIds, setSelectedLocationIds] = useState<number[]>([]);

    const [finishVisible, setFinishVisible] = useState(false);
    const finishOpacity = useRef(new Animated.Value(0)).current;
    const finishScale = useRef(new Animated.Value(0.9)).current;
    const finishFloat = useRef(new Animated.Value(0)).current;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadBio2Data();
    }, []);

    async function loadBio2Data() {
        try {
            setLoading(true);

            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError) throw userError;
            if (!user) throw new Error('Please sign in again.');

            const [
                { data: profile, error: profileError },
                { data: catalog, error: catalogError },
                { data: selectedRows, error: selectedError },
                { data: locationCatalog, error: locationCatalogError },
                { data: selectedLocationRows, error: selectedLocationError },
            ] = await Promise.all([
                supabase
                    .from('profiles')
                    .select('after_class, favorite_spot')
                    .eq('id', user.id)
                    .maybeSingle(),

                supabase
                    .from('favorite_food_spots')
                    .select('id, name, category')
                    .eq('is_active', true)
                    .order('id'),

                supabase
                    .from('user_favorite_food_spots')
                    .select('food_spot_id')
                    .eq('user_id', user.id),

                supabase
                    .from('campus_locations')
                    .select('id, name')
                    .in('name', placeOptions),

                supabase
                    .from('user_locations')
                    .select('location_id')
                    .eq('user_id', user.id),
            ]);

            if (profileError) throw profileError;
            if (catalogError) throw catalogError;
            if (selectedError) throw selectedError;
            if (locationCatalogError) throw locationCatalogError;
            if (selectedLocationError) throw selectedLocationError;

            setAfterClass(profile?.after_class ?? '');
            setFavoriteSpot(profile?.favorite_spot ?? '');
            setFoodSpots(catalog ?? []);

            setSelectedFoodSpotIds(
                (selectedRows ?? []).map((row) => Number(row.food_spot_id)),
            );

            setCampusLocations(locationCatalog ?? []);

            setSelectedLocationIds(
                (selectedLocationRows ?? []).map((row) => Number(row.location_id)),
            );
        } catch (error) {
            const message =
                error instanceof Error ? error.message : 'Something went wrong.';

            Alert.alert('Could not load your information', message);
        } finally {
            setLoading(false);
        }
    }

    function toggleFoodSpot(id: number) {
        setSelectedFoodSpotIds((currentIds) =>
            currentIds.includes(id)
                ? currentIds.filter((currentId) => currentId !== id)
                : [...currentIds, id],
        );
    }

    function toggleLocation(id: number) {
        setSelectedLocationIds((currentIds) =>
            currentIds.includes(id)
                ? currentIds.filter((currentId) => currentId !== id)
                : [...currentIds, id],
        );
    }

    async function saveFavoriteFoodSpots(userId: string) {
        const { data: existingRows, error: loadError } = await supabase
            .from('user_favorite_food_spots')
            .select('food_spot_id')
            .eq('user_id', userId);

        if (loadError) {
            throw loadError;
        }

        const existingIds = (existingRows ?? []).map(
            (row) => Number(row.food_spot_id),
        );

        const idsToDelete = existingIds.filter(
            (id) => !selectedFoodSpotIds.includes(id),
        );

        const idsToInsert = selectedFoodSpotIds.filter(
            (id) => !existingIds.includes(id),
        );

        if (idsToDelete.length > 0) {
            const { error: deleteError } = await supabase
                .from('user_favorite_food_spots')
                .delete()
                .eq('user_id', userId)
                .in('food_spot_id', idsToDelete);

            if (deleteError) {
                throw deleteError;
            }
        }

        if (idsToInsert.length > 0) {
            const { error: insertError } = await supabase
                .from('user_favorite_food_spots')
                .insert(
                    idsToInsert.map((foodSpotId) => ({
                        user_id: userId,
                        food_spot_id: foodSpotId,
                    })),
                );

            if (insertError) {
                throw insertError;
            }
        }
    }

    async function saveLocations(userId: string) {
        const { data: existingRows, error: loadError } = await supabase
            .from('user_locations')
            .select('location_id')
            .eq('user_id', userId);

        if (loadError) {
            throw loadError;
        }

        const existingIds = (existingRows ?? []).map(
            (row) => Number(row.location_id),
        );

        const idsToDelete = existingIds.filter(
            (id) => !selectedLocationIds.includes(id),
        );

        const idsToInsert = selectedLocationIds.filter(
            (id) => !existingIds.includes(id),
        );

        if (idsToDelete.length > 0) {
            const { error: deleteError } = await supabase
                .from('user_locations')
                .delete()
                .eq('user_id', userId)
                .in('location_id', idsToDelete);

            if (deleteError) {
                throw deleteError;
            }
        }

        if (idsToInsert.length > 0) {
            const { error: insertError } = await supabase
                .from('user_locations')
                .insert(
                    idsToInsert.map((locationId) => ({
                        user_id: userId,
                        location_id: locationId,
                    })),
                );

            if (insertError) {
                throw insertError;
            }
        }
    }

    function goToSwipe() {
        setFinishVisible(false);
        router.replace('/swipe');
    }

    useEffect(() => {
        if (!finishVisible) return;

        finishOpacity.setValue(0);
        finishScale.setValue(0.9);
        finishFloat.setValue(0);

        Animated.parallel([
            Animated.timing(finishOpacity, {
                toValue: 1,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.spring(finishScale, {
                toValue: 1,
                useNativeDriver: true,
                speed: 14,
                bounciness: 4,
            }),
            Animated.loop(
                Animated.sequence([
                    Animated.timing(finishFloat, {
                        toValue: 1,
                        duration: 900,
                        useNativeDriver: true,
                    }),
                    Animated.timing(finishFloat, {
                        toValue: 0,
                        duration: 900,
                        useNativeDriver: true,
                    }),
                ]),
            ),
        ]).start();
    }, [finishVisible, finishOpacity, finishScale, finishFloat]);

    async function handleSave() {
        if (saving || loading) return;

        try {
            setSaving(true);

            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError) throw userError;
            if (!user) throw new Error('Please sign in again.');

            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    after_class: afterClass.trim() || null,
                    favorite_spot: favoriteSpot.trim() || null,
                })
                .eq('id', user.id);

            if (profileError) throw profileError;

            await saveFavoriteFoodSpots(user.id);
            await saveLocations(user.id);

            await completeOnboarding();
            setFinishVisible(true);

        } catch (error) {
            const message =
                error instanceof Error ? error.message : 'Something went wrong.';

            Alert.alert('Could not save your information', message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable
                    onPress={() => router.replace('/bio1')}
                    style={styles.backButtonWrapper}
                    accessibilityRole="button"
                    accessibilityLabel="Go back"
                >
                    <LinearGradient
                        colors={THEME_GRADIENT}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.backButton}
                    >
                        <Ionicons
                            name="chevron-back"
                            size={25}
                            color="#FFFFFF"
                        />
                    </LinearGradient>
                </Pressable>

                <Text style={styles.headerTitle}>YOUR PROFILE</Text>

                <View style={styles.headerRightSpace} />
            </View>

            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={[
                        styles.scrollContent,
                        { paddingHorizontal: pagePadding },
                    ]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <FadeInView delay={50}>
                        <Text style={styles.title}>
                            A little more about you
                        </Text>

                        <Text style={styles.subtitle}>
                            Share a few more things so people can get to know you better.
                        </Text>
                    </FadeInView>

                    <FadeInView delay={120} style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            After Class I Go...
                        </Text>

                        <TextInput
                            style={styles.textInput}
                            value={afterClass}
                            onChangeText={setAfterClass}
                            placeholder="Tell us what you usually do after class..."
                            placeholderTextColor="#A7A0A0"
                            multiline
                            textAlignVertical="top"
                            maxLength={300}
                        />
                    </FadeInView>

                    <FadeInView delay={180} style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            My Favorite Spot
                        </Text>

                        <TextInput
                            style={styles.textInput}
                            value={favoriteSpot}
                            onChangeText={setFavoriteSpot}
                            placeholder="Where is your favorite spot in TU?"
                            placeholderTextColor="#A7A0A0"
                            multiline
                            textAlignVertical="top"
                            maxLength={300}
                        />
                    </FadeInView>

                    <FadeInView delay={240} style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            My Favorite Restaurant
                        </Text>

                        {loading ? (
                            <ActivityIndicator
                                size="small"
                                color={TITLE_PINK}
                                style={styles.loader}
                            />
                        ) : foodSpots.length === 0 ? (
                            <Text style={styles.emptyText}>
                                No food spots are available right now.
                            </Text>
                        ) : (
                            <View style={styles.chipContainer}>
                                {foodSpots.map((spot) => (
                                    <SelectableChip
                                        key={spot.id}
                                        label={spot.name}
                                        selected={selectedFoodSpotIds.includes(spot.id)}
                                        onPress={() => toggleFoodSpot(spot.id)}
                                    />
                                ))}
                            </View>
                        )}
                    </FadeInView>

                    <FadeInView delay={300} style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            You'll usually find me at..
                        </Text>

                        {loading ? (
                            <ActivityIndicator
                                size="small"
                                color={TITLE_PINK}
                                style={styles.loader}
                            />
                        ) : campusLocations.length === 0 ? (
                            <Text style={styles.emptyText}>
                                No campus locations are available right now.
                            </Text>
                        ) : (
                            <View style={styles.chipContainer}>
                                {campusLocations.map((location) => (
                                    <SelectableChip
                                        key={location.id}
                                        label={location.name}
                                        selected={selectedLocationIds.includes(location.id)}
                                        onPress={() => toggleLocation(location.id)}
                                    />
                                ))}
                            </View>
                        )}
                    </FadeInView>

                    <View style={styles.footer}>
                        <OnboardingGoButton
                            label={saving ? 'Saving...' : 'Start Now!'}
                            loading={saving}
                            disabled={saving || loading}
                            onPress={handleSave}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* FINISH POPUP */}
            <Modal
                visible={finishVisible}
                transparent
                animationType="fade"
                statusBarTranslucent
                onRequestClose={goToSwipe}
            >
                <View style={styles.finishOverlay}>
                    <Animated.View
                        style={[
                            styles.finishCard,
                            {
                                opacity: finishOpacity,
                                transform: [{ scale: finishScale }],
                            },
                        ]}
                    >
                        <View style={styles.finishAccent} />

                        <Animated.View
                            style={[
                                styles.finishDecor,
                                {
                                    transform: [
                                        {
                                            translateY: finishFloat.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [0, -6],
                                            }),
                                        },
                                    ],
                                },
                            ]}
                        >
                            <View style={styles.finishDecorCircle} />
                            <View style={styles.finishDecorLine} />
                            <View style={styles.finishDecorDot} />
                        </Animated.View>

                        <View style={styles.finishIconCircle}>
                            <Ionicons
                                name="checkmark"
                                size={36}
                                color="#FFFFFF"
                            />
                        </View>

                        <Text style={styles.finishTitle}>
                            You're all set!
                        </Text>

                        <Text style={styles.finishBody}>
                            Your profile is ready.
                            {'\n'}
                            Let's start TalkTU and meet new friends!
                        </Text>

                        <Pressable
                            style={styles.finishButtonShadow}
                            onPress={goToSwipe}
                            accessibilityRole="button"
                            accessibilityLabel="Let's start TalkTU"
                        >
                            <LinearGradient
                                colors={THEME_GRADIENT}
                                start={{ x: 0, y: 0.5 }}
                                end={{ x: 1, y: 0.5 }}
                                style={styles.finishButton}
                            >
                                <Text style={styles.finishButtonText}>
                                    Let's start TalkTU
                                </Text>
                                <Ionicons
                                    name="arrow-forward"
                                    size={20}
                                    color="#FFFFFF"
                                />
                            </LinearGradient>
                        </Pressable>
                    </Animated.View>
                </View>
            </Modal>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        height: 72,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        backgroundColor: '#FFFFFF',
        zIndex: 1,
    },
    backButtonWrapper: {
        width: 48,
        height: 48,
        borderRadius: 24,
        shadowColor: '#D98A83',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
    },
    backButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        color: TITLE_PINK,
        fontSize: 22,
        fontWeight: '800',
        letterSpacing: 1,
    },
    headerRightSpace: {
        width: 48,
        height: 48,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingTop: 8,
        paddingBottom: 48,
    },
    title: {
        color: TITLE_PINK,
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 8,
    },
    subtitle: {
        color: '#81767A',
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 28,
    },
    section: {
        marginBottom: 26,
    },
    sectionTitle: {
        color: TITLE_PINK,
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
    },
    textInput: {
        minHeight: 105,
        borderWidth: 1,
        borderColor: '#F4DDE2',
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 15,
        paddingVertical: 13,
        color: '#3D2630',
        fontSize: 15,
        lineHeight: 22,
    },
    categoryContainer: {
        gap: 20,
    },
    categorySection: {
        width: '100%',
    },
    categoryTitle: {
        color: '#C97983',
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 10,
    },
    loader: {
        marginVertical: 20,
    },
    emptyText: {
        color: '#81767A',
        fontSize: 14,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 9,
    },
    chip: {
        borderWidth: 1,
        borderColor: '#F1D9DE',
        borderRadius: 22,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    chipSelected: {
        backgroundColor: '#FFF0E8',
        borderColor: '#F08A8E',
    },
    chipText: {
        color: '#6D5B60',
        fontSize: 14,
    },
    chipTextSelected: {
        color: '#C75D70',
        fontWeight: '700',
    },
    footer: {
        marginTop: 12,
        marginBottom: 20,
    },

    finishOverlay: {
        flex: 1,
        backgroundColor: 'rgba(45, 28, 36, 0.42)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    finishCard: {
        width: '100%',
        maxWidth: 380,
        backgroundColor: '#FFFFFF',
        borderRadius: 28,
        paddingHorizontal: 26,
        paddingTop: 34,
        paddingBottom: 28,
        alignItems: 'center',
        overflow: 'hidden',
        shadowColor: '#7D4655',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.18,
        shadowRadius: 20,
        elevation: 12,
    },
    finishAccent: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 7,
        backgroundColor: '#FFAF79',
    },
    finishDecor: {
        position: 'absolute',
        top: 38,
        right: 30,
        width: 48,
        height: 42,
    },
    finishDecorCircle: {
        position: 'absolute',
        right: 2,
        top: 0,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#FFD86E',
    },
    finishDecorLine: {
        position: 'absolute',
        right: 22,
        top: 18,
        width: 18,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#FFAF79',
        transform: [{ rotate: '-35deg' }],
    },
    finishDecorDot: {
        position: 'absolute',
        left: 0,
        bottom: 2,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#F08A8E',
    },
    finishIconCircle: {
        width: 76,
        height: 76,
        borderRadius: 38,
        backgroundColor: '#F08A8E',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 22,
        shadowColor: '#F08A8E',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.25,
        shadowRadius: 9,
        elevation: 5,
    },
    finishTitle: {
        color: '#3D2630',
        fontSize: 26,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 12,
    },
    finishBody: {
        color: '#81767A',
        fontSize: 15,
        lineHeight: 24,
        textAlign: 'center',
        marginBottom: 28,
    },
    finishButtonShadow: {
        width: '100%',
        borderRadius: 18,
        shadowColor: '#D98A83',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 5,
    },
    finishButton: {
        minHeight: 54,
        borderRadius: 18,
        paddingHorizontal: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    finishButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '800',
    },

});
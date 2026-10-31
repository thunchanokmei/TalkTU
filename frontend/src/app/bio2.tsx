import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    KeyboardAvoidingView,
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

            router.replace('/swipe');
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
});
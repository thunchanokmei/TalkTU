import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { supabase } from '@/lib/supabase';
import OnboardingBackButton from '../components/navigation/OnboardingBackButton';
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

const BACK_BUTTON_OFFSET_TOP = 50;
const BACK_BUTTON_HEIGHT = 55;

export default function Bio2Screen() {
    const router = useRouter();
    const { width, height: screenHeight } = useWindowDimensions();

    const pagePadding = Math.max(14, Math.min(width * 0.045, 24));
    const backTop = Math.max(20, screenHeight * 0.04);
    const backLeft = Math.max(20, width * 0.07);
    const backButtonSpace =
        backTop + BACK_BUTTON_OFFSET_TOP + BACK_BUTTON_HEIGHT - 30;

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

            // Save the two optional text fields.
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    after_class: afterClass.trim() || null,
                    favorite_spot: favoriteSpot.trim() || null,
                })
                .eq('id', user.id);

            if (profileError) throw profileError;

            // Save favorite food spots.
            await saveFavoriteFoodSpots(user.id);

            // Save selected campus locations.
            await saveLocations(user.id);

            // Complete onboarding only after all Bio2 data has been saved.
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
            <OnboardingBackButton
                top={backTop}
                left={backLeft}
                onPress={() => router.replace('/bio1')}
            />

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
                    <View style={{ height: backButtonSpace }} />

                    <Text style={styles.title}>A little more about you</Text>
                    <Text style={styles.subtitle}>
                        Share a few more things so people can get to know you better.
                    </Text>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>After Class I Go...</Text>
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
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>My Favorite Spot</Text>
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
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            My Favorite Restaurant
                        </Text>

                        {loading ? (
                            <ActivityIndicator
                                size="small"
                                color="#7B263D"
                                style={styles.loader}
                            />
                        ) : foodSpots.length === 0 ? (
                            <Text style={styles.emptyText}>
                                No food spots are available right now.
                            </Text>
                        ) : (
                            <View style={styles.categoryContainer}>
                                {(
                                    [
                                        { key: 'cafeteria', title: 'โรงอาหาร' },
                                        { key: 'savory', title: 'ร้านของคาว' },
                                        { key: 'dessert_drink', title: 'ร้านของหวานและเครื่องดื่ม' },
                                    ] as const
                                ).map((category) => {
                                    const categorySpots = foodSpots.filter(
                                        (spot) => spot.category === category.key,
                                    );

                                    return (
                                        <View key={category.key} style={styles.categorySection}>
                                            {category.key !== 'cafeteria' && (
                                                <View style={styles.categoryDivider} />
                                            )}

                                            <View style={styles.chipContainer}>
                                                {categorySpots.map((spot) => {
                                                    const isSelected = selectedFoodSpotIds.includes(spot.id);

                                                    return (
                                                        <TouchableOpacity
                                                            key={spot.id}
                                                            style={[
                                                                styles.chip,
                                                                isSelected && styles.chipSelected,
                                                            ]}
                                                            onPress={() => toggleFoodSpot(spot.id)}
                                                            activeOpacity={0.8}
                                                        >
                                                            <Text
                                                                style={[
                                                                    styles.chipText,
                                                                    isSelected && styles.chipTextSelected,
                                                                ]}
                                                            >
                                                                {spot.name}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    );
                                                })}
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        )}
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            You'll usually find me at..
                        </Text>

                        {loading ? (
                            <ActivityIndicator
                                size="small"
                                color="#7B263D"
                                style={styles.loader}
                            />
                        ) : campusLocations.length === 0 ? (
                            <Text style={styles.emptyText}>
                                No campus locations are available right now.
                            </Text>
                        ) : (
                            <View style={styles.chipContainer}>
                                {campusLocations.map((location) => {
                                    const isSelected = selectedLocationIds.includes(location.id);

                                    return (
                                        <TouchableOpacity
                                            key={location.id}
                                            style={[
                                                styles.chip,
                                                isSelected && styles.chipSelected,
                                            ]}
                                            onPress={() => toggleLocation(location.id)}
                                            activeOpacity={0.8}
                                        >
                                            <Text
                                                style={[
                                                    styles.chipText,
                                                    isSelected && styles.chipTextSelected,
                                                ]}
                                            >
                                                {location.name}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        )}
                    </View>

                    <View style={styles.footer}>
                        <OnboardingGoButton
                            label={saving ? 'Saving...' : "Start Now!"}
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
        backgroundColor: '#FFFDFB',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 32,
    },
    title: {
        color: '#3D2630',
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 8,
    },
    subtitle: {
        color: '#81767A',
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 28,
    },
    section: {
        marginBottom: 25,
    },
    categoryContainer: {
        gap: 20,
    },
    categorySection: {
        width: '100%',
    },
    categoryTitle: {
        color: '#3D2630',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 9,
    },
    categoryDivider: {
        height: 1,
        backgroundColor: '#E7DDE0',
        marginBottom: 12,
    },
    sectionTitle: {
        color: '#3D2630',
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
    },
    textInput: {
        minHeight: 105,
        borderWidth: 1,
        borderColor: '#E7DDE0',
        borderRadius: 14,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 15,
        paddingVertical: 13,
        color: '#3D2630',
        fontSize: 15,
        lineHeight: 22,
    },
    helperText: {
        color: '#81767A',
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 14,
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
        borderColor: '#E5D8DC',
        borderRadius: 22,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    chipSelected: {
        backgroundColor: '#7B263D',
        borderColor: '#7B263D',
    },
    chipText: {
        color: '#5F5055',
        fontSize: 14,
    },
    chipTextSelected: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    footer: {
        marginTop: 12,
        marginBottom: 20,
    },
});
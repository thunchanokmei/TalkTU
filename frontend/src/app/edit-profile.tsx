import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import {
    ActivityIndicator,
    Image,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { supabase } from '../lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import {
    ImageManipulator,
    SaveFormat,
} from 'expo-image-manipulator';

import {
    GENDER_IDENTITY_MAP,
    GENDER_IDENTITY_OPTIONS,
    type GenderIdentityLabel,
} from '../constants/genderIdentity';

import WheelPicker from '../components/WheelPicker';

type ProfilePhoto = {
    id: string;
    storage_path: string;
    position: number;
};

type CampusLocation = {
    id: number;
    name: string;
};

const genderOptions = GENDER_IDENTITY_OPTIONS;

const heightOptions = Array.from(
    { length: 251 },
    (_, index) => String(index)
);

export default function EditProfileScreen() {
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [bio, setBio] = useState('');
    const [genderIdentity, setGenderIdentity] =
        useState<GenderIdentityLabel | ''>('');

    const [genderModal, setGenderModal] = useState(false);
    const [photos, setPhotos] = useState<ProfilePhoto[]>([]);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [newImages, setNewImages] = useState<(string | null)[]>(
        [null, null, null, null, null, null]
    );
    const [deletedPhotos, setDeletedPhotos] = useState<ProfilePhoto[]>([]);
    const [heightCm, setHeightCm] = useState<number | null>(null);
    const [heightModal, setHeightModal] = useState(false);

    const [campusLocations, setCampusLocations] = useState<CampusLocation[]>([]);
    const [selectedLocationIds, setSelectedLocationIds] = useState<number[]>([]);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);

            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError) {
                throw userError;
            }

            if (!user) {
                router.replace('/(auth)/login');
                return;
            }

            // โหลด Bio เดิม
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('bio, gender_identity, height_cm')
                .eq('id', user.id)
                .maybeSingle();

            if (profileError) {
                throw profileError;
            }

            setBio(profile?.bio ?? '');
            setHeightCm(
                typeof profile?.height_cm === 'number' && profile.height_cm > 0
                    ? profile.height_cm
                    : null
            );

            const savedGender = profile?.gender_identity;

            const genderLabel = genderOptions.find(
                (option) => GENDER_IDENTITY_MAP[option] === savedGender
            );

            setGenderIdentity(genderLabel ?? '');

            const { data: locations, error: locationsError } = await supabase
                .from('campus_locations')
                .select('id, name')
                .eq('is_active', true)
                .order('id', { ascending: true });

            if (locationsError) {
                throw locationsError;
            }

            setCampusLocations(locations ?? []);
            const { data: userLocationRows, error: userLocationsError } =
                await supabase
                    .from('user_locations')
                    .select('location_id')
                    .eq('user_id', user.id);

            if (userLocationsError) {
                throw userLocationsError;
            }

            setSelectedLocationIds(
                (userLocationRows ?? []).map((row) => row.location_id)
            );

            // โหลดรูปเดิม
            const { data: photoData, error: photoError } = await supabase
                .from('profile_photos')
                .select('id, storage_path, position')
                .eq('user_id', user.id)
                .order('position', { ascending: true });

            if (photoError) {
                throw photoError;
            }

            setPhotos(photoData ?? []);
        } catch (error) {
            console.error('Unable to load edit profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const getPhotoUrl = (storagePath: string) => {
        const { data } = supabase.storage
            .from('profile-photos')
            .getPublicUrl(storagePath);

        return data.publicUrl;
    };

    const pickImage = async (index: number) => {
        try {
            const permission =
                await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permission.granted) {
                console.error('Photo permission not granted');
                return;
            }

            const result =
                await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ['images'],
                    allowsEditing: true,
                    aspect: [3, 4],
                    quality: 0.8,
                });

            if (result.canceled) {
                return;
            }

            const selectedImage = result.assets[0]?.uri;

            if (!selectedImage) {
                return;
            }

            setNewImages((current) => {
                const updated = [...current];
                updated[index] = selectedImage;
                return updated;
            });
        } catch (error) {
            console.error('Image picker error:', error);
        }
    };

    const uploadNewPhotos = async (userId: string) => {
        for (let i = 0; i < newImages.length; i++) {
            const imageUri = newImages[i];

            // ช่องนี้ไม่ได้เลือกรูปใหม่
            if (!imageUri) {
                continue;
            }

            const position = i + 1;

            let arrayBuffer: ArrayBuffer;
            let contentType = 'image/jpeg';
            let extension = 'jpg';

            // Web
            if (Platform.OS === 'web') {
                const response = await fetch(imageUri);
                const blob = await response.blob();

                contentType = blob.type || 'image/jpeg';

                if (contentType.includes('png')) {
                    extension = 'png';
                } else if (contentType.includes('webp')) {
                    extension = 'webp';
                } else {
                    extension = 'jpg';
                }

                arrayBuffer = await blob.arrayBuffer();
            }

            // iOS / Android
            else {
                const imageContext =
                    ImageManipulator.manipulate(imageUri);

                imageContext.resize({
                    width: 1200,
                });

                const renderedImage =
                    await imageContext.renderAsync();

                const compressedImage =
                    await renderedImage.saveAsync({
                        compress: 0.75,
                        format: SaveFormat.JPEG,
                    });

                const response =
                    await fetch(compressedImage.uri);

                arrayBuffer =
                    await response.arrayBuffer();

                contentType = 'image/jpeg';
                extension = 'jpg';
            }

            // รูปเดิมของ position นี้ ถ้ามี
            const oldPhoto = photos.find(
                (photo) => photo.position === position
            );

            const oldStoragePath =
                oldPhoto?.storage_path ?? null;

            // สร้าง path แบบเดียวกับ onboarding
            const storagePath =
                `${userId}/${position}-${Date.now()}.${extension}`;

            const { error: uploadError } =
                await supabase.storage
                    .from('profile-photos')
                    .upload(
                        storagePath,
                        arrayBuffer,
                        {
                            contentType,
                            upsert: false,
                        }
                    );

            if (uploadError) {
                throw uploadError;
            }

            // อัปเดต row ของ position นี้
            const { error: photoError } =
                await supabase
                    .from('profile_photos')
                    .upsert(
                        {
                            user_id: userId,
                            storage_path: storagePath,
                            position,
                        },
                        {
                            onConflict: 'user_id,position',
                        }
                    );

            if (photoError) {
                throw photoError;
            }

            // เมื่อ DB ชี้รูปใหม่สำเร็จแล้ว ค่อยลบไฟล์เก่า
            if (
                oldStoragePath &&
                oldStoragePath !== storagePath
            ) {
                const { error: removeOldError } =
                    await supabase.storage
                        .from('profile-photos')
                        .remove([oldStoragePath]);

                if (removeOldError) {
                    console.warn(
                        'Unable to remove old profile photo:',
                        removeOldError
                    );
                }
            }
        }
    };

    const handleDeletePhoto = (photo: ProfilePhoto) => {
        setDeletedPhotos((current) => [
            ...current,
            photo,
        ]);

        setPhotos((current) =>
            current.filter((item) => item.id !== photo.id)
        );
    };

    const deleteMarkedPhotos = async (userId: string) => {
        for (const photo of deletedPhotos) {
            const { error: photoError } =
                await supabase
                    .from('profile_photos')
                    .delete()
                    .eq('user_id', userId)
                    .eq('position', photo.position);

            if (photoError) {
                throw photoError;
            }

            const { error: storageError } =
                await supabase.storage
                    .from('profile-photos')
                    .remove([photo.storage_path]);

            if (storageError) {
                console.warn(
                    'Unable to remove deleted profile photo:',
                    storageError
                );
            }
        }
    };

    const toggleLocation = (locationId: number) => {
        setSelectedLocationIds((current) =>
            current.includes(locationId)
                ? current.filter((id) => id !== locationId)
                : [...current, locationId]
        );
    };

    const saveCampusLocations = async (userId: string) => {
        const { data: existingRows, error: loadError } = await supabase
            .from('user_locations')
            .select('location_id')
            .eq('user_id', userId);

        if (loadError) {
            throw loadError;
        }

        const existingIds = (existingRows ?? []).map(
            (row) => row.location_id
        );

        const activeIds = campusLocations.map(
            (location) => location.id
        );

        const idsToDelete = existingIds.filter(
            (id) =>
                activeIds.includes(id) &&
                !selectedLocationIds.includes(id)
        );

        const idsToInsert = selectedLocationIds.filter(
            (id) => !existingIds.includes(id)
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
                    }))
                );

            if (insertError) {
                throw insertError;
            }
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError) {
                throw userError;
            }

            if (!user) {
                router.replace('/(auth)/login');
                return;
            }

            const genderValue = genderIdentity
                ? GENDER_IDENTITY_MAP[genderIdentity]
                : null;

            const { error } = await supabase
                .from('profiles')
                .update({
                    bio: bio.trim(),
                    gender_identity: genderValue,
                    height_cm: heightCm,
                })
                .eq('id', user.id);

            if (error) {
                throw error;
            }

            await saveCampusLocations(user.id);

            await deleteMarkedPhotos(user.id);

            await uploadNewPhotos(user.id);

            setDeletedPhotos([]);

            setNewImages([
                null,
                null,
                null,
                null,
                null,
                null,
            ]);

            await loadProfile();

            setSaveSuccess(true);

            setTimeout(() => {
                setSaveSuccess(false);
            }, 3000);

            setSaveSuccess(true);

            setTimeout(() => {
                setSaveSuccess(false);
            }, 3000);
        } catch (error) {
            console.error('Unable to save profile:', error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => {
                    if (router.canGoBack()) {
                        router.back();
                    } else {
                        router.replace('/profile');
                    }
                }}>
                    <Text style={styles.headerButton}>←</Text>
                </TouchableOpacity>

                <Text style={styles.title}>Edit Profile</Text>

                <TouchableOpacity onPress={() => router.push('/settings')}>
                    <Text style={styles.headerButton}>⚙</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.sectionTitle}>Photos</Text>

                <View style={styles.photoGrid}>
                    {[0, 1, 2, 3, 4, 5].map((index) => {
                        const photo = photos[index];
                        const newImage = newImages[index];

                        return (
                            <TouchableOpacity
                                key={index}
                                style={styles.photoBox}
                                onPress={() => pickImage(index)}
                            >
                                {newImage ? (
                                    <Image
                                        source={{ uri: newImage }}
                                        style={styles.photo}
                                    />
                                ) : photo ? (
                                    <>
                                        <Image
                                            source={{
                                                uri: getPhotoUrl(photo.storage_path),
                                            }}
                                            style={styles.photo}
                                        />

                                        <TouchableOpacity
                                            style={styles.removeButton}
                                            onPress={(event) => {
                                                event.stopPropagation();
                                                handleDeletePhoto(photo);
                                            }}
                                        >
                                            <Text style={styles.removeText}>
                                                ×
                                            </Text>
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <Text style={styles.plus}>+</Text>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <Text style={styles.sectionTitle}>Bio</Text>

                <TextInput
                    style={styles.bioInput}
                    value={bio}
                    onChangeText={setBio}
                    multiline
                    maxLength={300}
                    placeholder="Tell us about yourself"
                    textAlignVertical="top"
                />

                <Text style={styles.characterCount}>
                    {bio.length}/300
                </Text>

                <Text style={styles.sectionTitle}>Gender identity</Text>

                <TouchableOpacity
                    style={styles.selectField}
                    onPress={() => setGenderModal(true)}
                >
                    <Text style={styles.selectFieldText}>
                        {genderIdentity || 'Select gender identity'}
                    </Text>
                    <Text style={styles.selectArrow}>⌄</Text>
                </TouchableOpacity>

                <Modal
                    visible={genderModal}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setGenderModal(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>
                                Gender identity
                            </Text>

                            {genderOptions.map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    style={styles.modalOption}
                                    onPress={() => {
                                        setGenderIdentity(option);
                                        setGenderModal(false);
                                    }}
                                >
                                    <Text style={styles.modalOptionText}>
                                        {option}
                                        {genderIdentity === option ? ' ✓' : ''}
                                    </Text>
                                </TouchableOpacity>
                            ))}

                            <TouchableOpacity
                                style={styles.modalCancel}
                                onPress={() => setGenderModal(false)}
                            >
                                <Text>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                <Text style={styles.sectionTitle}>Height</Text>

                <TouchableOpacity
                    style={styles.selectField}
                    onPress={() => setHeightModal(true)}
                >
                    <Text style={styles.selectFieldText}>
                        {heightCm !== null ? `${heightCm} cm` : 'Select height'}
                    </Text>
                    <Text style={styles.selectArrow}>⌄</Text>
                </TouchableOpacity>

                <Modal
                    visible={heightModal}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setHeightModal(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>
                                Height
                            </Text>

                            <WheelPicker
                                items={heightOptions}
                                value={String(heightCm ?? 170)}
                                itemHeight={44}
                                onValueChange={(value) => {
                                    setHeightCm(Number(value));
                                }}
                            />

                            <TouchableOpacity
                                style={styles.heightDoneButton}
                                onPress={() => setHeightModal(false)}
                            >
                                <Text style={styles.heightDoneText}>
                                    Done
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                <Text style={styles.sectionTitle}>Campus locations</Text>

                <View style={styles.locationsContainer}>
                    {campusLocations.map((location) => {
                        const selected = selectedLocationIds.includes(location.id);

                        return (
                            <TouchableOpacity
                                key={location.id}
                                style={[
                                    styles.locationChip,
                                    selected && styles.locationChipSelected,
                                ]}
                                onPress={() => toggleLocation(location.id)}
                            >
                                <Text style={styles.locationChipText}>
                                    {selected ? '✓ ' : ''}
                                    {location.name}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSave}
                    disabled={saving}
                >
                    <Text style={styles.saveButtonText}>
                        {saving ? 'Saving...' : 'Save'}
                    </Text>
                </TouchableOpacity>

                {saveSuccess && (
                    <Text style={styles.successText}>
                        Profile saved successfully!
                    </Text>
                )}

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },

    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 16,
    },

    headerButton: {
        fontSize: 24,
    },

    title: {
        fontSize: 20,
        fontWeight: '700',
    },

    content: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginTop: 24,
        marginBottom: 12,
    },

    photoGrid: {
        flexDirection: 'row',
        gap: 10,
    },

    photoBox: {
        flex: 1,
        aspectRatio: 0.75,
        borderRadius: 12,
        backgroundColor: '#eee',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },

    photo: {
        width: '100%',
        height: '100%',
    },

    plus: {
        fontSize: 36,
        color: '#777',
    },

    bioInput: {
        minHeight: 120,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
    },

    characterCount: {
        textAlign: 'right',
        marginTop: 6,
        color: '#777',
    },

    selectField: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    selectFieldText: {
        fontSize: 16,
        color: '#222',
    },

    selectArrow: {
        fontSize: 22,
        color: '#777',
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },

    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
    },

    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
    },

    modalOption: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },

    modalOptionText: {
        fontSize: 16,
    },

    modalCancel: {
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 6,
    },

    heightDoneButton: {
        marginTop: 16,
        backgroundColor: '#222',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },

    heightDoneText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },

    locationsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },

    locationChip: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },

    locationChipSelected: {
        borderColor: '#222',
        backgroundColor: '#eee',
    },

    locationChipText: {
        fontSize: 14,
        color: '#222',
    },

    saveButton: {
        marginTop: 30,
        backgroundColor: '#222',
        borderRadius: 24,
        paddingVertical: 13,
        alignItems: 'center',
    },

    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },

    successText: {
        textAlign: 'center',
        marginTop: 12,
        fontSize: 14,
    },

    removeButton: {
        position: 'absolute',
        top: 5,
        right: 5,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },

    removeText: {
        fontSize: 18,
        lineHeight: 20,
    },
});
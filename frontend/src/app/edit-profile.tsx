import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import {
    ActivityIndicator,
    Image,
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

type ProfilePhoto = {
    id: string;
    storage_path: string;
    position: number;
};

export default function EditProfileScreen() {
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [bio, setBio] = useState('');
    const [photos, setPhotos] = useState<ProfilePhoto[]>([]);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [newImages, setNewImages] = useState<(string | null)[]>(
        [null, null, null, null, null, null]
    );
    const [deletedPhotos, setDeletedPhotos] = useState<ProfilePhoto[]>([]);

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
                .select('bio')
                .eq('id', user.id)
                .maybeSingle();

            if (profileError) {
                throw profileError;
            }

            setBio(profile?.bio ?? '');

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

            const { error } = await supabase
                .from('profiles')
                .update({
                    bio: bio.trim(),
                })
                .eq('id', user.id);

            if (error) {
                throw error;
            }

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
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.headerButton}>←</Text>
                </TouchableOpacity>

                <Text style={styles.title}>Edit Profile</Text>

                <TouchableOpacity onPress={() => console.log('Open Settings')}>
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
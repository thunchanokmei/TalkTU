import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import {
    ActivityIndicator,
    Animated,
    Image,
    Modal,
    PanResponder,
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
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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

type ProfilePhoto = {
    id: string;
    storage_path: string;
    position: number;
};

type CampusLocation = {
    id: number;
    name: string;
};

type FavoriteFoodSpot = {
    id: number;
    name: string;
};

/* ช่องรูป 1 ช่อง: รูปที่บันทึกแล้ว หรือรูปใหม่ที่เพิ่งเลือก (ยังไม่อัปโหลด) */
type SlotItem =
    | { type: 'saved'; id: string; storagePath: string }
    | { type: 'new'; uri: string };

type Rect = { x: number; y: number; w: number; h: number };

const PHOTO_SLOT_COUNT = 6;

const THEME_GRADIENT = ['#FF8D88', '#FFAF79', '#FFD86E'] as const;
const PANEL_GRADIENT = ['#F08A8E', '#F4AA82', '#FAE6CB'] as const;
const TITLE_PINK = '#F08A8E';

const genderOptions = GENDER_IDENTITY_OPTIONS;

/* ---------- ตัวเลือกส่วนสูง ---------- */

const HEIGHT_MIN = 100;
const HEIGHT_MAX = 250;
const HEIGHT_DEFAULT = 170;
const WHEEL_ITEM_HEIGHT = 44;
const WHEEL_VISIBLE_ITEMS = 5;

const heightValues = Array.from(
    { length: HEIGHT_MAX - HEIGHT_MIN + 1 },
    (_, index) => HEIGHT_MIN + index
);

function clampHeight(value: number) {
    return Math.min(HEIGHT_MAX, Math.max(HEIGHT_MIN, value));
}

function buildSlots(photos: ProfilePhoto[]): (SlotItem | null)[] {
    const result: (SlotItem | null)[] = Array(PHOTO_SLOT_COUNT).fill(null);

    for (const photo of photos) {
        const index = photo.position - 1;

        if (index >= 0 && index < PHOTO_SLOT_COUNT) {
            result[index] = {
                type: 'saved',
                id: photo.id,
                storagePath: photo.storage_path,
            };
        }
    }

    return result;
}

/* ============================================================
   Height wheel (เลื่อนเลือกส่วนสูง)
============================================================ */

function HeightWheel({
    value,
    onChange,
}: {
    value: number;
    onChange: (value: number) => void;
}) {
    const scrollRef = useRef<ScrollView>(null);
    const current = clampHeight(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            scrollRef.current?.scrollTo({
                y: (current - HEIGHT_MIN) * WHEEL_ITEM_HEIGHT,
                animated: false,
            });
        }, 0);

        return () => clearTimeout(timer);
        // เลื่อนไปค่าเริ่มต้นแค่ตอนเปิดครั้งแรก
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const settle = (offsetY: number) => {
        const index = Math.min(
            heightValues.length - 1,
            Math.max(0, Math.round(offsetY / WHEEL_ITEM_HEIGHT))
        );

        onChange(HEIGHT_MIN + index);
    };

    return (
        <View
            style={{
                height: WHEEL_ITEM_HEIGHT * WHEEL_VISIBLE_ITEMS,
            }}
        >
            <View
                pointerEvents="none"
                style={[
                    styles.wheelBand,
                    {
                        top:
                            WHEEL_ITEM_HEIGHT *
                            Math.floor(WHEEL_VISIBLE_ITEMS / 2),
                        height: WHEEL_ITEM_HEIGHT,
                    },
                ]}
            />

            <ScrollView
                ref={scrollRef}
                showsVerticalScrollIndicator={false}
                snapToInterval={WHEEL_ITEM_HEIGHT}
                decelerationRate="fast"
                nestedScrollEnabled
                scrollEventThrottle={16}
                onMomentumScrollEnd={(event) =>
                    settle(event.nativeEvent.contentOffset.y)
                }
                onScrollEndDrag={(event) =>
                    settle(event.nativeEvent.contentOffset.y)
                }
                contentContainerStyle={{
                    paddingVertical:
                        WHEEL_ITEM_HEIGHT *
                        Math.floor(WHEEL_VISIBLE_ITEMS / 2),
                }}
            >
                {heightValues.map((item) => (
                    <View key={item} style={styles.wheelItem}>
                        <Text
                            style={[
                                styles.wheelText,
                                item === current && styles.wheelTextActive,
                            ]}
                        >
                            {item}
                        </Text>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

/* ============================================================
   Photo slot (แตะ = เลือกรูป, กดค้างแล้วลาก = สลับตำแหน่ง)
============================================================ */

type PhotoSlotProps = {
    index: number;
    rect: Rect;
    uri: string | null;
    isDragging: boolean;
    isOver: boolean;
    dragXY: Animated.ValueXY;
    onPress: (index: number) => void;
    onRemove: (index: number) => void;
    onDragStart: (index: number) => void;
    onDragMove: (index: number, dx: number, dy: number) => void;
    onDragEnd: (index: number, dx: number, dy: number) => void;
    onDragCancel: () => void;
};

const LONG_PRESS_MS = 280;

function PhotoSlot(props: PhotoSlotProps) {
    const propsRef = useRef(props);
    propsRef.current = props;

    const draggingRef = useRef(false);
    const movedRef = useRef(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearTimer = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    useEffect(() => clearTimer, []);

    const responder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,

            onPanResponderGrant: () => {
                movedRef.current = false;
                draggingRef.current = false;
                clearTimer();

                // ช่องว่างลากไม่ได้ (แตะเพื่อเลือกรูปอย่างเดียว)
                if (propsRef.current.uri) {
                    timerRef.current = setTimeout(() => {
                        draggingRef.current = true;
                        propsRef.current.onDragStart(propsRef.current.index);
                    }, LONG_PRESS_MS);
                }
            },

            onPanResponderMove: (_, gesture) => {
                if (draggingRef.current) {
                    propsRef.current.onDragMove(
                        propsRef.current.index,
                        gesture.dx,
                        gesture.dy
                    );
                    return;
                }

                if (
                    Math.abs(gesture.dx) > 8 ||
                    Math.abs(gesture.dy) > 8
                ) {
                    movedRef.current = true;
                    clearTimer();
                }
            },

            onPanResponderRelease: (_, gesture) => {
                clearTimer();

                if (draggingRef.current) {
                    draggingRef.current = false;
                    propsRef.current.onDragEnd(
                        propsRef.current.index,
                        gesture.dx,
                        gesture.dy
                    );
                    return;
                }

                if (!movedRef.current) {
                    propsRef.current.onPress(propsRef.current.index);
                }
            },

            // ยังไม่ได้ลาก = ให้ ScrollView แย่งไปเลื่อนหน้าได้
            onPanResponderTerminationRequest: () => !draggingRef.current,

            onPanResponderTerminate: () => {
                clearTimer();

                if (draggingRef.current) {
                    draggingRef.current = false;
                    propsRef.current.onDragCancel();
                }
            },
        })
    ).current;

    const { rect, uri, isDragging, isOver, dragXY, index } = props;

    return (
        <Animated.View
            {...responder.panHandlers}
            style={[
                styles.photoBox,
                {
                    position: 'absolute',
                    left: rect.x,
                    top: rect.y,
                    width: rect.w,
                    height: rect.h,
                    zIndex: isDragging ? 50 : 1,
                },
                isOver && styles.photoBoxOver,
                isDragging && {
                    opacity: 0.9,
                    transform: [
                        { translateX: dragXY.x },
                        { translateY: dragXY.y },
                        { scale: 1.04 },
                    ],
                },
            ]}
        >
            {uri ? (
                <Image source={{ uri }} style={styles.photo} />
            ) : (
                <Text style={styles.plus}>+</Text>
            )}

            {uri && !isDragging ? (
                <TouchableOpacity
                    style={styles.removeButton}
                    hitSlop={{
                        top: 8,
                        bottom: 8,
                        left: 8,
                        right: 8,
                    }}
                    onPress={() => props.onRemove(index)}
                >
                    <Text style={styles.removeText}>×</Text>
                </TouchableOpacity>
            ) : null}
        </Animated.View>
    );
}

/* ============================================================
   Screen
============================================================ */

export default function EditProfileScreen() {
    const router = useRouter();
    const { width: screenWidth } = useWindowDimensions();

    /* ขนาดช่องรูปตาม mockup: ช่องใหญ่ซ้าย (2x2) + ช่องเล็ก 2 ช่องขวา + แถวล่าง 3 ช่อง */
    const pagePadding = 20;
    const panelPadding = 14;
    const gridGap = 10;
    const innerWidth =
        screenWidth - pagePadding * 2 - panelPadding * 2;
    const smallW = (innerWidth - gridGap * 2) / 3;
    const smallH = smallW * 1.45;
    const bigW = smallW * 2 + gridGap;
    const bigH = smallH * 2 + gridGap;
    const gridHeight = bigH + gridGap + smallH;

    const rects: Rect[] = [
        { x: 0, y: 0, w: bigW, h: bigH },
        { x: bigW + gridGap, y: 0, w: smallW, h: smallH },
        { x: bigW + gridGap, y: smallH + gridGap, w: smallW, h: smallH },
        { x: 0, y: bigH + gridGap, w: smallW, h: smallH },
        {
            x: smallW + gridGap,
            y: bigH + gridGap,
            w: smallW,
            h: smallH,
        },
        {
            x: (smallW + gridGap) * 2,
            y: bigH + gridGap,
            w: smallW,
            h: smallH,
        },
    ];

    const [loading, setLoading] = useState(true);
    const [bio, setBio] = useState('');
    const [genderIdentity, setGenderIdentity] =
        useState<GenderIdentityLabel | ''>('');

    const [genderModal, setGenderModal] = useState(false);
    const [savedPhotos, setSavedPhotos] = useState<ProfilePhoto[]>([]);
    const [slots, setSlots] = useState<(SlotItem | null)[]>(
        Array(PHOTO_SLOT_COUNT).fill(null)
    );
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [heightCm, setHeightCm] = useState<number | null>(null);
    const [heightModal, setHeightModal] = useState(false);

    const [campusLocations, setCampusLocations] = useState<CampusLocation[]>([]);
    const [selectedLocationIds, setSelectedLocationIds] = useState<number[]>([]);

    const [afterClass, setAfterClass] = useState('');
    const [favoriteSpot, setFavoriteSpot] = useState('');
    const [favoriteFoodSpots, setFavoriteFoodSpots] = useState<FavoriteFoodSpot[]>([]);
    const [selectedFoodSpotIds, setSelectedFoodSpotIds] = useState<number[]>([]);

    // ลากสลับตำแหน่งรูป
    const [dragFrom, setDragFrom] = useState<number | null>(null);
    const [dragOver, setDragOver] = useState<number | null>(null);
    const dragXY = useRef(new Animated.ValueXY()).current;

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
                .select('bio, gender_identity, height_cm, after_class, favorite_spot')
                .eq('id', user.id)
                .maybeSingle();

            if (profileError) {
                throw profileError;
            }

            setBio(profile?.bio ?? '');
            setAfterClass(profile?.after_class ?? '');
            setFavoriteSpot(profile?.favorite_spot ?? '');
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
            const { data: foodSpots, error: foodSpotsError } = await supabase
                .from('favorite_food_spots')
                .select('id, name')
                .eq('is_active', true)
                .order('id', { ascending: true });

            if (foodSpotsError) {
                throw foodSpotsError;
            }

            setFavoriteFoodSpots(foodSpots ?? []);

            const { data: userFoodSpotRows, error: userFoodSpotsError } =
                await supabase
                    .from('user_favorite_food_spots')
                    .select('food_spot_id')
                    .eq('user_id', user.id);

            if (userFoodSpotsError) {
                throw userFoodSpotsError;
            }

            setSelectedFoodSpotIds(
                (userFoodSpotRows ?? []).map((row) => row.food_spot_id)
            );
            const { data: photoData, error: photoError } = await supabase
                .from('profile_photos')
                .select('id, storage_path, position')
                .eq('user_id', user.id)
                .order('position', { ascending: true });

            if (photoError) {
                throw photoError;
            }

            setSavedPhotos(photoData ?? []);
            setSlots(buildSlots(photoData ?? []));
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

    const getSlotUri = (slot: SlotItem | null) => {
        if (!slot) {
            return null;
        }

        return slot.type === 'saved'
            ? getPhotoUrl(slot.storagePath)
            : slot.uri;
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

            setSlots((current) => {
                const updated = [...current];
                updated[index] = { type: 'new', uri: selectedImage };
                return updated;
            });
        } catch (error) {
            console.error('Image picker error:', error);
        }
    };

    const handleRemoveSlot = (index: number) => {
        setSlots((current) => {
            const updated = [...current];
            updated[index] = null;
            return updated;
        });
    };

    /* ---------- ลากสลับตำแหน่ง ---------- */

    const findDropTarget = (from: number, dx: number, dy: number) => {
        const origin = rects[from];
        const centerX = origin.x + origin.w / 2 + dx;
        const centerY = origin.y + origin.h / 2 + dy;

        return rects.findIndex(
            (rect) =>
                centerX >= rect.x &&
                centerX <= rect.x + rect.w &&
                centerY >= rect.y &&
                centerY <= rect.y + rect.h
        );
    };

    const resetDrag = () => {
        dragXY.setValue({ x: 0, y: 0 });
        setDragFrom(null);
        setDragOver(null);
    };

    const handleDragStart = (index: number) => {
        dragXY.setValue({ x: 0, y: 0 });
        setDragFrom(index);
        setDragOver(null);
    };

    const handleDragMove = (index: number, dx: number, dy: number) => {
        dragXY.setValue({ x: dx, y: dy });

        const target = findDropTarget(index, dx, dy);
        const next = target >= 0 && target !== index ? target : null;

        setDragOver((previous) => (previous === next ? previous : next));
    };

    const handleDragEnd = (index: number, dx: number, dy: number) => {
        const target = findDropTarget(index, dx, dy);

        if (target >= 0 && target !== index) {
            setSlots((current) => {
                const updated = [...current];
                [updated[index], updated[target]] = [
                    updated[target],
                    updated[index],
                ];
                return updated;
            });
        }

        resetDrag();
    };

    /* ---------- อัปโหลดรูปใหม่ ---------- */

    const uploadImage = async (
        userId: string,
        imageUri: string,
        position: number
    ) => {
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
            const imageContext = ImageManipulator.manipulate(imageUri);

            imageContext.resize({
                width: 1200,
            });

            const renderedImage = await imageContext.renderAsync();

            const compressedImage = await renderedImage.saveAsync({
                compress: 0.75,
                format: SaveFormat.JPEG,
            });

            const response = await fetch(compressedImage.uri);

            arrayBuffer = await response.arrayBuffer();

            contentType = 'image/jpeg';
            extension = 'jpg';
        }

        // สร้าง path แบบเดียวกับ onboarding
        const storagePath =
            `${userId}/${position}-${Date.now()}.${extension}`;

        const { error: uploadError } = await supabase.storage
            .from('profile-photos')
            .upload(storagePath, arrayBuffer, {
                contentType,
                upsert: false,
            });

        if (uploadError) {
            throw uploadError;
        }

        return storagePath;
    };

    /*
     * บันทึกรูปทั้งหมดตามลำดับช่องปัจจุบัน
     *
     * 1) อัปโหลดรูปใหม่
     * 2) ช่องไหนรูปเปลี่ยน -> upsert ที่ position นั้น
     *    (สลับตำแหน่งก็คือ upsert path ใหม่ลงแต่ละ position ไม่ต้องใช้ position ชั่วคราว)
     * 3) ช่องที่ว่างแต่เดิมมีรูป -> ลบ row
     * 4) ลบไฟล์ใน storage ของรูปที่ไม่ได้ใช้แล้ว
     */
    const savePhotos = async (userId: string) => {
        const desiredPaths: (string | null)[] = [];

        for (let i = 0; i < PHOTO_SLOT_COUNT; i++) {
            const slot = slots[i];

            if (!slot) {
                desiredPaths.push(null);
            } else if (slot.type === 'saved') {
                desiredPaths.push(slot.storagePath);
            } else {
                desiredPaths.push(
                    await uploadImage(userId, slot.uri, i + 1)
                );
            }
        }

        const currentPathAt = (position: number) =>
            savedPhotos.find((photo) => photo.position === position)
                ?.storage_path ?? null;

        // upsert ก่อน เพื่อไม่ให้มีช่วงที่ไม่เหลือรูปเลย
        for (let i = 0; i < PHOTO_SLOT_COUNT; i++) {
            const position = i + 1;
            const desired = desiredPaths[i];

            if (desired && desired !== currentPathAt(position)) {
                const { error } = await supabase
                    .from('profile_photos')
                    .upsert(
                        {
                            user_id: userId,
                            storage_path: desired,
                            position,
                        },
                        {
                            onConflict: 'user_id,position',
                        }
                    );

                if (error) {
                    throw error;
                }
            }
        }

        for (let i = 0; i < PHOTO_SLOT_COUNT; i++) {
            const position = i + 1;

            if (!desiredPaths[i] && currentPathAt(position)) {
                const { error } = await supabase
                    .from('profile_photos')
                    .delete()
                    .eq('user_id', userId)
                    .eq('position', position);

                if (error) {
                    throw error;
                }
            }
        }

        // ลบไฟล์ที่ไม่ได้ใช้แล้ว (ล้มเหลวได้ ไม่กระทบการบันทึก)
        const keepPaths = new Set(
            desiredPaths.filter((path): path is string => Boolean(path))
        );

        const unusedPaths = savedPhotos
            .filter(
                (photo) =>
                    photo.position >= 1 &&
                    photo.position <= PHOTO_SLOT_COUNT &&
                    !keepPaths.has(photo.storage_path)
            )
            .map((photo) => photo.storage_path);

        if (unusedPaths.length > 0) {
            const { error: removeError } = await supabase.storage
                .from('profile-photos')
                .remove(unusedPaths);

            if (removeError) {
                console.warn(
                    'Unable to remove unused profile photos:',
                    removeError
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

    const goBack = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/profile');
        }
    };

    const handleSave = async () => {
        if (saving || dragFrom !== null) {
            return;
        }

        try {
            setSaving(true);
            setErrorMessage('');

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
                    after_class: afterClass.trim() || null,
                    favorite_spot: favoriteSpot.trim() || null,
                })
                .eq('id', user.id);

            if (error) {
                throw error;
            }

            await saveCampusLocations(user.id);

            const { data: existingFoodSpotRows, error: loadFoodSpotsError } =
                await supabase
                    .from('user_favorite_food_spots')
                    .select('food_spot_id')
                    .eq('user_id', user.id);

            if (loadFoodSpotsError) {
                throw loadFoodSpotsError;
            }

            const existingFoodSpotIds = (existingFoodSpotRows ?? []).map(
                (row) => Number(row.food_spot_id)
            );

            const idsToDelete = existingFoodSpotIds.filter(
                (id) => !selectedFoodSpotIds.includes(id)
            );

            const idsToInsert = selectedFoodSpotIds.filter(
                (id) => !existingFoodSpotIds.includes(id)
            );

            if (idsToDelete.length > 0) {
                const { error: deleteFoodSpotsError } = await supabase
                    .from('user_favorite_food_spots')
                    .delete()
                    .eq('user_id', user.id)
                    .in('food_spot_id', idsToDelete);

                if (deleteFoodSpotsError) {
                    throw deleteFoodSpotsError;
                }
            }

            if (idsToInsert.length > 0) {
                const { error: insertFoodSpotsError } = await supabase
                    .from('user_favorite_food_spots')
                    .insert(
                        idsToInsert.map((foodSpotId) => ({
                            user_id: user.id,
                            food_spot_id: foodSpotId,
                        }))
                    );

                if (insertFoodSpotsError) {
                    throw insertFoodSpotsError;
                }
            }


            await savePhotos(user.id);

            // บันทึกสำเร็จ -> กลับหน้า Profile
            goBack();
        } catch (error) {
            console.error('Unable to save profile:', error);
            setErrorMessage('Unable to save profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const openHeightPicker = () => {
        if (heightCm === null) {
            setHeightCm(HEIGHT_DEFAULT);
        }

        setHeightModal(true);
    };

    if (loading) {
        return (
            <SafeAreaView
                style={styles.loadingContainer}
                edges={['top', 'bottom']}
            >
                <ActivityIndicator size="large" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            {/* ================= HEADER ================= */}

            <View style={[styles.header, { paddingHorizontal: pagePadding }]}>
                <TouchableOpacity
                    style={styles.headerShadow}
                    onPress={goBack}
                    activeOpacity={0.85}
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
                    <Text style={styles.title}>EDIT PROFILE</Text>
                </View>

                <TouchableOpacity
                    style={styles.headerShadow}
                    onPress={handleSave}
                    disabled={saving}
                    activeOpacity={0.85}
                >
                    <LinearGradient
                        colors={THEME_GRADIENT}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={styles.circleButton}
                    >
                        {saving ? (
                            <ActivityIndicator
                                size="small"
                                color="#FFFFFF"
                            />
                        ) : (
                            <Ionicons
                                name="checkmark"
                                size={26}
                                color="#FFFFFF"
                            />
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={[
                    styles.content,
                    { paddingHorizontal: pagePadding },
                ]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                automaticallyAdjustKeyboardInsets
                scrollEnabled={dragFrom === null}
            >
                {errorMessage ? (
                    <Text style={styles.errorText}>{errorMessage}</Text>
                ) : null}

                {/* ================= PHOTOS PANEL ================= */}

                <View style={styles.panelShadow}>
                    <LinearGradient
                        colors={PANEL_GRADIENT}
                        start={{ x: 0.5, y: 0 }}
                        end={{ x: 0.5, y: 1 }}
                        style={[
                            styles.panel,
                            { padding: panelPadding },
                        ]}
                    >
                        <View
                            style={{
                                width: innerWidth,
                                height: gridHeight,
                            }}
                        >
                            {rects.map((rect, index) => (
                                <PhotoSlot
                                    key={index}
                                    index={index}
                                    rect={rect}
                                    uri={getSlotUri(slots[index])}
                                    isDragging={dragFrom === index}
                                    isOver={dragOver === index}
                                    dragXY={dragXY}
                                    onPress={pickImage}
                                    onRemove={handleRemoveSlot}
                                    onDragStart={handleDragStart}
                                    onDragMove={handleDragMove}
                                    onDragEnd={handleDragEnd}
                                    onDragCancel={resetDrag}
                                />
                            ))}
                        </View>
                    </LinearGradient>
                </View>

                {/* ================= INFORMATION ================= */}

                <Text style={styles.sectionTitle}>Bio</Text>

                <View style={styles.bioBox}>
                    <TextInput
                        style={styles.bioInput}
                        value={bio}
                        onChangeText={setBio}
                        multiline
                        maxLength={300}
                        placeholder="Tell us about yourself"
                        placeholderTextColor="#999999"
                        textAlignVertical="top"
                    />

                    <Text style={styles.characterCount}>
                        {bio.length}/300
                    </Text>
                </View>

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

                <Text style={styles.sectionTitle}>Height</Text>

                <TouchableOpacity
                    style={styles.selectField}
                    onPress={openHeightPicker}
                >
                    <Text style={styles.selectFieldText}>
                        {heightCm !== null ? `${heightCm} cm` : 'Select height'}
                    </Text>
                    <Text style={styles.selectArrow}>⌄</Text>
                </TouchableOpacity>
                {/* ================= BIO 2 ================= */}

                <Text style={styles.sectionTitle}>After Class I Go...</Text>

                <View style={styles.bioBox}>
                    <TextInput
                        style={styles.bioInput}
                        value={afterClass}
                        onChangeText={setAfterClass}
                        maxLength={150}
                        placeholder="What do you usually do after class?"
                        placeholderTextColor="#999999"
                    />
                </View>

                <Text style={styles.sectionTitle}>My Favorite Spot</Text>

                <View style={styles.bioBox}>
                    <TextInput
                        style={styles.bioInput}
                        value={favoriteSpot}
                        onChangeText={setFavoriteSpot}
                        maxLength={150}
                        placeholder="Tell us your favorite spot"
                        placeholderTextColor="#999999"
                    />
                </View>

                <Text style={styles.sectionTitle}>My Favorite Restaurant</Text>

                <View style={styles.locationsContainer}>
                    {favoriteFoodSpots.map((spot) => {
                        const selected = selectedFoodSpotIds.includes(spot.id);

                        return (
                            <TouchableOpacity
                                key={spot.id}
                                style={[
                                    styles.locationChip,
                                    selected && styles.locationChipSelected,
                                ]}
                                onPress={() => {
                                    setSelectedFoodSpotIds((previous) =>
                                        previous.includes(spot.id)
                                            ? previous.filter((id) => id !== spot.id)
                                            : [...previous, spot.id]
                                    );
                                }}
                            >
                                <Text style={styles.locationChipText}>
                                    {selected ? '✓ ' : ''}
                                    {spot.name}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <Text style={styles.sectionTitle}>You'll usually find me at.. </Text>

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
            </ScrollView>

            {/* ================= GENDER MODAL ================= */}

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

            {/* ================= HEIGHT MODAL ================= */}

            <Modal
                visible={heightModal}
                transparent
                animationType="fade"
                onRequestClose={() => setHeightModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Height (cm)</Text>

                        <HeightWheel
                            value={heightCm ?? HEIGHT_DEFAULT}
                            onChange={setHeightCm}
                        />

                        <TouchableOpacity
                            style={styles.heightDoneButton}
                            onPress={() => setHeightModal(false)}
                        >
                            <Text style={styles.heightDoneText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },

    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },

    /* ================= HEADER ================= */

    header: {
        height: 72,
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

    title: {
        fontSize: 22,
        fontWeight: '800',
        letterSpacing: 0.5,
        color: TITLE_PINK,
    },

    content: {
        paddingTop: 8,
        paddingBottom: 48,
    },

    errorText: {
        textAlign: 'center',
        marginBottom: 10,
        fontSize: 14,
        color: '#C62828',
    },

    /* ================= PHOTOS PANEL ================= */

    panelShadow: {
        borderRadius: 26,
        backgroundColor: '#F4AA82',
        ...softShadow,
    },

    panel: {
        borderRadius: 26,
    },

    hintText: {
        marginTop: 10,
        textAlign: 'center',
        fontSize: 12,
        color: '#999999',
    },

    photoBox: {
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },

    photoBoxOver: {
        borderWidth: 3,
        borderColor: '#222222',
    },

    photo: {
        width: '100%',
        height: '100%',
    },

    plus: {
        fontSize: 40,
        fontWeight: '300',
        color: '#111111',
    },

    removeButton: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.25,
                shadowRadius: 2,
            },
            android: {
                elevation: 3,
            },
        }),
    },

    removeText: {
        fontSize: 16,
        lineHeight: 18,
        color: '#111111',
    },

    /* ================= INFORMATION ================= */

    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: TITLE_PINK,
        marginTop: 26,
        marginBottom: 12,
    },

    bioBox: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingTop: 12,
        paddingBottom: 8,
    },

    bioInput: {
        minHeight: 100,
        fontSize: 16,
        color: '#111111',
    },

    characterCount: {
        alignSelf: 'flex-end',
        fontSize: 12,
        color: '#999999',
    },

    selectField: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 14,
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

    /* ================= HEIGHT WHEEL ================= */

    wheelBand: {
        position: 'absolute',
        left: 0,
        right: 0,
        borderRadius: 12,
        backgroundColor: '#FFF0E8',
    },

    wheelItem: {
        height: WHEEL_ITEM_HEIGHT,
        alignItems: 'center',
        justifyContent: 'center',
    },

    wheelText: {
        fontSize: 20,
        color: '#AAAAAA',
    },

    wheelTextActive: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111111',
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

    /* ================= LOCATIONS ================= */

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
        borderColor: '#F08A8E',
        backgroundColor: '#FFF0E8',
    },

    locationChipText: {
        fontSize: 14,
        color: '#222',
    },
});

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

import {
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import OnboardingGoButton from '../components/navigation/OnboardingGoButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
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

/* ============================================================
   Types / constants
============================================================ */

type ProfilePhoto = {
  id: string;
  storage_path: string;
  position: number;
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

/* ---------- ตัวเลือกส่วนสูง (เหมือนหน้า Edit Profile) ---------- */

const HEIGHT_MIN = 100;
const HEIGHT_MAX = 250;
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

async function withRetry<T>(task: () => Promise<T>, tries = 2): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < tries; attempt++) {
    try {
      return await task();
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

/* ============================================================
   Small animated helpers
============================================================ */

/* ค่อย ๆ เลื่อนขึ้น + จางเข้า ตอนเปิดหน้า */
function FadeInView({
  delay = 0,
  children,
  style,
}: {
  delay?: number;
  children: React.ReactNode;
  style?: object;
}) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 420,
      delay,
      useNativeDriver: true,
    }).start();
  }, [delay, progress]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [16, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

/* ชิปสถานที่: เด้งเล็กน้อยตอนกด */
function LocationChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (value: number) => {
    Animated.spring(scale, {
      toValue: value,
      speed: 40,
      bounciness: 8,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={() => animateTo(0.92)}
        onPressOut={() => animateTo(1)}
        style={[
          styles.locationChip,
          selected && styles.locationChipSelected,
        ]}
      >
        <Text
          style={[
            styles.locationChipText,
            selected && styles.locationChipTextSelected,
          ]}
        >
          {selected ? '✓ ' : ''}
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

/* ============================================================
   Height wheel (เลื่อนเลือกส่วนสูง — เหมือนหน้า Edit Profile)
============================================================ */

function HeightWheel({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const scrollRef =
    useRef<React.ElementRef<typeof ScrollView>>(null); const current = clampHeight(value);

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

  // เด้งเข้าทีละช่องตอนเปิดหน้า + ยุบเล็กน้อยตอนกด
  const entrance = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(entrance, {
      toValue: 1,
      delay: 120 + props.index * 70,
      speed: 12,
      bounciness: 9,
      useNativeDriver: true,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatePress = (value: number) => {
    Animated.spring(pressScale, {
      toValue: value,
      speed: 40,
      bounciness: 6,
      useNativeDriver: true,
    }).start();
  };

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
        animatePress(0.96);

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

        if (Math.abs(gesture.dx) > 8 || Math.abs(gesture.dy) > 8) {
          movedRef.current = true;
          clearTimer();
        }
      },

      onPanResponderRelease: (_, gesture) => {
        clearTimer();
        animatePress(1);

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
        animatePress(1);

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
          opacity: entrance,
        },
        isOver && styles.photoBoxOver,
        isDragging
          ? {
            opacity: 0.92,
            transform: [
              { translateX: dragXY.x },
              { translateY: dragXY.y },
              { scale: 1.06 },
            ],
          }
          : {
            transform: [
              {
                scale: Animated.multiply(
                  entrance.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.6, 1],
                  }),
                  pressScale
                ),
              },
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

export default function Bio1Screen() {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();

  /* ขนาดช่องรูปเหมือนหน้า Edit Profile */
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
    { x: smallW + gridGap, y: bigH + gridGap, w: smallW, h: smallH },
    { x: (smallW + gridGap) * 2, y: bigH + gridGap, w: smallW, h: smallH },
  ];

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [
    genderIdentity,
    setGenderIdentity,
  ] = useState<GenderIdentityLabel | ''>('');
  const [heightCm, setHeightCm] = useState(170);
  const [places, setPlaces] = useState<string[]>([]);

  const [savedPhotos, setSavedPhotos] = useState<ProfilePhoto[]>([]);
  const [slots, setSlots] = useState<(SlotItem | null)[]>(
    Array(PHOTO_SLOT_COUNT).fill(null)
  );

  const [genderModal, setGenderModal] = useState(false);
  const [heightModal, setHeightModal] = useState(false);

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // ลากสลับตำแหน่งรูป
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const dragXY = useRef(new Animated.ValueXY()).current;

  // popup เสร็จสิ้น
  const [finishVisible, setFinishVisible] = useState(false);
  const finishScale = useRef(new Animated.Value(0.7)).current;
  const finishOpacity = useRef(new Animated.Value(0)).current;
  const finishPulse = useRef(new Animated.Value(1)).current;
  const finishFloat = useRef(new Animated.Value(0)).current;

  const genderOptions = GENDER_IDENTITY_OPTIONS;

  useEffect(() => {
    const loadExistingProfile = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!user) {
          return;
        }

        const {
          data: profile,
          error: profileError,
        } = await supabase
          .from('profiles')
          .select(
            'display_name, bio, height_cm, gender_identity'
          )
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) {
          throw profileError;
        }

        setDisplayName(
          profile?.display_name ?? ''
        );

        setBio(
          profile?.bio ?? ''
        );

        if (
          typeof profile?.height_cm === 'number' &&
          profile.height_cm > 0
        ) {
          setHeightCm(
            clampHeight(profile.height_cm)
          );
        }

        const savedGender =
          profile?.gender_identity;

        const genderLabel =
          GENDER_IDENTITY_OPTIONS.find(
            (option) =>
              GENDER_IDENTITY_MAP[option] ===
              savedGender
          );

        setGenderIdentity(
          genderLabel ?? ''
        );

        // Load existing profile photos
        const {
          data: photoRows,
          error: photoRowsError,
        } = await supabase
          .from('profile_photos')
          .select(
            'id, storage_path, position'
          )
          .eq('user_id', user.id)
          .order('position', {
            ascending: true,
          });

        if (photoRowsError) {
          throw photoRowsError;
        }

        setSavedPhotos(
          photoRows ?? []
        );

        setSlots(
          buildSlots(photoRows ?? [])
        );

        // Load saved profile place selections
        const {
          data: userPlaceRows,
          error: userPlacesError,
        } = await supabase
          .from('user_locations')
          .select('location_id')
          .eq('user_id', user.id);

        if (userPlacesError) {
          throw userPlacesError;
        }

        const placeIds =
          (userPlaceRows ?? []).map(
            (row) => row.location_id
          );

        if (placeIds.length === 0) {
          setPlaces([]);
          return;
        }

        const {
          data: placeRows,
          error: placesError,
        } = await supabase
          .from('campus_locations')
          .select('id, name')
          .in('id', placeIds);

        if (placesError) {
          throw placesError;
        }

        setPlaces(
          (placeRows ?? []).map(
            (row) => row.name
          )
        );
      } catch (error) {
        console.error(
          'Load existing Bio profile error:',
          error
        );
      }
    };

    loadExistingProfile();
  }, []);

  /* ---------- popup เสร็จสิ้น: animation ---------- */

  useEffect(() => {
    if (!finishVisible) {
      return;
    }

    finishScale.setValue(0.7);
    finishOpacity.setValue(0);

    Animated.parallel([
      Animated.spring(finishScale, {
        toValue: 1,
        speed: 11,
        bounciness: 12,
        useNativeDriver: true,
      }),
      Animated.timing(finishOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(finishPulse, {
          toValue: 1.1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(finishPulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );

    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(finishFloat, {
          toValue: 1,
          duration: 1100,
          useNativeDriver: true,
        }),
        Animated.timing(finishFloat, {
          toValue: 0,
          duration: 1100,
          useNativeDriver: true,
        }),
      ])
    );

    pulseLoop.start();
    floatLoop.start();

    return () => {
      pulseLoop.stop();
      floatLoop.stop();
    };
  }, [finishVisible, finishFloat, finishOpacity, finishPulse, finishScale]);

  const goToSwipe = () => {
    setFinishVisible(false);
    router.replace('/swipe');
  };

  /* ---------- รูป ---------- */

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
        Alert.alert(
          'Permission required',
          'Please allow access to your photos.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
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

      setErrorMessage('');

      setSlots((current) => {
        const updated = [...current];
        updated[index] = { type: 'new', uri: selectedImage };
        return updated;
      });
    } catch (error) {
      console.error('Image picker error:', error);

      Alert.alert('Error', 'Unable to select this photo.');
    }
  };

  // ลบเฉพาะในหน้าจอก่อน ไฟล์/แถวในฐานข้อมูลจะถูกจัดการตอนกดบันทึก
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

    /*
     * expo-image-manipulator crashes on Web for some browser
     * blob images, so on Web we upload the picked file directly.
     * On iOS/Android we resize and compress before upload.
     */
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
    } else {
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
   * 1) อัปโหลดรูปใหม่ (ลองซ้ำ 1 ครั้งถ้าพลาด)
   * 2) ช่องไหนรูปเปลี่ยน -> upsert ที่ position นั้น
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
        try {
          desiredPaths.push(
            await withRetry(() => uploadImage(userId, slot.uri, i + 1))
          );
        } catch (error) {
          console.error(`Upload photo ${i + 1} failed:`, error);

          throw new Error(
            `อัปโหลดรูปที่ ${i + 1} ไม่สำเร็จ กรุณาลองอีกครั้ง`
          );
        }
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

    // อัปเดตสถานะในหน้าจอ เพื่อไม่ให้อัปโหลดซ้ำถ้าต้องกดบันทึกอีกครั้ง
    const nextSaved: ProfilePhoto[] = [];
    const nextSlots: (SlotItem | null)[] = [];

    desiredPaths.forEach((path, i) => {
      if (path) {
        nextSaved.push({
          id: `${userId}-${i + 1}`,
          storage_path: path,
          position: i + 1,
        });

        nextSlots.push({
          type: 'saved',
          id: `${userId}-${i + 1}`,
          storagePath: path,
        });
      } else {
        nextSlots.push(null);
      }
    });

    setSavedPhotos(nextSaved);
    setSlots(nextSlots);
  };

  /* ---------- สถานที่ ---------- */

  const togglePlace = (place: string) => {
    setPlaces((current) => {
      if (current.includes(place)) {
        return current.filter((item) => item !== place);
      }

      return [...current, place];
    });
  };

  const handleStart = async () => {
    if (saving || dragFrom !== null) {
      return;
    }

    const hasSelectedPhoto = slots.some((slot) => slot !== null);

    if (!hasSelectedPhoto) {
      setErrorMessage('Please add at least one photo.');
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
        throw new Error('User is not authenticated.');
      }

      const genderValue = genderIdentity
        ? GENDER_IDENTITY_MAP[genderIdentity]
        : null;

      // 1. Save Bio / Height / Gender identity
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          bio: bio.trim(),
          height_cm: heightCm,
          gender_identity: genderValue,
        })
        .eq('id', user.id);

      if (profileError) {
        throw profileError;
      }

      // 2. Replace campus locations
      const { error: deleteLocationsError } = await supabase
        .from('user_locations')
        .delete()
        .eq('user_id', user.id);

      if (deleteLocationsError) {
        throw deleteLocationsError;
      }

      if (places.length > 0) {
        const { data: locationRows, error: locationsQueryError } =
          await supabase
            .from('campus_locations')
            .select('id, name')
            .in('name', places);

        if (locationsQueryError) {
          throw locationsQueryError;
        }

        if (locationRows && locationRows.length > 0) {
          const { error: insertLocationsError } = await supabase
            .from('user_locations')
            .insert(
              locationRows.map((location) => ({
                user_id: user.id,
                location_id: location.id,
              }))
            );

          if (insertLocationsError) {
            throw insertLocationsError;
          }
        }
      }
      // 3. Save photos
      await savePhotos(user.id);

      // 4. Show completion popup
      setFinishVisible(true);
    } catch (error) {
      console.error('Complete bio setup error:', error);

      const message =
        error instanceof Error
          ? error.message
          : 'Unable to save your profile.';

      setErrorMessage(message);

      Alert.alert(
        'Error',
        'บันทึกโปรไฟล์ไม่สำเร็จ กรุณาลองอีกครั้ง'
      );
    } finally {
      setSaving(false);
    }
  };

  /* ---------- UI ---------- */

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* ================= HEADER (อยู่กับที่ ไม่เลื่อนตามหน้าจอ) ================= */}

      <View style={[styles.header, { paddingHorizontal: pagePadding }]}>
        <TouchableOpacity
          style={styles.headerShadow}
          onPress={() => router.back()}
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
            <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>

        <View pointerEvents="none" style={styles.titleWrap}>
          <Text style={styles.title}>YOUR PROFILE</Text>
        </View>
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
          automaticallyAdjustKeyboardInsets
          scrollEnabled={dragFrom === null}
        >
          {/* ================= GREETING ================= */}

          <FadeInView>
            <Text style={styles.greeting}>
              Looking good{displayName ? `, ${displayName}` : ''} 😉
            </Text>

            <Text style={styles.greetingSub}>
              Add your photos and tell us a little about you.
            </Text>
          </FadeInView>

          {/* ================= PHOTOS PANEL ================= */}

          <FadeInView delay={100} style={styles.panelWrap}>
            <View style={styles.panelShadow}>
              <LinearGradient
                colors={PANEL_GRADIENT}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={[styles.panel, { padding: panelPadding }]}
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
          </FadeInView>

          {/* ================= INFORMATION ================= */}

          <FadeInView delay={220}>
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

              <Text style={styles.characterCount}>{bio.length}/300</Text>
            </View>
          </FadeInView>

          <FadeInView delay={300}>
            <Text style={styles.sectionTitle}>Gender identity</Text>

            <TouchableOpacity
              style={styles.selectField}
              activeOpacity={0.8}
              onPress={() => setGenderModal(true)}
            >
              <Text
                style={[
                  styles.selectFieldText,
                  !genderIdentity && styles.selectPlaceholder,
                ]}
              >
                {genderIdentity || 'Select gender identity'}
              </Text>
              <Text style={styles.selectArrow}>⌄</Text>
            </TouchableOpacity>
          </FadeInView>

          <FadeInView delay={380}>
            <Text style={styles.sectionTitle}>Height</Text>

            <TouchableOpacity
              style={styles.selectField}
              activeOpacity={0.8}
              onPress={() => setHeightModal(true)}
            >
              <Text style={styles.selectFieldText}>{heightCm} cm</Text>
              <Text style={styles.selectArrow}>⌄</Text>
            </TouchableOpacity>
          </FadeInView>

          <FadeInView delay={460}>
            <Text style={styles.sectionTitle}>
              You'll usually find me at..
            </Text>

            <View style={styles.locationsContainer}>
              {placeOptions.map((place) => (
                <LocationChip
                  key={place}
                  label={place}
                  selected={places.includes(place)}
                  onPress={() => togglePlace(place)}
                />
              ))}
            </View>
          </FadeInView>

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          {/* Shared onboarding go button */}
          <OnboardingGoButton
            label={saving ? 'Saving...' : 'go!'}
            loading={saving}
            disabled={saving}
            onPress={handleStart}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ================= GENDER MODAL ================= */}

      <Modal
        visible={genderModal}
        transparent
        animationType="fade"
        onRequestClose={() => setGenderModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Gender identity</Text>

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

            <HeightWheel value={heightCm} onChange={setHeightCm} />

            <TouchableOpacity
              style={styles.heightDoneButton}
              onPress={() => setHeightModal(false)}
            >
              <Text style={styles.heightDoneText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ================= FINISH POPUP ================= */}

      <Modal
        visible={finishVisible}
        transparent
        animationType="fade"
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
            {/* sparkles ลอยขึ้นลง */}
            <Animated.Text
              style={[
                styles.sparkle,
                styles.sparkleLeft,
                {
                  transform: [
                    {
                      translateY: finishFloat.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -8],
                      }),
                    },
                  ],
                },
              ]}
            >
              
            </Animated.Text>

            <Animated.Text
              style={[
                styles.sparkle,
                styles.sparkleRight,
                {
                  transform: [
                    {
                      translateY: finishFloat.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-6, 4],
                      }),
                    },
                  ],
                },
              ]}
            >
              
            </Animated.Text>

            <Animated.View
              style={{ transform: [{ scale: finishPulse }] }}
            >
              <LinearGradient
                colors={THEME_GRADIENT}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.finishIconCircle}
              >
                <Ionicons name="checkmark" size={44} color="#FFFFFF" />
              </LinearGradient>
            </Animated.View>

            <Text style={styles.finishTitle}>You're all set!</Text>

            <Text style={styles.finishBody}>
              Your profile is ready{displayName ? `, ${displayName}` : ''}.
              {'\n'}
              Let's start TalkTU and meet new friends!
            </Text>

            <TouchableOpacity
              style={styles.finishButtonShadow}
              onPress={goToSwipe}
              activeOpacity={0.85}
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
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
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
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    paddingTop: 8,
    paddingBottom: 48,
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

  greeting: {
    fontSize: 20,
    fontWeight: '800',
    color: '#560000',
  },

  greetingSub: {
    marginTop: 4,
    marginBottom: 16,
    fontSize: 13,
    color: '#9B7A7E',
  },

  /* ================= PHOTOS PANEL ================= */

  panelWrap: {
    marginBottom: 4,
  },

  panelShadow: {
    borderRadius: 26,
    backgroundColor: '#F4AA82',
    ...softShadow,
  },

  panel: {
    borderRadius: 26,
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

  /* ================= INFORMATION (เหมือนหน้า Edit Profile) ================= */

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
    flex: 1,
    fontSize: 16,
    color: '#222',
  },

  selectPlaceholder: {
    color: '#999999',
  },

  selectArrow: {
    fontSize: 22,
    color: '#777',
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
    borderColor: '#F08A8E',
    backgroundColor: '#FFF0E8',
  },

  locationChipText: {
    fontSize: 14,
    color: '#222',
  },

  locationChipTextSelected: {
    color: '#C75D70',
    fontWeight: '600',
  },

  detailsHeaderCopy: {
    flex: 1,
  },

  detailsHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#482C35',
  },

  detailsSubheading: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 16,
    color: '#98737D',
  },

  label: {
    marginBottom: 8,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
    color: '#583642',
  },

  bioInput: {
    minHeight: 112,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F4DDE2',
    fontSize: 14,
    lineHeight: 21,
    color: '#442D35',
  },

  counter: {
    marginTop: 6,
    marginBottom: 19,
    textAlign: 'right',
    fontSize: 11,
    color: '#A17D86',
  },

  dropdown: {
    minHeight: 50,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 14,
    paddingRight: 9,
    marginBottom: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F4DDE2',
    shadowColor: '#A64D61',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },

  dropdownText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#50343D',
  },

  placeholderText: {
    color: '#999999',
  },

  dropdownIcon: {
    width: 31,
    height: 31,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F2',
  },

  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',

    gap: 6,
  },

  chip: {
    minHeight: 34,
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1DDE1',
  },

  chipSelected: {
    backgroundColor: '#623D4A',
    borderColor: '#623D4A',
    shadowColor: '#A64D61',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 5,
    elevation: 2,
  },

  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#846873',
  },

  chipTextSelected: {
    color: '#FFFFFF',
  },

  errorText: {
    marginTop: 14,
    textAlign: 'center',
    fontSize: 13,
    color: '#C62828',
  },

  /* ================= MODALS ================= */

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

  /* ================= FINISH POPUP ================= */

  finishOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },

  finishCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 34,
    paddingBottom: 26,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#C45C6D',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.28,
        shadowRadius: 22,
      },
      android: {
        elevation: 12,
      },
    }),
  },

  sparkle: {
    position: 'absolute',
    fontSize: 26,
  },

  sparkleLeft: {
    top: 22,
    left: 26,
  },

  sparkleRight: {
    top: 40,
    right: 28,
  },

  finishIconCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },

  finishTitle: {
    marginTop: 20,
    fontSize: 24,
    fontWeight: '800',
    color: TITLE_PINK,
    textAlign: 'center',
  },

  finishBody: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    color: '#7A6468',
    textAlign: 'center',
  },

  finishButtonShadow: {
    alignSelf: 'stretch',
    marginTop: 24,
    borderRadius: 26,
    backgroundColor: '#FFAF79',
    ...softShadow,
  },

  finishButton: {
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },

  finishButtonText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: '#FFFFFF',
  },
});

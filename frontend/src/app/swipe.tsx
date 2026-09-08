import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  useWindowDimensions,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { supabase } from '@/lib/supabase';

const SWIPE_OUT_DURATION = 220;
const FETCH_LIMIT = 10;

type SwipeMode = 'date' | 'friends';

type CandidatePhoto = {
  id: string;
  storage_path: string;
  position: number;
};

type CandidateInterest = {
  id: string;
  name: string;
};

type Candidate = {
  user_id: string;
  display_name: string;
  age: number;
  tu_generation: number;
  bio: string | null;
  height_cm: number | null;
  faculty: string;
  department: string | null;
  photos: CandidatePhoto[];
  interests: CandidateInterest[];
};

type SwipeAction = 'like' | 'pass';

export default function SwipeScreen() {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const swipeThreshold = screenWidth * 0.25;

  const [mode, setMode] = useState<SwipeMode>('date');

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [photoIndex, setPhotoIndex] = useState(0);

  const position = useRef(new Animated.ValueXY()).current;

  const currentCandidate = candidates[currentIndex];

  /**
   * ดึง candidate จาก PostgreSQL RPC
   */
  const fetchCandidates = useCallback(
    async (selectedMode: SwipeMode, offset: number, append = false) => {
      try {
        if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
          setError(null);
        }

        const { data, error: rpcError } = await supabase.rpc(
          'get_discovery_candidates',
          {
            p_mode: selectedMode,
            p_limit: FETCH_LIMIT,
            p_offset: offset,
          }
        );

        if (rpcError) {
          throw rpcError;
        }

        const newCandidates = (data ?? []) as Candidate[];

        if (append) {
          setCandidates((previous) => [
            ...previous,
            ...newCandidates,
          ]);
        } else {
          setCandidates(newCandidates);
          setCurrentIndex(0);
          setPhotoIndex(0);
        }
      } catch (err) {
        console.error('get_discovery_candidates error:', err);

        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load candidates.'
        );
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  /**
   * โหลดครั้งแรก / เปลี่ยน mode
   */
  useEffect(() => {
    fetchCandidates(mode, 0, false);
  }, [mode, fetchCandidates]);

  /**
   * โหลดเพิ่มเมื่อใกล้หมด
   */
  useEffect(() => {
    const remaining = candidates.length - currentIndex;

    if (
      remaining <= 3 &&
      candidates.length > 0 &&
      !loadingMore
    ) {
      fetchCandidates(mode, candidates.length, true);
    }
  }, [
    candidates.length,
    currentIndex,
    loadingMore,
    mode,
    fetchCandidates,
  ]);

  /**
   * ไป photo ก่อนหน้า
   */
  const previousPhoto = () => {
    if (!currentCandidate?.photos?.length) {
      return;
    }

    setPhotoIndex((previous) =>
      previous > 0
        ? previous - 1
        : currentCandidate.photos.length - 1
    );
  };

  /**
   * ไป photo ถัดไป
   */
  const nextPhoto = () => {
    if (!currentCandidate?.photos?.length) {
      return;
    }

    setPhotoIndex((previous) =>
      previous < currentCandidate.photos.length - 1
        ? previous + 1
        : 0
    );
  };

  /**
   * บันทึก swipe
   *
   * IMPORTANT:
   * ตอนนี้ยังไม่ใส่ supabase.rpc(...) ตรงนี้
   * เพราะยังไม่มีชื่อ RPC/API สำหรับ record swipe
   *
   * ห้ามเปลี่ยนเป็นการ insert table โดยตรง
   * เพราะ backend มี RLS และคุณกำหนดให้ใช้ API/RPC ที่ backend เตรียมไว้
   */
  const saveSwipe = async (
  candidate: Candidate,
  action: SwipeAction
) => {
  const { data, error } = await supabase.rpc('submit_swipe', {
    p_target_id: candidate.user_id,
    p_mode: mode,
    p_action: action,
  });

  if (error) {
    console.error('submit_swipe error:', error);
    throw error;
  }

  console.log('submit_swipe result:', data);

  return data;
};

    /*
      เมื่อคุณส่ง RPC สำหรับบันทึก swipe มา
      ให้ใส่เฉพาะตรงนี้ เช่น:

      const { error } = await supabase.rpc(
        'ชื่อ_RPC_จริง',
        {
          ...parameters ตาม backend จริง
        }
      );

      if (error) {
        throw error;
      }
    */

  /**
   * หลัง swipe เสร็จ
   */
  const finishSwipe = async (
    action: SwipeAction
  ) => {
    if (!currentCandidate) {
      return;
    }

    const candidate = currentCandidate;

    try {
      await saveSwipe(candidate, action);

      setCurrentIndex((previous) => previous + 1);
      setPhotoIndex(0);

      position.setValue({
        x: 0,
        y: 0,
      });
    } catch (err) {
      console.error('save swipe error:', err);

      // ถ้าบันทึกไม่สำเร็จ ไม่ข้าม candidate
      position.setValue({
        x: 0,
        y: 0,
      });

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to save your swipe.'
      );
    }
  };

  /**
   * Swipe card ออกจอ
   */
  const swipeCard = (action: SwipeAction) => {
    const direction = action === 'like' ? 1 : -1;

    Animated.timing(position, {
      toValue: {
        x: direction * screenWidth * 1.3,
        y: 0,
      },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: true,
    }).start(() => {
      finishSwipe(action);
    });
  };

  /**
   * ปัดการ์ดด้วยนิ้ว
   */
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => {
        return Math.abs(gesture.dx) > 8;
      },

      onPanResponderMove: (_, gesture) => {
        position.setValue({
          x: gesture.dx,
          y: gesture.dy * 0.15,
        });
      },

      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > swipeThreshold) {
          swipeCard('like');
          return;
        }

        if (gesture.dx < -swipeThreshold) {
          swipeCard('pass');
          return;
        }

        Animated.spring(position, {
          toValue: {
            x: 0,
            y: 0,
          },
          useNativeDriver: true,
        }).start();
      },

      onPanResponderTerminate: () => {
        Animated.spring(position, {
          toValue: {
            x: 0,
            y: 0,
          },
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  /**
   * เปลี่ยน mode
   */
  const changeMode = (newMode: SwipeMode) => {
    if (newMode === mode) {
      return;
    }

    setMode(newMode);
    setCandidates([]);
    setCurrentIndex(0);
    setPhotoIndex(0);
    position.setValue({
      x: 0,
      y: 0,
    });
  };

  /**
   * Card rotation
   */
  const rotate = position.x.interpolate({
    inputRange: [-screenWidth, 0, screenWidth],
    outputRange: ['-12deg', '0deg', '12deg'],
    extrapolate: 'clamp',
  });

  /**
   * Like overlay opacity
   */
  const likeOpacity = position.x.interpolate({
    inputRange: [0, swipeThreshold, screenWidth * 0.7],
    outputRange: [0, 0.8, 1],
    extrapolate: 'clamp',
  });

  /**
   * Pass overlay opacity
   */
  const passOpacity = position.x.interpolate({
    inputRange: [-screenWidth * 0.7, -swipeThreshold, 0],
    outputRange: [1, 0.8, 0],
    extrapolate: 'clamp',
  });

  /**
   * Loading
   */
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" />

          <Text style={styles.loadingText}>
            Finding people...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /**
   * Error
   */
  if (error && candidates.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Ionicons
            name="cloud-offline-outline"
            size={48}
            color="#111"
          />

          <Text style={styles.emptyTitle}>
            Something went wrong
          </Text>

          <Text style={styles.emptyText}>
            {error}
          </Text>

          <TouchableOpacity
            onPress={() => fetchCandidates(mode, 0, false)}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#FF7B82', '#FFAA70', '#FFD37B']}
              style={styles.retryButton}
            >
              <Text style={styles.retryText}>
                Try again
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  /**
   * Empty state
   */
  if (!currentCandidate) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <ModeSwitch
            mode={mode}
            onChange={changeMode}
          />

          <View style={styles.center}>
            <Ionicons
              name="people-outline"
              size={56}
              color="#111"
            />

            <Text style={styles.emptyTitle}>
              No more people
            </Text>

            <Text style={styles.emptyText}>
              There are no more candidates right now.
            </Text>

            <TouchableOpacity
              onPress={() =>
                fetchCandidates(mode, 0, false)
              }
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[
                  '#FF7B82',
                  '#FFAA70',
                  '#FFD37B',
                ]}
                style={styles.retryButton}
              >
                <Text style={styles.retryText}>
                  Refresh
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const currentPhoto =
    currentCandidate.photos?.[photoIndex];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Mode */}
        <ModeSwitch
          mode={mode}
          onChange={changeMode}
        />

        {/* Card */}
        <View style={styles.cardArea}>
          <Animated.View
            {...panResponder.panHandlers}
            style={[
              styles.card,
              {
                transform: [
                  { translateX: position.x },
                  { translateY: position.y },
                  { rotate },
                ],
              },
            ]}
          >
            {/* Photo */}
            <View
              style={[
                styles.photoContainer,
                {
                  height: Math.max(
                    400,
                    Math.min(screenHeight * 0.55, 560)
                  ),
                },
              ]}
            >
              {currentPhoto?.storage_path ? (
                <PhotoFromStorage
                  storagePath={currentPhoto.storage_path}
                />
              ) : (
                <View style={styles.noPhoto}>
                  <Ionicons
                    name="person-outline"
                    size={70}
                    color="#999"
                  />
                </View>
              )}

              {/* Photo counter */}
              {currentCandidate.photos?.length > 0 && (
                <View style={styles.photoCounter}>
                  <Text style={styles.photoCounterText}>
                    {photoIndex + 1}/
                    {currentCandidate.photos.length}
                  </Text>
                </View>
              )}

              {/* Photo tap zones */}
              {currentCandidate.photos?.length > 1 && (
                <>
                  <TouchableOpacity
                    style={styles.leftPhotoZone}
                    onPress={previousPhoto}
                    activeOpacity={1}
                  />

                  <TouchableOpacity
                    style={styles.rightPhotoZone}
                    onPress={nextPhoto}
                    activeOpacity={1}
                  />
                </>
              )}

              {/* LIKE */}
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.actionLabel,
                  styles.likeLabel,
                  {
                    opacity: likeOpacity,
                  },
                ]}
              >
                <Text style={styles.likeLabelText}>
                  LIKE
                </Text>
              </Animated.View>

              {/* PASS */}
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.actionLabel,
                  styles.passLabel,
                  {
                    opacity: passOpacity,
                  },
                ]}
              >
                <Text style={styles.passLabelText}>
                  PASS
                </Text>
              </Animated.View>

              {/* Profile info */}
              <LinearGradient
                colors={[
                  'transparent',
                  'rgba(0,0,0,0.15)',
                  'rgba(0,0,0,0.85)',
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.infoGradient}
                pointerEvents="none"
              >
                <View style={styles.info}>
                  <Text style={styles.name}>
                    {currentCandidate.display_name},{' '}
                    {currentCandidate.age}
                  </Text>

                  <Text style={styles.faculty}>
                    {currentCandidate.faculty}
                    {currentCandidate.department
                      ? ` • ${currentCandidate.department}`
                      : ''}
                  </Text>

                  {currentCandidate.height_cm !== null && (
                    <Text style={styles.height}>
                      {currentCandidate.height_cm} cm
                    </Text>
                  )}
                </View>
              </LinearGradient>
            </View>

            {/* Details */}
            <View style={styles.details}>
              {currentCandidate.bio && (
                <Text
                  style={styles.bio}
                  numberOfLines={3}
                >
                  {currentCandidate.bio}
                </Text>
              )}

              {currentCandidate.interests?.length > 0 && (
                <View style={styles.interests}>
                  {currentCandidate.interests.map(
                    (interest) => (
                      <View
                        key={interest.id}
                        style={styles.interestChip}
                      >
                        <Text style={styles.interestText}>
                          {interest.name}
                        </Text>
                      </View>
                    )
                  )}
                </View>
              )}
            </View>
          </Animated.View>
        </View>

        {/* Error banner */}
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>
              {error}
            </Text>
          </View>
        )}

        {/* Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.passButton,
            ]}
            onPress={() => swipeCard('pass')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="close"
              size={32}
              color="#111"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.likeButton,
            ]}
            onPress={() => swipeCard('like')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="heart"
              size={28}
              color="#111"
            />
          </TouchableOpacity>
        </View>

        {loadingMore && (
          <View style={styles.loadingMore}>
            <ActivityIndicator size="small" />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

/* ============================================================
   Mode Switch
============================================================ */

type ModeSwitchProps = {
  mode: SwipeMode;
  onChange: (mode: SwipeMode) => void;
};

function ModeSwitch({
  mode,
  onChange,
}: ModeSwitchProps) {
  return (
    <View style={styles.modeContainer}>
      <TouchableOpacity
        style={[
          styles.modeButton,
          mode === 'date' && styles.modeButtonActive,
        ]}
        onPress={() => onChange('date')}
        activeOpacity={0.8}
      >
        <Ionicons
          name="heart-outline"
          size={17}
          color="#111"
        />

        <Text style={styles.modeText}>
          Date
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.modeButton,
          mode === 'friends' &&
            styles.modeButtonActive,
        ]}
        onPress={() => onChange('friends')}
        activeOpacity={0.8}
      >
        <Ionicons
          name="people-outline"
          size={17}
          color="#111"
        />

        <Text style={styles.modeText}>
          Friends
        </Text>
      </TouchableOpacity>
    </View>
  );
}

/* ============================================================
   Photo
============================================================ */

type PhotoFromStorageProps = {
  storagePath: string;
};

function PhotoFromStorage({
  storagePath,
}: PhotoFromStorageProps) {
  /*
    ตอนนี้ RPC ส่ง storage_path มา
    แต่ยังไม่มีชื่อ bucket ในข้อมูลที่ให้มา

    ถ้า storage_path เป็น URL อยู่แล้ว
    สามารถใช้ตรง ๆ ได้

    ถ้าเป็น Supabase Storage path:
    ต้องรู้ชื่อ bucket จริงก่อน
    จึงจะเรียก:

    supabase.storage
      .from('BUCKET_NAME')
      .getPublicUrl(storagePath)
  */

  if (
    storagePath.startsWith('http://') ||
    storagePath.startsWith('https://')
  ) {
    return (
      <AnimatedImage
        uri={storagePath}
      />
    );
  }

  return (
    <View style={styles.noPhoto}>
      <Ionicons
        name="image-outline"
        size={64}
        color="#999"
      />

      <Text style={styles.noPhotoText}>
        Photo unavailable
      </Text>
    </View>
  );
}

function AnimatedImage({
  uri,
}: {
  uri: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <View style={styles.noPhoto}>
        <Ionicons
          name="image-outline"
          size={64}
          color="#999"
        />

        <Text style={styles.noPhotoText}>
          Unable to load photo
        </Text>
      </View>
    );
  }

  const { Image } = require('react-native');

  return (
    <Image
      source={{ uri }}
      style={styles.photo}
      resizeMode="cover"
      onError={() => setFailed(true)}
    />
  );
}

/* ============================================================
   Styles
============================================================ */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  container: {
    flex: 1,
    paddingHorizontal: 16,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#555',
  },

  /* Mode */

  modeContainer: {
    alignSelf: 'center',
    flexDirection: 'row',

    marginTop: 8,
    marginBottom: 10,

    padding: 4,

    borderRadius: 24,

    backgroundColor: '#F2F2F2',
  },

  modeButton: {
    height: 38,

    paddingHorizontal: 18,

    borderRadius: 20,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 6,
  },

  modeButtonActive: {
    backgroundColor: '#FFFFFF',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,

    elevation: 2,
  },

  modeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
  },

  /* Card */

  cardArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  card: {
    width: '100%',
    maxWidth: 390,

    borderRadius: 22,

    backgroundColor: '#FFFFFF',

    overflow: 'hidden',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,

    elevation: 7,
  },

  photoContainer: {
    width: '100%',

    position: 'relative',

    backgroundColor: '#EDEDED',
  },

  photo: {
    width: '100%',
    height: '100%',
  },

  noPhoto: {
    flex: 1,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#EEEEEE',
  },

  noPhotoText: {
    marginTop: 8,

    fontSize: 13,
    color: '#777',
  },

  /* Photo counter */

  photoCounter: {
    position: 'absolute',

    top: 12,
    right: 12,

    paddingHorizontal: 10,
    paddingVertical: 5,

    borderRadius: 14,

    backgroundColor: 'rgba(0,0,0,0.55)',
  },

  photoCounterText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  /* Photo navigation */

  leftPhotoZone: {
    position: 'absolute',

    left: 0,
    top: 0,
    bottom: 0,

    width: '50%',
  },

  rightPhotoZone: {
    position: 'absolute',

    right: 0,
    top: 0,
    bottom: 0,

    width: '50%',
  },

  /* Like / Pass */

  actionLabel: {
    position: 'absolute',

    top: 35,

    paddingHorizontal: 14,
    paddingVertical: 7,

    borderWidth: 3,
    borderRadius: 10,
  },

  likeLabel: {
    right: 25,

    transform: [
      {
        rotate: '12deg',
      },
    ],

    borderColor: '#6CCB7B',
  },

  passLabel: {
    left: 25,

    transform: [
      {
        rotate: '-12deg',
      },
    ],

    borderColor: '#FF6F6F',
  },

  likeLabelText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#6CCB7B',
  },

  passLabelText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FF6F6F',
  },

  /* Info */

  infoGradient: {
    position: 'absolute',

    left: 0,
    right: 0,
    bottom: 0,

    height: 180,

    justifyContent: 'flex-end',
  },

  info: {
    paddingHorizontal: 18,
    paddingBottom: 18,
  },

  name: {
    fontSize: 29,
    lineHeight: 34,

    fontWeight: '900',

    color: '#FFFFFF',
  },

  faculty: {
    marginTop: 4,

    fontSize: 14,
    fontWeight: '600',

    color: '#FFFFFF',
  },

  height: {
    marginTop: 3,

    fontSize: 13,

    color: '#FFFFFF',
  },

  /* Details */

  details: {
    paddingHorizontal: 15,
    paddingVertical: 12,

    minHeight: 90,
  },

  bio: {
    fontSize: 14,
    lineHeight: 20,

    color: '#222',
  },

  interests: {
    flexDirection: 'row',
    flexWrap: 'wrap',

    gap: 7,

    marginTop: 10,
  },

  interestChip: {
    paddingHorizontal: 11,
    paddingVertical: 6,

    borderRadius: 16,

    backgroundColor: '#FFE4A8',
  },

  interestText: {
    fontSize: 12,
    fontWeight: '600',

    color: '#333',
  },

  /* Buttons */

  actionButtons: {
    height: 82,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 28,
  },

  actionButton: {
    width: 58,
    height: 58,

    borderRadius: 29,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#FFFFFF',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.16,
    shadowRadius: 4,

    elevation: 4,
  },

  passButton: {
    borderWidth: 2,
    borderColor: '#FF8585',
  },

  likeButton: {
    borderWidth: 2,
    borderColor: '#FFB36E',
  },

  /* Empty */

  emptyTitle: {
    marginTop: 15,

    fontSize: 22,
    fontWeight: '900',

    color: '#111',
  },

  emptyText: {
    marginTop: 7,

    fontSize: 14,
    lineHeight: 20,

    textAlign: 'center',

    color: '#666',
  },

  retryButton: {
    marginTop: 20,

    minWidth: 120,
    height: 44,

    paddingHorizontal: 20,

    borderRadius: 22,

    alignItems: 'center',
    justifyContent: 'center',
  },

  retryText: {
    fontSize: 14,
    fontWeight: '800',

    color: '#111',
  },

  /* Error */

  errorBanner: {
    position: 'absolute',

    left: 20,
    right: 20,
    bottom: 90,

    paddingHorizontal: 14,
    paddingVertical: 9,

    borderRadius: 12,

    backgroundColor: '#FFE0E0',
  },

  errorBannerText: {
    fontSize: 12,

    textAlign: 'center',

    color: '#A33',
  },

  loadingMore: {
    position: 'absolute',

    bottom: 88,
    alignSelf: 'center',
  },
});
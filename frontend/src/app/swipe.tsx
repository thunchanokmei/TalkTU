import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Image,
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
import { useRouter } from 'expo-router';

import { supabase } from '@/lib/supabase';
import BottomNavigation from '../components/navigation/BottomNavigation';

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
  const router = useRouter();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const shortSide = Math.min(
    screenWidth,
    screenHeight
  );

  const horizontalPadding = Math.max(
    20,
    screenWidth * 0.06
  );

  const cardWidth =
    screenWidth - horizontalPadding * 2;

  // Keep the card tall, but reserve visible breathing room above the bottom nav.
  const cardHeight = Math.min(
    screenHeight * 0.74,
    cardWidth * 1.82
  );
  const swipeThreshold = screenWidth * 0.25;

  // Responsive sizing tuned to keep the header and swipe actions visually balanced
  const logoWidth = Math.max(
    180,
    Math.min(shortSide * 0.52, 280)
  );
  const logoHeight = logoWidth * 0.50;

  const topIconButtonSize = Math.max(
    42,
    Math.min(shortSide * 0.11, 54)
  );
  const topIconSize = Math.max(
    26,
    Math.min(shortSide * 0.07, 34)
  );

  // Icons that appear while dragging left/right
  const swipeOverlayIconSize = Math.max(
    88,
    Math.min(shortSide * 0.23, 112)
  );

  // Floating like button on the card
  const actionButtonSize = Math.max(
    60,
    Math.min(shortSide * 0.17, 74)
  );
  const actionIconSize = Math.max(
    32,
    Math.min(shortSide * 0.09, 42)
  );

  const [mode, setMode] = useState<SwipeMode>('date');

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [photoIndex, setPhotoIndex] = useState(0);

  const position = useRef(new Animated.ValueXY()).current;

  const currentCandidate = candidates[currentIndex];

  const openCandidateProfile = () => {
    if (!currentCandidate) {
      return;
    }

    router.push({
      pathname: '/user/[userId]',
      params: {
        userId: currentCandidate.user_id,
        candidate: JSON.stringify(currentCandidate),
        mode,
      },
    });
  };

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

  useEffect(() => {
    fetchCandidates(mode, 0, false);
  }, [mode, fetchCandidates]);

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

  /*ปัดการ์ดด้วยนิ้ว*/
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

  const rotate = position.x.interpolate({
    inputRange: [-screenWidth, 0, screenWidth],
    outputRange: ['-12deg', '0deg', '12deg'],
    extrapolate: 'clamp',
  });
  const likeOpacity = position.x.interpolate({
    inputRange: [0, swipeThreshold, screenWidth * 0.7],
    outputRange: [0, 0.8, 1],
    extrapolate: 'clamp',
  });
  const passOpacity = position.x.interpolate({
    inputRange: [-screenWidth * 0.7, -swipeThreshold, 0],
    outputRange: [1, 0.8, 0],
    extrapolate: 'clamp',
  });

  const currentPhoto =
    currentCandidate?.photos?.[photoIndex];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* ================= HEADER ================= */}

        <View
          style={[
            styles.header,
            {
              paddingHorizontal:
                horizontalPadding,
            },
          ]}
        >
          <Image
            source={require('../../assets/images/talktu-logo2.png')}
            style={[
              styles.logo,
              {
                width: logoWidth,
                height: logoHeight,
              },
            ]}
            resizeMode="contain"
          />

          <TouchableOpacity
            style={[
              styles.filterButton,
              {
                width: topIconButtonSize,
                height: topIconButtonSize,
              },
            ]}
            activeOpacity={0.7}
            onPress={() => {
              console.log('Open filter');
            }}
          >
            <Ionicons
              name="options-outline"
              size={topIconSize}
              color="#FF7F87"
            />
          </TouchableOpacity>
        </View>

        {/* ================= CARD / STATE AREA ================= */}

        <View style={styles.cardArea}>
          {loading ? (
            <View style={styles.statusState}>
              <ActivityIndicator
                size="large"
                color="#FF7F87"
              />

              <Text style={styles.loadingText}>
                Finding people...
              </Text>
            </View>
          ) : error && candidates.length === 0 ? (
            <View style={styles.statusState}>
              <Ionicons
                name="cloud-offline-outline"
                size={54}
                color="#555555"
              />

              <Text style={styles.emptyTitle}>
                Something went wrong
              </Text>

              <Text style={styles.emptyText}>
                {error}
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
                    Try again
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : !currentCandidate ? (
            <View style={styles.statusState}>
              <Ionicons
                name="people-outline"
                size={58}
                color="#555555"
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
          ) : (
          <Animated.View
            {...panResponder.panHandlers}
            style={[
              styles.card,
              {
                width: cardWidth,
                height: cardHeight,

                transform: [
                  {
                    translateX:
                      position.x,
                  },
                  {
                    translateY:
                      position.y,
                  },
                  {
                    rotate,
                  },
                ],
              },
            ]}
          >
            {/* PROFILE PHOTO */}

            {currentPhoto?.storage_path ? (
              <PhotoFromStorage
                storagePath={
                  currentPhoto.storage_path
                }
              />
            ) : (
              <View style={styles.noPhoto}>
                <Ionicons
                  name="person-outline"
                  size={80}
                  color="#AAAAAA"
                />
              </View>
            )}

            {/* ================= PHOTO COUNTER ================= */}

            {currentCandidate.photos
              ?.length > 0 ? (
              <View
                style={
                  styles.photoCounter
                }
              >
                <Text
                  style={
                    styles.photoCounterText
                  }
                >
                  {photoIndex + 1}/
                  {
                    currentCandidate
                      .photos.length
                  }
                </Text>
              </View>
            ) : null}
            {/* ================= PHOTO TAP ZONES ================= */}

            <TouchableOpacity
              style={[
                styles.profileOpenZone,
                currentCandidate.photos?.length > 1
                  ? styles.profileOpenZoneWithPhotoNav
                  : styles.profileOpenZoneFull,
              ]}
              onPress={openCandidateProfile}
              activeOpacity={1}
            />

            {currentCandidate.photos?.length > 1 ? (
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
            ) : null}

            {/* LIKE */}
            <Animated.View
              pointerEvents="none"
              style={[
                styles.swipeIcon,
                styles.likeIcon,
                { opacity: likeOpacity },
              ]}
            >
              <Ionicons
                name="heart"
                size={swipeOverlayIconSize}
                color="#FF4D5A"
              />
            </Animated.View>

            {/* PASS */}
            <Animated.View
              pointerEvents="none"
              style={[
                styles.swipeIcon,
                styles.passIcon,
                { opacity: passOpacity },
              ]}
            >
              <Ionicons
                name="close"
                size={swipeOverlayIconSize + 4}
                color="#444444"
              />
            </Animated.View>

            {/* ================= DARK GRADIENT ================= */}

            <LinearGradient
              pointerEvents="none"
              colors={[
                'transparent',
                'rgba(0,0,0,0.02)',
                'rgba(0,0,0,0.75)',
              ]}
              locations={[
                0,
                0.56,
                1,
              ]}
              style={
                styles.profileGradient
              }
            />

            {/* ================= PROFILE INFO ================= */}

            <View
              style={
                styles.profileInfo
              }
            >
              <Text
                style={styles.nameText}
                numberOfLines={1}
              >
                {
                  currentCandidate.display_name
                }{' '}
                {currentCandidate.age}
              </Text>

              <Text
                style={
                  styles.detailText
                }
                numberOfLines={1}
              >
                {currentCandidate.department
                  ? `${currentCandidate.department}, ${currentCandidate.faculty}`
                  : currentCandidate.faculty}
              </Text>
            </View>

            {/* ================= FLOATING LIKE BUTTON ================= */}

            <TouchableOpacity
              style={[
                styles.floatingLikeButton,
                {
                  width: actionButtonSize,
                  height: actionButtonSize,
                  borderRadius: actionButtonSize / 2,
                },
              ]}
              activeOpacity={0.85}
              onPress={() =>
                swipeCard('like')
              }
            >
              <Ionicons
                name="heart"
                size={actionIconSize}
                color="#FF5964"
              />
            </TouchableOpacity>
          </Animated.View>
          )}
        </View>

        {/* ================= BOTTOM NAV ================= */}

        <BottomNavigation activeTab="swap" />

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
    backgroundColor: '#FFFFFF',
  },

  /* ================= HEADER ================= */

  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
    paddingTop: 0,
  },

  logo: {
    alignSelf: 'flex-start',
  },

  topRightButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  filterButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
  },

  /* ================= CARD ================= */

  cardArea: {
    flex: 1,

    alignItems: 'center',
    justifyContent: 'center',

    paddingTop: 2,
    paddingBottom: 18,
  },

  statusState: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },

  card: {
    position: 'relative',

    borderRadius: 24,

    overflow: 'hidden',

    backgroundColor:
      '#EEEEEE',

    shadowColor: '#000000',

    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.13,

    shadowRadius: 6,

    elevation: 5,
  },

  photo: {
    width: '100%',
    height: '100%',
  },

  noPhoto: {
    flex: 1,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor:
      '#E7E7E7',
  },

  /* ================= PHOTO COUNTER ================= */

  photoCounter: {
    position: 'absolute',

    top: 10,
    right: 10,

    minWidth: 38,
    height: 24,

    paddingHorizontal: 8,

    borderRadius: 999,

    backgroundColor:
      '#FFFFFF',

    justifyContent: 'center',
    alignItems: 'center',

    zIndex: 10,
  },

  photoCounterText: {
    color: '#111111',

    fontSize: 13,
    fontWeight: '700',
  },

  profileOpenZone: {
    position: 'absolute',

    top: 0,
    bottom: 105,

    zIndex: 4,
  },

  profileOpenZoneWithPhotoNav: {
    left: '18%',
    right: '18%',
  },

  profileOpenZoneFull: {
    left: 0,
    right: 0,
  },

  leftPhotoZone: {
    position: 'absolute',

    top: 0,
    bottom: 105,
    left: 0,

    width: '18%',

    zIndex: 5,
  },

  rightPhotoZone: {
    position: 'absolute',

    top: 0,
    bottom: 105,
    right: 0,

    width: '18%',

    zIndex: 5,
  },

  /* ================= PROFILE ================= */

  profileGradient: {
    position: 'absolute',

    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },

  profileInfo: {
    position: 'absolute',

    left: 13,
    right: 70,
    bottom: 27,

    zIndex: 6,
  },

  nameText: {
    color: '#FFFFFF',

    fontSize: 32,
    lineHeight: 36,

    fontWeight: '600',

    letterSpacing: -0.7,

    textShadowColor:
      'rgba(0,0,0,0.35)',

    textShadowOffset: {
      width: 0,
      height: 1,
    },

    textShadowRadius: 2,
  },

  detailText: {
    color: '#FFFFFF',

    fontSize: 11,

    marginTop: 2,

    opacity: 0.95,

    textShadowColor:
      'rgba(0,0,0,0.45)',

    textShadowOffset: {
      width: 0,
      height: 1,
    },

    textShadowRadius: 2,
  },

  /* ================= HEART BUTTON ================= */

  floatingLikeButton: {
    position: 'absolute',

    right: 14,
    bottom: 18,

    backgroundColor:
      '#FFFFFF',

    justifyContent: 'center',
    alignItems: 'center',

    zIndex: 12,

    shadowColor: '#000000',

    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.25,

    shadowRadius: 4,

    elevation: 7,
  },

  /* ================= SWIPE LABELS ================= */

  swipeIcon: {
    position: 'absolute',
    top: 30,
    zIndex: 20,
  },

  likeIcon: {
    left: 28,
    transform: [{ rotate: '-12deg' }],
  },

  passIcon: {
    right: 28,
    transform: [{ rotate: '12deg' }],
  },

  /* ================= LOADING / ERROR ================= */

  center: {
    flex: 1,

    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: 28,
  },

  loadingText: {
    marginTop: 12,

    fontSize: 14,
    color: '#444444',
  },

  emptyTitle: {
    marginTop: 15,

    fontSize: 20,
    fontWeight: '600',

    color: '#111111',
  },

  emptyText: {
    marginTop: 7,

    fontSize: 13,

    color: '#777777',

    textAlign: 'center',
  },

  retryButton: {
    marginTop: 18,

    borderRadius: 18,

    paddingHorizontal: 20,
    paddingVertical: 10,
  },

  retryText: {
    fontSize: 14,
    fontWeight: '600',

    color: '#111111',
  },

  /* ================= MODE SWITCH ================= */

  modeContainer: {
    alignSelf: 'center',
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 10,
    backgroundColor: '#F2F2F2',
    borderRadius: 999,
    padding: 4,
  },

  modeButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
  },

  modeButtonActive: {
    backgroundColor: '#FF9A7A',
  },

  modeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111111',
  },

  /* ================= NO PHOTO TEXT ================= */

  noPhotoText: {
    marginTop: 8,
    fontSize: 13,
    color: '#777777',
  },
});
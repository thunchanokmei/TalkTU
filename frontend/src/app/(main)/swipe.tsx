import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Modal,
  KeyboardAvoidingView,
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

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { supabase } from '@/lib/supabase';
// ✅ 1. ลบ import BottomNavigation ออกแล้ว (bar อยู่ใน (main)/_layout.tsx)
import { getMode } from '../../features/onboarding/services/onboardingService';
import MatchModal from '../../components/MatchModal';
import SettingsSheet from '../../components/SettingsSheet';

import {
  blockProfile,
  PROFILE_REPORT_REASONS,
  reportProfile,
  type ProfileReportReason,
} from '../../features/safety/services/profileSafetyService';

const SWIPE_OUT_DURATION = 220;
const FETCH_LIMIT = 10;

/* ธีมเดียวกับ BottomNavigation */
const THEME_GRADIENT = ['#FF8D88', '#FFAF79', '#FFD86E'] as const;

/* พื้นที่ด้านล่างการ์ดที่เว้นไว้ไม่ให้โซนแตะทับชื่อ/ปุ่ม */
const BOTTOM_RESERVED = 105;

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
  gender_identity:
  | GenderIdentity
  | null;
  faculty: string;
  department: string | null;
  photos: CandidatePhoto[];
  interests: CandidateInterest[];
  locations: CandidateLocation[];
};

type SwipeAction = 'like' | 'pass';

type GenderIdentity =
  | 'man'
  | 'woman'
  | 'non_binary'
  | 'prefer_not_to_say';

type CandidateLocation = {
  id: number;
  name: string;
};

export default function SwipeScreen() {
  const router = useRouter();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const shortSide = Math.min(
    screenWidth,
    screenHeight
  );
  // ระยะขอบข้างการ์ดตาม Figma (~8.6% ของความกว้างจอ)
  const horizontalPadding = Math.max(
    2,
    screenWidth * 0.07
  );
  const cardWidth =
    screenWidth - horizontalPadding * 2;
  // สัดส่วนการ์ดตาม Figma (สูง ≈ 1.76 เท่าของกว้าง)
  const cardHeight = Math.min(
    screenHeight * 0.8,
    cardWidth * 1.80
  );
  const swipeThreshold = screenWidth * 0.18;
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

  // ปุ่ม like ลอยมุมขวาล่างของการ์ด
  const actionButtonSize = Math.max(
    64,
    Math.min(cardWidth * 0.19, 82)
  );
  const actionIconSize = Math.round(actionButtonSize * 0.5);

  // ไอคอนปุ่มดู bio ข้างชื่อ
  const bioIconSize = Math.max(
    26,
    Math.min(cardWidth * 0.07, 32)
  );

  const [mode, setMode] = useState<SwipeMode | null>(null);

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [photoIndex, setPhotoIndex] = useState(0);
  const position = useRef(new Animated.ValueXY()).current;
  const isSwiping = useRef(false);

  const currentCandidate = candidates[currentIndex];

  useEffect(() => {
    const urls: string[] = [];

    // Prefetch รูปถัดไปของ candidate ปัจจุบัน
    const currentPhotoUrls =
      currentCandidate?.photos
        ?.slice(1)
        .map((photo) => getProfilePhotoUrl(photo.storage_path)) ?? [];

    urls.push(...currentPhotoUrls);

    // Prefetch รูปแรกของ candidate ถัดไป 2 คน
    const nextCandidates = candidates.slice(
      currentIndex + 1,
      currentIndex + 3
    );

    for (const candidate of nextCandidates) {
      const firstPhoto = candidate.photos?.[0];

      if (firstPhoto?.storage_path) {
        urls.push(getProfilePhotoUrl(firstPhoto.storage_path));
      }
    }

    if (urls.length > 0) {
      ExpoImage.prefetch(urls, 'memory-disk').catch((error) => {
        console.warn('Unable to prefetch profile photos:', error);
      });
    }
  }, [candidates, currentIndex, currentCandidate]);


  const [genderModal, setGenderModal] = useState(false);
  const [heightModal, setHeightModal] = useState(false);

  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedMatchId, setMatchedMatchId] = useState<string | null>(null);
  const [matchedCandidate, setMatchedCandidate] = useState<Candidate | null>(null);

  // Settings bottom sheet
  const [showSettings, setShowSettings] = useState(false);

  const [hasMore, setHasMore] = useState(true);

  const [
    showSafety,
    setShowSafety,
  ] =
    useState(false);

  const [
    safetyView,
    setSafetyView,
  ] =
    useState<
      | 'menu'
      | 'blockConfirm'
      | 'reportForm'
      | 'reportBlockPrompt'
    >('menu');

  const [
    reportReason,
    setReportReason,
  ] =
    useState<
      ProfileReportReason | ''
    >('');

  const [
    reportDetails,
    setReportDetails,
  ] =
    useState('');

  const [
    safetyBusy,
    setSafetyBusy,
  ] =
    useState(false);

  const openSafety = () => {
    if (
      !currentCandidate ||
      isSwiping.current
    ) {
      return;
    }

    setSafetyView('menu');
    setReportReason('');
    setReportDetails('');
    setShowSafety(true);
  };

  const closeSafety = () => {
    if (safetyBusy) {
      return;
    }

    setShowSafety(false);
    setSafetyView('menu');
    setReportReason('');
    setReportDetails('');
  };

  const removeCandidateFromDeck = (
    userId: string
  ) => {
    setCandidates(
      (previous) =>
        previous.filter(
          (candidate) =>
            candidate.user_id !==
            userId
        )
    );

    setPhotoIndex(0);

    position.setValue({
      x: 0,
      y: 0,
    });

    isSwiping.current =
      false;
  };

  const confirmBlockCandidate =
    async () => {
      if (
        !currentCandidate ||
        safetyBusy
      ) {
        return;
      }

      const candidate =
        currentCandidate;

      setSafetyBusy(true);

      try {
        const result =
          await blockProfile(
            candidate.user_id
          );

        if (result.error) {
          throw result.error;
        }

        /*
         * Block succeeded.
         *
         * Remove the person from
         * the current Swipe deck
         * immediately.
         */
        setShowSafety(false);
        setSafetyView('menu');
        setReportReason('');
        setReportDetails('');

        removeCandidateFromDeck(
          candidate.user_id
        );
      } catch (error) {
        console.error(
          'Block candidate error:',
          error
        );

        Alert.alert(
          'Block failed',
          error instanceof Error
            ? error.message
            : 'Please try again.'
        );
      } finally {
        setSafetyBusy(false);
      }
    };

  const submitProfileReport =
    async () => {
      if (
        !currentCandidate ||
        safetyBusy
      ) {
        return;
      }

      if (!reportReason) {
        Alert.alert(
          'Select a reason',
          'Please choose a report reason.'
        );

        return;
      }

      setSafetyBusy(true);

      try {
        const result =
          await reportProfile(
            currentCandidate.user_id,
            reportReason,
            reportDetails
          );

        if (result.error) {
          throw result.error;
        }

        /*
         * Report and Block are
         * separate operations.
         *
         * Report is already saved
         * before we ask about Block.
         */
        setSafetyView(
          'reportBlockPrompt'
        );
      } catch (error) {
        console.error(
          'Report profile error:',
          error
        );

        Alert.alert(
          'Report failed',
          error instanceof Error
            ? error.message
            : 'Please try again.'
        );
      } finally {
        setSafetyBusy(false);
      }
    };

  const openCandidateProfile = () => {
    if (!currentCandidate || isSwiping.current) {
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

  useEffect(() => {
    const loadMode = async () => {
      try {
        const savedMode = await getMode();

        if (savedMode) {
          setMode(savedMode);
        } else {
          setError('Unable to determine discovery mode.');
          setLoading(false);
        }
      } catch (err) {
        console.error('Load swipe mode error:', err);
        setError('Unable to load discovery mode.');
        setLoading(false);
      }
    };

    loadMode();
  }, []);

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


        console.log('get_discovery_candidates data:', data);
        console.log('get_discovery_candidates error:', rpcError);

        if (rpcError) {
          throw rpcError;
        }

        const newCandidates = (data ?? []) as Candidate[];

        if (newCandidates.length === 0 && append) {
          setHasMore(false);
        }

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
    if (!mode) {
      return;
    }

    fetchCandidates(mode, 0, false);
  }, [mode, fetchCandidates]);

  useEffect(() => {
    const remaining = candidates.length - currentIndex;

    if (
      mode &&
      remaining <= 3 &&
      candidates.length > 0 &&
      !loadingMore &&
      hasMore
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


    return data;
  };
  const finishSwipe = (
    candidate: Candidate,
    action: SwipeAction
  ) => {
    // Move to the next card immediately. Do not wait for Supabase.
    setCurrentIndex((previous) => previous + 1);
    setPhotoIndex(0);

    position.setValue({
      x: 0,
      y: 0,
    });

    isSwiping.current = false;

    // Save the swipe in the background.
    saveSwipe(candidate, action)
      .then((result) => {
        console.log('submit_swipe result:', result);

        if (result?.[0]?.matched) {
          console.log('MATCH!', result[0].match_id);
          setMatchedMatchId(result[0].match_id);
          setMatchedCandidate(candidate);
          setShowMatchModal(true);
        }
      })
      .catch((err) => {
        if (
          err?.code === 'P0001' &&
          err?.message === 'Target profile is not available'
        ) {
          return;
        }

        console.error('save swipe error:', err);

        setError(
          err instanceof Error
            ? err.message
            : err?.message ?? 'Unable to save your swipe.'
        );
      });
  };


  const swipeCard = (action: SwipeAction) => {
    if (!currentCandidate || isSwiping.current) {
      return;
    }

    const candidate = currentCandidate;
    const direction = action === 'like' ? 1 : -1;

    isSwiping.current = true;

    Animated.timing(position, {
      toValue: {
        x: direction * screenWidth * 1.35,
        y: 0,
      },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: false,
    }).start(({ finished }) => {

      if (!finished) {
        isSwiping.current = false;
        return;
      }

      finishSwipe(candidate, action);
    });
  };

  /* ปัดการ์ดด้วยนิ้ว */
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => false,

    // Let buttons/tap zones receive a normal tap, but capture the gesture
    // as soon as the finger actually starts moving horizontally.
    onMoveShouldSetPanResponder: (_, gesture) => {
      const horizontal = Math.abs(gesture.dx);
      const vertical = Math.abs(gesture.dy);

      return horizontal > 6 && horizontal > vertical;
    },

    onMoveShouldSetPanResponderCapture: (_, gesture) => {
      const horizontal = Math.abs(gesture.dx);
      const vertical = Math.abs(gesture.dy);

      return horizontal > 6 && horizontal > vertical;
    },

    onPanResponderGrant: () => {
      position.stopAnimation();
    },

    onPanResponderMove: (_, gesture) => {
      if (isSwiping.current) {
        return;
      }

      position.setValue({
        x: gesture.dx,
        y: gesture.dy * 0.08,
      });
    },

    onPanResponderRelease: (_, gesture) => {


      if (isSwiping.current) {
        return;
      }

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
        friction: 7,
        tension: 80,
        useNativeDriver: false,
      }).start();
    },

    onPanResponderTerminate: (_, gesture) => {
      if (isSwiping.current) {
        return;
      }

      Animated.spring(position, {
        toValue: {
          x: 0,
          y: 0,
        },
        friction: 7,
        tension: 80,
        useNativeDriver: false,
      }).start();
    },

    onPanResponderTerminationRequest: () => false,
  });

  const changeMode = (newMode: SwipeMode) => {
    if (newMode === mode) {
      return;
    }

    setMode(newMode);
    setHasMore(true);
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
    // ✅ 2. เพิ่ม edges={['top']} เพราะ inset ด้านล่างย้ายไปอยู่ที่ layout แล้ว
    <SafeAreaView style={styles.safeArea} edges={['top']}>
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
            // ✅ 3. เพิ่ม ../ อีกชั้น เพราะไฟล์ย้ายเข้า (main)
            source={require('../../../assets/images/talktu-logo2.png')}
            style={[
              styles.logo,
              {
                width: logoWidth,
                height: logoHeight,
                marginLeft:-15,
                marginTop:-20,
                marginBottom:-15,
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
            onPress={() => setShowSettings(true)}
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
                color="#FF8D88"
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
                style={styles.retryShadow}
                onPress={() => {
                  if (mode) {
                    fetchCandidates(mode, 0, false);
                  }
                }}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={THEME_GRADIENT}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
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
                style={styles.retryShadow}
                onPress={() => {
                  if (mode) {
                    fetchCandidates(mode, 0, false);
                  }
                }}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={THEME_GRADIENT}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
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

              {/* ================= PHOTO DASHES ================= */}

              {currentCandidate.photos?.length > 1 ? (
                <View
                  pointerEvents="none"
                  style={styles.photoDashes}
                >
                  {currentCandidate.photos.map(
                    (photo, index) => (
                      <View
                        key={photo.id}
                        style={[
                          styles.photoDash,
                          index === photoIndex &&
                            styles.photoDashActive,
                        ]}
                      />
                    )
                  )}
                </View>
              ) : null}

              {/* ================= SAFETY MENU ================= */}

              <TouchableOpacity
                style={
                  styles.safetyMenuButton
                }
                activeOpacity={0.8}
                onPress={openSafety}
              >
                <Ionicons
                  name="ellipsis-horizontal"
                  size={23}
                  color="#222222"
                />
              </TouchableOpacity>
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
                pointerEvents="box-none"
                style={[
                  styles.profileInfo,
                  { right: 14 + actionButtonSize + 10 },
                ]}
              >
                <View style={styles.nameRow}>
                  <Text
                    style={styles.nameText}
                    numberOfLines={1}
                  >
                    {
                      currentCandidate.display_name
                    }{' '}
                    {currentCandidate.age}
                  </Text>

                  {/* ปุ่มดู bio (ข้างชื่อ) */}
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="View bio"
                    style={styles.bioButton}
                    activeOpacity={0.7}
                    hitSlop={{
                      top: 10,
                      bottom: 10,
                      left: 10,
                      right: 10,
                    }}
                    onPress={openCandidateProfile}
                  >
                    <Ionicons
                      name="arrow-up-circle-outline"
                      size={bioIconSize}
                      color="#FFFFFF"
                    />
                  </TouchableOpacity>
                </View>

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
                  color="#FF8D88"
                />
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>

        {/* ✅ 4. ลบ <BottomNavigation activeTab="swap" /> ออกแล้ว */}

      </View>

      <MatchModal
        visible={showMatchModal}
        displayName={matchedCandidate?.display_name ?? ''}
        candidatePhotoPath={
          [...(matchedCandidate?.photos ?? [])]
            .sort((a, b) => a.position - b.position)[0]
            ?.storage_path
        }
        matchId={matchedMatchId}
        onContinue={() => setShowMatchModal(false)}
      />
      <Modal
        visible={showSafety}
        transparent
        animationType="fade"
        onRequestClose={
          closeSafety
        }
      >
        <Pressable
          style={
            styles.safetyOverlay
          }
          onPress={
            closeSafety
          }
        >
          <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    keyboardVerticalOffset={0}
    style={{
      flex: 1,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingBottom: Platform.OS === 'ios' ? 28 : 8,
    }}
  >
          <Pressable
            style={[
              styles.safetyModal,
              {
                width:
                  screenWidth >= 768
                    ? 420
                    : screenWidth - 40,
              },
            ]}
            onPress={(event) => {
              event.stopPropagation();
            }}
          >
            {/* HEADER */}

            <View
              style={
                styles.safetyHeader
              }
            >
              <TouchableOpacity
                style={
                  styles.safetyClose
                }
                disabled={
                  safetyBusy
                }
                onPress={
                  safetyView === 'menu' ||
                    safetyView ===
                    'reportBlockPrompt'
                    ? closeSafety
                    : () =>
                      setSafetyView(
                        'menu'
                      )
                }
              >
                <Text
                  style={
                    styles.safetyCloseText
                  }
                >
                  {safetyView ===
                    'menu' ||
                    safetyView ===
                    'reportBlockPrompt'
                    ? '×'
                    : '‹'}
                </Text>
              </TouchableOpacity>

              <Text
                style={
                  styles.safetyTitle
                }
              >
                {safetyView ===
                  'menu' &&
                  'Safety Tools'}

                {safetyView ===
                  'blockConfirm' &&
                  'Block User'}

                {safetyView ===
                  'reportForm' &&
                  'Report User'}

                {safetyView ===
                  'reportBlockPrompt' &&
                  'Report Submitted'}
              </Text>

              <View
                style={
                  styles.safetyHeaderSpacer
                }
              />
            </View>

            {/* MENU */}

            {safetyView ===
              'menu' &&
              currentCandidate && (
                <>
                  <TouchableOpacity
                    style={
                      styles.safetyOption
                    }
                    onPress={() =>
                      setSafetyView(
                        'blockConfirm'
                      )
                    }
                  >
                    <Ionicons
                      name="ban-outline"
                      size={18}
                      color="#333333"
                    />

                    <Text
                      style={
                        styles.safetyOptionText
                      }
                    >
                      Block{' '}
                      {
                        currentCandidate.display_name
                      }
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={
                      styles.safetyOption
                    }
                    onPress={() => {
                      setReportReason(
                        ''
                      );

                      setReportDetails(
                        ''
                      );

                      setSafetyView(
                        'reportForm'
                      );
                    }}
                  >
                    <Ionicons
                      name="flag-outline"
                      size={18}
                      color="#333333"
                    />

                    <Text
                      style={
                        styles.safetyOptionText
                      }
                    >
                      Report{' '}
                      {
                        currentCandidate.display_name
                      }
                    </Text>
                  </TouchableOpacity>
                </>
              )}

            {/* BLOCK CONFIRM */}

            {safetyView ===
              'blockConfirm' &&
              currentCandidate && (
                <>
                  <Text
                    style={
                      styles.safetyBody
                    }
                  >
                    Are you sure you
                    want to block{' '}
                    {
                      currentCandidate.display_name
                    }
                    ?
                    {'\n\n'}
                    You will no longer
                    be able to discover
                    or interact with
                    each other.
                  </Text>

                  <View
                    style={
                      styles.safetyActions
                    }
                  >
                    <TouchableOpacity
                      style={
                        styles.safetyCancel
                      }
                      disabled={
                        safetyBusy
                      }
                      onPress={() =>
                        setSafetyView(
                          'menu'
                        )
                      }
                    >
                      <Text
                        style={
                          styles.safetyCancelText
                        }
                      >
                        Cancel
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={
                        styles.safetyConfirm
                      }
                      disabled={
                        safetyBusy
                      }
                      onPress={
                        confirmBlockCandidate
                      }
                    >
                      <Text
                        style={
                          styles.safetyConfirmText
                        }
                      >
                        {safetyBusy
                          ? 'Blocking...'
                          : 'Block'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

            {/* REPORT */}

            {safetyView ===
              'reportForm' &&
              currentCandidate && (
                <>
                  <Text
                    style={
                      styles.safetyBody
                    }
                  >
                    Why are you
                    reporting{' '}
                    {
                      currentCandidate.display_name
                    }
                    ?
                  </Text>

                  <ScrollView
                    style={
                      styles.reportScroll
                    }
                    showsVerticalScrollIndicator={
                      false
                    }
                    keyboardShouldPersistTaps="handled"
                  >
                    {PROFILE_REPORT_REASONS.map(
                      (reason) => (
                        <TouchableOpacity
                          key={
                            reason.value
                          }
                          style={[
                            styles.reportReason,
                            reportReason ===
                            reason.value &&
                            styles.reportReasonSelected,
                          ]}
                          onPress={() =>
                            setReportReason(
                              reason.value
                            )
                          }
                        >
                          <Ionicons
                            name={
                              reportReason ===
                                reason.value
                                ? 'radio-button-on'
                                : 'radio-button-off'
                            }
                            size={17}
                            color={
                              reportReason ===
                                reason.value
                                ? '#E88A43'
                                : '#666666'
                            }
                          />

                          <Text
                            style={
                              styles.safetyOptionText
                            }
                          >
                            {
                              reason.label
                            }
                          </Text>
                        </TouchableOpacity>
                      )
                    )}

                    <TextInput
                      style={
                        styles.reportDetails
                      }
                      placeholder="Additional details (optional)"
                      placeholderTextColor="#888888"
                      multiline
                      maxLength={1000}
                      value={
                        reportDetails
                      }
                      onChangeText={
                        setReportDetails
                      }
                      textAlignVertical="top"
                    />
                  </ScrollView>

                  <View
                    style={
                      styles.safetyActions
                    }
                  >
                    <TouchableOpacity
                      style={
                        styles.safetyCancel
                      }
                      disabled={
                        safetyBusy
                      }
                      onPress={() =>
                        setSafetyView(
                          'menu'
                        )
                      }
                    >
                      <Text
                        style={
                          styles.safetyCancelText
                        }
                      >
                        Cancel
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={
                        styles.safetyConfirm
                      }
                      disabled={
                        safetyBusy ||
                        !reportReason
                      }
                      onPress={
                        submitProfileReport
                      }
                    >
                      <Text
                        style={
                          styles.safetyConfirmText
                        }
                      >
                        {safetyBusy
                          ? 'Submitting...'
                          : 'Submit Report'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

            {/* REPORT SUCCESS / ASK BLOCK */}

            {safetyView ===
              'reportBlockPrompt' &&
              currentCandidate && (
                <>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={46}
                    color="#E88A43"
                    style={{
                      alignSelf:
                        'center',
                      marginVertical:
                        12,
                    }}
                  />

                  <Text
                    style={
                      styles.safetyBody
                    }
                  >
                    Your report has
                    been submitted.
                    {'\n\n'}
                    Would you also
                    like to block{' '}
                    {
                      currentCandidate.display_name
                    }
                    ?
                  </Text>

                  <View
                    style={
                      styles.safetyActions
                    }
                  >
                    <TouchableOpacity
                      style={
                        styles.safetyCancel
                      }
                      disabled={
                        safetyBusy
                      }
                      onPress={
                        closeSafety
                      }
                    >
                      <Text
                        style={
                          styles.safetyCancelText
                        }
                      >
                        Not now
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={
                        styles.safetyConfirm
                      }
                      disabled={
                        safetyBusy
                      }
                      onPress={
                        confirmBlockCandidate
                      }
                    >
                      <Text
                        style={
                          styles.safetyConfirmText
                        }
                      >
                        {safetyBusy
                          ? 'Blocking...'
                          : `Block ${currentCandidate.display_name}`}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
          </Pressable>
          </KeyboardAvoidingView>
          
        </Pressable>
        
      </Modal>

      {/* ================= SETTINGS BOTTOM SHEET ================= */}

      <SettingsSheet
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        onSaved={(newMode) => {
          setHasMore(true);

          if (newMode === mode) {
            // โหมดเดิมแต่ตัวเลือกอาจเปลี่ยน (เช่น Men → Women) ให้โหลดการ์ดใหม่
            fetchCandidates(newMode, 0, false);
          } else {
            // effect ของ mode จะ fetch ให้เอง
            changeMode(newMode);
          }
        }}
      />

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

function getProfilePhotoUrl(storagePath: string) {
  if (
    storagePath.startsWith('http://') ||
    storagePath.startsWith('https://')
  ) {
    return storagePath;
  }

  return supabase.storage
    .from('profile-photos')
    .getPublicUrl(storagePath)
    .data.publicUrl;
}

function PhotoFromStorage({
  storagePath,
}: PhotoFromStorageProps) {
  const imageUrl = getProfilePhotoUrl(storagePath);

  return <CandidateImage uri={imageUrl} />;
}


function CandidateImage({
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

  return (
    <ExpoImage
      source={{ uri }}
      style={styles.photo}
      contentFit="cover"
      cachePolicy="memory-disk"
      transition={0}
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

    borderRadius: 30,

    overflow: 'hidden',

    backgroundColor:
      '#EEEEEE',

    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.14,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
    }),
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

  /* ================= PHOTO DASHES ================= */

  photoDashes: {
    position: 'absolute',
    top: 18,
    left: 60, // เว้นที่ให้ปุ่ม safety ทางขวาไม่ทับ และให้ขีดอยู่กึ่งกลางการ์ด
    right: 60,
    flexDirection: 'row',
    gap: 4,
    zIndex: 10,
  },

  photoDash: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },

  photoDashActive: {
    backgroundColor: '#FFFFFF',
  },

  profileOpenZone: {
    position: 'absolute',
    top: 0,
    bottom: BOTTOM_RESERVED,
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
    bottom: BOTTOM_RESERVED,
    left: 0,

    width: '18%',

    zIndex: 5,
  },

  rightPhotoZone: {
    position: 'absolute',

    top: 0,
    bottom: BOTTOM_RESERVED,
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

    left: 18,
    bottom: 26,

    zIndex: 13,
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  nameText: {
    flexShrink: 1,

    color: '#FFFFFF',

    fontSize: 32,
    lineHeight: 38,

    fontWeight: '700',

    letterSpacing: -0.7,

    textShadowColor:
      'rgba(0,0,0,0.35)',

    textShadowOffset: {
      width: 0,
      height: 1,
    },

    textShadowRadius: 2,
  },

  bioButton: {
    marginLeft: 10,

    justifyContent: 'center',
    alignItems: 'center',

    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOpacity: 0.35,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 },
      },
    }),
  },

  detailText: {
    color: '#FFFFFF',

    fontSize: 14,

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
    bottom: 16,

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

  retryShadow: {
    marginTop: 18,

    borderRadius: 999,
    backgroundColor: '#FFAF79',

    ...Platform.select({
      ios: {
        shadowColor: '#FF6B5E',
        shadowOpacity: 0.35,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 6,
        shadowColor: '#FF6B5E',
      },
    }),
  },

  retryButton: {
    borderRadius: 999,

    paddingHorizontal: 26,
    paddingVertical: 12,
  },

  retryText: {
    fontSize: 14,
    fontWeight: '700',

    color: '#FFFFFF',
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
  safetyMenuButton: {
    position: 'absolute',
    top: 10,
    right: 10,

    width: 38,
    height: 38,

    borderRadius: 19,

    backgroundColor:
      'rgba(255,255,255,0.94)',

    alignItems: 'center',
    justifyContent: 'center',

    zIndex: 30,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },

  safetyOverlay: {
    flex: 1,

    backgroundColor:
      'rgba(0,0,0,0.35)',

    justifyContent: 'flex-end',
    alignItems: 'center',

    paddingBottom: 28,
  },

  safetyModal: {
    maxHeight: '88%',

    backgroundColor: '#FFFFFF',

    borderRadius: 22,

    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 14,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },

  safetyHeader: {
    height: 48,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',

    marginBottom: 6,
  },

  safetyClose: {
    width: 34,
    height: 34,

    borderRadius: 17,

    backgroundColor:
      '#FFB56F',

    alignItems: 'center',
    justifyContent: 'center',
  },

  safetyCloseText: {
    color: '#FFFFFF',

    fontSize: 27,
    lineHeight: 29,
    fontWeight: '300',
  },

  safetyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222222',
  },

  safetyHeaderSpacer: {
    width: 34,
  },

  safetyOption: {
    minHeight: 42,

    borderRadius: 17,

    backgroundColor:
      '#EEEEEE',

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 16,

    marginTop: 8,
  },

  safetyOptionText: {
    marginLeft: 9,

    color: '#222222',

    fontSize: 12,
    fontWeight: '600',

    flexShrink: 1,
  },

  safetyBody: {
    color: '#333333',

    fontSize: 14,
    lineHeight: 21,

    textAlign: 'center',

    marginTop: 10,
    marginBottom: 14,

    paddingHorizontal: 6,
  },

  safetyActions: {
    flexDirection: 'row',

    gap: 10,

    marginTop: 14,
  },

  safetyCancel: {
    flex: 1,

    minHeight: 42,

    borderRadius: 17,

    backgroundColor:
      '#EEEEEE',

    alignItems: 'center',
    justifyContent: 'center',
  },

  safetyCancelText: {
    color: '#333333',

    fontSize: 13,
    fontWeight: '600',
  },

  safetyConfirm: {
    flex: 1,

    minHeight: 42,

    borderRadius: 17,

    backgroundColor:
      '#E88A43',

    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: 10,
  },

  safetyConfirmText: {
    color: '#FFFFFF',

    fontSize: 13,
    fontWeight: '600',

    textAlign: 'center',
  },

  reportScroll: {
    maxHeight: 430,
    
  },

  reportReason: {
    minHeight: 39,

    flexDirection: 'row',
    alignItems: 'center',

    borderRadius: 17,

    paddingHorizontal: 10,

    marginTop: 5,

    backgroundColor:
      '#F3F3F3',
  },

  reportReasonSelected: {
    backgroundColor:
      '#FFF0E3',

    borderWidth: 1,

    borderColor:
      '#E88A43',
  },

  reportDetails: {
    minHeight: 80,
    maxHeight: 120,

    borderRadius: 12,

    backgroundColor:
      '#F3F3F3',

    padding: 10,

    marginTop: 10,

    color: '#222222',

    fontSize: 13,
  },
});

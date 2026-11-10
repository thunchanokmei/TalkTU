
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  ActivityIndicator,
  AppState,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';

import { supabase } from '@/lib/supabase';

import AppHeader from '../../components/AppHeader';
import { getMode } from '../../features/onboarding/services/onboardingService';

const LIKE_LOGO = require('../../../assets/images/like.jpeg');

type SwipeMode = 'date' | 'friends';

type GenderIdentity =
  | 'man'
  | 'woman'
  | 'non_binary'
  | 'prefer_not_to_say';

type CandidatePhoto = {
  id: string;
  storage_path: string;
  position: number;
};

type CandidateInterest = {
  id: string;
  name: string;
};

type CandidateLocation = {
  id: number;
  name: string;
};

type IncomingLike = {
  user_id: string;
  display_name: string;
  age: number;
  tu_generation: number;
  bio: string | null;
  height_cm: number | null;
  gender_identity: GenderIdentity | null;
  faculty: string;
  department: string | null;
  photos: CandidatePhoto[];
  interests: CandidateInterest[];
  locations: CandidateLocation[];
};

const FETCH_LIMIT = 20;

export default function LikeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [mode, setMode] = useState<SwipeMode | null>(null);
  const [likes, setLikes] = useState<IncomingLike[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ป้องกันผลลัพธ์จาก request เก่ามาทับข้อมูลใหม่
  const requestIdRef = useRef(0);

  // เช็กว่าผู้ใช้กำลังอยู่หน้า Like หรือไม่
  const isFocusedRef = useRef(false);

  // เช็กสถานะของแอป
  const appStateRef = useRef(AppState.currentState);

  // --------------------------------------------
  // Load / Refresh Likes
  // --------------------------------------------
  const loadLikes = useCallback(async (isPullRefresh = false) => {
    const requestId = ++requestIdRef.current;

    if (isPullRefresh) {
      setRefreshing(true);
    } else {
      setRefreshing(false);
    }

    setError(null);

    try {
      const savedMode = await getMode();

      if (!savedMode) {
        throw new Error('Unable to determine current mode.');
      }

      const { data, error: rpcError } = await supabase.rpc(
        'get_incoming_likes',
        {
          p_mode: savedMode,
          p_limit: FETCH_LIMIT,
          p_offset: 0,
        }
      );

      if (rpcError) {
        throw rpcError;
      }

      // ไม่ใช้ผลลัพธ์ถ้าออกจากหน้าแล้ว
      // หรือมี request ใหม่กว่าเกิดขึ้น
      if (
        requestId !== requestIdRef.current ||
        !isFocusedRef.current
      ) {
        return;
      }

      setMode(savedMode);
      setLikes((data ?? []) as IncomingLike[]);
    } catch (err) {
      if (
        requestId !== requestIdRef.current ||
        !isFocusedRef.current
      ) {
        return;
      }

      console.error('get_incoming_likes error:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load likes.'
      );
    } finally {
      if (
        requestId === requestIdRef.current &&
        isFocusedRef.current
      ) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  // --------------------------------------------
  // Auto Refresh เมื่อเข้าหน้า Like
  // --------------------------------------------
  useFocusEffect(
    useCallback(() => {
      isFocusedRef.current = true;

      void loadLikes();

      return () => {
        isFocusedRef.current = false;

        // ยกเลิกผลลัพธ์ของ request ที่ยังไม่เสร็จ
        requestIdRef.current += 1;
      };
    }, [loadLikes])
  );

  // --------------------------------------------
  // Auto Refresh เมื่อกลับเข้าแอป
  // --------------------------------------------
  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (nextAppState) => {
        const wasInactive =
          appStateRef.current === 'background' ||
          appStateRef.current === 'inactive';

        if (
          wasInactive &&
          nextAppState === 'active' &&
          isFocusedRef.current
        ) {
          void loadLikes();
        }

        appStateRef.current = nextAppState;
      }
    );

    return () => {
      subscription.remove();
    };
  }, [loadLikes]);

  // --------------------------------------------
  // Pull to Refresh
  // --------------------------------------------
  const handleRefresh = useCallback(() => {
    void loadLikes(true);
  }, [loadLikes]);

  // --------------------------------------------
  // Card Dimensions
  // --------------------------------------------
  const horizontalPadding = Math.max(24, width * 0.08);
  const gap = Math.max(14, width * 0.04);

  const cardWidth =
    (width - horizontalPadding * 2 - gap) / 2;

  const cardHeight = cardWidth * 1.42;

  // --------------------------------------------
  // Open User Profile
  // --------------------------------------------
  const openProfile = (candidate: IncomingLike) => {
    if (!mode) {
      return;
    }

    router.push({
      pathname: '/user/[userId]',
      params: {
        userId: candidate.user_id,
        candidate: JSON.stringify(candidate),
        mode,
        source: 'like',
      },
    });
  };

  return (
    <View style={styles.screen}>
      <AppHeader logo={LIKE_LOGO} centerLogo />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color="#FF7F87"
          />
        </View>
      ) : (
        <FlatList
          data={error ? [] : likes}
          keyExtractor={(item) => item.user_id}
          numColumns={2}
          columnWrapperStyle={{ gap }}

          // Pull to Refresh
          refreshing={refreshing}
          onRefresh={handleRefresh}
          alwaysBounceVertical
          overScrollMode="always"

          contentContainerStyle={[
            {
              paddingHorizontal: horizontalPadding,
              paddingTop: 0,
              paddingBottom: 24,
              flexGrow: 1,
            },
            (error || likes.length === 0) && {
              justifyContent: 'center',
            },
          ]}

          showsVerticalScrollIndicator={false}

          // ทำให้ Refresh ได้แม้ไม่มี Like
          ListEmptyComponent={
            error ? (
              <View style={styles.center}>
                <Text style={styles.errorText}>
                  {error}
                </Text>

                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => void loadLikes()}
                >
                  <Text style={styles.retryText}>
                    Try again
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.center}>
                <Ionicons
                  name="heart-outline"
                  size={48}
                  color="#FF9A82"
                />

                <Text style={styles.emptyTitle}>
                  No likes yet
                </Text>

                <Text style={styles.emptyText}>
                  People who like you will appear here.
                </Text>
              </View>
            )
          }

          renderItem={({ item }) => {
            const firstPhoto = item.photos?.[0];

            return (
              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.card,
                  {
                    width: cardWidth,
                    height: cardHeight,
                  },
                ]}
                onPress={() => openProfile(item)}
              >
                <View style={styles.cardInner}>
                  {firstPhoto?.storage_path ? (
                    <ExpoImage
                      source={{
                        uri: getProfilePhotoUrl(
                          firstPhoto.storage_path
                        ),
                      }}
                      style={styles.photo}
                      contentFit="cover"
                      transition={150}
                    />
                  ) : (
                    <View style={styles.noPhoto}>
                      <Ionicons
                        name="person-outline"
                        size={48}
                        color="#AAAAAA"
                      />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  card: {
    marginBottom: 16,
    borderRadius: 20,
    backgroundColor: '#F0E4DB',

    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },

  cardInner: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },

  photo: {
    width: '100%',
    height: '100%',
  },

  noPhoto: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFE7E1',
  },

  errorText: {
    textAlign: 'center',
    color: '#C62828',
  },

  retryButton: {
    marginTop: 14,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FFF0A8',
  },

  retryText: {
    fontWeight: '600',
    color: '#333333',
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 19,
    fontWeight: '700',
    color: '#444444',
  },

  emptyText: {
    marginTop: 5,
    textAlign: 'center',
    color: '#888888',
  },
});

import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { useRouter } from 'expo-router';

import { supabase } from '@/lib/supabase';

import BottomNavigation from '../components/navigation/BottomNavigation';

import {
  getMode,
} from '../features/onboarding/services/onboardingService';

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

  const {
    width,
  } = useWindowDimensions();

  const [mode, setMode] =
    useState<SwipeMode | null>(null);

  const [likes, setLikes] =
    useState<IncomingLike[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const loadLikes = useCallback(
    async () => {
      try {
        setLoading(true);
        setError(null);

        const savedMode =
          await getMode();

        if (!savedMode) {
          throw new Error(
            'Unable to determine current mode.'
          );
        }

        setMode(savedMode);

        const {
          data,
          error: rpcError,
        } = await supabase.rpc(
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

        setLikes(
          (data ?? []) as IncomingLike[]
        );
      } catch (err) {
        console.error(
          'get_incoming_likes error:',
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load likes.'
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadLikes();
  }, [loadLikes]);

  const horizontalPadding =
    Math.max(
      20,
      width * 0.06
    );

  const gap = Math.max(
    12,
    width * 0.035
  );

  const cardWidth =
    (
      width -
      horizontalPadding * 2 -
      gap
    ) / 2;

  const openProfile = (
    candidate: IncomingLike
  ) => {
    if (!mode) {
      return;
    }

    router.push({
      pathname: '/user/[userId]',
      params: {
        userId:
          candidate.user_id,

        candidate:
          JSON.stringify(
            candidate
          ),

        mode,

        source: 'like',
      },
    });
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Like
        </Text>

        <Ionicons
          name="heart"
          size={27}
          color="#FF5964"
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color="#FF7F87"
          />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text
            style={styles.errorText}
          >
            {error}
          </Text>

          <TouchableOpacity
            style={
              styles.retryButton
            }
            onPress={loadLikes}
          >
            <Text
              style={
                styles.retryText
              }
            >
              Try again
            </Text>
          </TouchableOpacity>
        </View>
      ) : likes.length === 0 ? (
        <View style={styles.center}>
          <Ionicons
            name="heart-outline"
            size={48}
            color="#C9C9C9"
          />

          <Text
            style={styles.emptyTitle}
          >
            No likes yet
          </Text>

          <Text
            style={styles.emptyText}
          >
            People who like you
            will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={likes}
          keyExtractor={(item) =>
            item.user_id
          }
          numColumns={2}
          columnWrapperStyle={{
            gap,
          }}
          contentContainerStyle={{
            paddingHorizontal:
              horizontalPadding,

            paddingTop: 18,
            paddingBottom: 110,
          }}
          showsVerticalScrollIndicator={
            false
          }
          renderItem={({ item }) => {
            const firstPhoto =
              item.photos?.[0];

            return (
              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.card,
                  {
                    width: cardWidth,
                    height:
                      cardWidth * 1.25,
                  },
                ]}
                onPress={() =>
                  openProfile(item)
                }
              >
                {firstPhoto
                  ?.storage_path ? (
                  <ExpoImage
                    source={{
                      uri:
                        getProfilePhotoUrl(
                          firstPhoto.storage_path
                        ),
                    }}
                    style={
                      styles.photo
                    }
                    contentFit="cover"
                    transition={150}
                  />
                ) : (
                  <View
                    style={
                      styles.noPhoto
                    }
                  >
                    <Ionicons
                      name="person-outline"
                      size={48}
                      color="#AAAAAA"
                    />
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      )}

      <BottomNavigation activeTab="like"/>
    </View>
  );
}

function getProfilePhotoUrl(
  storagePath: string
) {
  if (
    storagePath.startsWith(
      'http://'
    ) ||
    storagePath.startsWith(
      'https://'
    )
  ) {
    return storagePath;
  }

  return supabase.storage
    .from('profile-photos')
    .getPublicUrl(storagePath)
    .data.publicUrl;
}

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,

      backgroundColor:
        '#FFF7EE',
    },

    header: {
      paddingTop: 58,
      paddingBottom: 15,

      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',

      gap: 7,

      backgroundColor:
        '#FFF7EE',
    },

    title: {
      fontSize: 28,
      fontWeight: '700',

      color: '#222222',
    },

    center: {
      flex: 1,

      alignItems: 'center',
      justifyContent:
        'center',

      paddingHorizontal: 30,
    },

    card: {
      marginBottom: 14,

      borderRadius: 16,

      overflow: 'hidden',

      backgroundColor:
        '#F0E4DB',
    },

    photo: {
      width: '100%',
      height: '100%',
    },

    noPhoto: {
      flex: 1,

      alignItems: 'center',
      justifyContent:
        'center',

      backgroundColor:
        '#EFE7E1',
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

      backgroundColor:
        '#FFF0A8',
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
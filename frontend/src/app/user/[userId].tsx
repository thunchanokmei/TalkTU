import React, { useMemo, useState } from 'react';

import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  useLocalSearchParams,
  useRouter,
} from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '@/lib/supabase';

type SwipeMode = 'date' | 'friends';
type SwipeAction = 'like' | 'pass';

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
  id: string | number;
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

  locations?: CandidateLocation[];
};

export default function UserProfileScreen() {
  const router = useRouter();

  const {
    candidate,
    mode,
  } = useLocalSearchParams<{
    userId: string;
    candidate?: string;
    mode?: SwipeMode;
  }>();

  const { width } = useWindowDimensions();

  const [photoIndex, setPhotoIndex] =
    useState(0);

  const [submitting, setSubmitting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState('');

  const profile = useMemo<Candidate | null>(
    () => {
      if (!candidate) {
        return null;
      }

      try {
        return JSON.parse(
          candidate
        ) as Candidate;
      } catch (error) {
        console.error(
          'Parse candidate error:',
          error
        );

        return null;
      }
    },
    [candidate]
  );

  if (!profile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.unavailable}>
          <Ionicons
            name="person-outline"
            size={54}
            color="#777777"
          />

          <Text style={styles.unavailableTitle}>
            Profile unavailable
          </Text>

          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backFallbackButton}
          >
            <Text style={styles.backFallbackText}>
              Go back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const photos =
    profile.photos ?? [];

  const currentPhoto =
    photos[photoIndex];

  const previousPhoto = () => {
    if (photos.length <= 1) {
      return;
    }

    setPhotoIndex((current) =>
      current > 0
        ? current - 1
        : photos.length - 1
    );
  };

  const nextPhoto = () => {
    if (photos.length <= 1) {
      return;
    }

    setPhotoIndex((current) =>
      current < photos.length - 1
        ? current + 1
        : 0
    );
  };

  const submitAction = async (
    action: SwipeAction
  ) => {
    if (submitting) {
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');

      const selectedMode: SwipeMode =
        mode === 'friends'
          ? 'friends'
          : 'date';

      const { error } =
        await supabase.rpc(
          'submit_swipe',
          {
            p_target_id:
              profile.user_id,

            p_mode:
              selectedMode,

            p_action:
              action,
          }
        );

      if (error) {
        throw error;
      }

      router.replace('/swipe');
    } catch (error) {
      console.error(
        'submit_swipe from profile error:',
        error
      );

      setErrorMessage(
        'Unable to save your choice. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const pagePadding = Math.max(
    14,
    Math.min(width * 0.045, 26)
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal:
              pagePadding,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* PHOTO */}

        <View style={styles.photoCard}>
          {currentPhoto?.storage_path ? (
            <ProfilePhoto
              storagePath={
                currentPhoto.storage_path
              }
            />
          ) : (
            <View style={styles.noPhoto}>
              <Ionicons
                name="person-outline"
                size={76}
                color="#AAAAAA"
              />
            </View>
          )}

          {/* BACK */}

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color="#333333"
            />
          </TouchableOpacity>

          {/* PHOTO COUNTER */}

          {photos.length > 0 ? (
            <View style={styles.photoCounter}>
              <Text
                style={styles.photoCounterText}
              >
                {photoIndex + 1}/
                {photos.length}
              </Text>
            </View>
          ) : null}

          {/* TAP LEFT / RIGHT */}

          {photos.length > 1 ? (
            <>
              <TouchableOpacity
                style={styles.photoLeftZone}
                onPress={previousPhoto}
                activeOpacity={1}
              />

              <TouchableOpacity
                style={styles.photoRightZone}
                onPress={nextPhoto}
                activeOpacity={1}
              />
            </>
          ) : null}

          {/* DARK GRADIENT */}

          <LinearGradient
            pointerEvents="none"
            colors={[
              'transparent',
              'rgba(0,0,0,0.05)',
              'rgba(0,0,0,0.75)',
            ]}
            locations={[0, 0.58, 1]}
            style={styles.photoGradient}
          />

          {/* NAME */}

          <View style={styles.heroInfo}>
            <Text style={styles.heroName}>
              {profile.display_name}{' '}
              {profile.age}
            </Text>

            <Text
              style={styles.heroDetail}
              numberOfLines={1}
            >
              {profile.department
                ? `${profile.department}, ${profile.faculty}`
                : profile.faculty}
            </Text>
          </View>
        </View>

        {/* BIO */}

        {profile.bio?.trim() ? (
          <LinearGradient
            colors={[
              '#FF9586',
              '#FFB77F',
              '#FFD3A2',
            ]}
            start={{
              x: 0,
              y: 0,
            }}
            end={{
              x: 1,
              y: 1,
            }}
            style={styles.infoCard}
          >
            <Text style={styles.cardTitle}>
              Bio
            </Text>

            <Text style={styles.bioText}>
              {profile.bio.trim()}
            </Text>
          </LinearGradient>
        ) : null}

        {/* ABOUT ME */}

        <LinearGradient
          colors={[
            '#FF9586',
            '#FFB77F',
            '#FFD3A2',
          ]}
          start={{
            x: 0,
            y: 0,
          }}
          end={{
            x: 1,
            y: 1,
          }}
          style={styles.infoCard}
        >
          <Text style={styles.cardTitle}>
            About me
          </Text>

          {profile.height_cm ? (
            <InfoRow
              icon="resize-outline"
              text={`${profile.height_cm} cm`}
            />
          ) : null}

          <InfoRow
            icon="school-outline"
            text={
              profile.department
                ? `${profile.department}, ${profile.faculty}`
                : profile.faculty
            }
          />

          <InfoRow
            icon="calendar-outline"
            text={`TU${profile.tu_generation}`}
            last
          />
        </LinearGradient>

        {/* INTERESTS */}

        {profile.interests?.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Interests
            </Text>

            <View style={styles.chipWrap}>
              {profile.interests.map(
                (interest) => (
                  <View
                    key={interest.id}
                    style={styles.chip}
                  >
                    <Text style={styles.chipText}>
                      {interest.name}
                    </Text>
                  </View>
                )
              )}
            </View>
          </View>
        ) : null}

        {/* LOCATIONS */}

        {profile.locations &&
        profile.locations.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              You'll usually find me at..
            </Text>

            <View style={styles.chipWrap}>
              {profile.locations.map(
                (location) => (
                  <View
                    key={String(location.id)}
                    style={styles.chip}
                  >
                    <Text style={styles.chipText}>
                      {location.name}
                    </Text>
                  </View>
                )
              )}
            </View>
          </View>
        ) : null}

        {errorMessage ? (
          <Text style={styles.errorText}>
            {errorMessage}
          </Text>
        ) : null}

        {/* PASS / LIKE */}

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.8}
            disabled={submitting}
            onPress={() =>
              submitAction('pass')
            }
          >
            {submitting ? (
              <ActivityIndicator
                color="#444444"
              />
            ) : (
              <Ionicons
                name="close"
                size={38}
                color="#444444"
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.8}
            disabled={submitting}
            onPress={() =>
              submitAction('like')
            }
          >
            {submitting ? (
              <ActivityIndicator
                color="#FF5964"
              />
            ) : (
              <Ionicons
                name="heart"
                size={34}
                color="#FF5964"
              />
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({
  icon,
  text,
  last = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  last?: boolean;
}) {
  return (
    <View
      style={[
        styles.infoRow,
        last && styles.infoRowLast,
      ]}
    >
      <Ionicons
        name={icon}
        size={16}
        color="#222222"
      />

      <Text
        style={styles.infoText}
        numberOfLines={2}
      >
        {text}
      </Text>
    </View>
  );
}

function ProfilePhoto({
  storagePath,
}: {
  storagePath: string;
}) {
  const [failed, setFailed] =
    useState(false);

  if (
    failed ||
    !(
      storagePath.startsWith('http://') ||
      storagePath.startsWith('https://')
    )
  ) {
    return (
      <View style={styles.noPhoto}>
        <Ionicons
          name="image-outline"
          size={64}
          color="#999999"
        />

        <Text style={styles.noPhotoText}>
          Photo unavailable
        </Text>
      </View>
    );
  }

  return (
    <Image
      source={{
        uri: storagePath,
      }}
      style={styles.photo}
      resizeMode="cover"
      onError={() =>
        setFailed(true)
      }
    />
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  scrollContent: {
    paddingTop: 10,
    paddingBottom: 34,
  },

  photoCard: {
    width: '100%',
    aspectRatio: 0.68,

    position: 'relative',
    overflow: 'hidden',

    borderRadius: 22,

    backgroundColor: '#E9E9E9',

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 4,
  },

  photo: {
    width: '100%',
    height: '100%',
  },

  noPhoto: {
    flex: 1,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#E8E8E8',
  },

  noPhotoText: {
    marginTop: 7,

    fontSize: 12,
    color: '#777777',
  },

  backButton: {
    position: 'absolute',

    top: 12,
    left: 12,

    width: 38,
    height: 38,

    zIndex: 20,

    borderRadius: 999,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor:
      'rgba(255,255,255,0.92)',
  },

  photoCounter: {
    position: 'absolute',

    top: 12,
    right: 12,

    minWidth: 38,
    height: 25,

    zIndex: 20,

    borderRadius: 999,

    paddingHorizontal: 8,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#FFFFFF',
  },

  photoCounterText: {
    fontSize: 12,
    fontWeight: '700',

    color: '#111111',
  },

  photoLeftZone: {
    position: 'absolute',

    top: 55,
    bottom: 90,
    left: 0,

    width: '22%',

    zIndex: 10,
  },

  photoRightZone: {
    position: 'absolute',

    top: 55,
    bottom: 90,
    right: 0,

    width: '22%',

    zIndex: 10,
  },

  photoGradient: {
    position: 'absolute',

    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },

  heroInfo: {
    position: 'absolute',

    left: 14,
    right: 14,
    bottom: 17,

    zIndex: 12,
  },

  heroName: {
    fontSize: 30,
    lineHeight: 34,

    fontWeight: '600',

    color: '#FFFFFF',

    letterSpacing: -0.5,

    textShadowColor:
      'rgba(0,0,0,0.35)',

    textShadowOffset: {
      width: 0,
      height: 1,
    },

    textShadowRadius: 2,
  },

  heroDetail: {
    marginTop: 2,

    fontSize: 11,

    color: '#FFFFFF',

    opacity: 0.96,

    textShadowColor:
      'rgba(0,0,0,0.45)',

    textShadowOffset: {
      width: 0,
      height: 1,
    },

    textShadowRadius: 2,
  },

  infoCard: {
    marginTop: 13,

    borderRadius: 20,

    paddingHorizontal: 15,
    paddingVertical: 14,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },

  cardTitle: {
    marginBottom: 8,

    fontSize: 12,
    fontWeight: '700',

    color: '#171717',
  },

  bioText: {
    fontSize: 13,
    lineHeight: 20,

    color: '#222222',
  },

  infoRow: {
    minHeight: 34,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 8,

    borderBottomWidth:
      StyleSheet.hairlineWidth,

    borderBottomColor:
      'rgba(255,255,255,0.72)',
  },

  infoRowLast: {
    borderBottomWidth: 0,
  },

  infoText: {
    flex: 1,

    fontSize: 12,

    color: '#222222',
  },

  section: {
    marginTop: 16,

    paddingHorizontal: 4,
  },

  sectionTitle: {
    marginBottom: 8,

    fontSize: 12,
    fontWeight: '600',

    color: '#222222',
  },

  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',

    gap: 7,
  },

  chip: {
    minHeight: 28,

    borderRadius: 999,

    paddingHorizontal: 12,
    paddingVertical: 6,

    backgroundColor: '#F3F3F3',

    alignItems: 'center',
    justifyContent: 'center',
  },

  chipText: {
    fontSize: 11,

    color: '#555555',
  },

  errorText: {
    marginTop: 15,

    paddingHorizontal: 5,

    textAlign: 'center',

    fontSize: 12,

    color: '#C62828',
  },

  actionRow: {
    marginTop: 25,

    paddingHorizontal: 30,

    flexDirection: 'row',
    justifyContent: 'space-between',

    alignItems: 'center',
  },

  actionButton: {
    width: 58,
    height: 58,

    borderRadius: 999,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#FFFFFF',

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },

  unavailable: {
    flex: 1,

    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: 30,
  },

  unavailableTitle: {
    marginTop: 10,

    fontSize: 18,
    fontWeight: '600',

    color: '#333333',
  },

  backFallbackButton: {
    marginTop: 18,

    borderRadius: 999,

    paddingHorizontal: 18,
    paddingVertical: 10,

    backgroundColor: '#FFE2D2',
  },

  backFallbackText: {
    fontSize: 13,
    fontWeight: '600',

    color: '#333333',
  },
});
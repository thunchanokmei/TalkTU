import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { supabase } from '../lib/supabase';
import {
  GENDER_IDENTITY_MAP,
  GENDER_IDENTITY_OPTIONS,
} from '../constants/genderIdentity';

const THEME_GRADIENT = ['#FF8D88', '#FFAF79', '#FFD86E'] as const;
const INFO_GRADIENT = ['#FF9586', '#FFB77F', '#FFD3A2'] as const;
const TITLE_PINK = '#F08A8E';

/* พื้นที่ด้านล่างการ์ดที่เว้นไว้ไม่ให้โซนแตะทับชื่อ/ปุ่ม */
const BOTTOM_RESERVED = 90;

type PreviewPhoto = {
  id: string;
  storage_path: string;
  position: number;
};

type NamedItem = {
  id: number;
  name: string;
};

type GenderIdentity =
  (typeof GENDER_IDENTITY_MAP)[keyof typeof GENDER_IDENTITY_MAP];

function getGenderLabel(value: string) {
  return (
    GENDER_IDENTITY_OPTIONS.find(
      (option) => GENDER_IDENTITY_MAP[option] === (value as GenderIdentity)
    ) ?? ''
  );
}

function calculateAge(birthDate: string) {
  const today = new Date();
  const birthday = new Date(birthDate);

  let calculatedAge = today.getFullYear() - birthday.getFullYear();

  const monthDifference = today.getMonth() - birthday.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthday.getDate())
  ) {
    calculatedAge--;
  }

  return calculatedAge;
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
    .getPublicUrl(storagePath).data.publicUrl;
}

/* รูปบนการ์ด: มี fallback เมื่อโหลดไม่ได้ เหมือนหน้า Swipe */
function CandidateImage({ uri }: { uri: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <View style={styles.noPhoto}>
        <Ionicons name="image-outline" size={64} color="#999999" />

        <Text style={styles.noPhotoText}>Unable to load photo</Text>
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
    <View style={[styles.infoRow, last && styles.infoRowLast]}>
      <Ionicons name={icon} size={16} color="#222222" />

      <Text style={styles.infoText} numberOfLines={2}>
        {text}
      </Text>
    </View>
  );
}

// fullScreenModal screens need their own SafeAreaProvider,
// otherwise the top inset can come back as 0 and the header
// overlaps the status bar.
export default function PreviewProfileScreen() {
  return (
    <SafeAreaProvider>
      <PreviewProfileContent />
    </SafeAreaProvider>
  );
}

function PreviewProfileContent() {
  const router = useRouter();
  const { width: screenWidth, height: screenHeight } =
    useWindowDimensions();

  // ขนาดการ์ดเหมือนหน้า Swipe
  const horizontalPadding = Math.max(2, screenWidth * 0.07);
  const cardWidth = screenWidth - horizontalPadding * 2;

  // สูตรเดียวกับหน้า Swipe แต่จำกัดไม่ให้เกินพื้นที่ว่างของหน้านี้
  const [areaHeight, setAreaHeight] = useState(0);
  const cardHeight = Math.min(
    screenHeight * 0.8,
    cardWidth * 1.8,
    areaHeight > 0 ? areaHeight - 32 : Number.MAX_SAFE_INTEGER
  );

  const bioIconSize = Math.max(26, Math.min(cardWidth * 0.07, 32));
  const detailPadding = Math.max(14, Math.min(screenWidth * 0.045, 26));

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState('');
  const [age, setAge] = useState<number | null>(null);
  const [bio, setBio] = useState<string | null>(null);
  const [heightCm, setHeightCm] = useState<number | null>(null);
  const [genderIdentity, setGenderIdentity] = useState<string | null>(null);
  const [generation, setGeneration] = useState<number | null>(null);
  const [faculty, setFaculty] = useState<string | null>(null);
  const [department, setDepartment] = useState<string | null>(null);
  const [photos, setPhotos] = useState<PreviewPhoto[]>([]);
  const [locations, setLocations] = useState<NamedItem[]>([]);
  const [interests, setInterests] = useState<NamedItem[]>([]);

  const [photoIndex, setPhotoIndex] = useState(0);
  const [showDetail, setShowDetail] = useState(false);

  const loadPreview = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

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

      const [
        profileResult,
        privateResult,
        photoResult,
        studentResult,
        interestRowsResult,
        locationRowsResult,
      ] = await Promise.all([
        supabase
          .from('profiles')
          .select(
            'display_name, bio, height_cm, tu_generation, gender_identity'
          )
          .eq('id', user.id)
          .maybeSingle(),

        supabase
          .from('user_private')
          .select('birth_date')
          .eq('user_id', user.id)
          .maybeSingle(),

        supabase
          .from('profile_photos')
          .select('id, storage_path, position')
          .eq('user_id', user.id)
          .order('position', { ascending: true }),

        supabase
          .from('student_accounts')
          .select('faculty, department')
          .eq('user_id', user.id)
          .eq('is_current_student', true)
          .maybeSingle(),

        supabase
          .from('user_interests')
          .select('interest_id')
          .eq('user_id', user.id),

        supabase
          .from('user_locations')
          .select('location_id')
          .eq('user_id', user.id),
      ]);

      if (profileResult.error) throw profileResult.error;
      if (privateResult.error) throw privateResult.error;
      if (photoResult.error) throw photoResult.error;
      if (studentResult.error) throw studentResult.error;
      if (interestRowsResult.error) throw interestRowsResult.error;
      if (locationRowsResult.error) throw locationRowsResult.error;

      const profile = profileResult.data;
      const privateData = privateResult.data;
      const student = studentResult.data;

      setDisplayName(profile?.display_name ?? 'User');
      setBio(profile?.bio ?? null);
      setHeightCm(
        typeof profile?.height_cm === 'number' && profile.height_cm > 0
          ? profile.height_cm
          : null
      );
      setGenderIdentity(profile?.gender_identity ?? null);
      setGeneration(profile?.tu_generation ?? null);

      setAge(
        privateData?.birth_date
          ? calculateAge(privateData.birth_date)
          : null
      );

      setFaculty(student?.faculty ?? null);
      setDepartment(student?.department ?? null);

      setPhotos(photoResult.data ?? []);
      setPhotoIndex(0);

      const interestIds = (interestRowsResult.data ?? [])
        .map((row) => row.interest_id)
        .filter((id): id is number => id !== null);

      const locationIds = (locationRowsResult.data ?? [])
        .map((row) => row.location_id)
        .filter((id): id is number => id !== null);

      const [interestData, locationData] = await Promise.all([
        interestIds.length > 0
          ? supabase
              .from('interests')
              .select('id, name')
              .in('id', interestIds)
              .eq('is_active', true)
          : Promise.resolve({ data: [], error: null }),

        locationIds.length > 0
          ? supabase
              .from('campus_locations')
              .select('id, name')
              .in('id', locationIds)
              .eq('is_active', true)
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (interestData.error) throw interestData.error;
      if (locationData.error) throw locationData.error;

      setInterests((interestData.data ?? []) as NamedItem[]);
      setLocations((locationData.data ?? []) as NamedItem[]);
    } catch (err) {
      console.error('Unable to load preview profile:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load your profile.'
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadPreview();
  }, [loadPreview]);

  const previousPhoto = () => {
    if (photos.length <= 1) {
      return;
    }

    setPhotoIndex((previous) =>
      previous > 0 ? previous - 1 : photos.length - 1
    );
  };

  const nextPhoto = () => {
    if (photos.length <= 1) {
      return;
    }

    setPhotoIndex((previous) =>
      previous < photos.length - 1 ? previous + 1 : 0
    );
  };

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/profile');
    }
  };

  const currentPhoto = photos[photoIndex];

  const detailLine = department
    ? `${department}${faculty ? `, ${faculty}` : ''}`
    : faculty ?? '';

  const genderLabel = genderIdentity ? getGenderLabel(genderIdentity) : '';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* ================= HEADER ================= */}

      <View
        style={[
          styles.header,
          { paddingHorizontal: horizontalPadding },
        ]}
      >
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
            <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>

        <View pointerEvents="none" style={styles.titleWrap}>
          <Text style={styles.title}>PREVIEW PROFILE</Text>
        </View>
      </View>

      {/* ================= CARD ================= */}

      <View
        style={styles.cardArea}
        onLayout={(event) =>
          setAreaHeight(event.nativeEvent.layout.height)
        }
      >
        {loading ? (
          <View style={styles.statusState}>
            <ActivityIndicator size="large" color="#FF8D88" />
          </View>
        ) : error ? (
          <View style={styles.statusState}>
            <Ionicons
              name="cloud-offline-outline"
              size={54}
              color="#555555"
            />

            <Text style={styles.emptyTitle}>Something went wrong</Text>
            <Text style={styles.emptyText}>{error}</Text>

            <TouchableOpacity
              style={styles.retryShadow}
              onPress={loadPreview}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={THEME_GRADIENT}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.retryButton}
              >
                <Text style={styles.retryText}>Try again</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View
            style={[
              styles.card,
              { width: cardWidth, height: cardHeight },
            ]}
          >
            {/* PROFILE PHOTO */}

            {currentPhoto?.storage_path ? (
              <CandidateImage
                uri={getProfilePhotoUrl(currentPhoto.storage_path)}
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

            {/* PHOTO DASHES */}

            {photos.length > 1 ? (
              <View pointerEvents="none" style={styles.photoDashes}>
                {photos.map((photo, index) => (
                  <View
                    key={photo.id}
                    style={[
                      styles.photoDash,
                      index === photoIndex && styles.photoDashActive,
                    ]}
                  />
                ))}
              </View>
            ) : null}

            {/* TAP ZONES */}

            <TouchableOpacity
              style={[
                styles.openProfileZone,
                photos.length > 1
                  ? styles.openProfileZoneWithPhotoNav
                  : styles.openProfileZoneFull,
              ]}
              onPress={() => setShowDetail(true)}
              activeOpacity={1}
            />

            {photos.length > 1 ? (
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

            {/* DARK GRADIENT */}

            <LinearGradient
              pointerEvents="none"
              colors={[
                'transparent',
                'rgba(0,0,0,0.02)',
                'rgba(0,0,0,0.75)',
              ]}
              locations={[0, 0.56, 1]}
              style={styles.profileGradient}
            />

            {/* PROFILE INFO */}

            <View
              pointerEvents="box-none"
              style={styles.profileInfo}
            >
              <View style={styles.nameRow}>
                <Text style={styles.nameText} numberOfLines={1}>
                  {displayName}
                  {age !== null ? ` ${age}` : ''}
                </Text>

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
                  onPress={() => setShowDetail(true)}
                >
                  <Ionicons
                    name="arrow-up-circle-outline"
                    size={bioIconSize}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              </View>

              {detailLine ? (
                <Text style={styles.detailText} numberOfLines={1}>
                  {detailLine}
                </Text>
              ) : null}
            </View>
          </View>
        )}
      </View>

      {/* ================= PROFILE DETAIL (ไม่มีปุ่ม like / pass) ================= */}

      <Modal
        visible={showDetail}
        animationType="slide"
        onRequestClose={() => setShowDetail(false)}
      >
        <SafeAreaProvider>
          <SafeAreaView style={styles.detailSafe} edges={['top', 'bottom']}>
            <ScrollView
              contentContainerStyle={[
                styles.detailContent,
                { paddingHorizontal: detailPadding },
              ]}
              showsVerticalScrollIndicator={false}
            >
              {/* PHOTO */}

              <View style={styles.detailPhotoCard}>
                {currentPhoto?.storage_path ? (
                  <CandidateImage
                    uri={getProfilePhotoUrl(currentPhoto.storage_path)}
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

                <TouchableOpacity
                  style={styles.detailBackButton}
                  onPress={() => setShowDetail(false)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="chevron-down"
                    size={24}
                    color="#333333"
                  />
                </TouchableOpacity>

                {photos.length > 0 ? (
                  <View style={styles.detailPhotoCounter}>
                    <Text style={styles.detailPhotoCounterText}>
                      {photoIndex + 1}/{photos.length}
                    </Text>
                  </View>
                ) : null}

                {photos.length > 1 ? (
                  <>
                    <TouchableOpacity
                      style={styles.detailLeftZone}
                      onPress={previousPhoto}
                      activeOpacity={1}
                    />

                    <TouchableOpacity
                      style={styles.detailRightZone}
                      onPress={nextPhoto}
                      activeOpacity={1}
                    />
                  </>
                ) : null}

                <LinearGradient
                  pointerEvents="none"
                  colors={[
                    'transparent',
                    'rgba(0,0,0,0.05)',
                    'rgba(0,0,0,0.75)',
                  ]}
                  locations={[0, 0.58, 1]}
                  style={styles.profileGradient}
                />

                <View style={styles.heroInfo} pointerEvents="none">
                  <Text style={styles.heroName}>
                    {displayName}
                    {age !== null ? ` ${age}` : ''}
                  </Text>

                  {detailLine ? (
                    <Text style={styles.heroDetail} numberOfLines={1}>
                      {detailLine}
                    </Text>
                  ) : null}
                </View>
              </View>

              {/* BIO */}

              {bio && bio.trim() ? (
                <LinearGradient
                  colors={INFO_GRADIENT}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.infoCard}
                >
                  <Text style={styles.cardTitle}>Bio</Text>
                  <Text style={styles.bioText}>{bio.trim()}</Text>
                </LinearGradient>
              ) : null}

              {/* ABOUT ME */}

              <LinearGradient
                colors={INFO_GRADIENT}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.infoCard}
              >
                <Text style={styles.cardTitle}>About me</Text>

                {heightCm !== null ? (
                  <InfoRow
                    icon="resize-outline"
                    text={`${heightCm} cm`}
                  />
                ) : null}

                {genderLabel ? (
                  <InfoRow
                    icon="male-female-outline"
                    text={genderLabel}
                  />
                ) : null}

                {detailLine ? (
                  <InfoRow
                    icon="school-outline"
                    text={detailLine}
                  />
                ) : null}

                {generation !== null ? (
                  <InfoRow
                    icon="calendar-outline"
                    text={`TU${generation}`}
                    last
                  />
                ) : null}
              </LinearGradient>

              {/* INTERESTS */}

              {interests.length > 0 ? (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Interests</Text>

                  <View style={styles.chipWrap}>
                    {interests.map((interest) => (
                      <View key={interest.id} style={styles.chip}>
                        <Text style={styles.chipText}>
                          {interest.name}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}

              {/* LOCATIONS */}

              {locations.length > 0 ? (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    You'll usually find me at..
                  </Text>

                  <View style={styles.chipWrap}>
                    {locations.map((location) => (
                      <View key={location.id} style={styles.chip}>
                        <Text style={styles.chipText}>
                          {location.name}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}
            </ScrollView>
          </SafeAreaView>
        </SafeAreaProvider>
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

  /* ================= HEADER (เหมือนหน้า Edit Profile) ================= */

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

  /* ================= CARD ================= */

  cardArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 14,
    paddingBottom: 18,
  },

  statusState: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
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
    ...softShadow,
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

  card: {
    position: 'relative',
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#EEEEEE',

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
    backgroundColor: '#E7E7E7',
  },

  noPhotoText: {
    marginTop: 8,
    fontSize: 13,
    color: '#777777',
  },

  /* ================= PHOTO DASHES ================= */

  photoDashes: {
    position: 'absolute',
    top: 18,
    left: 60,
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

  /* ================= TAP ZONES ================= */

  openProfileZone: {
    position: 'absolute',
    top: 0,
    bottom: BOTTOM_RESERVED,
    zIndex: 4,
  },

  openProfileZoneWithPhotoNav: {
    left: '18%',
    right: '18%',
  },

  openProfileZoneFull: {
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

  /* ================= PROFILE INFO ================= */

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
    right: 18,
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
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
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
    fontSize: 12,
    marginTop: 2,
    opacity: 0.95,
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  /* ================= PROFILE DETAIL ================= */

  detailSafe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  detailContent: {
    paddingTop: 40,
    paddingBottom: 34,
  },

  detailPhotoCard: {
    width: '100%',
    aspectRatio: 0.68,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 22,
    backgroundColor: '#E9E9E9',

    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.14,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  detailBackButton: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 38,
    height: 38,
    zIndex: 20,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
  },

  detailPhotoCounter: {
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

  detailPhotoCounterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111111',
  },

  detailLeftZone: {
    position: 'absolute',
    top: 55,
    bottom: 90,
    left: 0,
    width: '22%',
    zIndex: 10,
  },

  detailRightZone: {
    position: 'absolute',
    top: 55,
    bottom: 90,
    right: 0,
    width: '22%',
    zIndex: 10,
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
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  heroDetail: {
    marginTop: 2,
    fontSize: 11,
    color: '#FFFFFF',
    opacity: 0.96,
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  infoCard: {
    marginTop: 13,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 14,

    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },

  cardTitle: {
    marginBottom: 8,
    fontSize: 15,
    fontWeight: '700',
    color: '#171717',
  },

  bioText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#222222',
  },

  infoRow: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.72)',
  },

  infoRowLast: {
    borderBottomWidth: 0,
  },

  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#222222',
  },

  section: {
    marginTop: 16,
    paddingHorizontal: 4,
  },

  sectionTitle: {
    marginBottom: 8,
    fontSize: 14,
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
    fontSize: 14,
    color: '#555555',
  },
});

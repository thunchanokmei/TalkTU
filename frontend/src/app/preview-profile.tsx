import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { supabase } from '../lib/supabase';

const TITLE_PINK = '#F08A8E';

/* พื้นที่ด้านล่างการ์ดที่เว้นไว้ไม่ให้โซนแตะทับชื่อ/ปุ่ม */
const BOTTOM_RESERVED = 90;

type PreviewPhoto = {
  id: string;
  storage_path: string;
  position: number;
};

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

export default function PreviewProfileScreen() {
  const router = useRouter();
  const { width: screenWidth, height: screenHeight } =
    useWindowDimensions();

  // ขนาดการ์ดเหมือนหน้า Swipe
  const horizontalPadding = Math.max(2, screenWidth * 0.07);
  const cardWidth = screenWidth - horizontalPadding * 2;
  const cardHeight = Math.min(screenHeight * 0.78, cardWidth * 1.8);

  const shortSide = Math.min(screenWidth, screenHeight);
  const bioIconSize = Math.max(26, Math.min(cardWidth * 0.07, 32));
  const closeButtonSize = Math.max(42, Math.min(shortSide * 0.11, 54));

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState('');
  const [age, setAge] = useState<number | null>(null);
  const [bio, setBio] = useState<string | null>(null);
  const [heightCm, setHeightCm] = useState<number | null>(null);
  const [faculty, setFaculty] = useState<string | null>(null);
  const [department, setDepartment] = useState<string | null>(null);
  const [photos, setPhotos] = useState<PreviewPhoto[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);

  const [photoIndex, setPhotoIndex] = useState(0);
  const [showBio, setShowBio] = useState(false);

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
        { data: profile, error: profileError },
        { data: privateData, error: privateError },
        { data: photoRows, error: photoError },
        { data: locationRows, error: locationError },
      ] = await Promise.all([
        supabase
          .from('profiles')
          .select('display_name, bio, height_cm')
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
          .from('user_locations')
          .select('location_id')
          .eq('user_id', user.id),
      ]);

      if (profileError) throw profileError;
      if (privateError) throw privateError;
      if (photoError) throw photoError;
      if (locationError) throw locationError;

      setDisplayName(profile?.display_name ?? 'User');
      setBio(profile?.bio ?? null);
      setHeightCm(
        typeof profile?.height_cm === 'number' && profile.height_cm > 0
          ? profile.height_cm
          : null
      );

      setAge(
        privateData?.birth_date
          ? calculateAge(privateData.birth_date)
          : null
      );

      setPhotos(photoRows ?? []);
      setPhotoIndex(0);

      // ชื่อสถานที่ในมหาลัย
      const locationIds = (locationRows ?? []).map(
        (row) => row.location_id
      );

      if (locationIds.length > 0) {
        const { data: campusRows } = await supabase
          .from('campus_locations')
          .select('id, name')
          .in('id', locationIds);

        setLocations((campusRows ?? []).map((row) => row.name));
      } else {
        setLocations([]);
      }

      // คณะ/สาขา (ตาราง student_accounts เหมือนที่ทีมใช้)
      const { data: student, error: studentError } = await supabase
        .from('student_accounts')
        .select('faculty, department')
        .eq('user_id', user.id)
        .eq('is_current_student', true)
        .maybeSingle();

      if (studentError) throw studentError;

      setFaculty(student?.faculty ?? null);
      setDepartment(student?.department ?? null);

      // ความสนใจ
      const { data: interestRows, error: interestRowsError } =
        await supabase
          .from('user_interests')
          .select('interest_id')
          .eq('user_id', user.id);

      if (interestRowsError) throw interestRowsError;

      const interestIds = (interestRows ?? [])
        .map((row) => row.interest_id)
        .filter((id): id is number => id !== null);

      if (interestIds.length > 0) {
        const { data: interestData, error: interestError } =
          await supabase
            .from('interests')
            .select('id, name')
            .in('id', interestIds)
            .eq('is_active', true);

        if (interestError) throw interestError;

        setInterests((interestData ?? []).map((row) => row.name));
      } else {
        setInterests([]);
      }
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
    if (photos.length === 0) {
      return;
    }

    setPhotoIndex((previous) =>
      previous > 0 ? previous - 1 : photos.length - 1
    );
  };

  const nextPhoto = () => {
    if (photos.length === 0) {
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

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* ================= HEADER ================= */}

      <View
        style={[
          styles.header,
          { paddingHorizontal: horizontalPadding },
        ]}
      >
        <View style={{ width: closeButtonSize }} />

        <Text style={styles.title}>PREVIEW PROFILE</Text>

        <TouchableOpacity
          style={[
            styles.closeButton,
            {
              width: closeButtonSize,
              height: closeButtonSize,
              borderRadius: closeButtonSize / 2,
            },
          ]}
          onPress={goBack}
          activeOpacity={0.8}
        >
          <Ionicons name="close" size={26} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* ================= CARD ================= */}

      <View style={styles.cardArea}>
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
              style={styles.retryButton}
              onPress={loadPreview}
              activeOpacity={0.85}
            >
              <Text style={styles.retryText}>Try again</Text>
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
              <ExpoImage
                source={{
                  uri: getProfilePhotoUrl(currentPhoto.storage_path),
                }}
                style={styles.photo}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={0}
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
                styles.openBioZone,
                photos.length > 1
                  ? styles.openBioZoneWithPhotoNav
                  : styles.openBioZoneFull,
              ]}
              onPress={() => setShowBio(true)}
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
                  onPress={() => setShowBio(true)}
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

      {/* ================= BIO SHEET ================= */}

      <Modal
        visible={showBio}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBio(false)}
      >
        <Pressable
          style={styles.sheetOverlay}
          onPress={() => setShowBio(false)}
        >
          <Pressable
            style={styles.sheet}
            onPress={(event) => event.stopPropagation()}
          >
            <View style={styles.sheetHandle} />

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.sheetContent}
            >
              <Text style={styles.sheetName}>
                {displayName}
                {age !== null ? ` ${age}` : ''}
              </Text>

              {detailLine ? (
                <Text style={styles.sheetDetail}>{detailLine}</Text>
              ) : null}

              <Text style={styles.sheetSection}>Bio</Text>

              <Text style={styles.sheetBody}>
                {bio && bio.trim().length > 0
                  ? bio
                  : 'No bio yet.'}
              </Text>

              {heightCm !== null ? (
                <>
                  <Text style={styles.sheetSection}>Height</Text>
                  <Text style={styles.sheetBody}>{heightCm} cm</Text>
                </>
              ) : null}

              {interests.length > 0 ? (
                <>
                  <Text style={styles.sheetSection}>Interests</Text>

                  <View style={styles.chipRow}>
                    {interests.map((name) => (
                      <View key={name} style={styles.chip}>
                        <Text style={styles.chipText}>{name}</Text>
                      </View>
                    ))}
                  </View>
                </>
              ) : null}

              {locations.length > 0 ? (
                <>
                  <Text style={styles.sheetSection}>
                    Campus locations
                  </Text>

                  <View style={styles.chipRow}>
                    {locations.map((name) => (
                      <View key={name} style={styles.chip}>
                        <Text style={styles.chipText}>{name}</Text>
                      </View>
                    ))}
                  </View>
                </>
              ) : null}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  /* ================= HEADER ================= */

  header: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: TITLE_PINK,
  },

  closeButton: {
    backgroundColor: '#F4B0B0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ================= CARD ================= */

  cardArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 4,
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

  retryButton: {
    marginTop: 18,
    borderRadius: 999,
    backgroundColor: '#FFAF79',
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

  openBioZone: {
    position: 'absolute',
    top: 0,
    bottom: BOTTOM_RESERVED,
    zIndex: 4,
  },

  openBioZoneWithPhotoNav: {
    left: '18%',
    right: '18%',
  },

  openBioZoneFull: {
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

  /* ================= BIO SHEET ================= */

  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },

  sheet: {
    maxHeight: '75%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 10,
  },

  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#DDDDDD',
    marginBottom: 8,
  },

  sheetContent: {
    paddingHorizontal: 22,
    paddingBottom: 32,
  },

  sheetName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111111',
  },

  sheetDetail: {
    marginTop: 2,
    fontSize: 13,
    color: '#777777',
  },

  sheetSection: {
    marginTop: 20,
    marginBottom: 6,
    fontSize: 15,
    fontWeight: '700',
    color: TITLE_PINK,
  },

  sheetBody: {
    fontSize: 15,
    lineHeight: 22,
    color: '#222222',
  },

  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  chip: {
    borderRadius: 18,
    backgroundColor: '#FFF0E8',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },

  chipText: {
    fontSize: 13,
    color: '#222222',
  },
});

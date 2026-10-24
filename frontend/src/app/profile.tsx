
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import BottomNavigation from '../components/navigation/BottomNavigation';
import { supabase } from '../lib/supabase';
import {
  GENDER_IDENTITY_MAP,
  GENDER_IDENTITY_OPTIONS,
} from '../constants/genderIdentity';

type Photo = {
  id: string;
  storage_path: string;
  position: number;
};

type Interest = {
  id: number;
  name: string;
};

type CampusLocation = {
  id: number;
  name: string;
};

type GenderIdentity =
  (typeof GENDER_IDENTITY_MAP)[keyof typeof GENDER_IDENTITY_MAP];

const gradientColors = ['#FF9586', '#FFB77F', '#FFD3A2'] as const;

function calculateAge(birthDate: string) {
  const today = new Date();
  const birthday = new Date(birthDate);

  let age = today.getFullYear() - birthday.getFullYear();

  if (
    today.getMonth() < birthday.getMonth() ||
    (today.getMonth() === birthday.getMonth() &&
      today.getDate() < birthday.getDate())
  ) {
    age--;
  }

  return age;
}

function getGenderLabel(value: GenderIdentity) {
  return (
    GENDER_IDENTITY_OPTIONS.find(
      (option) => GENDER_IDENTITY_MAP[option] === value
    ) ?? ''
  );
}

function ProfilePhoto({ storagePath }: { storagePath: string }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadImage() {
      try {
        if (
          storagePath.startsWith('http://') ||
          storagePath.startsWith('https://')
        ) {
          if (!cancelled) setImageUrl(storagePath);
          return;
        }

        const { data, error } = await supabase.storage
          .from('profile-photos')
          .createSignedUrl(storagePath, 60 * 60);

        if (error) throw error;

        if (!cancelled) setImageUrl(data.signedUrl);
      } catch (error) {
        console.error('Profile photo error:', error);
        if (!cancelled) setFailed(true);
      }
    }

    loadImage();

    return () => {
      cancelled = true;
    };
  }, [storagePath]);

  if (failed) {
    return (
      <View style={styles.noPhoto}>
        <Ionicons name="image-outline" size={64} color="#999999" />
        <Text style={styles.noPhotoText}>Photo unavailable</Text>
      </View>
    );
  }

  if (!imageUrl) {
    return (
      <View style={styles.noPhoto}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Image
      source={{ uri: imageUrl }}
      style={styles.photo}
      resizeMode="cover"
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
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();

  const [displayName, setDisplayName] = useState('User');
  const [age, setAge] = useState<number | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [bio, setBio] = useState('');
  const [height, setHeight] = useState<number | null>(null);
  const [gender, setGender] = useState<GenderIdentity | null>(null);
  const [generation, setGeneration] = useState<number | null>(null);
  const [faculty, setFaculty] = useState('');
  const [department, setDepartment] = useState('');
  const [interests, setInterests] = useState<Interest[]>([]);
  const [locations, setLocations] = useState<CampusLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        router.replace('/(auth)/login');
        return;
      }

      const [
        profileResult,
        privateResult,
        photosResult,
        studentResult,
        interestsResult,
        locationsResult,
      ] = await Promise.all([
        supabase
          .from('profiles')
          .select('display_name, bio, height_cm, tu_generation, gender_identity')
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
      if (photosResult.error) throw photosResult.error;
      if (studentResult.error) throw studentResult.error;
      if (interestsResult.error) throw interestsResult.error;
      if (locationsResult.error) throw locationsResult.error;

      const profile = profileResult.data;
      const privateData = privateResult.data;
      const student = studentResult.data;

      setDisplayName(profile?.display_name ?? 'User');
      setAge(
        privateData?.birth_date
          ? calculateAge(privateData.birth_date)
          : null
      );
      setBio(profile?.bio ?? '');
      setHeight(profile?.height_cm ?? null);
      setGender(
        (profile?.gender_identity as GenderIdentity | null) ?? null
      );
      setGeneration(profile?.tu_generation ?? null);
      setFaculty(student?.faculty ?? '');
      setDepartment(student?.department ?? '');

      const orderedPhotos = photosResult.data ?? [];
      setPhotos(orderedPhotos);
      setPhotoIndex(0);

      const interestIds = (interestsResult.data ?? [])
        .map((item) => item.interest_id)
        .filter((id): id is number => id !== null);

      const locationIds = (locationsResult.data ?? [])
        .map((item) => item.location_id)
        .filter((id): id is number => id !== null);

      const [interestData, locationData] = await Promise.all([
        interestIds.length
          ? supabase
              .from('interests')
              .select('id, name')
              .in('id', interestIds)
              .eq('is_active', true)
          : Promise.resolve({ data: [], error: null }),

        locationIds.length
          ? supabase
              .from('campus_locations')
              .select('id, name')
              .in('id', locationIds)
              .eq('is_active', true)
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (interestData.error) throw interestData.error;
      if (locationData.error) throw locationData.error;

      setInterests((interestData.data ?? []) as Interest[]);
      setLocations((locationData.data ?? []) as CampusLocation[]);
    } catch (error) {
      console.error('Unable to load profile:', error);
      setErrorMessage('Unable to load your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const previousPhoto = () => {
    if (photos.length <= 1) return;
    setPhotoIndex((current) =>
      current > 0 ? current - 1 : photos.length - 1
    );
  };

  const nextPhoto = () => {
    if (photos.length <= 1) return;
    setPhotoIndex((current) =>
      current < photos.length - 1 ? current + 1 : 0
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  const currentPhoto = photos[photoIndex];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Profile</Text>

        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => router.push('/account-settings')}
          accessibilityRole="button"
          accessibilityLabel="Account Settings"
        >
          <Text style={styles.settingsButtonText}>⚙</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* PHOTOS */}
        <View style={styles.photoCard}>
          {currentPhoto?.storage_path ? (
            <ProfilePhoto storagePath={currentPhoto.storage_path} />
          ) : (
            <View style={styles.noPhoto}>
              <Ionicons name="person-outline" size={76} color="#AAAAAA" />
              <Text style={styles.noPhotoText}>No photos yet</Text>
            </View>
          )}

          {photos.length > 0 && (
            <View style={styles.photoCounter}>
              <Text style={styles.photoCounterText}>
                {photoIndex + 1}/{photos.length}
              </Text>
            </View>
          )}

          {photos.length > 1 && (
            <>
              <TouchableOpacity
                style={styles.photoLeftZone}
                onPress={previousPhoto}
                accessibilityRole="button"
                accessibilityLabel="Previous photo"
              />
              <TouchableOpacity
                style={styles.photoRightZone}
                onPress={nextPhoto}
                accessibilityRole="button"
                accessibilityLabel="Next photo"
              />
            </>
          )}

          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.62)']}
            style={styles.photoGradient}
            pointerEvents="none"
          />

          <TouchableOpacity
            style={styles.editIconButton}
            onPress={() => router.push('/edit-profile')}
            accessibilityRole="button"
            accessibilityLabel="Edit Profile"
          >
            <Ionicons name="pencil" size={21} color="#FF8D88" />
          </TouchableOpacity>
          <View style={styles.heroInfo} pointerEvents="none">
            <Text style={styles.heroName}>
              {displayName}{age !== null ? `, ${age}` : ''}
            </Text>
            {(department || faculty) ? (
              <Text style={styles.heroDetail}>
                {[department, faculty].filter(Boolean).join(', ')}
              </Text>
            ) : null}
          </View>
        </View>


        {/* BIO */}
        {bio.trim() ? (
          <LinearGradient
            colors={[...gradientColors]}
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
          colors={[...gradientColors]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.infoCard}
        >
          <Text style={styles.cardTitle}>About me</Text>

          {height ? (
            <InfoRow icon="resize-outline" text={`${height} cm`} />
          ) : null}

          {gender ? (
            <InfoRow icon="male-female-outline" text={getGenderLabel(gender)} />
          ) : null}

          {(department || faculty) ? (
            <InfoRow
              icon="school-outline"
              text={[department, faculty].filter(Boolean).join(', ')}
            />
          ) : null}

          {generation !== null ? (
            <InfoRow
              icon="calendar-outline"
              text={`TU${generation}`}
              last
            />
          ) : null}

          {!height && !gender && !faculty && !department && generation === null ? (
            <Text style={styles.emptyText}>No additional information yet.</Text>
          ) : null}
        </LinearGradient>

        {/* INTERESTS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interests</Text>
          {interests.length ? (
            <View style={styles.chipWrap}>
              {interests.map((interest) => (
                <View key={interest.id} style={styles.chip}>
                  <Text style={styles.chipText}>{interest.name}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No interests added yet.</Text>
          )}
        </View>

        {/* CAMPUS LOCATIONS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            You'll usually find me at..
          </Text>
          {locations.length ? (
            <View style={styles.chipWrap}>
              {locations.map((location) => (
                <View key={location.id} style={styles.chip}>
                  <Text style={styles.chipText}>{location.name}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No campus locations added yet.</Text>
          )}
        </View>

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}
      </ScrollView>

      <BottomNavigation activeTab="profile" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRow: {
    minHeight: 56,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 16,
  },
  settingsButton: {
    position: 'absolute',
    right: 24,
    top: 8,
    padding: 8,
  },
  settingsButtonText: {
    fontSize: 24,
    color: '#222222',
  },
  scrollContent: {
    paddingHorizontal: 14,
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
    shadowOffset: { width: 0, height: 3 },
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
  editIconButton: {
    position: 'absolute',
    right: 14,
    bottom: 14,
    zIndex: 30,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    elevation: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
  },
  infoCard: {
    marginTop: 13,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.72)',
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
  emptyText: {
    fontSize: 12,
    color: '#666666',
  },
  errorText: {
    marginTop: 15,
    paddingHorizontal: 5,
    textAlign: 'center',
    fontSize: 12,
    color: '#C62828',
  },
});
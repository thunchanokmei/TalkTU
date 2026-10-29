import { useCallback, useRef, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { supabase } from '../../lib/supabase';
import AppHeader from '../../components/AppHeader';
import {
  GENDER_IDENTITY_MAP,
  GENDER_IDENTITY_OPTIONS,
} from '../../constants/genderIdentity';

type GenderIdentity =
  (typeof GENDER_IDENTITY_MAP)[keyof typeof GENDER_IDENTITY_MAP];

const BUTTON_GRADIENT = ['#F2878C', '#F6A67E', '#FAD27C'] as const;
const PREVIEW_PINK = '#F08A8E';
const GEAR_YELLOW = '#FFD27A';

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

function getGenderIcon(
  value: GenderIdentity
): keyof typeof Ionicons.glyphMap {
  const label = getGenderLabel(value).toLowerCase();

  if (label.includes('woman') || label.includes('female')) {
    return 'female-outline';
  }

  if (label.includes('man') || label.includes('male')) {
    return 'male-outline';
  }

  return 'male-female-outline';
}

export default function ProfileScreen() {
  const router = useRouter();
  const hasLoadedRef = useRef(false);

  const [displayName, setDisplayName] = useState('User');
  const [age, setAge] = useState<number | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [gender, setGender] = useState<GenderIdentity | null>(null);
  const [generation, setGeneration] = useState<number | null>(null);
  const [faculty, setFaculty] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadProfile = useCallback(async () => {
    try {
      // โหลดครั้งแรกค่อยโชว์ spinner (กลับมาจากหน้า edit จะรีเฟรชเงียบ ๆ)
      if (!hasLoadedRef.current) {
        setLoading(true);
      }

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
        photoResult,
        studentResult,
      ] = await Promise.all([
        supabase
          .from('profiles')
          .select('display_name, tu_generation, gender_identity')
          .eq('id', user.id)
          .maybeSingle(),

        supabase
          .from('user_private')
          .select('birth_date')
          .eq('user_id', user.id)
          .maybeSingle(),

        supabase
          .from('profile_photos')
          .select('storage_path')
          .eq('user_id', user.id)
          .order('position', { ascending: true })
          .limit(1)
          .maybeSingle(),

        supabase
          .from('student_accounts')
          .select('faculty, department')
          .eq('user_id', user.id)
          .eq('is_current_student', true)
          .maybeSingle(),
      ]);

      if (profileResult.error) throw profileResult.error;
      if (privateResult.error) throw privateResult.error;
      if (photoResult.error) throw photoResult.error;
      if (studentResult.error) throw studentResult.error;

      const profile = profileResult.data;
      const privateData = privateResult.data;
      const student = studentResult.data;

      setDisplayName(profile?.display_name ?? 'User');

      setAge(
        privateData?.birth_date
          ? calculateAge(privateData.birth_date)
          : null
      );

      setGender(
        (profile?.gender_identity as GenderIdentity | null) ?? null
      );
      setGeneration(profile?.tu_generation ?? null);
      setFaculty(student?.faculty ?? '');
      setDepartment(student?.department ?? '');

      if (photoResult.data?.storage_path) {
        const { data } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(photoResult.data.storage_path);

        setPhotoUrl(data.publicUrl);
      } else {
        setPhotoUrl(null);
      }

      hasLoadedRef.current = true;
    } catch (error) {
      console.error('Unable to load profile:', error);
      setErrorMessage('Unable to load your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  // รีเฟรชทุกครั้งที่กลับมาหน้านี้ (เช่นหลังแก้โปรไฟล์)
  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  const detailLine = [department, faculty].filter(Boolean).join(', ');

  return (
    // edges ว่าง: AppHeader เว้นพื้นที่ใต้ status bar ให้เองแล้ว
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= HEADER ================= */}

        <AppHeader
          logo={require('../../../assets/images/profile.jpeg')}
          right={
            <TouchableOpacity
              onPress={() => router.push('/account-settings')}
              accessibilityRole="button"
              accessibilityLabel="Account Settings"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.7}
            >
              <Ionicons
                name="settings-sharp"
                size={34}
                color={GEAR_YELLOW}
              />
            </TouchableOpacity>
          }
        />

        {/* ================= PROFILE CARD ================= */}

        <View style={styles.card}>
          <View style={styles.photoWrap}>
            {photoUrl ? (
              <Image source={{ uri: photoUrl }} style={styles.photo} />
            ) : (
              <View style={styles.noPhoto}>
                <Ionicons
                  name="person-outline"
                  size={80}
                  color="#AAAAAA"
                />
              </View>
            )}

            <TouchableOpacity
              style={styles.previewPill}
              onPress={() => router.push('/preview-profile')}
              activeOpacity={0.85}
            >
              <Text style={styles.previewText}>PREVIEW PROFILE</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.name} numberOfLines={1}>
            {displayName}
            {age !== null ? `  ${age}` : ''}
          </Text>

          {detailLine ? (
            <Text style={styles.detail} numberOfLines={1}>
              {detailLine}
            </Text>
          ) : null}

          {/* TU / gender (wraps onto a new line on narrow screens) */}

          {generation !== null || gender ? (
            <View style={styles.infoGroup}>
              {generation !== null ? (
                <View style={styles.infoItem}>
                  <Ionicons
                    name="school"
                    size={24}
                    color="#111111"
                  />
                  <Text style={styles.infoText}>TU{generation}</Text>
                </View>
              ) : null}

              {gender ? (
                <View style={styles.infoItem}>
                  <Ionicons
                    name={getGenderIcon(gender)}
                    size={22}
                    color="#111111"
                  />
                  <Text style={styles.infoText}>
                    {getGenderLabel(gender)}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}

          {/* EDIT BUTTON (below the info, full width) */}

          <TouchableOpacity
            style={styles.editShadow}
            onPress={() => router.push('/edit-profile')}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={BUTTON_GRADIENT}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.editButton}
            >
              <Text style={styles.editText}>EDIT PROFILE</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const softShadow = Platform.select({
  ios: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
  },
  android: {
    elevation: 6,
  },
});

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

  scrollContent: {
    paddingBottom: 32,
  },

  /* ================= PROFILE CARD ================= */

  card: {
    marginHorizontal: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 36,
    padding: 16,
    paddingBottom: 22,
    ...softShadow,
  },

  photoWrap: {
    width: '100%',
    aspectRatio: 0.84,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#E9E9E9',
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

  previewPill: {
    position: 'absolute',
    top: 14,
    right: 14,
    height: 32,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  previewText: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.3,
    color: PREVIEW_PINK,
  },

  name: {
    marginTop: 14,
    marginHorizontal: 6,
    fontSize: 28,
    fontWeight: '800',
    color: '#111111',
  },

  detail: {
    marginTop: 2,
    marginHorizontal: 6,
    fontSize: 13,
    color: '#111111',
  },

  infoGroup: {
    marginTop: 14,
    marginHorizontal: 6,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: 16,
    rowGap: 8,
  },

  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  infoText: {
    fontSize: 16,
    color: '#111111',
  },

  editShadow: {
    marginTop: 18,
    marginHorizontal: 6,
    borderRadius: 24,
    backgroundColor: '#F6A67E',
    ...softShadow,
  },

  editButton: {
    height: 46,
    paddingHorizontal: 22,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  editText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
    color: '#FFFFFF',
  },

  errorText: {
    marginTop: 16,
    paddingHorizontal: 28,
    textAlign: 'center',
    fontSize: 12,
    color: '#C62828',
  },
});

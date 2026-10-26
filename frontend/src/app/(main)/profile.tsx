import { useCallback, useRef, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';

import { supabase } from '../../lib/supabase';

/* ไล่สีการ์ดโปรไฟล์ตาม mockup (ชมพูส้ม → พีช → ครีม) */
const CARD_GRADIENT = ['#F08A8E', '#F4AA82', '#FAE6CB'] as const;

const CONTACTS = [
  { label: 'Instagram', value: 'talktu.team' },
  { label: 'LINE', value: '@927qejxh' },
  { label: 'Gmail', value: 'talktu.team@gmail.com' },
];

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

export default function ProfileScreen() {
  const router = useRouter();
  const deletingAccountRef = useRef(false);
  const hasLoadedRef = useRef(false);

  const [copiedValue, setCopiedValue] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState('');
  const [age, setAge] = useState<number | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const handleCopy = async (value: string) => {
    try {
      await Clipboard.setStringAsync(value);
      setCopiedValue(value);
    } catch (error) {
      console.error('Unable to copy contact:', error);
    }
  };

  const loadProfile = useCallback(async () => {
    try {
      // โหลดครั้งแรกค่อยโชว์ spinner (กลับมาจากหน้า edit จะรีเฟรชเงียบ ๆ)
      if (!hasLoadedRef.current) {
        setLoading(true);
      }

      // 1. ดูว่าใครกำลัง login อยู่
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

      // Load profile data in parallel
      const [
        { data: profile, error: profileError },
        { data: privateData, error: privateError },
        { data: photo, error: photoError },
      ] = await Promise.all([
        supabase
          .from('profiles')
          .select('display_name')
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
      ]);

      if (profileError) throw profileError;
      if (privateError) throw privateError;
      if (photoError) throw photoError;

      setDisplayName(profile?.display_name ?? 'User');

      setAge(
        privateData?.birth_date
          ? calculateAge(privateData.birth_date)
          : null
      );

      if (photo?.storage_path) {
        const { data } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(photo.storage_path);

        setProfilePhoto(data.publicUrl);
      } else {
        setProfilePhoto(null);
      }

      hasLoadedRef.current = true;
    } catch (error) {
      console.error('Unable to load profile:', error);
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

  const deleteAccount = async () => {
    if (deletingAccountRef.current) return;

    deletingAccountRef.current = true;

    let requestAccepted = false;

    try {
      const { data, error } = await supabase.functions.invoke(
        'delete-account',
        { body: {} },
      );

      if (error || data?.success !== true || data?.status !== 'pending') {
        throw error ?? new Error('Account deletion was not confirmed');
      }

      requestAccepted = true;
    } catch (error) {
      console.error('Unable to request account deletion:', error);

      const message = 'Unable to request account deletion. Please try again.';

      if (Platform.OS === 'web') {
        window.alert(message);
      } else {
        Alert.alert('Delete Account Failed', message);
      }

      return;
    } finally {
      if (!requestAccepted) {
        deletingAccountRef.current = false;
      }
    }

    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' });

      if (error) {
        console.error('Unable to clear local session:', error);
      }
    } catch (error) {
      console.error('Unable to clear local session:', error);
    }

    router.replace('/(auth)/login');

    const message =
      'Your account deletion request has been received. Your account will be deleted shortly.';

    if (Platform.OS === 'web') {
      window.alert(message);
    } else {
      Alert.alert('Deletion Requested', message);
    }
  };

  const handleDeleteAccount = () => {
    const title = 'Delete your account?';
    const message =
      'This will permanently delete your account and associated data. This action cannot be undone.';

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`${title}\n\n${message}`);

      if (confirmed) {
        void deleteAccount();
      }

      return;
    }

    Alert.alert(title, message, [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete Account',
        style: 'destructive',
        onPress: () => {
          void deleteAccount();
        },
      },
    ]);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Unable to log out:', error);
      return;
    }

    router.replace('/(auth)/login');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= HEADER ================= */}

        <View style={styles.headerCard}>
          <Image
            source={require('../../../assets/images/profile.png')}
            style={styles.headerImage}
            resizeMode="contain"
          />
        </View>

        {/* ================= PROFILE CARD ================= */}

        <View style={styles.profileCardShadow}>
          <LinearGradient
            colors={CARD_GRADIENT}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.profileCard}
          >
            <View style={styles.profileRow}>
              {profilePhoto ? (
                <Image
                  source={{ uri: profilePhoto }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder} />
              )}

              <View style={styles.profileText}>
                <Text style={styles.name} numberOfLines={1}>
                  {displayName}
                  {age !== null ? ` ${age}` : ''}
                </Text>

                <TouchableOpacity
                  onPress={() => router.push('/preview-profile')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.previewLink}>
                    Preview Profile
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.editButton}
              onPress={() => router.push('/edit-profile')}
              activeOpacity={0.85}
            >
              <Text style={styles.editButtonText}>
                Edit Profile
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* ================= CONTACT DEVELOPER ================= */}

        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>
            Contact Us
          </Text>

          <Text style={styles.contactSubtitle}>
            Questions, feedback, or support? Reach out to us!
          </Text>

          {CONTACTS.map((contact) => (
            <View key={contact.label} style={styles.contactRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.contactLabel}>
                  {contact.label}
                </Text>
                <Text style={styles.contactValue}>
                  {contact.value}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => handleCopy(contact.value)}
                style={styles.copyButton}
              >
                <Text
                  style={[
                    styles.copyText,
                    copiedValue === contact.value && {
                      color: '#16A34A',
                    },
                  ]}
                >
                  {copiedValue === contact.value ? '✓ Copied!' : 'Copy'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* ================= ACCOUNT ================= */}

        <View style={styles.accountSection}>
          <TouchableOpacity
            style={styles.accountButton}
            onPress={handleLogout}
            activeOpacity={0.85}
          >
            <Text style={styles.accountText}>Log out</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.accountButton}
            onPress={handleDeleteAccount}
            activeOpacity={0.85}
          >
            <Text style={styles.accountText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
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

  /* ================= HEADER ================= */

  headerCard: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginBottom: 22,
    ...softShadow,
  },

  headerImage: {
    width: 240,
    height: 80,
  },

  /* ================= PROFILE CARD ================= */

  profileCardShadow: {
    marginHorizontal: 22,
    borderRadius: 44,
    backgroundColor: '#F4AA82',
    ...softShadow,
  },

  profileCard: {
    borderRadius: 44,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 30,
  },

  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
  },

  avatarPlaceholder: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#E8E8E8',
  },

  profileText: {
    flex: 1,
    marginLeft: 16,
  },

  name: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111111',
  },

  previewLink: {
    marginTop: 2,
    fontSize: 20,
    color: '#FFFFFF',
    textDecorationLine: 'underline',
  },

  editButton: {
    marginTop: 26,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...softShadow,
  },

  editButtonText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111111',
  },

  /* ================= CONTACT ================= */

  contactSection: {
    paddingHorizontal: 28,
    marginTop: 34,
  },

  contactTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
  },

  contactSubtitle: {
    marginTop: 3,
    marginBottom: 14,
    fontSize: 11,
    color: '#777777',
  },

  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  contactLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111111',
  },

  contactValue: {
    marginTop: 2,
    fontSize: 12,
    color: '#777777',
  },

  copyButton: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  copyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#222222',
  },

  /* ================= ACCOUNT ================= */

  accountSection: {
    alignItems: 'center',
    marginTop: 40,
    gap: 2,
  },

  accountButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
  },

  accountText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9A9A9A',
  },
});

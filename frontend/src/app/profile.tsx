import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import BottomNavigation from '../components/navigation/BottomNavigation';
import { supabase } from '../lib/supabase';
import * as Clipboard from 'expo-clipboard';

export default function ProfileScreen() {
  const router = useRouter();
  const deletingAccountRef = useRef(false);
  const [copiedValue, setCopiedValue] = useState<string | null>(null);

  const handleCopy = async (value: string) => {
    try {
      await Clipboard.setStringAsync(value);
      setCopiedValue(value);
    } catch (error) {
      console.error('Unable to copy contact:', error);
    }
  };

  const [displayName, setDisplayName] = useState('');
  const [age, setAge] = useState<number | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birthday = new Date(birthDate);

    let calculatedAge =
      today.getFullYear() - birthday.getFullYear();

    const monthDifference =
      today.getMonth() - birthday.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 &&
        today.getDate() < birthday.getDate())
    ) {
      calculatedAge--;
    }

    return calculatedAge;
  };

  const loadProfile = async () => {
    try {
      setLoading(true);

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
    } catch (error) {
      console.error('Unable to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
  if (deletingAccountRef.current) return;

  deletingAccountRef.current = true;

  try {
    const { data, error } = await supabase.functions.invoke(
      'delete-account',
      { body: {} },
    );

    if (error || data?.success !== true) {
      throw error ?? new Error('Account deletion was not confirmed');
    }

    await supabase.auth.signOut({ scope: 'local' });
    router.replace('/(auth)/login');
  } catch (error) {
    console.error('Unable to delete account:', error);

    const message = 'Unable to delete your account. Please try again.';

    if (Platform.OS === 'web') {
      window.alert(message);
    } else {
      Alert.alert('Delete Account Failed', message);
    }
  } finally {
    deletingAccountRef.current = false;
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
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Profile</Text>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >

        <View style={styles.profileSection}>
          {profilePhoto ? (
            <Image
              source={{ uri: profilePhoto }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder} />
          )}

          <Text style={styles.name}>
            {displayName}
            {age !== null ? ` ${age}` : ''}
          </Text>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push('/edit-profile')}
          >
            <Text style={styles.editButtonText}>
              Edit Profile
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.accountSection}>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.accountText}>
              Log out
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDeleteAccount}
          >
            <Text style={styles.deleteText}>
              Delete Account
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ paddingHorizontal: 24, marginTop: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 6 }}>
            Contact Developer
          </Text>

          <Text style={{ color: '#777777', marginBottom: 16 }}>
            Questions, feedback, or support? Reach out to us!
          </Text>

          {[
            { label: 'Instagram', value: '@talktu.official' },
            { label: 'LINE', value: 'talktuOA' },
            { label: 'Gmail', value: 'talktu@gmail.com' },
          ].map((contact) => (
            <View
              key={contact.label}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '600' }}>
                  {contact.label}
                </Text>
                <Text style={{ color: '#777777', marginTop: 3 }}>
                  {contact.value}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => handleCopy(contact.value)}
                style={{
                  borderWidth: 1,
                  borderColor: '#DDDDDD',
                  borderRadius: 10,
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                }}
              >
                <Text
                  style={{
                    fontWeight: '600',
                    color: copiedValue === contact.value ? '#16A34A' : '#222222',
                  }}
                >
                  {copiedValue === contact.value ? '✓ Copied!' : 'Copy'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      <BottomNavigation activeTab="profile" />
    </SafeAreaView >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },

  header: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 16,
  },

  profileSection: {
    alignItems: 'center',
    marginTop: 50,
  },

  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },

  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ddd',
  },

  name: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
  },

  editButton: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 30,
  },

  editButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },

  accountSection: {
    alignItems: 'center',
    marginTop: 60,
    gap: 18,
  },

  accountText: {
    fontSize: 16,
  },

  deleteText: {
    fontSize: 16,
    color: '#d33',
  },
});
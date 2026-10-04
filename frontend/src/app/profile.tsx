import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import BottomNavigation from '../components/navigation/BottomNavigation';
import { supabase } from '../lib/supabase';

export default function ProfileScreen() {
  const router = useRouter();

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

      // 2. โหลดชื่อ
      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        throw profileError;
      }

      setDisplayName(profile?.display_name ?? 'User');

      // 3. โหลดวันเกิด
      const {
        data: privateData,
        error: privateError,
      } = await supabase
        .from('user_private')
        .select('birth_date')
        .eq('user_id', user.id)
        .maybeSingle();

      if (privateError) {
        throw privateError;
      }

      if (privateData?.birth_date) {
        setAge(calculateAge(privateData.birth_date));
      }

      // 4. โหลดรูปแรกของ Profile
      const {
        data: photo,
        error: photoError,
      } = await supabase
        .from('profile_photos')
        .select('storage_path')
        .eq('user_id', user.id)
        .order('position', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (photoError) {
        throw photoError;
      }

      if (photo?.storage_path) {
        const { data } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(photo.storage_path);

        setProfilePhoto(data.publicUrl);
      }
    } catch (error) {
      console.error('Unable to load profile:', error);
    } finally {
      setLoading(false);
    }
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
          onPress={() =>
            console.log('Delete Account')
          }
        >
          <Text style={styles.deleteText}>
            Delete Account
          </Text>
        </TouchableOpacity>
      </View>

      <BottomNavigation
        activeTab="profile"
        onTabPress={(tab) => {
          if (tab === 'swap') {
            router.replace('/swipe');
          }

          if (tab === 'chat') {
            router.replace('/chat');
          }
        }}
      />
    </SafeAreaView>
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
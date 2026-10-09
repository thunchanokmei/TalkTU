import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  ActivityIndicator,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type MatchModalProps = {
  visible: boolean;
  displayName: string;
  candidatePhotoPath?: string | null;
  onContinue: () => void;
};

export default function MatchModal({
  visible,
  displayName,
  candidatePhotoPath,
  onContinue,
}: MatchModalProps) {
  const [candidateImageUrl, setCandidateImageUrl] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setCandidateImageUrl(null);

    if (!visible || !candidatePhotoPath) {
      return;
    }

    async function loadPhoto() {
      try {
        const path = candidatePhotoPath!;

        if (
          path.startsWith('https://') ||
          path.startsWith('http://')
        ) {
          if (!cancelled) setCandidateImageUrl(path);
          return;
        }

        const { data, error } = await supabase.storage
          .from('profile-photos')
          .createSignedUrl(path, 60 * 60);

        if (error) throw error;

        if (!cancelled) {
          setCandidateImageUrl(data.signedUrl);
        }
      } catch (error) {
        console.error('Match photo error:', error);
      }
    }

    loadPhoto();

    return () => {
      cancelled = true;
    };
  }, [visible, candidatePhotoPath]);

  const [myImageUrl, setMyImageUrl] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setMyImageUrl(null);

    if (!visible) {
      return;
    }

    async function loadMyPhoto() {
      try {
        const { data: authData, error: authError } =
          await supabase.auth.getUser();

        if (authError) throw authError;

        const userId = authData.user?.id;
        if (!userId) return;

        const { data: photo, error: photoError } =
          await supabase
            .from('profile_photos')
            .select('storage_path')
            .eq('user_id', userId)
            .order('position', { ascending: true })
            .limit(1)
            .maybeSingle();

        if (photoError) throw photoError;
        if (!photo?.storage_path) return;

        const { data, error } = await supabase.storage
          .from('profile-photos')
          .createSignedUrl(photo.storage_path, 60 * 60);

        if (error) throw error;

        if (!cancelled) {
          setMyImageUrl(data.signedUrl);
        }
      } catch (error) {
        console.error('My match photo error:', error);
      }
    }

    loadMyPhoto();

    return () => {
      cancelled = true;
    };
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      onRequestClose={onContinue}
      statusBarTranslucent
    >
      <LinearGradient
        colors={['#FF7885', '#FF9A83', '#FFE6B8']}
        locations={[0, 0.5, 1]}
        style={styles.container}
      >
        <View style={styles.centerArea}>
          <View style={styles.photoArea}>
            <View style={[styles.photoCard, styles.leftPhoto]}>
              {candidateImageUrl ? (
                <Image
                  source={{ uri: candidateImageUrl }}
                  style={styles.photo}
                  resizeMode="cover"
                />
              ) : candidatePhotoPath ? (
                <ActivityIndicator color="#FF7885" />
              ) : (
                <Text style={styles.photoPlaceholder}>♡</Text>
              )}
            </View>

            <View style={[styles.photoCard, styles.rightPhoto]}>
              {myImageUrl ? (
                <Image
                  source={{ uri: myImageUrl }}
                  style={styles.photo}
                  resizeMode="cover"
                />
              ) : (
                <Text style={styles.photoPlaceholder}>♡</Text>
              )}
            </View>

            <Text style={styles.matchTitle}>
              it's a Match!
            </Text>
          </View>
        </View>

        <View style={styles.bottomArea}>
          <TextInput
            placeholder={`Say something to ${displayName}`}
            placeholderTextColor="#999999"
            style={styles.messageInput}
          />

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onContinue}
          >
            <LinearGradient
              colors={['#FF7885', '#FFD17A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.doneButton}
            >
              <Text style={styles.doneText}>
                Done
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 80,
    paddingBottom: 65,
  },

  centerArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  photoArea: {
    width: '100%',
    height: 370,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },

  photoCard: {
    position: 'absolute',
    width: 175,
    height: 225,
    borderWidth: 5,
    borderColor: '#FFD98A',
    borderRadius: 24,
    backgroundColor: '#FFE0D3',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },

  leftPhoto: {
    top: 15,
    left: '5%',
    transform: [{ rotate: '-13deg' }],
  },

  rightPhoto: {
    bottom: 10,
    right: '5%',
    transform: [{ rotate: '13deg' }],
  },

  photoPlaceholder: {
    fontSize: 90,
    color: '#FFFFFF',
  },

  matchTitle: {
    position: 'absolute',
    zIndex: 10,
    fontSize: 43,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: '#E85E79',
    textShadowOffset: { width: 3, height: 4 },
    textShadowRadius: 4,
  },

  bottomArea: {
    width: '100%',
    gap: 16,
  },

  messageInput: {
    height: 54,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 22,
    fontSize: 14,
    color: '#333333',
  },

  doneButton: {
    height: 54,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  doneText: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
  },

  photo: {
    width: '100%',
    height: '100%',
  },
});
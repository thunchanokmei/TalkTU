import { useState } from 'react';
import { supabase } from '@/lib/supabase';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type PhotoBoxProps = {
  image: string | null;
  onPress: () => void;
  onRemove: () => void;
  style?: object;
};

export default function Bio1Screen() {
  const router = useRouter();

  const [images, setImages] = useState<(string | null)[]>(
    [null, null, null, null, null, null]
  );

  const [aboutMe, setAboutMe] = useState('');

  const pickImage = async (index: number) => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission required',
          'Please allow access to your photos.'
        );
        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [3, 4],
          quality: 0.8,
        });

      if (result.canceled) {
        return;
      }

      const selectedImage = result.assets[0]?.uri;

      if (!selectedImage) {
        return;
      }

      setImages((currentImages) => {
        const updatedImages = [...currentImages];
        updatedImages[index] = selectedImage;
        return updatedImages;
      });
    } catch (error) {
      console.log('Image picker error:', error);

      Alert.alert(
        'Error',
        'Unable to select this photo.'
      );
    }
  };

  const removeImage = (index: number) => {
    setImages((currentImages) => {
      const updatedImages = [...currentImages];
      updatedImages[index] = null;
      return updatedImages;
    });
  };

const handleContinue = async () => {
  try {
    // 1. เช็กว่า user login อยู่ไหม
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      Alert.alert('Error', 'กรุณา login ก่อน');
      return;
    }

    // 2. บันทึก About Me ลง profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        bio: aboutMe.trim(),
      })
      .eq('id', user.id);

    if (profileError) {
      console.error('Profile error:', profileError);
      Alert.alert('Error', 'บันทึก About Me ไม่สำเร็จ');
      return;
    }

    // 3. Upload รูปทีละรูป
    for (let i = 0; i < images.length; i++) {
      const imageUri = images[i];

      // ช่องที่ไม่ได้ใส่รูป ข้ามไป
      if (!imageUri) continue;

      const position = i + 1;

      // ดึงไฟล์จาก local URI
      const response = await fetch(imageUri);
      const arrayBuffer = await response.arrayBuffer();

      // path ที่เก็บใน Storage
      const storagePath = `${user.id}/${position}.jpg`;

      // Upload เข้า Storage
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(storagePath, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        Alert.alert(
          'Error',
          `อัปโหลดรูปที่ ${position} ไม่สำเร็จ`
        );
        return;
      }

      // 4. บันทึก path ลง profile_photos
      const { error: photoError } = await supabase
        .from('profile_photos')
        .insert({
          user_id: user.id,
          storage_path: storagePath,
          position: position,
        });

      if (photoError) {
        console.error('Photo DB error:', photoError);
        Alert.alert(
          'Error',
          `บันทึกข้อมูลรูปที่ ${position} ไม่สำเร็จ`
        );
        return;
      }
    }

    console.log('Bio1 saved successfully');

    // 5. ไป Bio2
    router.push('/bio2');

  } catch (error) {
    console.error('Unexpected error:', error);
    Alert.alert('Error', 'เกิดข้อผิดพลาด');
  }
};

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FF7C82', '#FFD17E']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.backGradient}
            >
              <Ionicons
                name="chevron-back"
                size={21}
                color="#111111"
              />

              <Ionicons
                name="chevron-back"
                size={21}
                color="#111111"
                style={styles.secondArrow}
              />
            </LinearGradient>
          </TouchableOpacity>

          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>
              Oh you’re xx{'\n'}
              Let them know{'\n'}
              Who u are
            </Text>
          </View>

          {/* Photos */}
          <LinearGradient
            colors={[
              '#FF7D82',
              '#FFAF72',
              '#FFE0A1',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.photoContainer}
          >
            {/* First row */}
            <View style={styles.topPhotoRow}>
              <PhotoBox
                image={images[0]}
                style={styles.largePhoto}
                onPress={() => pickImage(0)}
                onRemove={() => removeImage(0)}
              />

              <View style={styles.rightPhotoColumn}>
                <PhotoBox
                  image={images[1]}
                  style={styles.sidePhoto}
                  onPress={() => pickImage(1)}
                  onRemove={() => removeImage(1)}
                />

                <PhotoBox
                  image={images[2]}
                  style={styles.sidePhoto}
                  onPress={() => pickImage(2)}
                  onRemove={() => removeImage(2)}
                />
              </View>
            </View>

            {/* Second row */}
            <View style={styles.bottomPhotoRow}>
              <PhotoBox
                image={images[3]}
                style={styles.bottomPhoto}
                onPress={() => pickImage(3)}
                onRemove={() => removeImage(3)}
              />

              <PhotoBox
                image={images[4]}
                style={styles.bottomPhoto}
                onPress={() => pickImage(4)}
                onRemove={() => removeImage(4)}
              />

              <PhotoBox
                image={images[5]}
                style={styles.bottomPhoto}
                onPress={() => pickImage(5)}
                onRemove={() => removeImage(5)}
              />
            </View>
          </LinearGradient>

          {/* About me */}
          <LinearGradient
            colors={[
              '#FF8081',
              '#FFAE70',
              '#FFD16E',
            ]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.aboutContainer}
          >
            <Text style={styles.aboutTitle}>
              About me
            </Text>

            <TextInput
              value={aboutMe}
              onChangeText={setAboutMe}
              placeholder="Tell them something about you..."
              placeholderTextColor="#777777"
              multiline
              maxLength={300}
              textAlignVertical="top"
              style={styles.aboutInput}
            />

            <Text style={styles.counter}>
              {aboutMe.length}/300
            </Text>
          </LinearGradient>

          {/* Continue */}
          <TouchableOpacity
            style={styles.nextButtonContainer}
            onPress={handleContinue}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[
                '#FF7B82',
                '#FFAA70',
                '#FFD37B',
              ]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.nextButton}
            >
              <Text style={styles.nextText}>
                Continue
              </Text>

              <Ionicons
                name="arrow-forward"
                size={20}
                color="#111111"
              />
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* -------------------------------- */
/* Photo Box                         */
/* -------------------------------- */

function PhotoBox({
  image,
  onPress,
  onRemove,
  style,
}: PhotoBoxProps) {
  if (image !== null) {
    return (
      <View style={[styles.photoBox, style]}>
        <Image
          source={{ uri: image }}
          style={styles.image}
        />

        <TouchableOpacity
          style={styles.removeButton}
          onPress={onRemove}
          activeOpacity={0.8}
        >
          <Ionicons
            name="close"
            size={17}
            color="#111111"
          />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.photoBox, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons
        name="add"
        size={32}
        color="#111111"
      />
    </TouchableOpacity>
  );
}

/* -------------------------------- */
/* Styles                            */
/* -------------------------------- */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },

  /* Back */

  backButton: {
    width: 58,
    height: 38,
    borderRadius: 20,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,

    elevation: 4,
  },

  backGradient: {
    flex: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  secondArrow: {
    marginLeft: -13,
  },

  /* Title */

  titleContainer: {
    marginTop: 16,
    marginBottom: 12,
  },

  title: {
    fontSize: 27,
    lineHeight: 30,
    fontWeight: '800',
    color: '#080808',
  },

  /* Photos */

  photoContainer: {
    width: '100%',
    borderRadius: 17,
    padding: 10,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,

    elevation: 4,
  },

  topPhotoRow: {
    flexDirection: 'row',
  },

  largePhoto: {
    flex: 2,
    height: 270,
    marginRight: 9,
  },

  rightPhotoColumn: {
    flex: 1,
  },

  sidePhoto: {
    width: '100%',
    height: 130,
    marginBottom: 9,
  },

  bottomPhotoRow: {
    flexDirection: 'row',
  },

  bottomPhoto: {
    flex: 1,
    height: 125,
    marginRight: 9,
  },

  photoBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,

    alignItems: 'center',
    justifyContent: 'center',

    overflow: 'hidden',

    borderWidth: 1,
    borderColor: '#E5E5E5',
  },

  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  removeButton: {
    position: 'absolute',

    top: 7,
    right: 7,

    width: 25,
    height: 25,
    borderRadius: 13,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: 'rgba(255,255,255,0.9)',
  },

  /* About me */

  aboutContainer: {
    marginTop: 12,
    borderRadius: 15,

    padding: 12,

    minHeight: 150,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 3,

    elevation: 3,
  },

  aboutTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#080808',

    marginBottom: 8,
  },

  aboutInput: {
    minHeight: 90,

    backgroundColor: '#FFFFFF',
    borderRadius: 12,

    paddingHorizontal: 12,
    paddingVertical: 10,

    fontSize: 15,
    color: '#111111',
  },

  counter: {
    fontSize: 11,
    color: '#555555',

    textAlign: 'right',

    marginTop: 5,
  },

  /* Continue */

  nextButtonContainer: {
    marginTop: 20,
  },

  nextButton: {
    height: 52,
    borderRadius: 26,

    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',

    gap: 8,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,

    elevation: 3,
  },

  nextText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111111',
  },
});
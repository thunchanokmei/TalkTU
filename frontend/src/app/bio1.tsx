import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';


type PhotoBoxProps = {
  image: string | null;
  onPress: () => void;
  onRemove: () => void;
  style?: object;
};

export default function Bio1Screen() {
  const router = useRouter();
  const { width, height: screenHeight } = useWindowDimensions();

  const [displayName, setDisplayName] = useState('xx');

  const [images, setImages] = useState<(string | null)[]>(
    [null, null, null, null, null, null]
  );

  const [bio, setBio] = useState('');
  const [genderIdentity, setGenderIdentity] = useState('');
  const [height, setHeight] = useState('');
  const [places, setPlaces] = useState<string[]>([]);

  const [genderModal, setGenderModal] = useState(false);
  const [heightModal, setHeightModal] = useState(false);

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const pagePadding = Math.max(
    14,
    Math.min(width * 0.045, 24)
  );

  const largePhotoHeight = Math.max(
    240,
    Math.min(screenHeight * 0.34, 330)
  );

  const sidePhotoHeight = (largePhotoHeight - 10) / 2;
  const bottomPhotoHeight = Math.max(
    110,
    Math.min(screenHeight * 0.15, 150)
  );

  const genderOptions = [
    'Man',
    'Woman',
    'Non-binary',
    'Prefer not to say',
  ];

  const heightOptions = Array.from(
    { length: 61 },
    (_, index) => `${140 + index} cm`
  );

  const placeOptions = [
    'หอสมุดป๋วย',
    'SC3',
    'อินเตอร์โซน',
    'เชียงราก 1',
    'กรีน',
    'TU fitness',
    'ยิม 7',
    'หอใน มธ. 100 ปี',
    'เชียงราก 2',
    'SC BUS',
    'โรงอาหาร JC',
    'ประตูเชียงราก',
  ];

  useEffect(() => {
    const loadDisplayName = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data, error } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (data?.display_name) {
          setDisplayName(data.display_name);
        }
      } catch (error) {
        console.error(
          'Load display name error:',
          error
        );
      }
    };

    loadDisplayName();
  }, []);

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

      setImages((current) => {
        const updated = [...current];
        updated[index] = selectedImage;
        return updated;
      });
    } catch (error) {
      console.error(
        'Image picker error:',
        error
      );

      Alert.alert(
        'Error',
        'Unable to select this photo.'
      );
    }
  };

  const removeImage = (index: number) => {
    setImages((current) => {
      const updated = [...current];
      updated[index] = null;
      return updated;
    });
  };

  const togglePlace = (place: string) => {
    setPlaces((current) => {
      if (current.includes(place)) {
        return current.filter((item) => item !== place);
      }

      return [...current, place];
    });
  };

  const handleStart = async () => {
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
          bio: bio.trim(),
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
      router.push('/swipe');

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
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal:
                pagePadding,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[
                '#FF7C82',
                '#FFD17E',
              ]}
              start={{
                x: 0,
                y: 0.5,
              }}
              end={{
                x: 1,
                y: 0.5,
              }}
              style={styles.backGradient}
            >
              <Ionicons
                name="chevron-back"
                size={20}
                color="#111111"
              />

              <Ionicons
                name="chevron-back"
                size={20}
                color="#111111"
                style={styles.secondArrow}
              />
            </LinearGradient>
          </TouchableOpacity>

          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>
              Oh you’re {displayName}{'\n'}
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
            start={{
              x: 0,
              y: 0,
            }}
            end={{
              x: 1,
              y: 1,
            }}
            style={styles.photoContainer}
          >
            <View style={styles.topPhotoRow}>
              <PhotoBox
                image={images[0]}
                style={[
                  styles.largePhoto,
                  {
                    height:
                      largePhotoHeight,
                  },
                ]}
                onPress={() =>
                  pickImage(0)
                }
                onRemove={() =>
                  removeImage(0)
                }
              />

              <View
                style={
                  styles.rightPhotoColumn
                }
              >
                <PhotoBox
                  image={images[1]}
                  style={[
                    styles.sidePhoto,
                    {
                      height:
                        sidePhotoHeight,
                    },
                  ]}
                  onPress={() =>
                    pickImage(1)
                  }
                  onRemove={() =>
                    removeImage(1)
                  }
                />

                <PhotoBox
                  image={images[2]}
                  style={[
                    styles.sidePhoto,
                    {
                      height:
                        sidePhotoHeight,
                      marginBottom: 0,
                    },
                  ]}
                  onPress={() =>
                    pickImage(2)
                  }
                  onRemove={() =>
                    removeImage(2)
                  }
                />
              </View>
            </View>

            <View
              style={
                styles.bottomPhotoRow
              }
            >
              {[3, 4, 5].map(
                (index) => (
                  <PhotoBox
                    key={index}
                    image={images[index]}
                    style={[
                      styles.bottomPhoto,
                      {
                        height:
                          bottomPhotoHeight,
                      },
                      index === 5 &&
                      styles.lastBottomPhoto,
                    ]}
                    onPress={() =>
                      pickImage(index)
                    }
                    onRemove={() =>
                      removeImage(index)
                    }
                  />
                )
              )}
            </View>
          </LinearGradient>

          {/* One continuous Bio/Profile card */}
          <LinearGradient
            colors={[
              '#FF8081',
              '#FFAE70',
              '#FFE0A1',
            ]}
            start={{
              x: 0,
              y: 0,
            }}
            end={{
              x: 1,
              y: 1,
            }}
            style={styles.detailsCard}
          >
            <Text style={styles.label}>
              Bio
            </Text>

            <TextInput
              value={bio}
              onChangeText={setBio}
              multiline
              textAlignVertical="top"
              placeholder="Tell them something about you..."
              placeholderTextColor="#8A8A8A"
              maxLength={300}
              style={styles.bioInput}
            />

            <Text style={styles.counter}>
              {bio.length}/300
            </Text>

            <Text style={styles.label}>
              Gender identity
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.dropdown}
              onPress={() =>
                setGenderModal(true)
              }
            >
              <Text
                style={[
                  styles.dropdownText,
                  !genderIdentity &&
                  styles.placeholderText,
                ]}
              >
                {genderIdentity ||
                  'Select'}
              </Text>

              <View
                style={
                  styles.dropdownIcon
                }
              >
                <Ionicons
                  name="chevron-down"
                  size={17}
                  color="#777777"
                />
              </View>
            </TouchableOpacity>

            <Text style={styles.label}>
              Height
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.dropdown}
              onPress={() =>
                setHeightModal(true)
              }
            >
              <Text
                style={[
                  styles.dropdownText,
                  !height &&
                  styles.placeholderText,
                ]}
              >
                {height || 'Select'}
              </Text>

              <View
                style={
                  styles.dropdownIcon
                }
              >
                <Ionicons
                  name="chevron-down"
                  size={17}
                  color="#777777"
                />
              </View>
            </TouchableOpacity>

            <Text
              style={styles.placesTitle}
            >
              You’ll usually find me at..
            </Text>

            <View
              style={
                styles.chipsContainer
              }
            >
              {placeOptions.map(
                (place) => {
                  const selected =
                    places.includes(place);

                  return (
                    <TouchableOpacity
                      key={place}
                      activeOpacity={0.8}
                      onPress={() =>
                        togglePlace(place)
                      }
                      style={[
                        styles.chip,
                        selected &&
                        styles.chipSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selected &&
                          styles.chipTextSelected,
                        ]}
                      >
                        {place}
                      </Text>
                    </TouchableOpacity>
                  );
                }
              )}
            </View>
          </LinearGradient>

          {errorMessage ? (
            <Text
              style={
                styles.errorText
              }
            >
              {errorMessage}
            </Text>
          ) : null}

          {/* Start Now */}
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={saving}
            onPress={handleStart}
            style={[
              styles.startButtonContainer,
              saving &&
              styles.disabledButton,
            ]}
          >
            <LinearGradient
              colors={[
                '#FF7B82',
                '#FFAA70',
                '#FFD37B',
              ]}
              start={{
                x: 0,
                y: 0.5,
              }}
              end={{
                x: 1,
                y: 0.5,
              }}
              style={
                styles.startButton
              }
            >
              {saving ? (
                <ActivityIndicator
                  color="#111111"
                />
              ) : (
                <Text
                  style={
                    styles.startText
                  }
                >
                  Start Now!
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Gender identity modal */}
      <Modal
        visible={genderModal}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setGenderModal(false)
        }
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() =>
            setGenderModal(false)
          }
        >
          <Pressable
            style={styles.modalBox}
            onPress={(event) =>
              event.stopPropagation()
            }
          >
            <Text
              style={styles.modalTitle}
            >
              Gender identity
            </Text>

            {genderOptions.map(
              (option) => (
                <TouchableOpacity
                  key={option}
                  style={
                    styles.modalOption
                  }
                  onPress={() => {
                    setGenderIdentity(
                      option
                    );
                    setGenderModal(
                      false
                    );
                  }}
                >
                  <Text
                    style={
                      styles.modalOptionText
                    }
                  >
                    {option}
                  </Text>

                  {genderIdentity ===
                    option && (
                      <Ionicons
                        name="checkmark"
                        size={20}
                        color="#FF7B82"
                      />
                    )}
                </TouchableOpacity>
              )
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Height modal */}
      <Modal
        visible={heightModal}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setHeightModal(false)
        }
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() =>
            setHeightModal(false)
          }
        >
          <Pressable
            style={
              styles.heightModalBox
            }
            onPress={(event) =>
              event.stopPropagation()
            }
          >
            <Text
              style={styles.modalTitle}
            >
              Height
            </Text>

            <ScrollView
              style={styles.heightList}
              showsVerticalScrollIndicator={
                false
              }
            >
              {heightOptions.map(
                (option) => (
                  <TouchableOpacity
                    key={option}
                    style={
                      styles.modalOption
                    }
                    onPress={() => {
                      setHeight(option);
                      setHeightModal(
                        false
                      );
                    }}
                  >
                    <Text
                      style={
                        styles.modalOptionText
                      }
                    >
                      {option}
                    </Text>

                    {height ===
                      option && (
                        <Ionicons
                          name="checkmark"
                          size={20}
                          color="#FF7B82"
                        />
                      )}
                  </TouchableOpacity>
                )
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function PhotoBox({
  image,
  onPress,
  onRemove,
  style,
}: PhotoBoxProps) {
  if (image !== null) {
    return (
      <View
        style={[
          styles.photoBox,
          style,
        ]}
      >
        <Image
          source={{ uri: image }}
          style={styles.image}
        />

        <TouchableOpacity
          style={
            styles.removeButton
          }
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
      style={[
        styles.photoBox,
        style,
      ]}
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    paddingTop: 12,
    paddingBottom: 42,
  },

  backButton: {
    width: 48,
    height: 31,

    borderRadius: 999,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },

  backGradient: {
    flex: 1,

    borderRadius: 999,

    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  secondArrow: {
    marginLeft: -13,
  },

  titleContainer: {
    marginTop: 13,
    marginBottom: 12,
  },

  title: {
    fontSize: 25,
    lineHeight: 28,

    fontWeight: '700',

    color: '#080808',
  },

  photoContainer: {
    width: '100%',

    borderRadius: 18,

    padding: 9,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.16,
    shadowRadius: 4,
    elevation: 4,
  },

  topPhotoRow: {
    flexDirection: 'row',
  },

  largePhoto: {
    flex: 2,
    marginRight: 9,
  },

  rightPhotoColumn: {
    flex: 1,
  },

  sidePhoto: {
    width: '100%',
    marginBottom: 10,
  },

  bottomPhotoRow: {
    flexDirection: 'row',
    marginTop: 9,
  },

  bottomPhoto: {
    flex: 1,
    marginRight: 9,
  },

  lastBottomPhoto: {
    marginRight: 0,
  },

  photoBox: {
    backgroundColor: '#FFFFFF',

    borderRadius: 13,

    alignItems: 'center',
    justifyContent: 'center',

    overflow: 'hidden',

    borderWidth: 1,
    borderColor: '#E9E9E9',
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

    borderRadius: 999,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor:
      'rgba(255,255,255,0.92)',
  },

  detailsCard: {
    marginTop: 12,

    borderRadius: 17,

    paddingHorizontal: 10,
    paddingTop: 12,
    paddingBottom: 16,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.13,
    shadowRadius: 4,
    elevation: 3,
  },

  label: {
    marginBottom: 6,

    fontSize: 14,
    fontWeight: '700',

    color: '#111111',
  },

  bioInput: {
    minHeight: 100,

    borderRadius: 11,

    paddingHorizontal: 12,
    paddingVertical: 10,

    backgroundColor: '#FFFFFF',

    fontSize: 14,
    color: '#111111',
  },

  counter: {
    marginTop: 4,
    marginBottom: 13,

    textAlign: 'right',

    fontSize: 10,

    color: '#555555',
  },

  dropdown: {
    minHeight: 39,

    borderRadius: 11,

    flexDirection: 'row',
    alignItems: 'center',

    paddingLeft: 11,
    paddingRight: 5,

    marginBottom: 13,

    backgroundColor: '#FFFFFF',
  },

  dropdownText: {
    flex: 1,

    fontSize: 13,

    color: '#111111',
  },

  placeholderText: {
    color: '#999999',
  },

  dropdownIcon: {
    width: 27,
    height: 27,

    borderRadius: 999,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#E4E4E4',
  },

  placesTitle: {
    marginTop: 1,
    marginBottom: 8,

    fontSize: 13,
    fontWeight: '700',

    color: '#111111',
  },

  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',

    gap: 6,
  },

  chip: {
    minHeight: 27,

    borderRadius: 999,

    paddingHorizontal: 10,
    paddingVertical: 5,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#FFFFFF',
  },

  chipSelected: {
    backgroundColor: '#2F2F2F',
  },

  chipText: {
    fontSize: 10,

    color: '#666666',
  },

  chipTextSelected: {
    color: '#FFFFFF',
  },

  errorText: {
    marginTop: 10,

    textAlign: 'center',

    fontSize: 12,

    color: '#C62828',
  },

  startButtonContainer: {
    alignSelf: 'flex-end',

    marginTop: 13,

    borderRadius: 999,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.14,
    shadowRadius: 3,
    elevation: 3,
  },

  disabledButton: {
    opacity: 0.65,
  },

  startButton: {
    minWidth: 98,
    height: 38,

    borderRadius: 999,

    paddingHorizontal: 17,

    alignItems: 'center',
    justifyContent: 'center',
  },

  startText: {
    fontSize: 12,
    fontWeight: '700',

    color: '#111111',
  },

  modalOverlay: {
    flex: 1,

    paddingHorizontal: 25,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor:
      'rgba(0,0,0,0.35)',
  },

  modalBox: {
    width: '100%',
    maxWidth: 350,

    borderRadius: 18,

    padding: 18,

    backgroundColor: '#FFFFFF',
  },

  heightModalBox: {
    width: '100%',
    maxWidth: 350,
    height: 420,

    borderRadius: 18,

    padding: 18,

    backgroundColor: '#FFFFFF',
  },

  modalTitle: {
    marginBottom: 8,

    fontSize: 18,
    fontWeight: '700',

    color: '#111111',
  },

  heightList: {
    flex: 1,
  },

  modalOption: {
    minHeight: 43,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    borderBottomWidth:
      StyleSheet.hairlineWidth,

    borderBottomColor: '#E5E5E5',
  },

  modalOptionText: {
    fontSize: 14,

    color: '#111111',
  },
});

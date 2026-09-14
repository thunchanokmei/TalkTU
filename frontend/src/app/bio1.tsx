import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  completeOnboarding,
} from '@/features/onboarding/services/onboardingService';

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
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import WheelPicker from '../components/WheelPicker';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import {
  ImageManipulator,
  SaveFormat,
} from 'expo-image-manipulator';

type PhotoBoxProps = {
  image: string | null;
  onPress: () => void;
  onRemove: () => void;
  style?: object;
};

const GENDER_IDENTITY_MAP = {
  Man: 'man',
  Woman: 'woman',
  'Non-binary': 'non_binary',
  'Prefer not to say': 'prefer_not_to_say',
} as const;

type GenderIdentityLabel =
  keyof typeof GENDER_IDENTITY_MAP;

export default function Bio1Screen() {
  const router = useRouter();
  const { width, height: screenHeight } = useWindowDimensions();

  const [displayName, setDisplayName] = useState('');

  const [images, setImages] = useState<(string | null)[]>(
    [null, null, null, null, null, null]
  );

  const [imageStoragePaths, setImageStoragePaths] =
    useState<(string | null)[]>([
      null,
      null,
      null,
      null,
      null,
      null,
    ]);

  const [bio, setBio] = useState('');
  const [
    genderIdentity,
    setGenderIdentity,
  ] = useState<GenderIdentityLabel | ''>('');
  const [heightCm, setHeightCm] = useState(170);
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

  const genderOptions: GenderIdentityLabel[] = [
    'Man',
    'Woman',
    'Non-binary',
    'Prefer not to say',
  ];

  const heightOptions = Array.from(
    { length: 251 },
    (_, index) => String(index)
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
    const loadExistingProfile =
      async () => {
        try {
          const {
            data: { user },
            error: userError,
          } =
            await supabase.auth
              .getUser();

          if (userError) {
            throw userError;
          }

          if (!user) {
            return;
          }

          const {
            data: profile,
            error: profileError,
          } =
            await supabase
              .from('profiles')
              .select(
                'display_name, bio, height_cm, gender_identity'
              )
              .eq('id', user.id)
              .maybeSingle();

          if (profileError) {
            throw profileError;
          }

          setDisplayName(
            profile?.display_name ??
            ''
          );

          setBio(
            profile?.bio ??
            ''
          );

          // โหลดรูปเดิมจาก profile_photos
          const {
            data: photoRows,
            error: photoRowsError,
          } = await supabase
            .from('profile_photos')
            .select('storage_path, position')
            .eq('user_id', user.id)
            .order('position', {
              ascending: true,
            });

          if (photoRowsError) {
            throw photoRowsError;
          }

          const loadedImages: (string | null)[] = [
            null,
            null,
            null,
            null,
            null,
            null,
          ];

          const loadedStoragePaths: (string | null)[] = [
            null,
            null,
            null,
            null,
            null,
            null,
          ];

          for (const photo of photoRows ?? []) {
            const index = photo.position - 1;

            if (
              index < 0 ||
              index >= loadedImages.length
            ) {
              continue;
            }

            const publicUrl = supabase.storage
              .from('profile-photos')
              .getPublicUrl(
                photo.storage_path
              )
              .data.publicUrl;

            loadedImages[index] = publicUrl;
            loadedStoragePaths[index] = photo.storage_path;
          }

          setImages(loadedImages);
          setImageStoragePaths(loadedStoragePaths);

          if (
            typeof profile?.height_cm ===
            'number'
          ) {
            setHeightCm(
              profile.height_cm
            );
          }

          const identity =
            profile?.gender_identity;

          if (
            identity === 'man'
          ) {
            setGenderIdentity(
              'Man'
            );
          } else if (
            identity === 'woman'
          ) {
            setGenderIdentity(
              'Woman'
            );
          } else if (
            identity ===
            'non_binary'
          ) {
            setGenderIdentity(
              'Non-binary'
            );
          } else if (
            identity ===
            'prefer_not_to_say'
          ) {
            setGenderIdentity(
              'Prefer not to say'
            );
          }

          /*
           * Reload saved campus locations.
           * This makes Back -> forward preserve
           * the actual database value.
           */
          const {
            data:
            userLocationRows,
            error:
            userLocationsError,
          } =
            await supabase
              .from(
                'user_locations'
              )
              .select(
                'location_id'
              )
              .eq(
                'user_id',
                user.id
              );

          if (
            userLocationsError
          ) {
            throw userLocationsError;
          }

          const locationIds =
            (
              userLocationRows ??
              []
            ).map(
              (row) =>
                row.location_id
            );

          if (
            locationIds.length > 0
          ) {
            const {
              data:
              locationRows,
              error:
              locationError,
            } =
              await supabase
                .from(
                  'campus_locations'
                )
                .select(
                  'id, name'
                )
                .in(
                  'id',
                  locationIds
                );

            if (locationError) {
              throw locationError;
            }

            setPlaces(
              (
                locationRows ??
                []
              ).map(
                (row) =>
                  row.name
              )
            );
          } else {
            setPlaces([]);
          }
        } catch (error) {
          console.error(
            'Load existing Bio profile error:',
            error
          );
        }
      };

    loadExistingProfile();
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

  const removeImage = async (index: number) => {
    const storagePath = imageStoragePaths[index];

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error('User is not authenticated.');
      }

      if (storagePath) {
        const { error: storageError } =
          await supabase.storage
            .from('profile-photos')
            .remove([storagePath]);

        if (storageError) {
          throw storageError;
        }

        const { error: photoRowError } =
          await supabase
            .from('profile_photos')
            .delete()
            .eq('user_id', user.id)
            .eq('position', index + 1);

        if (photoRowError) {
          throw photoRowError;
        }
      }

      setImages((current) => {
        const updated = [...current];
        updated[index] = null;
        return updated;
      });

      setImageStoragePaths((current) => {
        const updated = [...current];
        updated[index] = null;
        return updated;
      });

      setErrorMessage('');
    } catch (error) {
      console.error('Remove photo error:', error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to remove this photo.'
      );
    }
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
    if (saving) {
      return;
    }

    const hasSelectedPhoto = images.some(
      (image) => image !== null
    );

    if (!hasSelectedPhoto) {
      setErrorMessage(
        'Please add at least one photo.'
      );
      return;
    }

    try {
      setSaving(true);
      setErrorMessage('');

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error(
          'User is not authenticated.'
        );
      }

      const genderValue =
        genderIdentity
          ? GENDER_IDENTITY_MAP[
          genderIdentity
          ]
          : null;

      // ------------------------------------------------------
      // 1. Save Bio / Height / Gender identity
      // Height 0 is treated as "not specified".
      // ------------------------------------------------------
      const {
        error: profileError,
      } = await supabase
        .from('profiles')
        .update({
          bio: bio.trim(),
          height_cm:
            heightCm,
          gender_identity:
            genderValue,
        })
        .eq('id', user.id);

      if (profileError) {
        throw profileError;
      }

      // ------------------------------------------------------
      // 2. Replace campus locations
      // ------------------------------------------------------
      const {
        error:
        deleteLocationsError,
      } = await supabase
        .from('user_locations')
        .delete()
        .eq('user_id', user.id);

      if (deleteLocationsError) {
        throw deleteLocationsError;
      }

      if (places.length > 0) {
        const {
          data: locationRows,
          error:
          locationsQueryError,
        } = await supabase
          .from('campus_locations')
          .select('id, name')
          .in('name', places);

        if (locationsQueryError) {
          throw locationsQueryError;
        }

        if (
          locationRows &&
          locationRows.length > 0
        ) {
          const {
            error:
            insertLocationsError,
          } = await supabase
            .from('user_locations')
            .insert(
              locationRows.map(
                (location) => ({
                  user_id:
                    user.id,

                  location_id:
                    location.id,
                })
              )
            );

          if (
            insertLocationsError
          ) {
            throw insertLocationsError;
          }
        }
      }

      // ------------------------------------------------------
      // 3. Upload selected photos
      // ------------------------------------------------------
      for (
        let i = 0;
        i < images.length;
        i++
      ) {

        const imageUri = images[i];

        if (!imageUri) {
          continue;
        }

        const isExistingPhoto =
          imageStoragePaths[i] !== null &&
          (
            imageUri.startsWith('http://') ||
            imageUri.startsWith('https://')
          );

        if (isExistingPhoto) {
          continue;
        }

        const position = i + 1;


        let arrayBuffer:
          ArrayBuffer;

        let contentType =
          'image/jpeg';

        let extension =
          'jpg';

        /*
         * expo-image-manipulator currently crashes
         * on Web for some browser blob images with:
         * "source height is zero or not a number".
         *
         * On Web we upload the ImagePicker file
         * directly. On iOS/Android we still resize
         * and compress before upload.
         */
        if (
          Platform.OS === 'web'
        ) {
          const response =
            await fetch(
              imageUri
            );

          const blob =
            await response.blob();

          contentType =
            blob.type ||
            'image/jpeg';

          if (
            contentType.includes(
              'png'
            )
          ) {
            extension =
              'png';
          } else if (
            contentType.includes(
              'webp'
            )
          ) {
            extension =
              'webp';
          } else {
            extension =
              'jpg';
          }

          arrayBuffer =
            await blob.arrayBuffer();
        } else {
          const imageContext =
            ImageManipulator
              .manipulate(
                imageUri
              );

          /*
           * Do not pass height: null.
           * Let the manipulator preserve
           * the original aspect ratio.
           */
          imageContext.resize({
            width: 1200,
          });

          const renderedImage =
            await imageContext
              .renderAsync();

          const compressedImage =
            await renderedImage
              .saveAsync({
                compress: 0.75,
                format:
                  SaveFormat.JPEG,
              });

          const response =
            await fetch(
              compressedImage.uri
            );

          arrayBuffer =
            await response
              .arrayBuffer();

          contentType =
            'image/jpeg';

          extension =
            'jpg';
        }

        const oldStoragePath =
          imageStoragePaths[i];

        const storagePath =
          `${user.id}/${position}-${Date.now()}.${extension}`;

        const {
          error: uploadError,
        } = await supabase.storage
          .from('profile-photos')
          .upload(
            storagePath,
            arrayBuffer,
            {
              contentType,
              upsert: false,
            }
          );

        if (uploadError) {
          throw uploadError;
        }

        const {
          error: photoError,
        } = await supabase
          .from('profile_photos')
          .upsert(
            {
              user_id: user.id,
              storage_path:
                storagePath,
              position,
            },
            {
              onConflict:
                'user_id,position',
            }
          );

        if (photoError) {
          throw photoError;
        }

        if (
          oldStoragePath &&
          oldStoragePath !== storagePath
        ) {
          const { error: removeOldError } =
            await supabase.storage
              .from('profile-photos')
              .remove([oldStoragePath]);

          if (removeOldError) {
            console.warn(
              'Unable to remove old profile photo:',
              removeOldError
            );
          }
        }

        setImageStoragePaths((current) => {
          const updated = [...current];
          updated[i] = storagePath;
          return updated;
        });

      }

      // ------------------------------------------------------
      // 4. Complete onboarding
      // ------------------------------------------------------
      await completeOnboarding();

      router.replace('/swipe');
    } catch (error) {
      console.error(
        'Complete bio setup error:',
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to save your profile.'
      );

      Alert.alert(
        'Error',
        'บันทึกโปรไฟล์ไม่สำเร็จ กรุณาลองอีกครั้ง'
      );
    } finally {
      setSaving(false);
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
              Oh you’re {displayName || '...'}{'\n'}
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
              <Text style={styles.dropdownText}>
                {heightCm} cm
              </Text>

              <View style={styles.dropdownIcon}>
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
              You'll usually find me at..
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
              styles.heightWheelModalBox
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

            <WheelPicker
              items={heightOptions}
              value={String(
                heightCm
              )}
              itemHeight={44}
              onValueChange={(
                value
              ) => {
                setHeightCm(
                  Number(value)
                );
              }}
            />

            <TouchableOpacity
              style={
                styles.heightDoneButton
              }
              activeOpacity={0.8}
              onPress={() =>
                setHeightModal(false)
              }
            >
              <Text
                style={
                  styles.heightDoneText
                }
              >
                Done
              </Text>
            </TouchableOpacity>
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

  modalTitle: {
    marginBottom: 8,

    fontSize: 18,
    fontWeight: '700',

    color: '#111111',
  },

  heightWheelModalBox: {
    width: '100%',
    maxWidth: 350,

    borderRadius: 18,

    padding: 18,

    backgroundColor: '#FFFFFF',
  },













  heightDoneButton: {
    alignSelf: 'flex-end',

    marginTop: 12,

    borderRadius: 999,

    paddingHorizontal: 18,
    paddingVertical: 8,

    backgroundColor: '#FFE0A1',
  },

  heightDoneText: {
    fontSize: 13,
    fontWeight: '600',

    color: '#111111',
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

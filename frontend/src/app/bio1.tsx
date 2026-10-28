import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import {
  completeOnboarding,
} from '@/features/onboarding/services/onboardingService';

import {
  ActivityIndicator,
  Animated,
  FlatList,
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
import OnboardingBackButton from '../components/navigation/OnboardingBackButton';
import OnboardingGoButton from '../components/navigation/OnboardingGoButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

import {
  ImageManipulator,
  SaveFormat,
} from 'expo-image-manipulator';

import {
  GENDER_IDENTITY_MAP,
  GENDER_IDENTITY_OPTIONS,
  type GenderIdentityLabel,
} from '../constants/genderIdentity';

type PhotoBoxProps = {
  image: string | null;
  onPress: () => void;
  onRemove: () => void;
  style?: object;
};

// ขนาดจริงของ OnboardingBackButton (ดูจาก component: marginTop 50 + height 55)
const BACK_BUTTON_OFFSET_TOP = 50;
const BACK_BUTTON_HEIGHT = 55;

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
  const heightListRef = useRef<FlatList<string>>(null);

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const pagePadding = Math.max(
    14,
    Math.min(width * 0.045, 24)
  );

  // ตำแหน่งปุ่ม Back (ใช้สูตรเดียวกับหน้าอื่น)
  const backTop = Math.max(20, screenHeight * 0.04);
  const backLeft = Math.max(20, width * 0.07);

  // ความสูงที่ปุ่ม Back กินพื้นที่ ใช้เว้นที่ให้ title ไม่ทับปุ่ม
  const backButtonSpace =
    backTop + BACK_BUTTON_OFFSET_TOP + BACK_BUTTON_HEIGHT - 30;

  const largePhotoHeight = Math.max(
    240,
    Math.min(screenHeight * 0.34, 330)
  );

  const sidePhotoHeight = (largePhotoHeight - 10) / 2;
  const bottomPhotoHeight = Math.max(
    110,
    Math.min(screenHeight * 0.15, 150)
  );

  const genderOptions = GENDER_IDENTITY_OPTIONS;

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
    'หอใน',
    'เชียงราก 2',
    'SC1',
    'โรงอาหาร JC',
    'สวนป๋วย 100 ปี',
    'ศกร.',
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

          const savedGender = profile?.gender_identity;

          const genderLabel = GENDER_IDENTITY_OPTIONS.find(
            (option) => GENDER_IDENTITY_MAP[option] === savedGender
          );

          setGenderIdentity(genderLabel ?? '');

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
  useEffect(() => {
    if (!heightModal) return;
    requestAnimationFrame(() => {
      heightListRef.current?.scrollToOffset({
        offset: heightCm * 44,
        animated: false,
      });
    });
  }, [heightModal]);

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
      {/* ปุ่ม Back: อยู่กับที่ วางระดับเดียวกับหน้าอื่น (ไม่อยู่ใน ScrollView) */}
      <OnboardingBackButton
        top={backTop}
        left={backLeft}
        onPress={() => router.back()}
      />

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
          {/* Spacer เว้นที่ให้ปุ่ม Back เพื่อให้ title ไม่ทับปุ่ม */}
          <View style={{ height: backButtonSpace }} />

          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>
              Looking good, {displayName || '...'}{'\n'}
              Let them get {'\n'}to know you. 😉 {'\n'}
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

          {/* Profile information — ใช้รูปแบบฟอร์มเดียวกับหน้า Edit Profile */}
          <Text style={styles.sectionTitle}>Bio</Text>

          <View style={styles.bioBox}>
            <TextInput
              style={styles.editBioInput}
              value={bio}
              onChangeText={setBio}
              multiline
              maxLength={300}
              placeholder="Tell us about yourself"
              placeholderTextColor="#999999"
              textAlignVertical="top"
            />

            <Text style={styles.characterCount}>{bio.length}/300</Text>
          </View>

          <Text style={styles.sectionTitle}>Gender identity</Text>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.selectField}
            onPress={() => setGenderModal(true)}
          >
            <Text style={[
              styles.selectFieldText,
              !genderIdentity && styles.selectPlaceholder,
            ]}>
              {genderIdentity || 'Select gender identity'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#777777" />
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Height</Text>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.selectField}
            onPress={() => setHeightModal(true)}
          >
            <Text style={styles.selectFieldText}>{heightCm} cm</Text>
            <Ionicons name="chevron-down" size={20} color="#777777" />
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>You'll usually find me at..</Text>

          <View style={styles.locationsContainer}>
            {placeOptions.map((place) => {
              const selected = places.includes(place);

              return (
                <TouchableOpacity
                  key={place}
                  activeOpacity={0.8}
                  onPress={() => togglePlace(place)}
                  style={[
                    styles.locationChip,
                    selected && styles.locationChipSelected,
                  ]}
                >
                  <Text style={[
                    styles.locationChipText,
                    selected && styles.locationChipTextSelected,
                  ]}>
                    {selected ? '✓ ' : ''}
                    {place}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {errorMessage ? (
            <Text
              style={
                styles.errorText
              }
            >
              {errorMessage}
            </Text>
          ) : null}

          {/* Shared onboarding go button */}
          <OnboardingGoButton
            label={saving ? 'Saving...' : 'Start Now!'}
            loading={saving}
            disabled={saving}
            onPress={handleStart}
          />
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

            <ScrollView
              style={styles.genderOptionsScroll}
              contentContainerStyle={styles.genderOptionsContent}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
            >
              {genderOptions.map((option) => {
                const selected = genderIdentity === option;
                return (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.modalOption,
                      selected && styles.modalOptionSelected,
                    ]}
                    onPress={() => {
                      setGenderIdentity(option);
                      setGenderModal(false);
                    }}
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        selected && styles.modalOptionTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                    {selected ? (
                      <Ionicons name="checkmark-circle" size={21} color="#D95F77" />
                    ) : (
                      <View style={styles.unselectedRadio} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
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

            <Text style={styles.modalSubtitle}>เลื่อนเพื่อเลือกส่วนสูงของคุณ</Text>
            <View style={styles.heightPickerFrame}>
              <View pointerEvents="none" style={styles.heightSelectionHighlight} />
              <FlatList
                ref={heightListRef}
                data={heightOptions}
                keyExtractor={(item) => item}
                getItemLayout={(_, index) => ({
                  length: 44,
                  offset: 44 * index,
                  index,
                })}
                style={styles.heightList}
                contentContainerStyle={styles.heightListContent}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
                snapToInterval={44}
                snapToAlignment="start"
                decelerationRate="fast"
                bounces={false}
                onMomentumScrollEnd={(event) => {
                  const nextIndex = Math.round(event.nativeEvent.contentOffset.y / 44);
                  setHeightCm(Math.max(0, Math.min(250, nextIndex)));
                }}
                onScrollToIndexFailed={(info) => {
                  requestAnimationFrame(() => {
                    // Recover gracefully if the list has not measured yet.
                    heightListRef.current?.scrollToOffset({
                      offset: info.index * 44,
                      animated: false,
                    });
                  });
                }}
                renderItem={({ item }) => {
                  const selected = Number(item) === heightCm;
                  return (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={styles.heightItem}
                      onPress={() => {
                        const nextHeight = Number(item);
                        setHeightCm(nextHeight);
                        heightListRef.current?.scrollToOffset({
                          offset: nextHeight * 44,
                          animated: true,
                        });
                      }}
                    >
                      <Text style={[
                        styles.heightItemText,
                        selected && styles.heightItemTextSelected,
                      ]}>
                        {item}
                      </Text>
                      {selected ? <Text style={styles.heightUnit}>cm</Text> : null}
                    </TouchableOpacity>
                  );
                }}
              />
            </View>

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
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 35,
      bounciness: 4,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 28,
      bounciness: 6,
    }).start();
  };

  return (
    <Animated.View style={[style, styles.photoAnimated, { transform: [{ scale }] }]}>
      {image !== null ? (
        <View style={[styles.photoBox, styles.photoFilled]}>
          <Image source={{ uri: image }} style={styles.image} />
          <View style={styles.photoOverlay}>
            <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
          </View>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={onRemove}
            activeOpacity={0.7}
            accessibilityLabel="Remove photo"
          >
            <Ionicons name="close" size={16} color="#50333A" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.changePhotoTap}
            onPress={onPress}
            activeOpacity={0.75}
            onPressIn={pressIn}
            onPressOut={pressOut}
            accessibilityLabel="Change photo"
          >
            <Ionicons name="camera" size={17} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.photoBox, styles.photoEmpty]}
          onPress={onPress}
          activeOpacity={0.82}
          onPressIn={pressIn}
          onPressOut={pressOut}
          accessibilityLabel="Add photo"
        >
          <View style={styles.addPhotoIcon}>
            <Ionicons name="add" size={24} color="#C85C73" />
          </View>
          <Text style={styles.addPhotoText}>Add photo</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
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
    paddingTop: 0,
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
    marginLeft:15,
  },

  title: {
    fontSize: 30,
    lineHeight: 28,
    fontWeight: '700',
    color: '#560000',
    shadowColor: '#edd05a',
    shadowOffset: {
      width: 0.5,
      height: 3,
    },
    shadowOpacity: 0.4,
    shadowRadius: 4
  },

  photoContainer: {
    width: '100%',
    borderRadius: 22,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    shadowColor: '#C45C6D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 7,
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

  photoAnimated: {
    minWidth: 0,
  },

  photoBox: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.95)',
  },

  photoEmpty: {
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderColor: 'rgba(198,92,115,0.18)',
    borderStyle: 'dashed',
    padding: 5,
  },

  photoFilled: {
    borderColor: '#FFFFFF',
    shadowColor: '#9D455B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 7,
    elevation: 3,
  },

  addPhotoIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F2',
    marginBottom: 5,
  },

  addPhotoText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#75414D',
    textAlign: 'center',
  },

  addPhotoHint: {
    marginTop: 2,
    fontSize: 9,
    color: '#A77B83',
    textAlign: 'center',
  },

  photoOverlay: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    width: 27,
    height: 27,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(45,35,39,0.42)',
  },

  changePhotoTap: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 31,
    height: 31,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(45,35,39,0.58)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
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

  /* Form styling matched to Edit Profile */
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F08A8E',
    marginTop: 26,
    marginBottom: 12,
  },

  bioBox: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },

  editBioInput: {
    minHeight: 100,
    fontSize: 16,
    color: '#111111',
    padding: 0,
  },

  characterCount: {
    alignSelf: 'flex-end',
    fontSize: 12,
    color: '#999999',
  },

  selectField: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },

  selectFieldText: {
    flex: 1,
    fontSize: 16,
    color: '#222222',
  },

  selectPlaceholder: {
    color: '#999999',
  },

  locationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  locationChip: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },

  locationChipSelected: {
    borderColor: '#F08A8E',
    backgroundColor: '#FFF0E8',
  },

  locationChipText: {
    fontSize: 14,
    color: '#222222',
  },

  locationChipTextSelected: {
    color: '#C75D70',
    fontWeight: '600',
  },

  detailsCard: {
    marginTop: 18,
    borderRadius: 24,
    paddingHorizontal: 17,
    paddingTop: 17,
    paddingBottom: 20,
    borderWidth: 1,
    borderColor: '#fefdfa',
    shadowColor: '#C45C6D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 5,
  },

  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 19,
  },

  detailsHeaderIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginRight: 11,
    shadowColor: '#C45C6D',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 7,
    elevation: 2,
  },

  detailsHeaderCopy: {
    flex: 1,
  },

  detailsHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#482C35',
  },

  detailsSubheading: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 16,
    color: '#98737D',
  },

  label: {
    marginBottom: 8,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
    color: '#583642',
  },

  bioInput: {
    minHeight: 112,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F4DDE2',
    fontSize: 14,
    lineHeight: 21,
    color: '#442D35',
  },

  counter: {
    marginTop: 6,
    marginBottom: 19,
    textAlign: 'right',
    fontSize: 11,
    color: '#A17D86',
  },

  dropdown: {
    minHeight: 50,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 14,
    paddingRight: 9,
    marginBottom: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F4DDE2',
    shadowColor: '#A64D61',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },

  dropdownText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#50343D',
  },

  placeholderText: {
    color: '#999999',
  },

  dropdownIcon: {
    width: 31,
    height: 31,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F2',
  },

  placesTitle: {
    marginTop: 2,
    marginBottom: 11,
    fontSize: 13,
    fontWeight: '800',
    color: '#583642',
  },

  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',

    gap: 6,
  },

  chip: {
    minHeight: 34,
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1DDE1',
  },

  chipSelected: {
    backgroundColor: '#623D4A',
    borderColor: '#623D4A',
    shadowColor: '#A64D61',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 5,
    elevation: 2,
  },

  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#846873',
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
    alignSelf: 'stretch',
    marginTop: 18,
    borderRadius: 999,
    shadowColor: '#C85D73',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.24,
    shadowRadius: 12,
    elevation: 6,
  },

  disabledButton: {
    opacity: 0.65,
  },

  startButton: {
    minWidth: 98,
    height: 54,
    borderRadius: 999,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },

  startText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#44232D',
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
    maxWidth: 360,
    maxHeight: '78%',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: '#FFFDFD',
    borderWidth: 1,
    borderColor: '#F7E1E5',
    shadowColor: '#633342',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },

  genderOptionsScroll: {
    flexGrow: 0,
    maxHeight: 390,
  },

  genderOptionsContent: {
    paddingBottom: 6,
  },

  modalSubtitle: {
    marginTop: -2,
    marginBottom: 12,
    fontSize: 12,
    color: '#9B7882',
    textAlign: 'center',
  },

  heightPickerFrame: {
    height: 220,
    overflow: 'hidden',
    borderRadius: 20,
    backgroundColor: '#FFF5F6',
    borderWidth: 1,
    borderColor: '#F5DDE2',
    position: 'relative',
    marginTop: 3,
  },

  heightList: {
    flex: 1,
    zIndex: 1,
  },

  heightListContent: {
    paddingVertical: 88,
  },

  heightSelectionHighlight: {
    position: 'absolute',
    zIndex: 0,
    top: 88,
    left: 12,
    right: 12,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#FFE1E6',
    borderWidth: 1,
    borderColor: '#F7B8C6',
  },

  heightItem: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

  heightItemText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#B49AA1',
  },

  heightItemTextSelected: {
    fontSize: 20,
    fontWeight: '800',
    color: '#743D4D',
  },

  heightUnit: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B84F68',
  },

  modalOptionSelected: {
    backgroundColor: '#FFF0F3',
    borderRadius: 12,
    borderBottomColor: 'transparent',
    paddingHorizontal: 10,
  },

  modalOptionTextSelected: {
    fontWeight: '700',
    color: '#A8445D',
  },

  unselectedRadio: {
    width: 19,
    height: 19,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E7C9D0',
  },

  modalTitle: {
    marginBottom: 14,
    fontSize: 19,
    fontWeight: '800',
    color: '#50313D',
    textAlign: 'center',
  },

  heightWheelModalBox: {
    width: '100%',
    maxWidth: 350,
    borderRadius: 24,
    padding: 20,
    backgroundColor: '#FFFDFD',
    borderWidth: 1,
    borderColor: '#F7E1E5',
    shadowColor: '#633342',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
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
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0E2E5',
  },

  modalOptionText: {
    flex: 1,
    fontSize: 14,
    color: '#634A53',
  },
});
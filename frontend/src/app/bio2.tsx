import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Bio2Screen() {
  const router = useRouter();

  const [bio, setBio] = useState('');
  const [gender, setGender] = useState('');
  const [height, setHeight] = useState('');
  const [places, setPlaces] = useState<string[]>([]);

  const [genderModal, setGenderModal] = useState(false);
  const [heightModal, setHeightModal] = useState(false);

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
    'คณะบัญชี',
    'ครุ',
    'มนุษย์',
    'วิศวะ',
    'นิเทศ',
    'IT',
    'วิทย์',
    'แพทย์',
    'สังคมศาสตร์',
    'บริหาร 100',
    'ตึกเรียน 2',
    'รังสิต',
    'โรงอาหาร',
    'LGBTQ space',
  ];

  const togglePlace = (place: string) => {
    setPlaces((current) => {
      if (current.includes(place)) {
        return current.filter((item) => item !== place);
      }

      return [...current, place];
    });
  };

  const handleStart = () => {
    console.log('bio:', bio);
    console.log('gender:', gender);
    console.log('height:', height);
    console.log('places:', places);

    // ถ้าหน้าถัดไปคือหน้า Profile ให้เปลี่ยนเป็น:
    // router.push('/profile');

    // ตอนนี้กลับไปหน้าแรกก่อน
    router.push('/');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
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
              size={19}
              color="#111"
            />

            <Ionicons
              name="chevron-back"
              size={19}
              color="#111"
              style={styles.secondArrow}
            />
          </LinearGradient>
        </TouchableOpacity>

        {/* Main card */}
        <LinearGradient
          colors={['#FF7D82', '#FFAD72', '#FFE0A1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.mainCard}
        >
          {/* Bio */}
          <Text style={styles.label}>Bio</Text>

          <TextInput
            value={bio}
            onChangeText={setBio}
            multiline
            textAlignVertical="top"
            placeholder=""
            placeholderTextColor="#777"
            maxLength={300}
            style={styles.bioInput}
          />

          {/* Gender */}
          <Text style={styles.label}>Gender identity</Text>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.dropdown}
            onPress={() => setGenderModal(true)}
          >
            <Text
              style={[
                styles.dropdownText,
                !gender && styles.placeholderText,
              ]}
            >
              {gender || ''}
            </Text>

            <View style={styles.dropdownIcon}>
              <Ionicons
                name="chevron-down"
                size={17}
                color="#777"
              />
            </View>
          </TouchableOpacity>

          {/* Height */}
          <Text style={styles.label}>Height</Text>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.dropdown}
            onPress={() => setHeightModal(true)}
          >
            <Text
              style={[
                styles.dropdownText,
                !height && styles.placeholderText,
              ]}
            >
              {height || ''}
            </Text>

            <View style={styles.dropdownIcon}>
              <Ionicons
                name="chevron-down"
                size={17}
                color="#777"
              />
            </View>
          </TouchableOpacity>

          {/* Places */}
          <Text style={styles.placesTitle}>
            You’ll usually find me at..
          </Text>

          <View style={styles.chipsContainer}>
            {placeOptions.map((place) => {
              const selected = places.includes(place);

              return (
                <TouchableOpacity
                  key={place}
                  activeOpacity={0.8}
                  onPress={() => togglePlace(place)}
                  style={[
                    styles.chip,
                    selected && styles.chipSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selected && styles.chipTextSelected,
                    ]}
                  >
                    {place}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </LinearGradient>

        {/* Start button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleStart}
          style={styles.startButtonContainer}
        >
          <LinearGradient
            colors={['#FF7B82', '#FFAA70', '#FFD37B']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.startButton}
          >
            <Text style={styles.startText}>Start Now!</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* Gender Modal */}
      <Modal
        visible={genderModal}
        transparent
        animationType="fade"
        onRequestClose={() => setGenderModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setGenderModal(false)}
        >
          <Pressable
            style={styles.modalBox}
            onPress={(event) => event.stopPropagation()}
          >
            <Text style={styles.modalTitle}>
              Gender identity
            </Text>

            {genderOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.modalOption}
                onPress={() => {
                  setGender(option);
                  setGenderModal(false);
                }}
              >
                <Text style={styles.modalOptionText}>
                  {option}
                </Text>

                {gender === option && (
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color="#FF7B82"
                  />
                )}
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Height Modal */}
      <Modal
        visible={heightModal}
        transparent
        animationType="fade"
        onRequestClose={() => setHeightModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setHeightModal(false)}
        >
          <Pressable
            style={styles.heightModalBox}
            onPress={(event) => event.stopPropagation()}
          >
            <Text style={styles.modalTitle}>
              Height
            </Text>

            <ScrollView
              style={styles.heightList}
              showsVerticalScrollIndicator={false}
            >
              {heightOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.modalOption}
                  onPress={() => {
                    setHeight(option);
                    setHeightModal(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>
                    {option}
                  </Text>

                  {height === option && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color="#FF7B82"
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  scrollContent: {
    paddingHorizontal: 10,
    paddingTop: 14,
    paddingBottom: 35,
  },

  // Back
  backButton: {
    width: 43,
    height: 29,
    borderRadius: 18,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.18,
    shadowRadius: 2,
    elevation: 3,
  },

  backGradient: {
    flex: 1,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  secondArrow: {
    marginLeft: -13,
  },

  // Main
  mainCard: {
    marginTop: 8,
    borderRadius: 13,
    paddingHorizontal: 7,
    paddingTop: 11,
    paddingBottom: 15,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 4,
  },

  label: {
    fontSize: 13,
    fontWeight: '800',
    color: '#080808',
    marginBottom: 5,
  },

  bioInput: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 8,

    fontSize: 13,
    color: '#111111',

    marginBottom: 13,
  },

  // Dropdown
  dropdown: {
    height: 27,
    backgroundColor: '#FFFFFF',
    borderRadius: 9,

    flexDirection: 'row',
    alignItems: 'center',

    paddingLeft: 10,
    paddingRight: 4,

    marginBottom: 11,
  },

  dropdownText: {
    flex: 1,
    fontSize: 12,
    color: '#111',
  },

  placeholderText: {
    color: '#999',
  },

  dropdownIcon: {
    width: 21,
    height: 21,
    borderRadius: 11,

    backgroundColor: '#E1E1E1',

    alignItems: 'center',
    justifyContent: 'center',
  },

  // Places
  placesTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#080808',

    marginTop: 0,
    marginBottom: 7,
  },

  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },

  chip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,

    paddingHorizontal: 9,
    paddingVertical: 5,

    minHeight: 24,

    alignItems: 'center',
    justifyContent: 'center',
  },

  chipSelected: {
    backgroundColor: '#111111',
  },

  chipText: {
    fontSize: 9,
    color: '#555',
  },

  chipTextSelected: {
    color: '#FFFFFF',
  },

  // Start
  startButtonContainer: {
    alignSelf: 'flex-end',
    marginTop: 10,

    borderRadius: 18,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.16,
    shadowRadius: 2,
    elevation: 3,
  },

  startButton: {
    minWidth: 64,
    height: 29,

    borderRadius: 18,

    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: 11,
  },

  startText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#111',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',

    justifyContent: 'center',
    alignItems: 'center',

    paddingHorizontal: 25,
  },

  modalBox: {
    width: '100%',
    maxWidth: 350,

    backgroundColor: '#FFFFFF',
    borderRadius: 18,

    padding: 18,
  },

  heightModalBox: {
    width: '100%',
    maxWidth: 350,
    height: 420,

    backgroundColor: '#FFFFFF',
    borderRadius: 18,

    padding: 18,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111',

    marginBottom: 8,
  },

  heightList: {
    flex: 1,
  },

  modalOption: {
    minHeight: 43,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5E5',
  },

  modalOptionText: {
    fontSize: 14,
    color: '#111',
  },
});
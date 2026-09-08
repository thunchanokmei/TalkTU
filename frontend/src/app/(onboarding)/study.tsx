import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

const generations = [87, 88, 89, 90, 91, 92];

export default function StudyScreen() {
  const { width, height } = useWindowDimensions();

  const [generation, setGeneration] = useState<number | null>(null);
  const [showGenerations, setShowGenerations] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // TEMPORARY
  // ภายหลังอ่านจาก student_accounts.faculty
  const faculty = 'Faculty of Engineering';

  const handleContinue = () => {
    setErrorMessage('');

    if (!generation) {
      setErrorMessage('Please select your TU generation.');
      return;
    }

    console.log({
      faculty,
      generation,
    });

    router.push('/gender');
  };

  const handleBack = () => {
    router.replace('/birthday');
  };

  return (
    <LinearGradient
      colors={['#FF7F87', '#FFA577', '#FFE8C8']}
      locations={[0, 0.45, 1]}
      style={styles.screen}
    >
      <Pressable
        style={[
          styles.backButton,
          {
            top: height * 0.04,
            left: width * 0.07,
            width: width * 0.11,
            height: width * 0.065,
          },
        ]}
        onPress={handleBack}
      >
        <LinearGradient
          colors={['#FFE98F', '#FFB873']}
          style={styles.backGradient}
        >
          <Text style={styles.backText}>{'<<'}</Text>
        </LinearGradient>
      </Pressable>

      <View
        style={[
          styles.content,
          {
            paddingHorizontal: width * 0.1,
            paddingTop: height * 0.14,
          },
        ]}
      >
        <Text
          style={[
            styles.title,
            {
              fontSize: Math.max(21, width * 0.055),
            },
          ]}
        >
          What do you{'\n'}study? 👀
        </Text>

        <Text style={styles.label}>Faculty</Text>

        <View style={styles.readOnlyField}>
          <Text style={styles.fieldText}>
            {faculty}
          </Text>
        </View>

        <Text style={styles.label}>
          What TU generation are you in?
        </Text>

        <Pressable
          style={styles.selectField}
          onPress={() => setShowGenerations(!showGenerations)}
        >
          <Text style={styles.fieldText}>
            {generation ? `TU${generation}` : ''}
          </Text>

          <Text style={styles.arrow}>▼</Text>
        </Pressable>

        {showGenerations ? (
          <View style={styles.dropdown}>
            {generations.map((item) => (
              <Pressable
                key={item}
                style={styles.dropdownItem}
                onPress={() => {
                  setGeneration(item);
                  setShowGenerations(false);
                }}
              >
                <Text style={styles.dropdownText}>
                  TU{item}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        {errorMessage ? (
          <Text style={styles.errorText}>
            {errorMessage}
          </Text>
        ) : null}

        <Pressable
          style={styles.goButton}
          onPress={handleContinue}
        >
          <Text style={styles.goText}>go!</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  content: {
    flex: 1,
  },

  backButton: {
    position: 'absolute',
    borderRadius: 999,
    overflow: 'hidden',
    zIndex: 20,
  },

  backGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  backText: {
    fontWeight: '500',
    fontSize: 13,
  },

  title: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 28,

    textShadowColor: 'rgba(75,50,45,0.35)',
    textShadowOffset: {
      width: 1,
      height: 2,
    },
    textShadowRadius: 2,
  },

  label: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 14,
  },

  readOnlyField: {
    width: '100%',
    minHeight: 44,
    borderRadius: 13,
    backgroundColor: '#F3F3F3',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },

  selectField: {
    width: '100%',
    minHeight: 44,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  fieldText: {
    color: '#333333',
    fontSize: 14,
  },

  arrow: {
    color: '#FFA06E',
    fontSize: 16,
  },

  dropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 5,
    overflow: 'hidden',
  },

  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },

  dropdownText: {
    fontSize: 14,
  },

  errorText: {
    color: '#C62828',
    fontSize: 12,
    marginTop: 8,
  },

  goButton: {
    alignSelf: 'flex-end',
    marginTop: 16,
    paddingHorizontal: 18,
    minHeight: 34,
    borderRadius: 12,
    backgroundColor: '#FFF6AE',
    justifyContent: 'center',
  },

  goText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
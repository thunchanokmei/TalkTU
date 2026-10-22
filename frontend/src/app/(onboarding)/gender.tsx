import {
  useEffect,
  useState,
} from 'react';

import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import {
  LinearGradient,
} from 'expo-linear-gradient';

import {
  router,
} from 'expo-router';

import {
  getSexAtBirth,
  saveSexAtBirth,
  type SexAtBirth,
} from '../../features/onboarding/services/onboardingService';

import OnboardingBackButton from '../../components/navigation/OnboardingBackButton';
import OnboardingGoButton from '../../components/navigation/OnboardingGoButton';

export default function GenderScreen() {
  const {
    width,
    height,
  } = useWindowDimensions();

  const [
    gender,
    setGender,
  ] = useState<SexAtBirth | null>(null);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('');

  useEffect(() => {
    const loadGender = async () => {
      try {
        const value = await getSexAtBirth();

        if (value) {
          setGender(value);
        }
      } catch (error) {
        console.error(
          'Load gender error:',
          error
        );
      }
    };

    loadGender();
  }, []);

  const handleContinue = async () => {
    if (!gender) {
      setErrorMessage('Please select one option.');
      return;
    }

    setErrorMessage('');

    try {
      await saveSexAtBirth(gender);
      router.push('/mode');
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to save your sex.'
      );
    }
  };

  const backTop = Math.max(20, height * 0.04);
  const backLeft = Math.max(20, width * 0.07);

  return (
    <LinearGradient
      colors={[
        '#FF7F87',
        '#FFA577',
        '#FFE8C8',
      ]}
      locations={[
        0,
        0.45,
        1,
      ]}
      style={styles.screen}
    >
      <OnboardingBackButton
        top={backTop}
        left={backLeft}
        onPress={() => router.replace('/study')}
      />

      <View
        style={[
          styles.content,
          {
            paddingHorizontal: Math.max(24, width * 0.1),
            paddingTop: Math.max(110, height * 0.17),
          },
        ]}
      >
        <Text
          style={[
            styles.title,
            {
              fontSize: Math.max(40, width * 0.065),
             
            },
          ]}
        >
          What's your{'\n'}
          Sex at birth ? 👶
        </Text>

        <ChoiceRow
          label="Male"
          selected={gender === 'male'}
          onPress={() => {
            setGender('male');
            setErrorMessage('');
          }}
        />

        <ChoiceRow
          label="Female"
          selected={gender === 'female'}
          onPress={() => {
            setGender('female');
            setErrorMessage('');
          }}
        />

        {errorMessage ? (
          <Text style={styles.errorText}>
            {errorMessage}
          </Text>
        ) : null}

        {gender ? (
          <OnboardingGoButton
            onPress={handleContinue}
            label="Next!"
          />
        ) : null}
      </View>
    </LinearGradient>
  );
}

function ChoiceRow({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <Pressable
      style={[
        styles.choice,
        hovered && styles.choiceHovered,
        selected && styles.choiceSelected,
        selected && hovered && styles.choiceSelectedHovered,
      ]}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
    >
      <Text
        style={[
          styles.choiceText,
          hovered && styles.choiceTextHovered,
          selected && styles.choiceTextSelected,
        ]}
      >
        {label}
      </Text>

      <View
        style={[
          styles.circle,
          hovered && styles.circleHovered,
          selected && styles.circleSelected,
        ]}
      >
        {selected ? <View style={styles.circleDot} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  content: {
    flex: 1,
  },

  title: {
    marginBottom: 20,
    color: '#FFFFFF',
    fontWeight: '600',
    textShadowColor: 'rgba(75,50,45,0.35)',
    textShadowOffset: {
      width: 1,
      height: 2,
    },
    textShadowRadius: 2,
  },

  choice: {
    width: '100%',
    height:'7%',
    minHeight: 48,
    marginBottom:0,
    marginTop:15,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.75)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',

    shadowColor: '#8D5140',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 4,
  },

  choiceHovered: {
    backgroundColor: '#FFE0EC',
    borderColor: '#F08AB3',
    shadowColor: '#C94F83',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },

  choiceSelected: {
    backgroundColor: '#FFFABF',
    borderColor: '#fff8a5',
    borderWidth: 2,
    shadowColor: '#FFFABF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.28,
    shadowRadius: 6,
    elevation: 6,
  },

  choiceSelectedHovered: {
    backgroundColor: '#FFFABF',
    borderColor: '#FFFABF',
  },

  choiceText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '400',
  },

  choiceTextHovered: {
    color: '#B83D73',
  },

  choiceTextSelected: {
    color: '#B83D73',
    fontWeight: '700',
  },

  circle: {
    width: 20,
    height: 20,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: '#eae9e9',
    backgroundColor: '#f4dfd7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  circleHovered: {
    borderColor: '#FFE1E1',
    backgroundColor: '#FFD1E4',
  },

  circleSelected: {
    borderColor: '#FFE1E1',
    backgroundColor: '#FFE1E1',
  },

  circleDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
  },

  errorText: {
    marginTop: 7,
    color: '#C62828',
  },
});

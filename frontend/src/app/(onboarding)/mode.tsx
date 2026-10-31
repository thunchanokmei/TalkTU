import { useState } from 'react';

import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';

import { useFonts } from '@expo-google-fonts/google-sans/useFonts';
import { GoogleSans_400Regular } from '@expo-google-fonts/google-sans/400Regular';
import { GoogleSans_500Medium } from '@expo-google-fonts/google-sans/500Medium';
import { GoogleSans_600SemiBold } from '@expo-google-fonts/google-sans/600SemiBold';

import { saveMode } from '../../features/onboarding/services/onboardingService';

import OnboardingBackButton from '../../components/navigation/OnboardingBackButton';
import OnboardingGoButton from '../../components/navigation/OnboardingGoButton';

type Mode = 'date' | 'friends';

export default function ModeScreen() {
    const { width, height } = useWindowDimensions();
    const { name } = useLocalSearchParams<{
        name?: string;
    }>();
    const shortSide = Math.min(width, height);

  const [mode, setMode] =
    useState<Mode | null>(null);

  const [errorMessage, setErrorMessage] =
    useState('');

  /*
   * ============================
   * FONT
   * ============================
   */

  const [fontsLoaded] = useFonts({
    GoogleSans:
      GoogleSans_400Regular,

    GoogleSansMedium:
      GoogleSans_500Medium,

    GoogleSansSemiBold:
      GoogleSans_600SemiBold,
  });

  /*
   * ============================
   * RESPONSIVE SIZE
   * ============================
   */

  const horizontalPadding =
    Math.max(
      24,
      width * 0.1
    );

  const titleSize =
     Math.max(
      25,
      Math.min(
        shortSide * 0.1,
        40
      )
    );

  const backButtonWidth =
    Math.max(
      42,
      Math.min(
        shortSide * 0.12,
        64
      )
    );

  const backButtonHeight =
    Math.max(
      28,
      Math.min(
        shortSide * 0.072,
        38
      )
    );

  /*
   * ============================
   * BACK
   * ============================
   */

  const handleBack = () => {
    router.replace('/gender');
  };

  /*
   * ============================
   * CONTINUE
   * ============================
   */

const handleContinue = async () => {
  setErrorMessage('');

  if (!mode) {
    setErrorMessage(
      'Please select what you are looking for.'
    );
    return;
  }

  try {
    await saveMode(mode);

    if (mode === 'date') {
      router.push({
        pathname: '/interested-in',
        params: { name },
      });
      return;
    }

    // Friends mode ไม่ต้องเลือก interested_in
    router.push({
      pathname: '/bio1',
      params: { name },
    });
  } catch (error) {
    console.error('Mode save error:', error);

    setErrorMessage(
      'Something went wrong. Please try again.'
    );
  }
};

  /*
   * ============================
   * WAIT FOR FONT
   * ============================
   */

  if (!fontsLoaded) {
    return null;
  }

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
        top={Math.max(20, height * 0.04)}
        left={Math.max(20, width * 0.07)}
        onPress={handleBack}
      />

      {/* =========================
          CONTENT
          ========================= */}

      <View
        style={[
          styles.content,
          {
            paddingHorizontal:
              horizontalPadding,

            paddingTop:
              Math.max(
                110,
                height * 0.17
              ),
          },
        ]}
      >
        {/* =========================
            TITLE
            ========================= */}

        <Text
          style={[
            styles.title,
            {
              fontSize:titleSize,
              lineHeight:titleSize * 1.15,
              marginTop:10,
              marginBottom: 20,
            },
          ]}
        >
          What you
          {'\n'}
          looking for?
        </Text>

        {/* =========================
            OPTIONS
            ========================= */}

        <ChoiceRow
          label="Date"
          selected={
            mode === 'date'
          }
          onPress={() => {
            setMode('date');
            setErrorMessage('');
          }}
        />

        <ChoiceRow
          label="Friends"
          selected={
            mode === 'friends'
          }
          onPress={() => {
            setMode('friends');
            setErrorMessage('');
          }}
        />

        {/* =========================
            ERROR
            ========================= */}

        {errorMessage ? (
          <Text
            style={[
              styles.errorText,
              {
                fontSize:
                  Math.max(
                    11,
                    Math.min(
                      shortSide *
                        0.03,
                      15
                    )
                  ),
              },
            ]}
          >
            {errorMessage}
          </Text>
        ) : null}

        {mode ? (
          <OnboardingGoButton
            onPress={handleContinue}
            label="go!"
          />
        ) : null}
      </View>
    </LinearGradient>
  );
}

/*
 * ======================================================
 * CHOICE ROW
 * ======================================================
 */

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

/*
 * ======================================================
 * STYLES
 * ======================================================
 */

const styles = StyleSheet.create({
  /*
   * ============================
   * SCREEN
   * ============================
   */
  screen: {
    flex: 1,
    width: '100%',
  },
  content: {
    flex: 1,
  },

  /*
   * ============================
   * BACK BUTTON
   * ============================
   */

  backButton: {
    position: 'absolute',
    zIndex: 20,
    borderRadius: 999,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.22,
    shadowRadius: 4,
    elevation: 5,
  },
  backGradient: {
    flex: 1,
    width: '100%',
    height: '100%',
    borderRadius: 999,
    justifyContent:'center',
    alignItems: 'center',
  },
  backText: {
    fontFamily: 'GoogleSansMedium',
    color: '#222222',
  },

  /*
   * ============================
   * TITLE
   * ============================
   */

  title: {
    fontFamily:
      'GoogleSansSemiBold',

    fontWeight: '600',

    color: '#FFFFFF',

    marginBottom: 20,

    textShadowColor:
      'rgba(75, 50, 45, 0.35)',

    textShadowOffset: {
      width: 1,
      height: 2,
    },

    textShadowRadius: 2,
  },

  /*
   * ============================
   * CHOICE
   * ============================
   */

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

  /*
   * ============================
   * CIRCLE
   * ============================
   */

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

  /*
   * ============================
   * ERROR
   * ============================
   */

  errorText: {
    fontFamily:
      'GoogleSans',

    color: '#C62828',

    marginTop: 7,
  },

  /*
   * ============================
   * GO BUTTON
   * ============================
   */

  goButton: {
    alignSelf:
      'flex-end',
    paddingHorizontal: 14,
    marginTop: 16,
    borderRadius: 12,
    backgroundColor:'#FFF6AE',
    justifyContent:'center',
    alignItems:'center',
    shadowColor:'#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.28,
    shadowRadius: 5,
    elevation: 6,
  },
  goText: {
    fontFamily:'GoogleSansSemiBold',
    fontWeight: '600',
    color: '#111111',
    textShadowColor:'rgba(0, 0, 0, 0.15)',
    textShadowOffset: {
      width: 0,
      height: 1,
    },
    textShadowRadius: 1,
  },
});
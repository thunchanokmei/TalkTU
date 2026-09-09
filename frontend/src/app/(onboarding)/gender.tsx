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

import { useFonts } from '@expo-google-fonts/google-sans/useFonts';
import { GoogleSans_400Regular } from '@expo-google-fonts/google-sans/400Regular';
import { GoogleSans_500Medium } from '@expo-google-fonts/google-sans/500Medium';
import { GoogleSans_600SemiBold } from '@expo-google-fonts/google-sans/600SemiBold';

import { saveSexAtBirth } from '../../features/onboarding/services/onboardingService';

type Gender = 'male' | 'female';

export default function GenderScreen() {
  const { width, height } = useWindowDimensions();

  const shortSide = Math.min(width, height);

  const [gender, setGender] =
    useState<Gender | null>(null);

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
      20,
      Math.min(
        shortSide * 0.055,
        30
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
   * CONTINUE
   * ============================
   */

  const handleContinue =
    async () => {
      setErrorMessage('');

      if (!gender) {
        setErrorMessage(
          'Please select your gender.'
        );
        return;
      }

      try {
        await saveSexAtBirth(
          gender
        );

        console.log(
          'sex_at_birth saved:',
          gender
        );

        router.push('/mode');
      } catch (error) {
        console.error(
          'Save gender error:',
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Unable to save your gender.'
        );
      }
    };

  /*
   * ============================
   * BACK
   * ============================
   */

  const handleBack = () => {
    router.replace('/study');
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
      {/* =========================
          BACK BUTTON
          ========================= */}

      <Pressable
        style={[
          styles.backButton,
          {
            top: Math.max(
              20,
              height * 0.04
            ),

            left: Math.max(
              20,
              width * 0.07
            ),

            width:
              backButtonWidth,

            height:
              backButtonHeight,
          },
        ]}
        onPress={handleBack}
      >
        <LinearGradient
          colors={[
            '#FFE98F',
            '#FFB873',
          ]}
          start={{
            x: 0,
            y: 0,
          }}
          end={{
            x: 1,
            y: 1,
          }}
          style={
            styles.backGradient
          }
        >
          <Text
            style={[
              styles.backText,
              {
                fontSize:
                  Math.max(
                    12,
                    Math.min(
                      shortSide *
                        0.033,
                      17
                    )
                  ),
              },
            ]}
          >
            {'<<'}
          </Text>
        </LinearGradient>
      </Pressable>

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
              fontSize:
                titleSize,

              lineHeight:
                titleSize * 1.15,
            },
          ]}
        >
          What's your
          {'\n'}
          Gender
        </Text>

        {/* =========================
            CHOICES
            ========================= */}

        <ChoiceRow
          label="Men"
          selected={
            gender === 'male'
          }
          onPress={() => {
            setGender('male');
            setErrorMessage('');
          }}
        />

        <ChoiceRow
          label="Women"
          selected={
            gender === 'female'
          }
          onPress={() => {
            setGender('female');
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

        {/* =========================
            GO BUTTON
            ========================= */}

        {gender ? (
          <Pressable
            style={[
              styles.goButton,
              {
                minWidth:
                  Math.max(
                    58,
                    Math.min(
                      shortSide *
                        0.15,
                      84
                    )
                  ),

                height:
                  Math.max(
                    34,
                    Math.min(
                      height *
                        0.045,
                      44
                    )
                  ),
              },
            ]}
            onPress={
              handleContinue
            }
          >
            <Text
              style={[
                styles.goText,
                {
                  fontSize:
                    Math.max(
                      15,
                      Math.min(
                        shortSide *
                          0.04,
                        20
                      )
                    ),
                },
              ]}
            >
              go!
            </Text>
          </Pressable>
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
  return (
    <Pressable
      style={[
        styles.choice,
        selected &&
          styles.choiceSelected,
      ]}
      onPress={onPress}
    >
      <Text
        style={
          styles.choiceText
        }
      >
        {label}
      </Text>

      <View
        style={[
          styles.circle,
          selected &&
            styles.circleSelected,
        ]}
      />
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

    shadowColor:
      '#000000',

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

    justifyContent:
      'center',

    alignItems:
      'center',
  },

  backText: {
    fontFamily:
      'GoogleSansMedium',

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

    minHeight: 44,

    backgroundColor:
      '#FFFFFF',

    borderRadius: 12,

    paddingHorizontal: 16,

    marginBottom: 10,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent:
      'space-between',

    shadowColor:
      '#000000',

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.15,

    shadowRadius: 3,

    elevation: 3,
  },

  choiceSelected: {
    backgroundColor:
      '#FFF9E8',
  },

  choiceText: {
    fontFamily:
      'GoogleSans',

    fontSize: 16,

    color: '#333333',
  },

  /*
   * ============================
   * CIRCLE
   * ============================
   */

  circle: {
    width: 16,

    height: 16,

    borderRadius: 999,

    backgroundColor:
      '#F2D3C3',
  },

  circleSelected: {
    backgroundColor:
      '#F19068',
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

    backgroundColor:
      '#FFF6AE',

    justifyContent:
      'center',

    alignItems:
      'center',

    shadowColor:
      '#000000',

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.28,

    shadowRadius: 5,

    elevation: 6,
  },

  goText: {
    fontFamily:
      'GoogleSansSemiBold',

    fontWeight: '600',

    color: '#111111',

    textShadowColor:
      'rgba(0, 0, 0, 0.15)',

    textShadowOffset: {
      width: 0,
      height: 1,
    },

    textShadowRadius: 1,
  },
});
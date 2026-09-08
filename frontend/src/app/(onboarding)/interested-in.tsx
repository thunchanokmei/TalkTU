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

import { saveDatingPreferences } from '../../features/onboarding/services/onboardingService';

type Interest =
  | 'men'
  | 'women'
  | 'beyond_binary';

export default function InterestedInScreen() {
  const { width, height } = useWindowDimensions();

  const shortSide = Math.min(width, height);

  const [selected, setSelected] =
    useState<Interest[]>([]);

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

  const choiceHeight =
    Math.max(
      44,
      Math.min(
        height * 0.055,
        56
      )
    );

  /*
   * ============================
   * TOGGLE INTEREST
   * ============================
   */

  const toggleInterest = (
    value: Interest
  ) => {
    setErrorMessage('');

    setSelected((current) => {
      if (current.includes(value)) {
        return current.filter(
          (item) => item !== value
        );
      }

      return [
        ...current,
        value,
      ];
    });
  };

  /*
   * ============================
   * BACK
   * ============================
   */

  const handleBack = () => {
    router.replace('/mode');
  };

  /*
   * ============================
   * CONTINUE
   * ============================
   */

  const handleContinue =
    async () => {
      setErrorMessage('');

      if (
        selected.length === 0
      ) {
        setErrorMessage(
          'Please select at least one option.'
        );
        return;
      }

      try {
        await saveDatingPreferences(
          selected
        );

        console.log(
          'Preferences saved:',
          selected
        );

        router.push('/bio1');
      } catch (error) {
        console.error(
          'Save preferences error:',
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Unable to save your dating preferences.'
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
                height * 0.18
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
                titleSize * 1.12,
            },
          ]}
        >
          Who u wanna{'\n'}date ?
        </Text>

        {/* =========================
            OPTIONS
            ========================= */}

        <ChoiceRow
          label="Men"
          selected={selected.includes(
            'men'
          )}
          height={choiceHeight}
          onPress={() =>
            toggleInterest('men')
          }
        />

        <ChoiceRow
          label="Women"
          selected={selected.includes(
            'women'
          )}
          height={choiceHeight}
          onPress={() =>
            toggleInterest(
              'women'
            )
          }
        />

        <ChoiceRow
          label="Beyond Binary"
          selected={selected.includes(
            'beyond_binary'
          )}
          height={choiceHeight}
          onPress={() =>
            toggleInterest(
              'beyond_binary'
            )
          }
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

        {selected.length > 0 ? (
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
  height,
  onPress,
}: {
  label: string;
  selected: boolean;
  height: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[
        styles.choice,
        {
          height,
        },
      ]}
      onPress={onPress}
    >
      <Text
        style={styles.choiceText}
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

    marginBottom: 30,

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

    backgroundColor:
      '#FFFFFF',

    borderRadius: 14,

    paddingHorizontal: 16,

    marginBottom: 10,

    flexDirection: 'row',

    alignItems:
      'center',

    justifyContent:
      'space-between',

    shadowColor:
      '#000000',

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.12,

    shadowRadius: 3,

    elevation: 3,
  },

  choiceText: {
    fontFamily:
      'GoogleSansMedium',

    fontSize: 14,

    fontWeight: '500',

    color: '#222222',
  },

  /*
   * ============================
   * SELECTION CIRCLE
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
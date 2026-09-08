import { useEffect, useState } from 'react';

import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import {
  getMyFaculty,
  getTuGenerations,
  saveTuGeneration,
} from '../../features/onboarding/services/onboardingService';

import { useFonts } from '@expo-google-fonts/google-sans/useFonts';
import { GoogleSans_400Regular } from '@expo-google-fonts/google-sans/400Regular';
import { GoogleSans_500Medium } from '@expo-google-fonts/google-sans/500Medium';
import { GoogleSans_600SemiBold } from '@expo-google-fonts/google-sans/600SemiBold';

export default function StudyScreen() {
  const { width, height } = useWindowDimensions();
  const shortSide = Math.min(width, height);

  const [faculty, setFaculty] = useState('Loading...');
  const [generations, setGenerations] = useState<number[]>([]);
  const [generation, setGeneration] = useState<number | null>(null);
  const [showGenerations, setShowGenerations] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  /*
   * ============================
   * FONT
   * ============================
   */

  const [fontsLoaded] = useFonts({
    GoogleSans: GoogleSans_400Regular,
    GoogleSansMedium: GoogleSans_500Medium,
    GoogleSansSemiBold: GoogleSans_600SemiBold,
  });

  /*
   * ============================
   * RESPONSIVE SIZE
   * ============================
   */

  const horizontalPadding = Math.max(
    24,
    width * 0.1
  );

  const titleSize = Math.max(
    20,
    Math.min(shortSide * 0.055, 30)
  );

  const fieldHeight = Math.max(
    44,
    Math.min(height * 0.055, 56)
  );

  const backButtonWidth = Math.max(
    42,
    Math.min(shortSide * 0.12, 64)
  );

  const backButtonHeight = Math.max(
    28,
    Math.min(shortSide * 0.072, 38)
  );

  /*
   * ============================
   * LOAD STUDY DATA
   * ============================
   */

  useEffect(() => {
    const loadStudyData = async () => {
      try {
        const [
          facultyValue,
          generationValues,
        ] = await Promise.all([
          getMyFaculty(),
          getTuGenerations(),
        ]);

        setFaculty(
          facultyValue ??
            'Faculty information unavailable'
        );

        setGenerations(
          generationValues
        );
      } catch (error) {
        console.error(
          'Load study data error:',
          error
        );

        setFaculty(
          'Faculty information unavailable'
        );
      }
    };

    loadStudyData();
  }, []);

  /*
   * ============================
   * CONTINUE
   * ============================
   */

  const handleContinue = async () => {
    setErrorMessage('');

    if (generation === null) {
      setErrorMessage(
        'Please select your TU generation.'
      );
      return;
    }

    try {
      await saveTuGeneration(
        generation
      );

      console.log(
        'TU generation saved:',
        generation
      );

      router.push('/gender');
    } catch (error) {
      console.error(
        'Save generation error:',
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to save your TU generation.'
      );
    }
  };

  /*
   * ============================
   * BACK
   * ============================
   */

  const handleBack = () => {
    router.replace('/birthday');
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
                      shortSide * 0.033,
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
                height * 0.14
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
          What do you
          {'\n'}
          study? 👀
        </Text>

        {/* =========================
            FACULTY
            ========================= */}

        <Text
          style={[
            styles.label,
            {
              fontSize:
                Math.max(
                  13,
                  Math.min(
                    shortSide * 0.032,
                    16
                  )
                ),
            },
          ]}
        >
          Faculty
        </Text>

        <View
          style={[
            styles.readOnlyField,
            {
              height: fieldHeight,
            },
          ]}
        >
          <Text
            style={[
              styles.fieldText,
              {
                fontSize:
                  Math.max(
                    14,
                    Math.min(
                      shortSide * 0.035,
                      17
                    )
                  ),
              },
            ]}
          >
            {faculty}
          </Text>
        </View>

        {/* =========================
            TU GENERATION
            ========================= */}

        <Text
          style={[
            styles.label,
            {
              fontSize:
                Math.max(
                  13,
                  Math.min(
                    shortSide * 0.032,
                    16
                  )
                ),
            },
          ]}
        >
          What TU generation are you in?
        </Text>

        <Pressable
          style={[
            styles.selectField,
            {
              height: fieldHeight,
            },
          ]}
          onPress={() =>
            setShowGenerations(
              !showGenerations
            )
          }
        >
          <Text
            style={[
              styles.fieldText,
              {
                fontSize:
                  Math.max(
                    14,
                    Math.min(
                      shortSide * 0.035,
                      17
                    )
                  ),
              },
            ]}
          >
            {generation
              ? `TU${generation}`
              : ''}
          </Text>

          <Text
            style={[
              styles.arrow,
              {
                fontSize:
                  Math.max(
                    14,
                    Math.min(
                      shortSide * 0.035,
                      17
                    )
                  ),
              },
            ]}
          >
            ▼
          </Text>
        </Pressable>

        {/* =========================
            DROPDOWN
            ========================= */}

        {showGenerations ? (
          <View
            style={styles.dropdown}
          >
            {generations.map(
              (item) => (
                <Pressable
                  key={item}
                  style={
                    styles.dropdownItem
                  }
                  onPress={() => {
                    setGeneration(
                      item
                    );
                    setShowGenerations(
                      false
                    );
                    setErrorMessage(
                      ''
                    );
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownText,
                      {
                        fontSize:
                          Math.max(
                            14,
                            Math.min(
                              shortSide *
                                0.035,
                              17
                            )
                          ),
                      },
                    ]}
                  >
                    TU{item}
                  </Text>
                </Pressable>
              )
            )}
          </View>
        ) : null}

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
                      shortSide * 0.03,
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

        <Pressable
          style={[
            styles.goButton,
            {
              minWidth:
                Math.max(
                  58,
                  Math.min(
                    shortSide * 0.15,
                    84
                  )
                ),

              height:
                Math.max(
                  34,
                  Math.min(
                    height * 0.045,
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
                      shortSide * 0.04,
                      20
                    )
                  ),
              },
            ]}
          >
            go!
          </Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

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
   * LABEL
   * ============================
   */

  label: {
    fontFamily:
      'GoogleSansMedium',

    color: '#FFFFFF',

    marginBottom: 8,

    marginTop: 14,

    textShadowColor:
      'rgba(75, 50, 45, 0.25)',

    textShadowOffset: {
      width: 1,
      height: 1,
    },

    textShadowRadius: 2,
  },

  /*
   * ============================
   * READ ONLY FACULTY
   * ============================
   */

  readOnlyField: {
    width: '100%',

    borderRadius: 12,

    backgroundColor:
      '#F3F3F3',

    justifyContent:
      'center',

    paddingHorizontal: 16,

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

  /*
   * ============================
   * SELECT FIELD
   * ============================
   */

  selectField: {
    width: '100%',

    borderRadius: 12,

    backgroundColor:
      '#FFFFFF',

    paddingHorizontal: 16,

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

  fieldText: {
    fontFamily:
      'GoogleSans',

    color: '#333333',
  },

  arrow: {
    fontFamily:
      'GoogleSansMedium',

    color: '#FFA06E',
  },

  /*
   * ============================
   * DROPDOWN
   * ============================
   */

  dropdown: {
    width: '100%',

    backgroundColor:
      '#FFFFFF',

    borderRadius: 12,

    marginTop: 5,

    overflow: 'hidden',

    shadowColor:
      '#000000',

    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.15,

    shadowRadius: 4,

    elevation: 4,

    zIndex: 10,
  },

  dropdownItem: {
    paddingVertical: 10,

    paddingHorizontal: 16,
  },

  dropdownText: {
    fontFamily:
      'GoogleSans',

    color: '#333333',
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
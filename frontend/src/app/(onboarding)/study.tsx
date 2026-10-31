import { useEffect, useState } from 'react';

import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import OnboardingBackButton from '../../components/navigation/OnboardingBackButton';
import OnboardingGoButton from '../../components/navigation/OnboardingGoButton';
import { router, useLocalSearchParams } from 'expo-router';

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
  const { name } = useLocalSearchParams<{
    name?: string;
  }>();

  const [faculty, setFaculty] = useState('Loading...');
  const [generations, setGenerations] = useState<number[]>([]);
  const [generation, setGeneration] = useState<number | null>(null);
  const [showGenerations, setShowGenerations] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [hoveredGeneration, setHoveredGeneration] =
  useState<number | null>(null);  
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
      25,
      Math.min(
        shortSide * 0.1,
        40
      )
  );

  const fieldHeight = Math.max(
    44,
    Math.min(height * 0.055, 56)
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
    router.push({
      pathname: '/gender',
      params: { name },
    });
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
          SHARED BACK BUTTON
          ========================= */}
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
              marginTop:30,
              marginBottom:20,
            },
          ]}
        >
          What do you
          {'\n'}
          study? 
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
                  20,
                  Math.min(
                    shortSide * 0.035,
                    20
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
              marginTop:20,
              fontSize:
                Math.max(
                  20,
                  Math.min(
                    shortSide * 0.055,
                    20
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
                    15,
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
           {generations.map((item) => (
  <Pressable
    key={item}
    style={[
      styles.dropdownItem,
      hoveredGeneration === item && {
        backgroundColor: '#FFE1E1',
      },
    ]}
    onHoverIn={() => setHoveredGeneration(item)}
    onHoverOut={() => setHoveredGeneration(null)}
    onPress={() => {
      setGeneration(item);
      setShowGenerations(false);
      setErrorMessage('');
    }}
  >
    <Text
      style={[
        styles.dropdownText,
        {
          fontSize: Math.max(
            14,
            Math.min(shortSide * 0.035, 17)
          ),
          color:
            hoveredGeneration === item
              ? '#483232'
              : '#333333',
        },
      ]}
    >
      TU{item}
    </Text>
  </Pressable>
))}
                   
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
            SHARED GO BUTTON
            ========================= */}
        <OnboardingGoButton onPress={handleContinue} label="Next" />
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
   * TITLE
   * ============================
   */

  title: {
    fontFamily:'GoogleSansSemiBold',
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 10,
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
    fontFamily:'GoogleSansMedium',
    color: '#FFFFFF',
    marginBottom: 8,
    marginTop: 10,
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
    borderRadius: 20,
    backgroundColor:'#F3F3F3',
    justifyContent:'center',
    paddingHorizontal: 16,
    shadowColor:'#000000',


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
    borderRadius: 20,
    backgroundColor:'#FFFFFF',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:'space-between',
    shadowColor:'#000000',
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
    backgroundColor:'#FFFFFF',
    borderRadius: 20,
    marginTop: 5,
    overflow: 'hidden',
    shadowColor:'#000000',
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

});
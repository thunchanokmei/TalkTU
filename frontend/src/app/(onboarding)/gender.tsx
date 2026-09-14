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

export default function GenderScreen() {
  const {
    width,
    height,
  } =
    useWindowDimensions();

  const [
    gender,
    setGender,
  ] =
    useState<
      SexAtBirth | null
    >(null);

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState('');

  useEffect(() => {
    const loadGender =
      async () => {
        try {
          const value =
            await getSexAtBirth();

          if (value) {
            setGender(
              value
            );
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

  const handleContinue =
    async () => {
      if (!gender) {
        setErrorMessage(
          'Please select one option.'
        );
        return;
      }

      try {
        await saveSexAtBirth(
          gender
        );

        router.push(
          '/mode'
        );
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Unable to save your gender.'
        );
      }
    };

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
      <Pressable
        style={[
          styles.backButton,
          {
            top:
              Math.max(
                20,
                height * 0.04
              ),

            left:
              Math.max(
                20,
                width * 0.07
              ),
          },
        ]}
        onPress={() =>
          router.replace(
            '/study'
          )
        }
      >
        <LinearGradient
          colors={[
            '#FFE98F',
            '#FFB873',
          ]}
          style={
            styles.backGradient
          }
        >
          <Text>
            {'<<'}
          </Text>
        </LinearGradient>
      </Pressable>

      <View
        style={[
          styles.content,
          {
            paddingHorizontal:
              Math.max(
                24,
                width * 0.1
              ),

            paddingTop:
              Math.max(
                110,
                height * 0.17
              ),
          },
        ]}
      >
        <Text
          style={[
            styles.title,
            {
              fontSize:
                Math.max(
                  21,
                  width *
                    0.055
                ),
            },
          ]}
        >
          What's your{'\n'}
          Gender
        </Text>

        <ChoiceRow
          label="Men"
          selected={
            gender === 'male'
          }
          onPress={() => {
            setGender('male');
            setErrorMessage(
              ''
            );
          }}
        />

        <ChoiceRow
          label="Women"
          selected={
            gender ===
            'female'
          }
          onPress={() => {
            setGender(
              'female'
            );
            setErrorMessage(
              ''
            );
          }}
        />

        {errorMessage ? (
          <Text
            style={
              styles.errorText
            }
          >
            {errorMessage}
          </Text>
        ) : null}

        {gender ? (
          <Pressable
            style={
              styles.goButton
            }
            onPress={
              handleContinue
            }
          >
            <Text
              style={
                styles.goText
              }
            >
              go!
            </Text>
          </Pressable>
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

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,
    },

    content: {
      flex: 1,
    },

    backButton: {
      position: 'absolute',

      zIndex: 20,

      width: 50,
      height: 32,

      borderRadius: 999,
      overflow: 'hidden',
    },

    backGradient: {
      flex: 1,

      alignItems: 'center',
      justifyContent:
        'center',
    },

    title: {
      marginBottom: 20,

      color: '#FFFFFF',

      fontWeight: '600',

      textShadowColor:
        'rgba(75,50,45,0.35)',

      textShadowOffset: {
        width: 1,
        height: 2,
      },

      textShadowRadius: 2,
    },

    choice: {
      width: '100%',

      minHeight: 44,

      marginBottom: 10,

      paddingHorizontal: 16,

      borderRadius: 12,

      flexDirection: 'row',

      alignItems: 'center',
      justifyContent:
        'space-between',

      backgroundColor:
        '#FFFFFF',
    },

    choiceSelected: {
      backgroundColor:
        '#FFF9E8',
    },

    choiceText: {
      fontSize: 16,

      color: '#333333',
    },

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

    errorText: {
      marginTop: 7,

      color: '#C62828',
    },

    goButton: {
      alignSelf:
        'flex-end',

      marginTop: 16,

      minHeight: 34,

      paddingHorizontal: 18,

      borderRadius: 12,

      justifyContent:
        'center',

      backgroundColor:
        '#FFF6AE',
    },

    goText: {
      fontSize: 16,
      fontWeight: '600',
    },
  });

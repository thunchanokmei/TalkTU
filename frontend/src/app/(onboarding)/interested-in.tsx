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
  getDatingPreferences,
  saveDatingPreferences,
  type DatingInterest,
} from '../../features/onboarding/services/onboardingService';

export default function InterestedInScreen() {
  const {
    width,
    height,
  } =
    useWindowDimensions();

  const [
    selected,
    setSelected,
  ] =
    useState<
      DatingInterest | null
    >(null);

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState('');

  useEffect(() => {
    const loadPreference =
      async () => {
        try {
          const existing =
            await getDatingPreferences();

          /*
           * Product rule requested now:
           * exactly one dating preference.
           *
           * If old test data contains multiple,
           * show the first one and the next save
           * converts it to a one-item array.
           */
          if (
            existing.length > 0
          ) {
            setSelected(
              existing[0]
            );
          }
        } catch (error) {
          console.error(
            'Load dating preference error:',
            error
          );
        }
      };

    loadPreference();
  }, []);

  const handleContinue =
    async () => {
      if (!selected) {
        setErrorMessage(
          'Please select one option.'
        );
        return;
      }

      try {
        await saveDatingPreferences(
          [selected]
        );

        router.push(
          '/bio1'
        );
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Unable to save your dating preference.'
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
            '/mode'
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
                height * 0.18
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
          Who u wanna{'\n'}
          date ?
        </Text>

        <ChoiceRow
          label="Men"
          selected={
            selected === 'men'
          }
          onPress={() => {
            setSelected('men');
            setErrorMessage(
              ''
            );
          }}
        />

        <ChoiceRow
          label="Women"
          selected={
            selected ===
            'women'
          }
          onPress={() => {
            setSelected(
              'women'
            );
            setErrorMessage(
              ''
            );
          }}
        />

        <ChoiceRow
          label="Beyond Binary"
          selected={
            selected ===
            'beyond_binary'
          }
          onPress={() => {
            setSelected(
              'beyond_binary'
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

        {selected ? (
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
      marginBottom: 30,

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

      borderRadius: 14,

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
      fontSize: 14,
      fontWeight: '500',

      color: '#222222',
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

      color: '#111111',
    },
  });

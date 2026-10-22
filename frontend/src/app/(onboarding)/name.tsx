import {
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
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
  getDisplayName,
  saveDisplayName,
} from '../../features/onboarding/services/onboardingService';

export default function NameScreen() {
  const [
    name,
    setName,
  ] = useState('');

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('');

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const {
    width,
    height,
  } =
    useWindowDimensions();

  const shortSide =
    Math.min(
      width,
      height
    );

  useEffect(() => {
    const loadName =
      async () => {
        try {
          const existingName =
            await getDisplayName();

          if (existingName) {
            setName(
              existingName
            );
          }
        } catch (error) {
          console.error(
            'Load name error:',
            error
          );
        } finally {
          setLoading(false);
        }
      };

    loadName();
  }, []);

  const horizontalPadding =
    Math.max(
      24,
      width * 0.1
    );

  const logoWidth =
    Math.max(
      150,
      Math.min(
        shortSide * 0.48,
        280
      )
    );

  const logoHeight =
    logoWidth * 0.75;

  const titleSize =
    Math.max(
      20,
      Math.min(
        shortSide * 0.055,
        30
      )
    );

  const inputHeight =
    Math.max(
      44,
      Math.min(
        height * 0.055,
        56
      )
    );

  const handleContinue =
    async () => {
      const cleanName =
        name.trim();

      setErrorMessage('');

      if (!cleanName) {
        setErrorMessage(
          'Please enter your name.'
        );
        return;
      }

      try {
        setSaving(true);

        /*
         * Save BEFORE leaving this page.
         * Going back and editing therefore
         * updates the same profiles row,
         * instead of only passing a route param.
         */
        await saveDisplayName(
          cleanName
        );

        router.push(
          '/birthday'
        );
      } catch (error) {
        console.error(
          'Save name error:',
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Unable to save your name.'
        );
      } finally {
        setSaving(false);
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
            '/login'
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
          <Text
            style={
              styles.backText
            }
          >
            {'<<'}
          </Text>
        </LinearGradient>
      </Pressable>

      <View
        style={[
          styles.content,
          {
            paddingHorizontal:
              horizontalPadding,

            paddingTop:
              Math.max(
                70,
                height * 0.1
              ),
          },
        ]}
      >
        <Image
          source={require(
            '../../../assets/images/talktu-logo.png'
          )}
          style={{
            width: logoWidth,
            height:
              logoHeight,
            alignSelf:
              'center',
          }}
          resizeMode="contain"
        />

        <Text
          style={[
            styles.title,
            {
              fontSize:
                titleSize,

              lineHeight:
                titleSize *
                1.15,
            },
          ]}
        >
          What's your{'\n'}
          Name ?
        </Text>

        {loading ? (
          <ActivityIndicator
            color="#FFFFFF"
          />
        ) : (
          <TextInput
            style={[
              styles.input,
              {
                height:
                  inputHeight,
              },
            ]}
            value={name}
            onChangeText={
              setName
            }
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={
              handleContinue
            }
          />
        )}

        {errorMessage ? (
          <Text
            style={
              styles.errorText
            }
          >
            {errorMessage}
          </Text>
        ) : null}

        <Pressable
          style={[
            styles.goButton,
            saving &&
              styles.disabled,
          ]}
          disabled={
            saving ||
            loading
          }
          onPress={
            handleContinue
          }
        >
          {saving ? (
            <ActivityIndicator
              color="#111111"
            />
          ) : (
            <Text
              style={
                styles.goText
              }
            >
              go!
            </Text>
          )}
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,
      width: '100%',
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

    backText: {
      fontWeight: '500',

      color: '#222222',
    },

    title: {
      marginTop: 8,
      marginBottom: 16,

      fontWeight: '600',

      color: '#FFFFFF',

      textShadowColor:
        'rgba(75,50,45,0.35)',

      textShadowOffset: {
        width: 1,
        height: 2,
      },

      textShadowRadius: 2,
    },

    input: {
      width: '100%',

      borderRadius: 12,

      paddingHorizontal: 16,

      backgroundColor:
        '#FFFFFF',

      fontSize: 16,

      color: '#333333',
    },

    errorText: {
      marginTop: 7,

      color: '#C62828',
    },

    goButton: {
      alignSelf:
        'flex-end',

      minWidth: 64,
      height: 38,

      marginTop: 16,

      paddingHorizontal: 14,

      borderRadius: 12,

      alignItems: 'center',
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

    disabled: {
      opacity: 0.6,
    },
  });

import {
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import {LinearGradient,} 
from 'expo-linear-gradient';
import {router,} 
from 'expo-router';

import OnboardingBackButton from '../../components/navigation/OnboardingBackButton';
import OnboardingGoButton from '../../components/navigation/OnboardingGoButton';

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

  const {width,height,
  } = useWindowDimensions();

  const shortSide =
    Math.min(
      width,
      height
    );
  useEffect(() => {
    const loadName = async () => {
      try {
        const existingName =
          await getDisplayName();

        if (existingName) {
          setName(existingName);
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
      200,
      Math.min(
        shortSide * 0.65,
        400
      )
    );

  const logoHeight =
    logoWidth * 0.75;

  const titleSize =
    Math.max(
      25,
      Math.min(
        shortSide * 0.1,
        35
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

  const handleContinue = async () => {
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
      <OnboardingBackButton
        top={Math.max(20, height * 0.04)}
        left={Math.max(20, width * 0.07)}
        onPress={() =>
          router.replace('/login')
        }
      />

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
            height: logoHeight,
            alignSelf: 'center',
            marginTop: 60,
          }}
          resizeMode="contain"
        />

        <Text
          style={[
            styles.title,
            {
              fontSize: titleSize,
              lineHeight: titleSize * 1.15,
              fontWeight:'bold',
               shadowColor: '#524c4c',
              shadowOffset: {
              width: 0.5,
              height: 3,
    },
    shadowOpacity: 0.4,
    shadowRadius: 4
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
                height: inputHeight,
              },
            ]}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={handleContinue}
          />
        )}

        {!loading && (
          <Text style={styles.nameNotice}>
            Please choose your name carefully.
            {'\n'}
            You can set your name only once and won't be able to change it later.
          </Text>
        )}

        {errorMessage ? (
          <Text
            style={styles.errorText}
          >
            {errorMessage}
          </Text>
        ) : null}

        <OnboardingGoButton
          onPress={handleContinue}
          loading={saving}
          disabled={loading}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    width: '100%',
  },

  content: {
    flex: 1,
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
    borderRadius: 15,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    fontSize: 16,
    color: '#333333',
    shadowColor: '#524c4c',
    shadowOffset: {
      width: 0.5,
      height: 3,
    },
    shadowOpacity: 0.4,
    shadowRadius: 4
  },

  nameNotice: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 19,
    color: '#7A4038',
  },

  errorText: {
    marginTop: 7,
    color: '#C62828',
  },
});

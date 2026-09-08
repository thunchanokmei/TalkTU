import { useState } from 'react';

import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import { useFonts } from '@expo-google-fonts/google-sans/useFonts';
import { GoogleSans_400Regular } from '@expo-google-fonts/google-sans/400Regular';
import { GoogleSans_500Medium } from '@expo-google-fonts/google-sans/500Medium';
import { GoogleSans_600SemiBold } from '@expo-google-fonts/google-sans/600SemiBold';

export default function NameScreen() {
  const [name, setName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const { width, height } = useWindowDimensions();
  const shortSide = Math.min(width, height);

  const [fontsLoaded] = useFonts({
    GoogleSans: GoogleSans_400Regular,
    GoogleSansMedium: GoogleSans_500Medium,
    GoogleSansSemiBold: GoogleSans_600SemiBold,
  });

  const horizontalPadding = Math.max(24, width * 0.1);

  const logoWidth = Math.max(
    150,
    Math.min(shortSide * 0.48, 280)
  );

  const logoHeight = logoWidth * 0.75;

  const titleSize = Math.max(
    20,
    Math.min(shortSide * 0.055, 30)
  );

  const inputHeight = Math.max(
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

  const handleBack = () => {
    router.replace('/login');
  };

  const handleContinue = () => {
    const cleanName = name.trim();

    setErrorMessage('');

    if (!cleanName) {
      setErrorMessage('Please enter your name.');
      return;
    }

    router.push({
      pathname: '/birthday',
      params: {
        name: cleanName,
      },
    });
  };

  // ป้องกันไม่ให้ render ก่อน font โหลดเสร็จ
  if (!fontsLoaded) {
    return null;
  }

  return (
    <LinearGradient
      colors={['#FF7F87', '#FFA577', '#FFE8C8']}
      locations={[0, 0.45, 1]}
      style={styles.screen}
    >
      <Pressable
        style={[
          styles.backButton,
          {
            top: Math.max(20, height * 0.04),
            left: Math.max(20, width * 0.07),
            width: backButtonWidth,
            height: backButtonHeight,
          },
        ]}
        onPress={handleBack}
      >
        <LinearGradient
          colors={['#FFE98F', '#FFB873']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.backGradient}
        >
          <Text
            style={[
              styles.backText,
              {
                fontSize: Math.max(
                  12,
                  Math.min(shortSide * 0.033, 17)
                ),
              },
            ]}
          >
            {'<<'}
          </Text>
        </LinearGradient>
      </Pressable>

      <View
        style={[
          styles.content,
          {
            paddingHorizontal: horizontalPadding,
            paddingTop: Math.max(70, height * 0.1),
          },
        ]}
      >
        <Image
          source={require('../../../assets/images/talktu-logo.png')}
          style={{
            width: logoWidth,
            height: logoHeight,
            alignSelf: 'center',
          }}
          resizeMode="contain"
        />

        <Text
          style={[
            styles.title,
            {
              fontSize: titleSize,
              lineHeight: titleSize * 1.15,
              marginTop: Math.max(8, height * 0.015),
            },
          ]}
        >
          What's your{'\n'}Name ?
        </Text>

        <TextInput
          style={[
            styles.input,
            {
              height: inputHeight,
              fontSize: Math.max(
                15,
                Math.min(shortSide * 0.038, 19)
              ),
            },
          ]}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={handleContinue}
        />

        {errorMessage ? (
          <Text
            style={[
              styles.errorText,
              {
                fontSize: Math.max(
                  11,
                  Math.min(shortSide * 0.03, 15)
                ),
              },
            ]}
          >
            {errorMessage}
          </Text>
        ) : null}

        <Pressable
          style={[
            styles.goButton,
            {
              minWidth: Math.max(
                58,
                Math.min(shortSide * 0.15, 84)
              ),
              height: Math.max(
                34,
                Math.min(height * 0.045, 44)
              ),
            },
          ]}
          onPress={handleContinue}
        >
          <Text
            style={[
              styles.goText,
              {
                fontSize: Math.max(
                  15,
                  Math.min(shortSide * 0.04, 20)
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

    borderRadius: 999,
    overflow: 'hidden',

    // เงาปุ่ม Back
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

    justifyContent: 'center',
    alignItems: 'center',
  },

  backText: {
    fontFamily: 'GoogleSansMedium',
    color: '#222222',
  },

  title: {
    fontFamily: 'GoogleSansSemiBold',
    color: '#FFFFFF',

    marginBottom: 16,

    textShadowColor: 'rgba(75, 50, 45, 0.35)',

    textShadowOffset: {
      width: 1,
      height: 2,
    },

    textShadowRadius: 2,
  },

  input: {
    width: '100%',

    backgroundColor: '#FFFFFF',

    borderRadius: 12,

    paddingHorizontal: 16,

    color: '#333333',

    fontFamily: 'GoogleSans',

    shadowColor: '#000000',

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.15,
    shadowRadius: 3,

    elevation: 3,
  },

  errorText: {
    fontFamily: 'GoogleSans',
    color: '#C62828',
    marginTop: 7,
  },

  goButton: {
    alignSelf: 'flex-end',

    paddingHorizontal: 14,

    marginTop: 16,

    borderRadius: 12,

    backgroundColor: '#FFF6AE',

    justifyContent: 'center',
    alignItems: 'center',

    // ✨ เพิ่มเงาปุ่ม go!
    shadowColor: '#000000',

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.28,
    shadowRadius: 5,

    elevation: 6,
  },

  goText: {
    fontFamily: 'GoogleSansSemiBold',

    fontWeight: '600',

    color: '#111111',

    textShadowColor: 'rgba(0, 0, 0, 0.15)',

    textShadowOffset: {
      width: 0,
      height: 1,
    },

    textShadowRadius: 1,
  },
});
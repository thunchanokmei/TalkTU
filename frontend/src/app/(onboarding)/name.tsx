import { useState } from 'react';

import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

export default function NameScreen() {
  const [name, setName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleContinue = () => {
    const cleanName = name.trim();

    setErrorMessage('');

    if (!cleanName) {
      setErrorMessage('Please enter your name.');
      return;
    }

    // ตอนนี้ยังเก็บเป็น UI flow ก่อน
    // backend จะบันทึก profile ทีหลัง
    console.log('Name:', cleanName);

    router.push('/(onboarding)/birthday');
  };

  return (
    <View style={styles.page}>
      <LinearGradient
        colors={['#FF7F87', '#FFA577', '#FFE8C8']}
        locations={[0, 0.45, 1]}
        style={styles.screen}
      >
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>
            {'<<'}
          </Text>
        </Pressable>

        <View style={styles.content}>
          <Image
            source={require('../../../assets/images/talktu-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.title}>
            What's your{'\n'}Name ?
          </Text>

          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={handleContinue}
          />

          {errorMessage ? (
            <Text style={styles.errorText}>
              {errorMessage}
            </Text>
          ) : null}

          <Pressable
            style={styles.goButton}
            onPress={handleContinue}
          >
            <Text style={styles.goText}>
              go!
            </Text>
          </Pressable>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },

  screen: {
    flex: 1,
    width: '100%',
    maxWidth: 390,
  },

  backButton: {
    position: 'absolute',
    top: 22,
    left: 22,

    width: 38,
    height: 27,

    borderRadius: 15,

    backgroundColor: '#FFD18B',

    justifyContent: 'center',
    alignItems: 'center',

    zIndex: 10,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,

    elevation: 3,
  },

  backText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000000',
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 65,
  },

  logo: {
    width: 150,
    height: 115,

    alignSelf: 'center',

    transform: [{ scale: 1.35 }],

    marginBottom: 22,
  },

  title: {
    fontSize: 22,
    lineHeight: 24,

    fontWeight: '800',

    color: '#FFFFFF',

    marginBottom: 14,
  },

  input: {
    width: '100%',
    height: 46,

    borderRadius: 11,

    backgroundColor: '#FFFFFF',

    paddingHorizontal: 14,

    fontSize: 16,
    color: '#333333',

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.17,
    shadowRadius: 3,

    elevation: 3,
  },

  errorText: {
    fontSize: 12,
    color: '#C62828',

    marginTop: 7,
  },

  goButton: {
    alignSelf: 'flex-end',

    minWidth: 58,
    height: 34,

    marginTop: 16,

    borderRadius: 11,

    backgroundColor: '#FFF6AE',

    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.18,
    shadowRadius: 3,

    elevation: 3,
  },

  goText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111111',
  },
});
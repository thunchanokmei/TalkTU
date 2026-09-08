import { useState } from 'react';

import {
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleContinue = () => {
    const cleanUsername = username.trim();

    setErrorMessage('');

    if (!cleanUsername) {
      setErrorMessage('Please enter your TU email.');
      return;
    }

    // TEMPORARY:
    // ภายหลังตรงนี้จะเปิด TU Gateway
    console.log('Continue to TU Gateway:', cleanUsername);
  };

  return (
    <View style={styles.page}>
      <LinearGradient
        colors={['#FF7F87', '#FFA577', '#FFE8C8']}
        locations={[0, 0.45, 1]}
        style={styles.screen}
      >
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.content}>
            <Image
              source={require('../../../assets/images/talktu-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />

            <TextInput
              style={styles.input}
              placeholder="xxxxx@dome.tu.ac.th"
              placeholderTextColor="#B8B8B8"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              returnKeyType="go"
              onSubmitEditing={handleContinue}
            />

            {errorMessage ? (
              <Text style={styles.errorText}>
                {errorMessage}
              </Text>
            ) : null}
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

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

  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 190,
  },

  logo: {
    width: 320,
    height: 220,
    alignSelf: 'center',
    marginBottom: 18,
  },

  input: {
    width: '77%',
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 11,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#333333',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 4,
  },

  errorText: {
    width: '77%',
    color: '#C62828',
    fontSize: 12,
    marginTop: 8,
  },
});
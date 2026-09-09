import { useState } from 'react';
import { router } from 'expo-router';

import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

import { loginWithTu } from '../../features/auth/services/authService';

export default function LoginScreen() {
  const { width, height } = useWindowDimensions();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    const cleanUsername = username.trim();

    setErrorMessage('');

    if (!cleanUsername) {
      setErrorMessage('Please enter your TU username.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your TU password.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginWithTu(cleanUsername, password);

      if (!result.success) {
        setErrorMessage(result.message);
        return;
      }

      console.log('TU login successful');
      router.replace('/name');
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('Something went wrong while logging in.');
    } finally {
      setIsLoading(false);
    }
  };

  /*
   * Responsive sizing
   *
   * Mobile:
   *   ใช้พื้นที่เกือบเต็มจอ
   *
   * Tablet / Web:
   *   จำกัดเฉพาะ content ไม่ให้กว้างเกิน design
   */
  const contentWidth = Math.min(width * 0.86, 390);

  /*
   * Logo จะย่อเมื่อหน้าจอแคบ
   * แต่จะไม่ใหญ่เกินขนาดใน Figma
   */
  const logoWidth = Math.min(width * 0.72, 320);
  const logoHeight = logoWidth * 0.6875;

  /*
   * เดิมใช้ paddingTop: 190
   * ปรับตามความสูงหน้าจอเพื่อไม่ให้จอเล็ก
   * ดัน logo ลงไปจนเกินพื้นที่
   */
  const topPadding = Math.max(
    60,
    Math.min(height * 0.2, 190)
  );

  return (
    <View style={styles.page}>
      <LinearGradient
        colors={['#FF7F87', '#FFA577', '#FFE8C8']}
        locations={[0, 0.45, 1]}
        style={styles.screen}
      >
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View
            style={[
              styles.content,
              {
                width: contentWidth,
                paddingTop: topPadding,
              },
            ]}
          >
            <Image
              source={require('../../../assets/images/talktu-logo.png')}
              style={[
                styles.logo,
                {
                  width: logoWidth,
                  height: logoHeight,
                },
              ]}
              resizeMode="contain"
            />

            <TextInput
              style={styles.input}
              placeholder="TU Username"
              placeholderTextColor="#B8B8B8"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              returnKeyType="next"
            />

            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="TU password"
              placeholderTextColor="#B8B8B8"
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
              returnKeyType="go"
              onSubmitEditing={handleContinue}
            />

            <Pressable
              style={({ pressed }) => [
                styles.loginButton,
                pressed && styles.loginButtonPressed,
                isLoading && styles.loginButtonDisabled,
              ]}
              onPress={handleContinue}
              disabled={isLoading}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? 'Logging in...' : 'Login'}
              </Text>
            </Pressable>

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

  /*
   * พื้นที่นอกสุด
   * ใช้สำหรับจัดหน้าให้อยู่ตรงกลางบน Web
   */
  page: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },

  /*
   * สำคัญ:
   * ห้ามใส่ maxWidth: 390 ตรงนี้
   *
   * เพราะจะทำให้ gradient ถูกล็อกเป็น 390px
   * และเกิดพื้นที่ว่างด้านข้างบน Chrome / iPad
   */
  screen: {
    flex: 1,
    width: '100%',
  },

  /*
   * Content ยังคงจำกัดความกว้างไว้ประมาณ design ใน Figma
   * แต่ตัว gradient ด้านหลังเต็มหน้าจอ
   */
  content: {
    flex: 1,
    alignSelf: 'center',
    alignItems: 'center',
  },

  logo: {
    alignSelf: 'center',
    marginBottom: 18,
  },

  input: {
    width: '100%',
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

  passwordInput: {
    marginTop: 12,
  },

  loginButton: {
    width: '77%',
    height: 44,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 4,
  },

  loginButtonPressed: {
    opacity: 0.7,
  },

  loginButtonDisabled: {
    opacity: 0.5,
  },

  loginButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },

  errorText: {
    width: '100%',
    color: '#C62828',
    fontSize: 12,
    marginTop: 8,
  },
});
import { useState } from 'react';

import {
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
  const { width, height } = useWindowDimensions();

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

  errorText: {
    width: '100%',
    color: '#C62828',
    fontSize: 12,
    marginTop: 8,
  },
});
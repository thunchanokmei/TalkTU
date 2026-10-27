import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { router } from 'expo-router';

import { supabase } from '../lib/supabase';

export default function DevLoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setMessage('Enter test email and password.');
      return;
    }

    try {
      setLoading(true);
      setMessage('');

      const { data, error } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (error) {
        setMessage(error.message);
        return;
      }

      console.log(
        'DEV LOGIN USER:',
        data.user?.id
      );

      router.replace('/name');
    } catch (error) {
      console.error(error);
      setMessage('Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        DEV Login
      </Text>

      <Text style={styles.warning}>
        Supabase test account only
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Test email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Test password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Pressable
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text>
          {loading ? 'Logging in...' : 'Login'}
        </Text>
      </Pressable>

      {message ? (
        <Text style={styles.message}>
          {message}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#FFFFFF',
  },

  title: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 5,
  },

  warning: {
    marginBottom: 25,
    color: '#777777',
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
  },

  button: {
    height: 46,
    borderRadius: 10,
    backgroundColor: '#FFE29A',
    justifyContent: 'center',
    alignItems: 'center',
  },

  message: {
    marginTop: 12,
    color: '#C62828',
  },
});
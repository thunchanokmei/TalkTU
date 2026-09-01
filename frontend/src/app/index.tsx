import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { Session } from '@supabase/supabase-js';

import { supabase } from '../lib/supabase';

export default function HomeScreen() {
  const [email, setEmail] = useState('test@talktu.dev');
  const [password, setPassword] = useState('Test123456!');

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // เช็กว่ามี session เก่าอยู่ในเครื่องหรือไม่
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    // ฟังเวลามีการ login / logout
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async () => {
    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        Alert.alert('Login failed', error.message);
        return;
      }
    } catch (error) {
      console.error(error);

      Alert.alert(
        'Error',
        'Something went wrong while logging in.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      Alert.alert('Logout failed', error.message);
    }
  };

  if (session) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>
          Auth connected ✅
        </Text>

        <Text style={styles.label}>
          Logged in as
        </Text>

        <Text style={styles.value}>
          {session.user.email}
        </Text>

        <Text style={styles.label}>
          User ID
        </Text>

        <Text style={styles.userId}>
          {session.user.id}
        </Text>

        <View style={styles.button}>
          <Button
            title="Log out"
            onPress={handleLogout}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        TalkTU Auth Test
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <View style={styles.button}>
        {loading ? (
          <ActivityIndicator />
        ) : (
          <Button
            title="Login"
            onPress={handleLogin}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
  },

  input: {
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
  },

  button: {
    marginTop: 12,
  },

  label: {
    marginTop: 16,
    fontSize: 14,
    color: '#666666',
  },

  value: {
    fontSize: 18,
    fontWeight: '600',
  },

  userId: {
    fontSize: 13,
  },
});
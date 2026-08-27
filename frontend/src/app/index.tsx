import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { supabase } from '../lib/supabase';

type TuGeneration = {
  code: number;
};

export default function HomeScreen() {
  const [generations, setGenerations] = useState<TuGeneration[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchGenerations();
  }, []);

  const fetchGenerations = async () => {
    setLoading(true);
    setErrorMessage('');

    const { data, error } = await supabase
      .from('tu_generations')
      .select('code')
      .eq('is_active', true)
      .order('code', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    setGenerations(data ?? []);
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text>Connecting to Supabase...</Text>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>
          Supabase connection failed
        </Text>

        <Text>{errorMessage}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Supabase connected ✅
      </Text>

      <Text style={styles.subtitle}>
        TU Generations
      </Text>

      {generations.map((generation) => (
        <Text
          key={generation.code}
          style={styles.generation}
        >
          TU{generation.code}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    padding: 24,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },

  subtitle: {
    fontSize: 18,
    marginTop: 12,
  },

  generation: {
    fontSize: 18,
  },

  error: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
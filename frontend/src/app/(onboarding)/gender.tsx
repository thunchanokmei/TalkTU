import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

type Gender = 'male' | 'female';

export default function GenderScreen() {
  const { width, height } = useWindowDimensions();

  const [gender, setGender] =
    useState<Gender | null>(null);

  const handleContinue = () => {
    if (!gender) return;

    console.log('sex_at_birth:', gender);

    router.push('/mode');
  };

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
            top: height * 0.04,
            left: width * 0.07,
            width: width * 0.11,
            height: width * 0.065,
          },
        ]}
        onPress={() =>
          router.replace('/study')
        }
      >
        <LinearGradient
          colors={['#FFE98F', '#FFB873']}
          style={styles.backGradient}
        >
          <Text>{'<<'}</Text>
        </LinearGradient>
      </Pressable>

      <View
        style={[
          styles.content,
          {
            paddingHorizontal: width * 0.1,
            paddingTop: height * 0.18,
          },
        ]}
      >
        <Text
          style={[
            styles.title,
            {
              fontSize: Math.max(21, width * 0.055),
            },
          ]}
        >
          What's your{'\n'}Gender
        </Text>

        <ChoiceRow
          label="Men"
          selected={gender === 'male'}
          onPress={() => setGender('male')}
        />

        <ChoiceRow
          label="Women"
          selected={gender === 'female'}
          onPress={() => setGender('female')}
        />

        {gender ? (
          <Pressable
            style={styles.goButton}
            onPress={handleContinue}
          >
            <Text style={styles.goText}>go!</Text>
          </Pressable>
        ) : null}
      </View>
    </LinearGradient>
  );
}

function ChoiceRow({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={styles.choice}
      onPress={onPress}
    >
      <Text style={styles.choiceText}>
        {label}
      </Text>

      <View
        style={[
          styles.circle,
          selected && styles.circleSelected,
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  content: {
    flex: 1,
  },

  backButton: {
    position: 'absolute',
    borderRadius: 999,
    overflow: 'hidden',
    zIndex: 20,
  },

  backGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 30,

    textShadowColor: 'rgba(75,50,45,0.35)',
    textShadowOffset: {
      width: 1,
      height: 2,
    },
    textShadowRadius: 2,
  },

  choice: {
    width: '100%',
    minHeight: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 10,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  choiceText: {
    fontSize: 14,
    fontWeight: '500',
  },

  circle: {
    width: 16,
    height: 16,
    borderRadius: 999,
    backgroundColor: '#F2D3C3',
  },

  circleSelected: {
    backgroundColor: '#F19068',
  },

  goButton: {
    alignSelf: 'flex-end',
    marginTop: 10,
    backgroundColor: '#FFF6AE',
    minHeight: 34,
    borderRadius: 12,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },

  goText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
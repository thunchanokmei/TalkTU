import { useMemo, useState } from 'react';
import type { DimensionValue } from 'react-native';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';

type WheelColumnProps = {
  items: string[];
  itemHeight: number;
  width: DimensionValue;
  onValueChange: (value: string) => void;
};

function WheelColumn({
  items,
  itemHeight,
  width,
  onValueChange,
}: WheelColumnProps) {
  const handleScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const offsetY = event.nativeEvent.contentOffset.y;

    const index = Math.round(offsetY / itemHeight);

    const safeIndex = Math.max(
      0,
      Math.min(index, items.length - 1)
    );

    onValueChange(items[safeIndex]);
  };

  return (
    <ScrollView
      style={{
        width,
        height: itemHeight * 3,
        zIndex: 2,
      }}
      contentContainerStyle={{
        paddingVertical: itemHeight,
      }}
      showsVerticalScrollIndicator={false}
      snapToInterval={itemHeight}
      decelerationRate="fast"
      scrollEventThrottle={16}
      onScroll={handleScroll}
      onMomentumScrollEnd={handleScroll}
      onScrollEndDrag={handleScroll}
    >
      {items.map((item, index) => (
        <View
          key={`${item}-${index}`}
          style={{
            height: itemHeight,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={styles.wheelText}>
            {item}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

export default function BirthdayScreen() {
  const { width, height } = useWindowDimensions();
  const shortSide = Math.min(width, height);

  const { name } = useLocalSearchParams<{
    name?: string;
  }>();

  const [day, setDay] = useState('xx');
  const [month, setMonth] = useState('xxxx');
  const [year, setYear] = useState('xxxx');
  const [errorMessage, setErrorMessage] = useState('');

  const itemHeight = Math.max(38, Math.min(height * 0.052, 50));
  const horizontalPadding = Math.max(24, width * 0.1);
  const titleSize = Math.max(20, Math.min(shortSide * 0.055, 30));

  const backButtonWidth = Math.max(42, Math.min(shortSide * 0.12, 64));
  const backButtonHeight = Math.max(28, Math.min(shortSide * 0.072, 38));

  const days = useMemo(
    () => [
      'xx',
      ...Array.from({ length: 31 }, (_, index) => String(index + 1)),
    ],
    []
  );

  const months = useMemo(
    () => [
      'xxxx',
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],
    []
  );

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();

    return [
      'xxxx',
      ...Array.from({ length: 83 }, (_, index) =>
        String(currentYear - 18 - index)
      ),
    ];
  }, []);

  const handleBack = () => {
    router.replace('/(onboarding)/name');
  };

  const handleContinue = () => {
    setErrorMessage('');

    if (day === 'xx' || month === 'xxxx' || year === 'xxxx') {
      setErrorMessage('Please select your birthday.');
      return;
    }

    const monthIndex = months.indexOf(month);

    const selectedDate = new Date(
      Number(year),
      monthIndex - 1,
      Number(day)
    );

    if (
      selectedDate.getFullYear() !== Number(year) ||
      selectedDate.getMonth() !== monthIndex - 1 ||
      selectedDate.getDate() !== Number(day)
    ) {
      setErrorMessage('Please select a valid date.');
      return;
    }

    const today = new Date();
    let age = today.getFullYear() - selectedDate.getFullYear();

    const birthdayThisYear = new Date(
      today.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate()
    );

    if (today < birthdayThisYear) {
      age -= 1;
    }

    if (age < 18) {
      setErrorMessage('You must be at least 18 years old.');
      return;
    }

    console.log('Birthday:', {
      day,
      month,
      year,
    });
    router.push('/(onboarding)/study');
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
                fontSize: Math.max(12, Math.min(shortSide * 0.033, 17)),
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
            paddingTop: Math.max(110, height * 0.17),
          },
        ]}
      >
        <Text
          style={[
            styles.title,
            {
              fontSize: titleSize,
              lineHeight: titleSize * 1.12,
            },
          ]}
        >
          Hi {name || 'Name'}
          {'\n'}
          When your
          {'\n'}
          Birthday ?
        </Text>

        <View
          style={[
            styles.pickerCard,
            {
              height: itemHeight * 3 + height * 0.035,
            },
          ]}
        >
          <View
            style={[
              styles.selectedRow,
              {
                height: itemHeight,
                top: itemHeight + height * 0.0175,
              },
            ]}
          />

          <View style={styles.wheelRow}>
            <WheelColumn
              items={days}
              itemHeight={itemHeight}
              width="23%"
              onValueChange={setDay}
            />

            <WheelColumn
              items={months}
              itemHeight={itemHeight}
              width="48%"
              onValueChange={setMonth}
            />

            <WheelColumn
              items={years}
              itemHeight={itemHeight}
              width="29%"
              onValueChange={setYear}
            />
          </View>
        </View>

        {errorMessage ? (
          <Text
            style={[
              styles.errorText,
              {
                fontSize: Math.max(11, Math.min(shortSide * 0.03, 15)),
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
              minWidth: Math.max(58, Math.min(shortSide * 0.15, 84)),
              height: Math.max(34, Math.min(height * 0.045, 44)),
            },
          ]}
          onPress={handleContinue}
        >
          <Text
            style={[
              styles.goText,
              {
                fontSize: Math.max(15, Math.min(shortSide * 0.04, 20)),
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
  },

  backGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 999,
  },

  backText: {
    fontWeight: '500',
    color: '#222222',
  },

  title: {
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 20,
    textShadowColor: 'rgba(75, 50, 45, 0.35)',
    textShadowOffset: {
      width: 1,
      height: 2,
    },
    textShadowRadius: 2,
  },

  pickerCard: {
    width: '100%',
    backgroundColor: '#F8D5D5',
    borderRadius: 12,
    paddingHorizontal: 8,
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 3,
  },

  wheelRow: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },

  selectedRow: {
    position: 'absolute',
    left: 8,
    right: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 9,
    zIndex: 1,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },

  wheelText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#222222',
  },

  errorText: {
    color: '#C62828',
    marginTop: 8,
  },

  goButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 14,
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: '#FFF6AE',
    justifyContent: 'center',
    alignItems: 'center',
  },

  goText: {
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

import { useEffect, useMemo, useRef, useState } from 'react';

import type {
  DimensionValue,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';

import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';

import { useFonts } from '@expo-google-fonts/google-sans/useFonts';
import { GoogleSans_400Regular } from '@expo-google-fonts/google-sans/400Regular';
import { GoogleSans_500Medium } from '@expo-google-fonts/google-sans/500Medium';
import { GoogleSans_600SemiBold } from '@expo-google-fonts/google-sans/600SemiBold';

import { saveBirthDate } from '../../features/onboarding/services/onboardingService';

type WheelColumnProps = {
  items: string[];
  selectedIndex: number;
  itemHeight: number;
  width: DimensionValue;
  onValueChange: (value: string, index: number) => void;
};

function WheelColumn({
  items,
  selectedIndex,
  itemHeight,
  width,
  onValueChange,
}: WheelColumnProps) {
  const scrollRef = useRef<ScrollView>(null);

  const currentIndexRef = useRef(selectedIndex);
  const [visibleIndex, setVisibleIndex] =
    useState(selectedIndex);

  useEffect(() => {
    currentIndexRef.current = selectedIndex;
    setVisibleIndex(selectedIndex);

    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: selectedIndex * itemHeight,
        animated: false,
      });
    }, 30);

    return () => clearTimeout(timer);
  }, [selectedIndex, itemHeight]);

  const getIndexFromOffset = (
    offsetY: number
  ) => {
    const index = Math.round(
      offsetY / itemHeight
    );

    return Math.max(
      0,
      Math.min(index, items.length - 1)
    );
  };

  const handleScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const offsetY =
      event.nativeEvent.contentOffset.y;

    const index =
      getIndexFromOffset(offsetY);

    if (
      index !== currentIndexRef.current
    ) {
      currentIndexRef.current = index;
      setVisibleIndex(index);
    }
  };

  const handleMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const offsetY =
      event.nativeEvent.contentOffset.y;

    const index =
      getIndexFromOffset(offsetY);

    const targetY =
      index * itemHeight;

    scrollRef.current?.scrollTo({
      y: targetY,
      animated: false,
    });

    currentIndexRef.current = index;
    setVisibleIndex(index);

    onValueChange(
      items[index],
      index
    );
  };

  const handleScrollEndDrag = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const offsetY =
      event.nativeEvent.contentOffset.y;

    const index =
      getIndexFromOffset(offsetY);

    currentIndexRef.current = index;
    setVisibleIndex(index);
  };

  return (
    <ScrollView
      ref={scrollRef}
      style={[
        styles.wheelColumn,
        {
          width,
          height: itemHeight * 3,
        },
      ]}
      contentContainerStyle={{
        paddingVertical: itemHeight,
      }}
      showsVerticalScrollIndicator={false}
      snapToInterval={itemHeight}
      snapToAlignment="start"
      decelerationRate="fast"
      bounces={false}
      alwaysBounceVertical={false}
      scrollEventThrottle={16}
      onScroll={handleScroll}
      onScrollEndDrag={handleScrollEndDrag}
      onMomentumScrollEnd={
        handleMomentumScrollEnd
      }
    >
      {items.map((item, index) => {
        const distance = Math.abs(
          index - visibleIndex
        );

        return (
          <View
            key={`${item}-${index}`}
            style={[
              styles.wheelItem,
              {
                height: itemHeight,
                opacity:
                  distance === 0
                    ? 1
                    : distance === 1
                      ? 0.45
                      : 0.12,
              },
            ]}
          >
            <Text
              style={[
                styles.wheelText,
                distance === 0 &&
                styles.wheelTextSelected,
              ]}
            >
              {item}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

export default function BirthdayScreen() {
  const { width, height } =
    useWindowDimensions();

  const shortSide = Math.min(
    width,
    height
  );

  const { name } =
    useLocalSearchParams<{
      name?: string;
    }>();

  const [fontsLoaded] = useFonts({
    GoogleSans:
      GoogleSans_400Regular,

    GoogleSansMedium:
      GoogleSans_500Medium,

    GoogleSansSemiBold:
      GoogleSans_600SemiBold,
  });

  const defaultDate = useMemo(() => {
    const today = new Date();

    return new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate()
    );
  }, []);

  const days = useMemo(
    () =>
      Array.from(
        { length: 31 },
        (_, index) =>
          String(index + 1)
      ),
    []
  );

  const months = useMemo(
    () => [
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
    const currentYear =
      new Date().getFullYear();

    return Array.from(
      { length: 83 },
      (_, index) =>
        String(
          currentYear -
          18 -
          index
        )
    );
  }, []);

  const initialDayIndex =
    defaultDate.getDate() - 1;

  const initialMonthIndex =
    defaultDate.getMonth();

  const initialYearIndex = Math.max(
    0,
    years.indexOf(
      String(
        defaultDate.getFullYear()
      )
    )
  );

  const [day, setDay] = useState(
    String(
      defaultDate.getDate()
    )
  );

  const [month, setMonth] =
    useState(
      months[initialMonthIndex]
    );

  const [year, setYear] = useState(
    String(
      defaultDate.getFullYear()
    )
  );

  const [dayIndex, setDayIndex] =
    useState(initialDayIndex);

  const [monthIndex, setMonthIndex] =
    useState(
      initialMonthIndex
    );

  const [yearIndex, setYearIndex] =
    useState(
      initialYearIndex
    );

  const [errorMessage, setErrorMessage] =
    useState('');

  const itemHeight = Math.max(
    38,
    Math.min(
      height * 0.052,
      50
    )
  );

  const horizontalPadding =
    Math.max(
      24,
      width * 0.1
    );

  const titleSize = Math.max(
    20,
    Math.min(
      shortSide * 0.055,
      30
    )
  );

  const backButtonWidth =
    Math.max(
      42,
      Math.min(
        shortSide * 0.12,
        64
      )
    );

  const backButtonHeight =
    Math.max(
      28,
      Math.min(
        shortSide * 0.072,
        38
      )
    );

  const getDaysInMonth = (
    numericYear: number,
    numericMonthIndex: number
  ) => {
    return new Date(
      numericYear,
      numericMonthIndex + 1,
      0
    ).getDate();
  };

  const handleDayChange = (
    value: string,
    index: number
  ) => {
    setDay(value);
    setDayIndex(index);
    setErrorMessage('');
  };

  const handleMonthChange = (
    value: string,
    index: number
  ) => {
    setMonth(value);
    setMonthIndex(index);
    setErrorMessage('');

    const numericYear =
      Number(year);

    const maxDay =
      getDaysInMonth(
        numericYear,
        index
      );

    const numericDay =
      Number(day);

    if (
      Number.isInteger(
        numericDay
      ) &&
      numericDay > maxDay
    ) {
      setDay(
        String(maxDay)
      );

      setDayIndex(
        maxDay - 1
      );
    }
  };

  const handleYearChange = (
    value: string,
    index: number
  ) => {
    setYear(value);
    setYearIndex(index);
    setErrorMessage('');

    const numericYear =
      Number(value);

    const maxDay =
      getDaysInMonth(
        numericYear,
        monthIndex
      );

    const numericDay =
      Number(day);

    if (
      Number.isInteger(
        numericDay
      ) &&
      numericDay > maxDay
    ) {
      setDay(
        String(maxDay)
      );

      setDayIndex(
        maxDay - 1
      );
    }
  };

  const handleBack = () => {
    router.replace('/name');
  };

  const handleContinue =
    async () => {
      setErrorMessage('');

      const numericDay =
        Number(day);

      const numericMonth =
        monthIndex + 1;

      const numericYear =
        Number(year);

      if (
        !Number.isInteger(
          numericDay
        ) ||
        !Number.isInteger(
          numericMonth
        ) ||
        !Number.isInteger(
          numericYear
        )
      ) {
        setErrorMessage(
          'Please select your birthday.'
        );
        return;
      }

      if (
        numericMonth < 1 ||
        numericMonth > 12
      ) {
        setErrorMessage(
          'Please select a valid month.'
        );
        return;
      }

      const maxDay =
        getDaysInMonth(
          numericYear,
          monthIndex
        );

      if (
        numericDay < 1 ||
        numericDay > maxDay
      ) {
        setErrorMessage(
          'Please select a valid date.'
        );
        return;
      }

      const selectedDate =
        new Date(
          numericYear,
          monthIndex,
          numericDay
        );

      if (
        selectedDate.getFullYear() !==
        numericYear ||
        selectedDate.getMonth() !==
        monthIndex ||
        selectedDate.getDate() !==
        numericDay
      ) {
        setErrorMessage(
          'Please select a valid date.'
        );
        return;
      }

      const today =
        new Date();

      let age =
        today.getFullYear() -
        selectedDate.getFullYear();

      const birthdayThisYear =
        new Date(
          today.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate()
        );

      if (
        today <
        birthdayThisYear
      ) {
        age -= 1;
      }

      if (age < 18) {
        setErrorMessage(
          'You must be at least 18 years old.'
        );
        return;
      }

      const monthNumber =
        String(
          numericMonth
        ).padStart(2, '0');

      const dayNumber =
        String(
          numericDay
        ).padStart(2, '0');

      const birthDate =
        `${numericYear}-${monthNumber}-${dayNumber}`;

      try {
        console.log('Saving birthday:', birthDate);

        await saveBirthDate(birthDate);

        console.log('Birthday saved:', birthDate);

        router.push('/study');
      } catch (error) {
        console.error('Save birthday error:', error);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Unable to save your birthday.'
        );
      }
    };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <LinearGradient
      colors={[
        '#FF7F87',
        '#FFA577',
        '#FFE8C8',
      ]}
      locations={[
        0,
        0.45,
        1,
      ]}
      style={styles.screen}
    >
      <Pressable
        style={[
          styles.backButton,
          {
            top: Math.max(
              20,
              height * 0.04
            ),

            left: Math.max(
              20,
              width * 0.07
            ),

            width:
              backButtonWidth,

            height:
              backButtonHeight,
          },
        ]}
        onPress={handleBack}
      >
        <LinearGradient
          colors={[
            '#FFE98F',
            '#FFB873',
          ]}
          start={{
            x: 0,
            y: 0,
          }}
          end={{
            x: 1,
            y: 1,
          }}
          style={
            styles.backGradient
          }
        >
          <Text
            style={[
              styles.backText,
              {
                fontSize:
                  Math.max(
                    12,
                    Math.min(
                      shortSide *
                      0.033,
                      17
                    )
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
            paddingHorizontal:
              horizontalPadding,

            paddingTop:
              Math.max(
                110,
                height * 0.17
              ),
          },
        ]}
      >
        <Text
          style={[
            styles.title,
            {
              fontSize:
                titleSize,

              lineHeight:
                titleSize * 1.15,
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
              height:
                itemHeight * 3,
            },
          ]}
        >
          {/* SELECTED WHITE ROW + INNER SHADOW */}

          <View
            pointerEvents="none"
            style={[
              styles.selectedRow,
              {
                top:
                  itemHeight,

                height:
                  itemHeight,
              },
            ]}
          >
            {/* เงาด้านบนอยู่ "ข้างใน" กล่องขาว */}
            <LinearGradient
              colors={[
                'rgba(120, 70, 70, 0.16)',
                'rgba(120, 70, 70, 0)',
              ]}
              start={{
                x: 0,
                y: 0,
              }}
              end={{
                x: 0,
                y: 1,
              }}
              style={
                styles.selectedTopShadow
              }
            />

            {/* เงาด้านล่างอยู่ "ข้างใน" กล่องขาว */}
            <LinearGradient
              colors={[
                'rgba(120, 70, 70, 0)',
                'rgba(120, 70, 70, 0.16)',
              ]}
              start={{
                x: 0,
                y: 0,
              }}
              end={{
                x: 0,
                y: 1,
              }}
              style={
                styles.selectedBottomShadow
              }
            />
          </View>

          {/* WHEELS */}

          <View
            pointerEvents="box-none"
            style={
              styles.wheelLayer
            }
          >
            <WheelColumn
              items={days}
              selectedIndex={
                dayIndex
              }
              itemHeight={
                itemHeight
              }
              width="23%"
              onValueChange={
                handleDayChange
              }
            />

            <WheelColumn
              items={months}
              selectedIndex={
                monthIndex
              }
              itemHeight={
                itemHeight
              }
              width="48%"
              onValueChange={
                handleMonthChange
              }
            />

            <WheelColumn
              items={years}
              selectedIndex={
                yearIndex
              }
              itemHeight={
                itemHeight
              }
              width="29%"
              onValueChange={
                handleYearChange
              }
            />
          </View>
        </View>

        {errorMessage ? (
          <Text
            style={[
              styles.errorText,
              {
                fontSize:
                  Math.max(
                    11,
                    Math.min(
                      shortSide *
                      0.03,
                      15
                    )
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
              minWidth:
                Math.max(
                  58,
                  Math.min(
                    shortSide *
                    0.15,
                    84
                  )
                ),

              height:
                Math.max(
                  34,
                  Math.min(
                    height *
                    0.045,
                    44
                  )
                ),
            },
          ]}
          onPress={
            handleContinue
          }
        >
          <Text
            style={[
              styles.goText,
              {
                fontSize:
                  Math.max(
                    15,
                    Math.min(
                      shortSide *
                      0.04,
                      20
                    )
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

    justifyContent:
      'center',

    alignItems:
      'center',
  },

  backText: {
    fontFamily:
      'GoogleSansMedium',

    color: '#222222',
  },

  title: {
    fontFamily:
      'GoogleSansSemiBold',

    fontWeight: '600',

    color: '#FFFFFF',

    marginBottom: 20,

    textShadowColor:
      'rgba(75, 50, 45, 0.35)',

    textShadowOffset: {
      width: 1,
      height: 2,
    },

    textShadowRadius: 2,
  },

  pickerCard: {
    width: '100%',

    backgroundColor:
      '#F8D5D5',

    borderRadius: 12,

    position: 'relative',

    overflow: 'hidden',

    shadowColor:
      '#000000',

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.18,

    shadowRadius: 3,

    elevation: 3,
  },

  /*
   * กล่องขาวตรงกลาง
   */
  selectedRow: {
    position: 'absolute',

    left: 8,
    right: 8,

    backgroundColor:
      '#FFFFFF',

    borderRadius: 9,

    shadowColor:
      '#000000',

    shadowOffset: {
      width: 0,
      height: 1,
    },

    shadowOpacity: 0.12,

    shadowRadius: 2,

    elevation: 1,

    zIndex: 0,

    overflow: 'hidden',
  },

  /*
   * เงาด้านบนของกล่องขาว
   */
  selectedTopShadow: {
    position: 'absolute',

    top: 0,
    left: 0,
    right: 0,

    height: '35%',
  },

  /*
   * เงาด้านล่างของกล่องขาว
   */
  selectedBottomShadow: {
    position: 'absolute',

    bottom: 0,
    left: 0,
    right: 0,

    height: '35%',
  },

  wheelLayer: {
    position: 'absolute',

    top: 0,
    left: 8,
    right: 8,
    bottom: 0,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent:
      'center',

    zIndex: 2,

    elevation: 2,
  },

  wheelColumn: {
    flexGrow: 0,

    flexShrink: 0,

    backgroundColor:
      'transparent',
  },

  wheelItem: {
    justifyContent:
      'center',

    alignItems:
      'center',

    backgroundColor:
      'transparent',
  },

  wheelText: {
    fontFamily:
      'GoogleSans',

    fontSize: 16,

    fontWeight: '500',

    color: '#222222',

    textAlign: 'center',

    includeFontPadding:
      false,
  },

  wheelTextSelected: {
    fontFamily:
      'GoogleSansSemiBold',

    fontWeight: '600',
  },

  errorText: {
    fontFamily:
      'GoogleSans',

    color: '#C62828',

    marginTop: 7,
  },

  goButton: {
    alignSelf:
      'flex-end',

    paddingHorizontal: 14,

    marginTop: 16,

    borderRadius: 12,

    backgroundColor:
      '#FFF6AE',

    justifyContent:
      'center',

    alignItems:
      'center',

    shadowColor:
      '#000000',

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.28,

    shadowRadius: 5,

    elevation: 6,
  },

  goText: {
    fontFamily:
      'GoogleSansSemiBold',

    fontWeight: '600',

    color: '#111111',

    textShadowColor:
      'rgba(0, 0, 0, 0.15)',

    textShadowOffset: {
      width: 0,
      height: 1,
    },

    textShadowRadius: 1,
  },
});
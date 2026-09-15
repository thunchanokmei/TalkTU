import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import {
  LinearGradient,
} from 'expo-linear-gradient';

import {
  router,
} from 'expo-router';

import WheelPicker
  from '../../components/WheelPicker';

import {
  getBirthDate,
  getDisplayName,
  saveBirthDate,
} from '../../features/onboarding/services/onboardingService';

export default function BirthdayScreen() {
  const {
    width,
    height,
  } =
    useWindowDimensions();

  const shortSide =
    Math.min(
      width,
      height
    );

  const defaultDate =
    useMemo(() => {
      const today =
        new Date();

      return new Date(
        today.getFullYear() -
        18,
        today.getMonth(),
        today.getDate()
      );
    }, []);

  const days =
    useMemo(
      () =>
        Array.from(
          {
            length: 31,
          },
          (_, index) =>
            String(
              index + 1
            )
        ),
      []
    );

  const months =
    useMemo(
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

  const years =
    useMemo(() => {
      const currentYear =
        new Date()
          .getFullYear();

      return Array.from(
        {
          length: 83,
        },
        (_, index) =>
          String(
            currentYear -
            18 -
            index
          )
      );
    }, []);

  const [
    displayName,
    setDisplayName,
  ] =
    useState('');

  const [
    day,
    setDay,
  ] =
    useState(
      String(
        defaultDate.getDate()
      )
    );

  const [
    month,
    setMonth,
  ] =
    useState(
      months[
      defaultDate.getMonth()
      ]
    );

  const [
    year,
    setYear,
  ] =
    useState(
      String(
        defaultDate.getFullYear()
      )
    );

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState('');

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const itemHeight = Math.max(
    54,
    Math.min(
      height * 0.065,
      60
    )
  );

  useEffect(() => {
    const loadSavedData =
      async () => {
        try {
          const [
            savedName,
            savedBirthDate,
          ] =
            await Promise.all([
              getDisplayName(),
              getBirthDate(),
            ]);

          if (savedName) {
            setDisplayName(
              savedName
            );
          }

          /*
           * IMPORTANT:
           * Split YYYY-MM-DD manually.
           * Do not do new Date('YYYY-MM-DD'),
           * because timezone conversion can move
           * the displayed day.
           */
          if (savedBirthDate) {
            const [
              y,
              m,
              d,
            ] =
              savedBirthDate
                .split('-')
                .map(Number);

            if (
              Number.isInteger(y) &&
              Number.isInteger(m) &&
              Number.isInteger(d) &&
              m >= 1 &&
              m <= 12
            ) {
              const yearString =
                String(y);

              if (
                years.includes(
                  yearString
                )
              ) {
                setYear(
                  yearString
                );
              }

              setMonth(
                months[
                m - 1
                ]
              );

              setDay(
                String(d)
              );
            }
          }
        } catch (error) {
          console.error(
            'Load birthday data error:',
            error
          );
        }
      };

    loadSavedData();
  }, [
    months,
    years,
  ]);

  const monthIndex =
    Math.max(
      0,
      months.indexOf(
        month
      )
    );

  const getDaysInMonth = (
    numericYear: number,
    numericMonthIndex:
      number
  ) =>
    new Date(
      numericYear,
      numericMonthIndex +
      1,
      0
    ).getDate();

  /*
   * If Month/Year changes and the current day
   * no longer exists (31 -> February),
   * update both state and wheel.
   */
  useEffect(() => {
    const maxDay =
      getDaysInMonth(
        Number(year),
        monthIndex
      );

    if (
      Number(day) >
      maxDay
    ) {
      setDay(
        String(maxDay)
      );
    }
  }, [
    day,
    monthIndex,
    year,
  ]);

  const handleContinue =
    async () => {
      setErrorMessage('');

      const numericDay =
        Number(day);

      const numericMonth =
        monthIndex + 1;

      const numericYear =
        Number(year);

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

      const today =
        new Date();

      let age =
        today.getFullYear() -
        selectedDate
          .getFullYear();

      const birthdayThisYear =
        new Date(
          today.getFullYear(),
          selectedDate
            .getMonth(),
          selectedDate
            .getDate()
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

      const birthDate =
        `${numericYear}-` +
        `${String(
          numericMonth
        ).padStart(
          2,
          '0'
        )}-` +
        `${String(
          numericDay
        ).padStart(
          2,
          '0'
        )}`;

      try {
        setSaving(true);

        /*
         * day/month/year are continuously
         * synchronized with the highlighted
         * wheel row, so this is exactly what
         * the user sees.
         */
        await saveBirthDate(
          birthDate
        );

        router.push(
          '/study'
        );
      } catch (error) {
        console.error(
          'Save birthday error:',
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Unable to save your birthday.'
        );
      } finally {
        setSaving(false);
      }
    };

  const horizontalPadding =
    Math.max(
      24,
      width * 0.1
    );

  const titleSize =
    Math.max(
      26,
      Math.min(
        shortSide * 0.065,
        34
      )
    );

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
            top:
              Math.max(
                20,
                height * 0.04
              ),

            left:
              Math.max(
                20,
                width * 0.07
              ),
          },
        ]}
        onPress={() =>
          router.replace(
            '/name'
          )
        }
      >
        <LinearGradient
          colors={[
            '#FFE98F',
            '#FFB873',
          ]}
          style={
            styles.backGradient
          }
        >
          <Text
            style={
              styles.backText
            }
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
                titleSize *
                1.15,
            },
          ]}
        >
          Hi{' '}
          {displayName ||
            'there'}
          {'\n'}
          When your{'\n'}
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
          <View
            pointerEvents="none"
            style={[
              styles.sharedSelectedRow,
              {
                top:
                  itemHeight,

                height:
                  itemHeight,
              },
            ]}
          />
          <WheelPicker
            items={days}
            value={day}
            itemHeight={itemHeight}
            width="28%"
            showSelectionBackground={false}
            onValueChange={(value) => {
              setDay(value);
              setErrorMessage('');
            }}
          />

          <WheelPicker
            items={months}
            value={month}
            itemHeight={itemHeight}
            width="42%"
            showSelectionBackground={false}
            onValueChange={(value) => {
              setMonth(value);
              setErrorMessage('');
            }}
          />

          <WheelPicker
            items={years}
            value={year}
            itemHeight={itemHeight}
            width="30%"
            showSelectionBackground={false}
            onValueChange={(value) => {
              setYear(value);
              setErrorMessage('');
            }}
          />
        </View>

        {errorMessage ? (
          <Text
            style={
              styles.errorText
            }
          >
            {errorMessage}
          </Text>
        ) : null}

        <Pressable
          disabled={saving}
          style={[
            styles.goButton,
            saving &&
            styles.disabled,
          ]}
          onPress={
            handleContinue
          }
        >
          <Text
            style={
              styles.goText
            }
          >
            {saving
              ? '...'
              : 'go!'}
          </Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,
    },

    content: {
      flex: 1,
    },

    backButton: {
      position: 'absolute',

      zIndex: 20,

      width: 50,
      height: 32,

      borderRadius: 999,
      overflow: 'hidden',
    },

    backGradient: {
      flex: 1,

      alignItems: 'center',
      justifyContent:
        'center',
    },

    backText: {
      color: '#222222',
      fontWeight: '500',
    },

    title: {
      marginBottom: 30,

      color: '#FFFFFF',

      fontWeight: '700',

      textShadowColor:
        'rgba(75,50,45,0.35)',

      textShadowOffset: {
        width: 2,
        height: 3,
      },

      textShadowRadius: 2,
    },

    pickerCard: {
      width: '100%',

      position: 'relative',

      flexDirection: 'row',

      alignItems: 'center',

      overflow: 'hidden',

      borderRadius: 18,

      backgroundColor: '#F7D9D8',

      shadowColor: '#000000',

      shadowOffset: {
        width: 0,
        height: 4,
      },

      shadowOpacity: 0.22,

      shadowRadius: 5,

      elevation: 5,
    },
    sharedSelectedRow: {
      position: 'absolute',

      left: 14,
      right: 14,

      zIndex: 0,

      borderRadius: 15,

      backgroundColor: '#FFFFFF',

      shadowColor: '#000000',

      shadowOffset: {
        width: 0,
        height: 2,
      },

      shadowOpacity: 0.22,

      shadowRadius: 4,

      elevation: 4,
    },

    errorText: {
      marginTop: 10,

      color: '#C62828',
    },

    goButton: {
      alignSelf: 'flex-end',

      marginTop: 30,

      minWidth: 112,
      height: 48,

      borderRadius: 16,

      alignItems: 'center',
      justifyContent: 'center',

      backgroundColor: '#FFF6AE',

      shadowColor: '#000000',

      shadowOffset: {
        width: 0,
        height: 4,
      },

      shadowOpacity: 0.25,

      shadowRadius: 5,

      elevation: 5,
    },

    goText: {
      fontSize: 25,
      fontWeight: '700',

      color: '#111111',
    },

    disabled: {
      opacity: 0.6,
    },
  });

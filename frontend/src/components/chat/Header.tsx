import React from 'react';
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const CORAL = '#EE7F7F';
const ORANGE = '#F7A572';
const SIDE_SLOT = 72; // ซ้าย/ขวากว้างเท่ากัน เพื่อให้ชื่ออยู่กึ่งกลางจริง

type HeaderProps = {
  variant?: 'logo' | 'chat';
  title?: string;
  onBackPress?: () => void;
  onReportPress?: () => void;
};

export default function Header({
  variant = 'logo',
  title,
  onBackPress,
  onReportPress,
}: HeaderProps) {
  const { width: screenWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const isWide = screenWidth >= 768;

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
      return;
    }
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/chat');
    }
  };

  const containerStyle = [
    styles.base,
    isWide && styles.wide,
    { paddingTop: insets.top + 20 },
  ];

  if (variant === 'chat') {
    return (
      <View style={[containerStyle, styles.chatPad]}>
        <View style={styles.row}>
          <View style={styles.sideSlot}>
            <Pressable
              onPress={handleBack}
              accessibilityRole="button"
              accessibilityLabel="Back"
            >
              <LinearGradient
                colors={[ORANGE, CORAL]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.circleButton}
              >
                <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
              </LinearGradient>
            </Pressable>
          </View>

          <View style={styles.titleWrap}>
            <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
              {title}
            </Text>
          </View>

          <View style={[styles.sideSlot, styles.sideSlotRight]}>
            <Pressable
              onPress={onReportPress}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Report"
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            >
              <Ionicons name="alert-circle-outline" size={28} color={CORAL} />
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[containerStyle, styles.logoPad]}>
      <Image
        source={require('../../../assets/images/chat-header.png')}
        style={styles.chatLogo}
        resizeMode="contain"
      />
    </View>
  );
}

const headerShadow = Platform.select({
  web: { boxShadow: '0px 6px 14px rgba(0,0,0,0.12)' } as any,
  default: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
});

const titleShadow = Platform.select({
  web: { textShadow: '0px 2px 4px rgba(238,127,127,0.40)' } as any,
  default: {
    textShadowColor: 'rgba(238,127,127,0.40)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});

const styles = StyleSheet.create({
  // ติดขอบบน เต็มความกว้าง โค้งเฉพาะมุมล่าง
  base: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    zIndex: 10,
    ...headerShadow,
  },

  // Tablet / Web: จำกัดความกว้างและจัดกึ่งกลาง
  wide: {
    maxWidth: 620,
    alignSelf: 'center',
  },

  logoPad: {
    paddingBottom: 14,
    paddingLeft: 28,
    alignItems: 'flex-start',
  },

  chatPad: {
    paddingBottom: 16,
    paddingHorizontal: 16,
  },

  chatLogo: {
    width: 150,
    height: 64,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
  },

  sideSlot: {
    width: SIDE_SLOT,
  },

  sideSlotRight: {
    alignItems: 'flex-end',
  },

  titleWrap: {
    flex: 1,
    alignItems: 'center',
  },

  title: {
    fontSize: 22,
    fontWeight: '600',
    color: CORAL,
    ...titleShadow,
  },

  backPill: {
    width: 64,
    height: 36,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  secondChevron: {
    marginLeft: -10,
  },
  headerShadow: {
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 4,
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
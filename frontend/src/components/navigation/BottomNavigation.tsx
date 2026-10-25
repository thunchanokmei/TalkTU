import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  LayoutChangeEvent,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { usePathname, useRouter } from 'expo-router';

export type BottomNavTab =
  | 'swap'
  | 'like'
  | 'board'
  | 'chat'
  | 'profile';

type BottomNavigationProps = {
  style?: ViewStyle;
};

const NAV_ITEMS: {
  key: BottomNavTab;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: 'swap', label: 'Swap', icon: 'happy' },
  { key: 'like', label: 'Like', icon: 'heart' },
  { key: 'board', label: 'Board', icon: 'albums-outline' },
  { key: 'chat', label: 'Chat', icon: 'chatbubble-ellipses' },
  { key: 'profile', label: 'Profile', icon: 'person' },
];

const ROUTES = {
  swap: '/swipe',
  like: '/like',
  board: '/feed',
  chat: '/chat',
  profile: '/profile',
} as const;

// หา tab ที่ active จาก path (รองรับหน้าย่อย เช่น /chat/123)
function getTabFromPath(pathname: string): BottomNavTab {
  if (pathname.startsWith('/like')) return 'like';
  if (pathname.startsWith('/chat')) return 'chat';
  if (pathname.startsWith('/profile')) return 'profile';
  return 'swap';
}

const PADDING = 6;

export default function BottomNavigation({ style }: BottomNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const activeTab = getTabFromPath(pathname);

  const { width, height } = useWindowDimensions();

  const shortSide = Math.min(width, height);

  const horizontalMargin = Math.max(20, Math.min(shortSide * 0.06, 32));
  const bottomMargin = Math.max(10, Math.min(shortSide * 0.025, 18));
  const navHeight = Math.max(58, Math.min(shortSide * 0.16, 68));
  const itemSize = navHeight - 8;
  const iconSize = Math.max(19, Math.min(shortSide * 0.052, 24));

  const activeIndex = NAV_ITEMS.findIndex((i) => i.key === activeTab);

  const [containerWidth, setContainerWidth] = useState(0);

  const slotWidth =
    containerWidth > 0 ? (containerWidth - PADDING * 2) / NAV_ITEMS.length : 0;

  const pillX = (index: number) =>
    PADDING + index * slotWidth + (slotWidth - itemSize) / 2;

  const translateX = useRef(new Animated.Value(0)).current;
  const pillScale = useRef(new Animated.Value(1)).current;

  // refs เพื่อให้ PanResponder อ่านค่าล่าสุดได้เสมอ
  const startX = useRef(0);
  const currentX = useRef(0);
  const latest = useRef({ slotWidth, itemSize, activeIndex, activeTab });
  latest.current = { slotWidth, itemSize, activeIndex, activeTab };

  useEffect(() => {
    const id = translateX.addListener(({ value }) => {
      currentX.current = value;
    });
    return () => translateX.removeListener(id);
  }, [translateX]);

  // เลื่อน pill ไปที่ tab ที่ active
  useEffect(() => {
    if (slotWidth === 0) return;
    Animated.spring(translateX, {
      toValue: pillX(activeIndex),
      useNativeDriver: true,
      damping: 16,
      stiffness: 180,
      mass: 0.8,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, slotWidth, itemSize]);

  const goTo = (index: number) => {
  const item = NAV_ITEMS[index];
  if (!item || item.key === latest.current.activeTab) return;
  router.navigate(ROUTES[item.key]);
};

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        // ปล่อยให้ tap ปกติผ่านไปที่ปุ่ม จับเฉพาะตอนลากแนวนอน
        onMoveShouldSetPanResponder: (_, g) =>
          Math.abs(g.dx) > 6 && Math.abs(g.dx) > Math.abs(g.dy),
        onPanResponderGrant: () => {
          translateX.stopAnimation((v) => {
            startX.current = v;
          });
          Animated.spring(pillScale, {
            toValue: 1.1,
            useNativeDriver: true,
            friction: 6,
          }).start();
        },
        onPanResponderMove: (_, g) => {
          const { slotWidth: sw, itemSize: is } = latest.current;
          const min = PADDING + (sw - is) / 2;
          const max = min + sw * (NAV_ITEMS.length - 1);
          const next = Math.max(min, Math.min(startX.current + g.dx, max));
          translateX.setValue(next);
        },
        onPanResponderRelease: () => finishDrag(),
        onPanResponderTerminate: () => finishDrag(),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const finishDrag = () => {
    const { slotWidth: sw, itemSize: is, activeIndex: ai } = latest.current;
    const center = currentX.current - PADDING + is / 2;
    const idx = Math.max(
      0,
      Math.min(Math.floor(center / sw), NAV_ITEMS.length - 1)
    );

    Animated.spring(pillScale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
    }).start();

    const target = NAV_ITEMS[idx];
    if (idx === ai || target.key === 'board') {
      // ไม่มีหน้าปลายทาง -> เด้งกลับที่เดิม
      Animated.spring(translateX, {
        toValue: PADDING + ai * sw + (sw - is) / 2,
        useNativeDriver: true,
        damping: 16,
        stiffness: 180,
      }).start();
      return;
    }

    Animated.spring(translateX, {
      toValue: PADDING + idx * sw + (sw - is) / 2,
      useNativeDriver: true,
      damping: 16,
      stiffness: 180,
    }).start();
    goTo(idx);
  };

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w !== containerWidth) setContainerWidth(w);
  };

  return (
    // View ด้านนอกรับเงา (เงาต้องมี backgroundColor ถึงจะขึ้น)
    <View
      onLayout={onLayout}
      {...panResponder.panHandlers}
      style={[
        styles.bottomNav,
        {
          marginHorizontal: horizontalMargin,
          marginBottom: bottomMargin,
          minHeight: navHeight,
        },
        style,
      ]}
    >
      {/* พื้นหลัง gradient สีเดิม */}
      <LinearGradient
        colors={['#FF8D88', '#FFAF79', '#FFD86E']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.background}
      />

      {/* แผ่นเลื่อนตามนิ้ว (อยู่ใต้ไอคอน) */}
      {slotWidth > 0 && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.pill,
            {
              width: itemSize,
              height: itemSize,
              borderRadius: itemSize / 2,
              transform: [{ translateX }, { scale: pillScale }],
            },
          ]}
        >
          {/* inner shadow: ไล่เงาเข้มจากขอบบนและขอบข้าง */}
          <LinearGradient
            colors={['rgba(170,40,32,0.45)', 'rgba(170,40,32,0)']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 0.6 }}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={['rgba(170,40,32,0.25)', 'rgba(170,40,32,0)']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 0.4, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={['rgba(170,40,32,0.25)', 'rgba(170,40,32,0)']}
            start={{ x: 1, y: 0.5 }}
            end={{ x: 0.6, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
          {/* แสงสะท้อนบางๆ ขอบล่าง ให้ดูเป็นขอบนูนของกระจก */}
          <LinearGradient
            colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.45)']}
            start={{ x: 0.5, y: 0.8 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      )}

      {NAV_ITEMS.map((item, index) => (
        <TouchableOpacity
          key={item.key}
          activeOpacity={0.75}
          style={[styles.navItem, { height: itemSize }]}
          onPress={() => goTo(index)}
        >
          <Ionicons name={item.icon} size={iconSize} color="#f7f3f3" />


          <Text style={styles.navLabel}>{item.label}</Text>
        </TouchableOpacity>
      ))}

    {NAV_ITEMS.map((item, index) => (
        <TouchableOpacity
          key={item.key}
          activeOpacity={0.75}
          style={[styles.navItem, { height: itemSize }]}
          onPress={() => goTo(index)}
        >
          <Ionicons
            name={item.icon}
            size={iconSize}
            color="#f7f3f3"
          />

          <Text style={styles.navLabel}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    backgroundColor: '#FFAF79',
    borderRadius: 999,

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: PADDING,
    paddingVertical: 4,

    ...Platform.select({
      ios: {
        shadowColor: '#FF6B5E',
        shadowOpacity: 0.35,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 6 },
      },
      android: {
        elevation: 10,
        shadowColor: '#FF6B5E',
      },
    }),
  },

  background: {
    ...StyleSheet.absoluteFill,
    borderRadius: 999,
  },

  pill: {
    position: 'absolute',
    top: 4,
    left: 0,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 104, 93, 0.65)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.3)',
  },

  navItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  navLabel: {
    marginTop: 1,

    fontSize: 10,
    fontWeight: '600',

    color: '#fbfafa',
  },
});
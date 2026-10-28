import { ReactNode } from 'react';
import {
  Image,
  ImageSourcePropType,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const HEADER_HEIGHT = 96;
const LOGO_HEIGHT = 64;
const LOGO_MAX_WIDTH = 250;
const SIDE_PADDING_LEFT = 5;
const SIDE_PADDING_RIGHT = 28;
const MARGIN_BOTTOM = 26;

// ใช้เมื่ออ่านขนาดรูปไม่ได้ (เช่นโลโก้ที่เป็น uri)

type AppHeaderProps = {
  logo: ImageSourcePropType;
  right?: ReactNode;
  centerLogo?: boolean;
};

export default function AppHeader({ logo, right, centerLogo = false, }: AppHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.header,
        {
          height: HEADER_HEIGHT + insets.top,
          paddingTop: insets.top,
        },
      ]}
    >
      {centerLogo ? (
        <View
          pointerEvents="none"
          style={[
            styles.centerLogoContainer,
            {
              top: insets.top,
            },
          ]}
        >
          <Image
            source={logo}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      ) : (
        <Image
          source={logo}
          style={styles.logo}
          resizeMode="contain"
        />
      )}

      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: SIDE_PADDING_LEFT,
    paddingRight: SIDE_PADDING_RIGHT,
    marginBottom: MARGIN_BOTTOM,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,

    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.16,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },

      web: {
        boxShadow: '0px 5px 14px rgba(0, 0, 0, 0.16)',
      },

    }),
  },

  right: {
    marginLeft: 'auto',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logo: {
    width: LOGO_MAX_WIDTH,
    height: LOGO_HEIGHT,
  },
  
  centerLogoContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

import { ReactNode } from 'react';
import {
  Image,
  ImageSourcePropType,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/*
 * Header กลางของหน้า Like / Chat / Profile
 *
 * ปรับขนาดและตำแหน่งโลโก้ได้ที่ค่าคงที่ด้านล่างนี้ที่เดียว
 * ทุกหน้าจะเปลี่ยนตามกัน
 */
const HEADER_HEIGHT = 96;
const LOGO_HEIGHT = 64;
const LOGO_MAX_WIDTH = 250;
const SIDE_PADDING_LEFT = 32;
const SIDE_PADDING_RIGHT = 28;
const MARGIN_BOTTOM = 26;

// ใช้เมื่ออ่านขนาดรูปไม่ได้ (เช่นโลโก้ที่เป็น uri)
const FALLBACK_RATIO = 3.5;

type AppHeaderProps = {
  /** รูปโลโก้ของหน้านั้น เช่น require('.../profile.png') */
  logo: ImageSourcePropType;

  /** ปุ่มฝั่งขวา (ไม่ใส่ก็ได้) */
  right?: ReactNode;
};

export default function AppHeader({ logo, right }: AppHeaderProps) {
  // header ครอบคลุมพื้นที่ใต้ status bar ด้วย เพื่อให้สีขาวต่อเนื่องกับขอบบนของโทรศัพท์
  // (หน้าที่ใช้ header นี้ไม่ต้องเว้น safe area ด้านบนเอง)
  const insets = useSafeAreaInsets();

  // ล็อกความสูงโลโก้ให้เท่ากันทุกหน้า แล้วคำนวณความกว้างตามสัดส่วนรูป
  const resolvedLogo = Image.resolveAssetSource(logo);
  const ratio =
    resolvedLogo?.width && resolvedLogo?.height
      ? resolvedLogo.width / resolvedLogo.height
      : FALLBACK_RATIO;

  let logoHeight = LOGO_HEIGHT;
  let logoWidth = logoHeight * ratio;

  if (logoWidth > LOGO_MAX_WIDTH) {
    logoWidth = LOGO_MAX_WIDTH;
    logoHeight = logoWidth / ratio;
  }

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
      <Image
        source={logo}
        style={{ width: logoWidth, height: logoHeight }}
        resizeMode="contain"
      />

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
    }),
  },

  right: {
    marginLeft: 'auto',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

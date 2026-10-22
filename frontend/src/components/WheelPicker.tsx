
import React, { useEffect, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type WheelPickerProps = {
  items: string[];
  value: string;
  itemHeight: number;
  width: number | `${number}%`;
  showSelectionBackground?: boolean;
  onValueChange: (value: string) => void;
};

export default function WheelPicker({
  items,
  value,
  itemHeight,
  width,
  showSelectionBackground = false,
  onValueChange,
}: WheelPickerProps) {
  const scrollRef = useRef<ScrollView>(null);
  const selectedIndex = Math.max(0, items.indexOf(value));

  useEffect(() => {
    const index = Math.max(0, items.indexOf(value));

    scrollRef.current?.scrollTo({
      y: index * itemHeight,
      animated: false,
    });
  }, [value, items, itemHeight]);

  const handleScrollEnd = (offsetY: number) => {
    const index = Math.max(
      0,
      Math.min(
        items.length - 1,
        Math.round(offsetY / itemHeight),
      ),
    );

    if (items[index] !== undefined) {
      onValueChange(items[index]);
    }
  };

  return (
    <View style={[styles.container, { width }]}>
      {showSelectionBackground && (
        <View
          pointerEvents="none"
          style={[
            styles.selection,
            { top: itemHeight, height: itemHeight },
          ]}
        />
      )}

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={{
          paddingVertical: itemHeight,
        }}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        directionalLockEnabled
        bounces={false}
        alwaysBounceVertical={false}
        decelerationRate="fast"
        snapToInterval={itemHeight}
        snapToAlignment="start"
        onMomentumScrollEnd={(event) => {
          handleScrollEnd(event.nativeEvent.contentOffset.y);
        }}
        onScrollEndDrag={(event) => {
          // รองรับการลากสั้น ๆ ที่ไม่มี momentum
          handleScrollEnd(event.nativeEvent.contentOffset.y);
        }}
      >
        {items.map((item, index) => (
          <View
            key={`${item}-${index}`}
            style={[styles.item, { height: itemHeight }]}
          >
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={[
                styles.label,
                {
                  fontSize: itemHeight * 0.34,
                  color:
                    index === selectedIndex
                      ? '#7C454B'
                      : '#B99A9C',
                  fontWeight:
                    index === selectedIndex ? '700' : '400',
                  opacity:
                    index === selectedIndex ? 1 : 0.72,
                },
              ]}
            >
              {item}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    minWidth: 0,
    position: 'relative',
  },
  scroll: {
    flex: 1,
  },
  item: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  label: {
    textAlign: 'center',
  },
  selection: {
    position: 'absolute',
    left: 2,
    right: 2,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
  },
});

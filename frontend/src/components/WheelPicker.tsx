import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import type {
    DimensionValue,
    NativeScrollEvent,
    NativeSyntheticEvent,
} from 'react-native';

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

    width?: DimensionValue;

    showSelectionBackground?: boolean;

    onValueChange: (
        value: string,
        index: number
    ) => void;
};

export default function WheelPicker({
    items,
    value,
    itemHeight,

    width = '100%',

    showSelectionBackground = true,

    onValueChange,
}: WheelPickerProps) {
    const scrollRef =
        useRef<ScrollView>(null);

    const isInteractingRef =
        useRef(false);

    const scrollTimerRef =
        useRef<ReturnType<
            typeof setTimeout
        > | null>(null);

    const selectedIndex =
        useMemo(() => {
            const index =
                items.indexOf(value);

            return index >= 0
                ? index
                : 0;
        }, [items, value]);

    const [
        currentIndex,
        setCurrentIndex,
    ] =
        useState(selectedIndex);

    const currentIndexRef =
        useRef(selectedIndex);

    const clampIndex = (
        index: number
    ) => {
        return Math.max(
            0,
            Math.min(
                index,
                items.length - 1
            )
        );
    };

    const getIndexFromOffset = (
        offsetY: number
    ) => {
        return clampIndex(
            Math.round(
                offsetY /
                itemHeight
            )
        );
    };

    const scrollToIndex = (
        index: number
    ) => {
        const safeIndex =
            clampIndex(index);

        scrollRef.current?.scrollTo({
            y:
                safeIndex *
                itemHeight,

            animated: false,
        });
    };

    /*
     * ถ้า value เปลี่ยนจากภายนอก
     * เช่น 31 -> 28 ตอนเปลี่ยนเดือน
     */
    useEffect(() => {
        if (
            isInteractingRef.current
        ) {
            return;
        }

        currentIndexRef.current =
            selectedIndex;

        setCurrentIndex(
            selectedIndex
        );

        requestAnimationFrame(() => {
            scrollToIndex(
                selectedIndex
            );
        });
    }, [
        selectedIndex,
        itemHeight,
    ]);

    /*
     * ตอนเปิดครั้งแรก
     */
    const handleLayout = () => {
        requestAnimationFrame(() => {
            scrollToIndex(
                selectedIndex
            );
        });
    };

    const selectIndex = (
        index: number
    ) => {
        const safeIndex =
            clampIndex(index);

        if (
            safeIndex ===
            currentIndexRef.current
        ) {
            return;
        }

        currentIndexRef.current =
            safeIndex;

        setCurrentIndex(
            safeIndex
        );

        onValueChange(
            items[safeIndex],
            safeIndex
        );
    };

    const handleScroll = (
        event:
            NativeSyntheticEvent<
                NativeScrollEvent
            >
    ) => {
        isInteractingRef.current =
            true;

        const offsetY =
            event.nativeEvent
                .contentOffset.y;

        const index =
            getIndexFromOffset(
                offsetY
            );

        selectIndex(index);

        /*
         * Web ใช้ mouse wheel/trackpad
         * บางครั้งไม่มี momentum-end
         *
         * รอจนหยุด scroll แล้วจัด offset
         * ของ ScrollView ที่ซ่อนอยู่
         *
         * ผู้ใช้จะไม่เห็นการ snap นี้เลย
         */
        if (
            scrollTimerRef.current
        ) {
            clearTimeout(
                scrollTimerRef.current
            );
        }

        scrollTimerRef.current =
            setTimeout(() => {
                const finalIndex =
                    currentIndexRef.current;

                scrollToIndex(
                    finalIndex
                );

                isInteractingRef.current =
                    false;
            }, 100);
    };

    const previousIndex =
        currentIndex - 1;

    const nextIndex =
        currentIndex + 1;

    return (
        <View
            onLayout={handleLayout}
            style={[
                styles.container,
                {
                    width,

                    height:
                        itemHeight * 3,
                },
            ]}
        >
            {/* background ของช่องกลาง
          ใช้เฉพาะกรณี component ต้องวาดเอง */}
            {showSelectionBackground ? (
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
                />
            ) : null}

            {/* =================================
          UI ที่ผู้ใช้มองเห็น
          ตำแหน่งทั้ง 3 แถว FIX ตายตัว
          ================================= */}

            <View
                pointerEvents="none"
                style={[
                    styles.visualRow,
                    {
                        top: 0,

                        height:
                            itemHeight,
                    },
                ]}
            >
                {items[
                    previousIndex
                ] !== undefined ? (
                    <Text
                        style={
                            styles.normalText
                        }
                    >
                        {
                            items[
                            previousIndex
                            ]
                        }
                    </Text>
                ) : null}
            </View>

            <View
                pointerEvents="none"
                style={[
                    styles.visualRow,
                    {
                        top:
                            itemHeight,

                        height:
                            itemHeight,
                    },
                ]}
            >
                <Text
                    style={
                        styles.selectedText
                    }
                >
                    {items[currentIndex]}
                </Text>
            </View>

            <View
                pointerEvents="none"
                style={[
                    styles.visualRow,
                    {
                        top:
                            itemHeight * 2,

                        height:
                            itemHeight,
                    },
                ]}
            >
                {items[
                    nextIndex
                ] !== undefined ? (
                    <Text
                        style={
                            styles.normalText
                        }
                    >
                        {
                            items[
                            nextIndex
                            ]
                        }
                    </Text>
                ) : null}
            </View>

            {/* =================================
          ScrollView จริง
          เอาไว้รับ wheel / trackpad / touch

          แต่ซ่อน text ข้างในทั้งหมด
          ================================= */}

            <ScrollView
                ref={scrollRef}

                style={
                    styles.scrollLayer
                }

                contentContainerStyle={{
                    paddingVertical:
                        itemHeight,
                }}

                showsVerticalScrollIndicator={
                    false
                }

                bounces={false}

                alwaysBounceVertical={
                    false
                }

                nestedScrollEnabled

                scrollEventThrottle={16}

                /*
                 * native ก็ช่วย snap
                 * แต่ต่อให้ Web snap ไม่เป๊ะ
                 * visual ด้านบนก็ยังกลางเสมอ
                 */
                snapToInterval={
                    itemHeight
                }

                snapToAlignment="start"

                decelerationRate="fast"

                onScroll={
                    handleScroll
                }
            >
                {items.map(
                    (
                        item,
                        index
                    ) => (
                        <View
                            key={`${item}-${index}`}
                            style={{
                                height:
                                    itemHeight,
                            }}
                        />
                    )
                )}
            </ScrollView>
        </View>
    );
}

const styles =
    StyleSheet.create({
        container: {
            position:
                'relative',

            overflow:
                'hidden',
        },

        selectedRow: {
            position:
                'absolute',

            left: 0,
            right: 0,

            borderRadius:
                15,

            backgroundColor:
                '#FFFFFF',
        },

        /*
         * ข้อความจริงที่มองเห็น
         */
        visualRow: {
            position:
                'absolute',

            left: 0,
            right: 0,

            alignItems:
                'center',

            justifyContent:
                'center',

            zIndex: 2,
        },

        normalText: {
            fontSize: 16,

            fontWeight:
                '500',

            color:
                '#A7A7A7',

            opacity: 0.55,

            textAlign:
                'center',
        },

        selectedText: {
            fontSize: 23,

            fontWeight:
                '700',

            color:
                '#111111',

            textAlign:
                'center',
        },

        scrollLayer: {
            position: 'absolute',

            top: 0,
            left: 0,
            right: 0,
            bottom: 0,

            zIndex: 10,

            opacity: 0.01,
        },
    });
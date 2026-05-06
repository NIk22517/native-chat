import React, { memo, useCallback, useEffect, useMemo, useRef } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

const ITEM_HEIGHT = 56;
const VISIBLE_ROWS = 5;
const CENTER_INDEX = Math.floor(VISIBLE_ROWS / 2);

const HOURS = Array.from({ length: 12 }, (_, i) =>
  String(i + 1).padStart(2, "0"),
);
const MINUTES = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, "0"),
);
const PERIODS = ["AM", "PM"] as const;

export interface TimeValue {
  hour: number;
  minute: number;
  period: "AM" | "PM";
}

type PickerColumnProps = {
  data: readonly string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  width: number;
};

const AnimatedScrollView = Animated.ScrollView;

const RowItem = memo(function RowItem({
  label,
  index,
  scrollY,
}: {
  label: string;
  index: number;
  scrollY: SharedValue<number>;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const centerY = scrollY.value + CENTER_INDEX * ITEM_HEIGHT;
    const itemY = index * ITEM_HEIGHT;
    const distance = Math.abs(centerY - itemY);

    return {
      opacity: interpolate(
        distance,
        [0, ITEM_HEIGHT, ITEM_HEIGHT * 2],
        [1, 0.55, 0.22],
        Extrapolation.CLAMP,
      ),
      transform: [
        {
          scale: interpolate(
            distance,
            [0, ITEM_HEIGHT, ITEM_HEIGHT * 2],
            [1.08, 0.96, 0.86],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  return (
    <View style={item.wrapper}>
      <Animated.Text style={[item.text, animatedStyle]}>{label}</Animated.Text>
    </View>
  );
});

const PickerColumn = memo(function PickerColumn({
  data,
  selectedIndex,
  onChange,
  width,
}: PickerColumnProps) {
  const scrollRef = useRef<Animated.ScrollView>(null);
  const scrollY = useSharedValue(selectedIndex * ITEM_HEIGHT);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      y: selectedIndex * ITEM_HEIGHT,
      animated: false,
    });
    scrollY.value = selectedIndex * ITEM_HEIGHT;
  }, [selectedIndex, scrollY]);

  const handleMomentumEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y;
      const nextIndex = Math.max(
        0,
        Math.min(data.length - 1, Math.round(y / ITEM_HEIGHT)),
      );

      scrollRef.current?.scrollTo({
        y: nextIndex * ITEM_HEIGHT,
        animated: true,
      });

      if (nextIndex !== selectedIndex) {
        onChange(nextIndex);
      }
    },
    [data.length, onChange, selectedIndex],
  );

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollY.value = e.nativeEvent.contentOffset.y;
    },
    [scrollY],
  );

  return (
    <View style={[col.wrapper, { width }]}>
      <View style={col.highlight} pointerEvents="none" />

      <AnimatedScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        bounces={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        scrollEventThrottle={16}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumEnd}
        contentContainerStyle={{
          paddingVertical: CENTER_INDEX * ITEM_HEIGHT,
        }}
      >
        {data.map((label, index) => (
          <RowItem
            key={`${label}-${index}`}
            label={label}
            index={index}
            scrollY={scrollY}
          />
        ))}
      </AnimatedScrollView>

      <View style={col.fadeTop} pointerEvents="none" />
      <View style={col.fadeBottom} pointerEvents="none" />
    </View>
  );
});

export function CustomTimePicker({
  value,
  onChange,
}: {
  value: TimeValue;
  onChange: (value: TimeValue) => void;
}) {
  const hourIndex = useMemo(
    () => Math.max(0, HOURS.indexOf(String(value.hour).padStart(2, "0"))),
    [value.hour],
  );

  const minuteIndex = useMemo(
    () => Math.max(0, MINUTES.indexOf(String(value.minute).padStart(2, "0"))),
    [value.minute],
  );

  const periodIndex = useMemo(
    () => Math.max(0, PERIODS.indexOf(value.period)),
    [value.period],
  );

  const handleHour = useCallback(
    (i: number) => {
      onChange({
        ...value,
        hour: Number(HOURS[i]),
      });
    },
    [onChange, value],
  );

  const handleMinute = useCallback(
    (i: number) => {
      onChange({
        ...value,
        minute: Number(MINUTES[i]),
      });
    },
    [onChange, value],
  );

  const handlePeriod = useCallback(
    (i: number) => {
      onChange({
        ...value,
        period: PERIODS[i],
      });
    },
    [onChange, value],
  );

  return (
    <View style={tp.container}>
      <View style={tp.row}>
        <PickerColumn
          data={HOURS}
          selectedIndex={hourIndex}
          onChange={handleHour}
          width={80}
        />

        <Text style={tp.sep}>:</Text>

        <PickerColumn
          data={MINUTES}
          selectedIndex={minuteIndex}
          onChange={handleMinute}
          width={90}
        />

        <View style={{ width: 14 }} />

        <PickerColumn
          data={PERIODS}
          selectedIndex={periodIndex}
          onChange={handlePeriod}
          width={80}
        />
      </View>
    </View>
  );
}

const item = StyleSheet.create({
  wrapper: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 26,
    color: "#fff",
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
});

const col = StyleSheet.create({
  wrapper: {
    height: ITEM_HEIGHT * VISIBLE_ROWS,
    overflow: "hidden",
  },
  highlight: {
    position: "absolute",
    top: CENTER_INDEX * ITEM_HEIGHT,
    left: 4,
    right: 4,
    height: ITEM_HEIGHT,
    borderRadius: 14,
    backgroundColor: "rgba(10,124,255,0.10)",
  },
  fadeTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT * CENTER_INDEX,
    backgroundColor: "rgba(17,17,19,0.75)",
  },
  fadeBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT * CENTER_INDEX,
    backgroundColor: "rgba(17,17,19,0.75)",
  },
});

const tp = StyleSheet.create({
  container: {
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  sep: {
    fontSize: 28,
    color: "rgba(255,255,255,0.5)",
  },
});

import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { CustomTimePicker, type TimeValue } from "./custom-time-picker";

interface ScheduleMessageSheetProps {
  visible: boolean;
  onClose: () => void;
  onSchedule: (scheduledAt: Date) => void;
}

type Step = "date" | "time";

function toDateString(d: Date) {
  return d.toISOString().split("T")[0];
}

function initialTime(): TimeValue {
  const now = new Date();
  const rounded = new Date(now);
  rounded.setMinutes(Math.ceil(now.getMinutes() / 5) * 5, 0, 0);

  if (rounded.getMinutes() === 60) {
    rounded.setHours(rounded.getHours() + 1, 0, 0, 0);
  }

  let h = rounded.getHours();
  const period: "AM" | "PM" = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;

  return {
    hour: h,
    minute: rounded.getMinutes(),
    period,
  };
}

function buildFinalDate(dateStr: string, t: TimeValue): Date {
  const [y, m, d] = dateStr.split("-").map(Number);

  let hour24 = t.hour % 12;
  if (t.period === "PM") hour24 += 12;
  if (t.period === "AM" && t.hour === 12) hour24 = 0;

  return new Date(y, m - 1, d, hour24, t.minute, 0, 0);
}

function formatPreview(dateStr: string, t: TimeValue) {
  return buildFinalDate(dateStr, t).toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const PRESETS = [
  {
    label: "30 min",
    icon: "⚡",
    getDate: () => new Date(Date.now() + 30 * 60 * 1000),
  },
  {
    label: "1 hour",
    icon: "⏰",
    getDate: () => new Date(Date.now() + 60 * 60 * 1000),
  },
  {
    label: "Tonight",
    icon: "🌙",
    getDate: () => {
      const d = new Date();
      d.setHours(20, 0, 0, 0);
      if (d <= new Date()) d.setDate(d.getDate() + 1);
      return d;
    },
  },
  {
    label: "Tomorrow 9AM",
    icon: "☀️",
    getDate: () => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(9, 0, 0, 0);
      return d;
    },
  },
] as const;

function StepDots({ step }: { step: Step }) {
  return (
    <View style={dot.row}>
      <View style={[dot.dot, step === "date" && dot.active]} />
      <View style={[dot.dot, step === "time" && dot.active]} />
    </View>
  );
}

const dot = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    marginBottom: 16,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  active: {
    width: 18,
    borderRadius: 999,
    backgroundColor: "#0A7CFF",
  },
});

const MemoCalendar = memo(Calendar);

export function ScheduleMessageSheet({
  visible,
  onClose,
  onSchedule,
}: ScheduleMessageSheetProps) {
  const today = useMemo(() => toDateString(new Date()), []);

  const [mounted, setMounted] = useState(visible);
  const [step, setStep] = useState<Step>("date");
  const [selectedDate, setSelectedDate] = useState(today);
  const [timeValue, setTimeValue] = useState<TimeValue>(() => initialTime());

  const openProgress = useSharedValue(0);
  const stepProgress = useSharedValue(0); // 0 => date, 1 => time

  useEffect(() => {
    if (visible) {
      setMounted(true);
      openProgress.value = withTiming(1, {
        duration: 260,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      openProgress.value = withTiming(
        0,
        {
          duration: 220,
          easing: Easing.in(Easing.cubic),
        },
        (finished) => {
          if (finished) {
            // keep JS state reset simple and predictable
          }
        },
      );

      const timeout = setTimeout(() => {
        setMounted(false);
        setStep("date");
        stepProgress.value = 0;
      }, 220);

      return () => clearTimeout(timeout);
    }
  }, [visible, openProgress, stepProgress]);

  const markedDates = useMemo(
    () => ({
      [selectedDate]: {
        selected: true,
        selectedColor: "#0A7CFF",
        selectedTextColor: "#FFFFFF",
      },
      [today]: {
        marked: true,
        dotColor: "#0A7CFF",
      },
    }),
    [selectedDate, today],
  );

  const calendarTheme = useMemo(
    () => ({
      backgroundColor: "transparent",
      calendarBackground: "transparent",
      textSectionTitleColor: "rgba(255,255,255,0.35)",
      selectedDayBackgroundColor: "#0A7CFF",
      selectedDayTextColor: "#fff",
      todayTextColor: "#0A7CFF",
      dayTextColor: "#fff",
      textDisabledColor: "rgba(255,255,255,0.18)",
      dotColor: "#0A7CFF",
      arrowColor: "#0A7CFF",
      disabledArrowColor: "rgba(255,255,255,0.15)",
      monthTextColor: "#fff",
      textDayFontSize: 14,
      textMonthFontSize: 16,
      textMonthFontWeight: "700" as const,
      textDayHeaderFontSize: 12,
      textDayFontWeight: "500" as const,
    }),
    [],
  );

  const goToDate = useCallback(() => {
    setStep("date");
    stepProgress.value = withTiming(0, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
  }, [stepProgress]);

  const goToTime = useCallback(() => {
    setStep("time");
    stepProgress.value = withTiming(1, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
  }, [stepProgress]);

  const handleDayPress = useCallback(
    (day: { dateString: string }) => {
      setSelectedDate(day.dateString);
      requestAnimationFrame(() => {
        goToTime();
      });
    },
    [goToTime],
  );

  const handlePreset = useCallback(
    (preset: (typeof PRESETS)[number]) => {
      const d = preset.getDate();

      let minutes = Math.round(d.getMinutes() / 5) * 5;
      if (minutes === 60) {
        d.setHours(d.getHours() + 1, 0, 0, 0);
        minutes = 0;
      }

      const period: "AM" | "PM" = d.getHours() >= 12 ? "PM" : "AM";
      const hour = d.getHours() % 12 || 12;

      setSelectedDate(toDateString(d));
      setTimeValue({
        hour,
        minute: minutes,
        period,
      });

      goToTime();
    },
    [goToTime],
  );

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleSchedule = useCallback(() => {
    onSchedule(buildFinalDate(selectedDate, timeValue));
    onClose();
  }, [onSchedule, onClose, selectedDate, timeValue]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(openProgress.value, [0, 1], [0, 1]),
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(openProgress.value, [0, 1], [700, 0]),
      },
    ],
    opacity: interpolate(openProgress.value, [0, 1], [0.96, 1]),
  }));

  const datePaneStyle = useAnimatedStyle(() => ({
    opacity: interpolate(stepProgress.value, [0, 1], [1, 0]),
    transform: [
      {
        translateX: interpolate(stepProgress.value, [0, 1], [0, -28]),
      },
    ],
  }));

  const timePaneStyle = useAnimatedStyle(() => ({
    opacity: interpolate(stepProgress.value, [0, 1], [0, 1]),
    transform: [
      {
        translateX: interpolate(stepProgress.value, [0, 1], [28, 0]),
      },
    ],
  }));

  if (!mounted) return null;

  return (
    <Modal
      transparent
      visible={mounted}
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <Pressable style={StyleSheet.absoluteFill} onPress={handleClose}>
        <Animated.View style={[s.backdrop, backdropStyle]} />
      </Pressable>

      <Animated.View style={[s.sheet, sheetStyle]}>
        <View style={s.handle} />

        <View style={s.header}>
          {step === "time" ? (
            <Pressable onPress={goToDate} hitSlop={10}>
              <Text style={s.navTxt}>← Date</Text>
            </Pressable>
          ) : (
            <View style={{ width: 52 }} />
          )}

          <Text style={s.title}>
            {step === "date" ? "Pick a Date" : "Pick a Time"}
          </Text>

          <Pressable onPress={handleClose} hitSlop={10}>
            <Text style={s.closeTxt}>✕</Text>
          </Pressable>
        </View>

        <StepDots step={step} />

        <View style={s.stage}>
          <Animated.View
            pointerEvents={step === "date" ? "auto" : "none"}
            style={[s.pane, datePaneStyle]}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.presetsRow}
            >
              {PRESETS.map((p) => (
                <Pressable
                  key={p.label}
                  onPress={() => handlePreset(p)}
                  style={({ pressed }) => [
                    s.presetPill,
                    pressed && s.presetPressed,
                  ]}
                >
                  <Text style={s.presetIcon}>{p.icon}</Text>
                  <Text style={s.presetLabel}>{p.label}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <MemoCalendar
              minDate={today}
              current={selectedDate}
              markedDates={markedDates}
              onDayPress={handleDayPress}
              theme={calendarTheme}
              enableSwipeMonths
              hideExtraDays={false}
              style={s.calendar}
            />
          </Animated.View>

          <Animated.View
            pointerEvents={step === "time" ? "auto" : "none"}
            style={[s.pane, s.paneAbsolute, timePaneStyle]}
          >
            <View style={s.timeStep}>
              <Pressable onPress={goToDate} style={s.dateBadge}>
                <Text style={s.dateBadgeIcon}>📅</Text>
                <Text style={s.dateBadgeTxt}>
                  {new Date(`${selectedDate}T12:00:00`).toLocaleDateString([], {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
                <Text style={s.dateBadgeEdit}>Edit</Text>
              </Pressable>

              <CustomTimePicker value={timeValue} onChange={setTimeValue} />

              <View style={s.previewRow}>
                <Text style={s.previewLabel}>Sends at</Text>
                <Text style={s.previewValue}>
                  {formatPreview(selectedDate, timeValue)}
                </Text>
              </View>

              <Pressable
                onPress={handleSchedule}
                style={({ pressed }) => [
                  s.scheduleBtn,
                  pressed && s.scheduleBtnPressed,
                ]}
              >
                <Text style={s.scheduleBtnTxt}>⏰ Schedule Message</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Animated.View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },

  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#111113",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 44,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.07)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 24,
  },

  handle: {
    width: 38,
    height: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignSelf: "center",
    marginBottom: 16,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
  },

  navTxt: {
    width: 52,
    color: "#0A7CFF",
    fontSize: 14,
    fontWeight: "500",
  },

  closeTxt: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 15,
    fontWeight: "600",
  },

  stage: {
    minHeight: 430,
  },

  pane: {
    width: "100%",
  },

  paneAbsolute: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },

  presetsRow: {
    gap: 8,
    paddingHorizontal: 2,
    marginBottom: 12,
  },

  presetPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(10,124,255,0.1)",
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(10,124,255,0.25)",
  },

  presetPressed: {
    opacity: 0.65,
  },

  presetIcon: {
    fontSize: 13,
  },

  presetLabel: {
    fontSize: 13,
    color: "#4DA3FF",
    fontWeight: "500",
  },

  calendar: {
    borderRadius: 16,
    overflow: "hidden",
  },

  timeStep: {
    gap: 14,
  },

  dateBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 14,
    padding: 13,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.08)",
  },

  dateBadgeIcon: {
    fontSize: 16,
  },

  dateBadgeTxt: {
    flex: 1,
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
  },

  dateBadgeEdit: {
    fontSize: 13,
    color: "#0A7CFF",
    fontWeight: "500",
  },

  previewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 2,
  },

  previewLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.35)",
  },

  previewValue: {
    fontSize: 13.5,
    color: "#0A7CFF",
    fontWeight: "600",
  },

  scheduleBtn: {
    backgroundColor: "#0A7CFF",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#0A7CFF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },

  scheduleBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },

  scheduleBtnTxt: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.2,
  },
});

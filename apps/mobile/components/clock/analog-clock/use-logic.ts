import { useSharedValue } from "react-native-reanimated";
import { Gesture } from "react-native-gesture-handler";
import { useCallback, useMemo } from "react";
import { CLOCK_SIZE, CLOCK_SYNC } from "..";
import {
  coordinates,
  normalize_delta_angle,
  size,
  wrap_24,
} from "./helpers";

type HAND_TYPE = "HOUR" | "MINUTE";

type Props = {
  interactive: boolean;
  change: CLOCK_SYNC;
  size: CLOCK_SIZE;
  date: Date;
  mn: number;
  hr: number;
};

export const useLogic = (props: Props) => {
  const hand = useSharedValue<HAND_TYPE | null>(null);

  const drag_start_total_minutes = useSharedValue(0);
  const drag_accumulated_angle = useSharedValue(0);
  const last_raw_angle = useSharedValue(0);

  const drag_start_hour_24 = useSharedValue(props.hr);
  const last_hour_angle = useSharedValue(0);
  const emitted_hour = useSharedValue(props.hr);
  const emitted_minute = useSharedValue(props.mn);

  const face_s = size(props.size);
  const center = face_s / 2;
  const radius = center - 2;

  const mAngle = props.mn * 6;
  const hAngle = (props.hr % 12) * 30 + props.mn * 0.5;
  const sAngle = props.date.getSeconds() * 6;

  const hHandLength = face_s * 0.25;
  const mHandLength = face_s * 0.35;
  const sHandLength = face_s * 0.4;

  const hEnd = coordinates(hAngle, hHandLength, center);
  const mEnd = coordinates(mAngle, mHandLength, center);
  const sEnd = coordinates(sAngle, sHandLength, center);

  const pick_hand = useCallback(
    (x: number, y: number): HAND_TYPE => {
      const h_distance = Math.hypot(x - hEnd.x, y - hEnd.y);
      const m_distance = Math.hypot(x - mEnd.x, y - mEnd.y);
      return h_distance < m_distance ? "HOUR" : "MINUTE";
    },
    [hEnd, mEnd],
  );

  const markers = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => {
      const angle = i * 30;
      const isCardinal = i % 3 === 0;
      const length = isCardinal ? face_s * 0.09 : face_s * 0.06;
      const strokeWidth = isCardinal
        ? props.size === "LARGE"
          ? 4
          : 2
        : props.size === "LARGE"
          ? 2
          : 2;

      const start = coordinates(angle, radius - length, center);
      const end = coordinates(angle, radius - 6, center);

      return {
        key: `marker-${i}`,
        start,
        end,
        strokeWidth,
        opacity: isCardinal ? 1 : 0.5,
      };
    });
  }, [face_s, radius, props.size, center]);

  const update_time = (hours: number, minutes: number) => {
    if (emitted_hour.value === hours && emitted_minute.value === minutes) {
      return;
    }
    emitted_hour.value = hours;
    emitted_minute.value = minutes;
    props.change({ hr: hours, mn: minutes });
  };

  const gesture = Gesture.Pan()
    .onBegin((e) => {
      if (!props.interactive) return;

      hand.value = pick_hand(e.x, e.y);
      const dx = e.x - center;
      const dy = e.y - center;

      let angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
      if (angle < 0) angle += 360;

      last_raw_angle.value = angle;
      drag_accumulated_angle.value = 0;

      drag_start_total_minutes.value = props.hr * 60 + props.mn;
      drag_start_hour_24.value = props.hr;
      last_hour_angle.value = angle;
      emitted_hour.value = props.hr;
      emitted_minute.value = props.mn;
    })
    .onUpdate((e) => {
      if (!hand.value || !props.interactive) return;

      const dx = e.x - center;
      const dy = e.y - center;

      let angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
      if (angle < 0) angle += 360;

      if (hand.value === "MINUTE") {
        const delta = normalize_delta_angle(angle - last_raw_angle.value);
        drag_accumulated_angle.value += delta;
        last_raw_angle.value = angle;

        const moved_minutes = Math.round(drag_accumulated_angle.value / 6);
        const total_minutes =
          drag_start_total_minutes.value + moved_minutes;

        const nextHour24 = wrap_24(Math.floor(total_minutes / 60));
        const nextMinute = ((total_minutes % 60) + 60) % 60;

        update_time(nextHour24, nextMinute);
        return;
      }

      if (hand.value === "HOUR") {
        const delta = normalize_delta_angle(angle - last_hour_angle.value);
        drag_accumulated_angle.value += delta;
        last_hour_angle.value = angle;

        const moved_hours = Math.round(drag_accumulated_angle.value / 30);
        const nextHour24 = wrap_24(drag_start_hour_24.value + moved_hours);

        update_time(nextHour24, props.mn);
      }
    })
    .onEnd(() => {
      hand.value = null;
    })
    .runOnJS(true);

  return {
    markers,
    gesture,
    d: {
      face_s,
      center,
      radius,
    },
    p: {
      hEnd,
      mEnd,
      sEnd,
    },
  };
};

import { GestureResponderEvent, PanResponder } from "react-native";
import { useCallback, useMemo, useState } from "react";
import { CLOCK_SIZE_TYPE } from "../..";

type HAND_TYPE = "HOUR" | "MINUTE";

type Props = {
  size: CLOCK_SIZE_TYPE;
  date: Date;
  mn: number; // minutes
  hr: number; // hours
  interactive: boolean;
  onTimeChange?: (hours: number, minutes: number) => void;
};

const to_radians = (deg: number) => (deg * Math.PI) / 180;

const size = (clock_size: CLOCK_SIZE_TYPE) => {
  switch (clock_size) {
    case "LARGE":
      return 200;
    case "MEDIUM":
      return 170;
    case "SMALL":
      return 100;
    default:
      return 100;
  }
};

const coordinates = (angle: number, radius: number, center: number) => ({
  x: center + radius * Math.cos(to_radians(angle - 90)),
  y: center + radius * Math.sin(to_radians(angle - 90)),
});

export const useLogicV2 = (props: Props) => {
  const [isActive, setIsActive] = useState<HAND_TYPE | null>(null); // states which hand is currently being dragged

  const face_s = props.size === "LARGE" ? 170 : 100;
  const center = face_s / 2;
  const radius = center - 2;

  /**
   * example; assuming it is 15mins = 90deg
   * this is because minute focuses on 0-60
   */
  const mAngle = props.mn * 6;

  /**
   * example; assuming hour is 3, (3 % 12) = 3;
   * why hour uses modulus is because its not really supposed to be focusing on the individual seconds
   * but instead on the major times like 0-11 not 0-60
   * also the props.minutes * 0.5 is adding additional time because 3:45 should have the hour hand closer to 4 than 3:15
   */
  const hAngle = (props.hr % 12) * 30 + props.mn * 0.5;

  // we just get the seconds directly then get the angle by multiplying by 6
  const sAngle = props.date ? props.date.getSeconds() * 6 : 0;

  const hHandLength = face_s * 0.25;
  const mHandLength = face_s * 0.35;
  const sHandLength = face_s * 0.4;

  /**
   * You need these to know where the hands point at
   * that's why you need to know what point on the circle its pointing at using the coordinates
   */
  const hEnd = coordinates(hAngle, hHandLength, center);
  const mEnd = coordinates(mAngle, mHandLength, center);
  const sEnd = coordinates(sAngle, sHandLength, center);

  /**
   * this function calculates the distance the user's finger is closest to
   * using the pythagoras distance formula (d= sqrt(sq(x1​−x2​) + sq(y1​−y2​)))
   * @param x number
   * @param y number
   * @returns HAND_TYPE ("HOUR" | "MINUTE")
   */
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
      const length = isCardinal ? face_s * 0.08 : face_s * 0.045;
      const strokeWidth = isCardinal
        ? props.size === "LARGE"
          ? 4
          : 2
        : props.size === "LARGE"
          ? 2
          : 1;

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

  const update_from_point = useCallback(
    (
      event: GestureResponderEvent,
      cHand: HAND_TYPE, // clock hand
    ) => {
      const { locationX, locationY } = event.nativeEvent;
      const dx = locationX - center;
      const dy = locationY - center;

      let angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
      if (angle < 0) angle += 360;

      if (cHand === "MINUTE") {
        const nextMinutes = Math.round(angle / 6) % 60;
        props.onTimeChange?.(props.hr, nextMinutes);
        return;
      }

      // Preserve AM/PM-ish half-day from the incoming value.
      const currentHalf = Math.floor(props.hr / 12) * 12;
      const nextHours12 = Math.round(angle / 30) % 12;
      props.onTimeChange?.(currentHalf + nextHours12, props.mn);
    },
    [center, props],
  );

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => {
          return props.interactive;
        },
        onMoveShouldSetPanResponder: () => {
          return props.interactive;
        },
        onPanResponderGrant: (event) => {
          if (!props.interactive) return;
          const hand = pick_hand(
            event.nativeEvent.locationX,
            event.nativeEvent.locationY,
          );
          setIsActive(hand);
          update_from_point(event, hand);
        },
        onPanResponderMove: (event) => {
          if (!props.interactive || !isActive) return;
          update_from_point(event, isActive);
        },
        onPanResponderRelease: () => {
          setIsActive(null);
        },
        onPanResponderTerminate: () => {
          setIsActive(null);
        },
      }),
    [props.interactive, isActive, update_from_point, pick_hand],
  );

  return {
    isActive,
    markers,
    pickHand: pick_hand,
    size,
    setIsActive,
    dimensions: {
      face_s,
      center,
      radius,
    },
    angles: {
      mAngle,
      hAngle,
      sAngle,
    },
    lengths: {
      hHandLength,
      mHandLength,
      sHandLength,
    },
    points: {
      hEnd,
      mEnd,
      sEnd,
    },
    responder,
  };
};

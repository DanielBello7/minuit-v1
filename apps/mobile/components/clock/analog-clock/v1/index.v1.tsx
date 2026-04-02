/** This version uses Gesture.Rotation() */
import { Canvas, Circle, Line, Shadow } from "@shopify/react-native-skia";
import { CLOCK_SIZE_TYPE } from "../..";
import { InterText, ThemedView } from "@/components/themed";
import { Platform, StyleSheet, View } from "react-native";
import { COLORS } from "@/constants/themes/colors";
import { useLogicV1 } from "./use-logic.v1";
import { GestureDetector } from "react-native-gesture-handler";

type Props = {
  size: CLOCK_SIZE_TYPE;
  date: Date;
  mn: number; // minutes
  hr: number; // hours
  interactive: boolean;
  card: string;
  border: string;
  foreground: string;
  primary: string;
  seconds?: boolean;
  onTimeChange?: (hours: number, minutes: number) => void;
};

export const AnalogClockV1 = (props: Props) => {
  const logic = useLogicV1(props);
  const scale = {
    height: logic.dimensions.face_s,
    width: logic.dimensions.face_s,
  };

  return (
    <View style={styles.main}>
      <ThemedView style={[styles.face, scale]}>
        {/* the whole canvas drawable */}
        <GestureDetector gesture={logic.gesture}>
          <Canvas style={scale}>
            {/* the circle for the shadow on the outer circle */}
            <Circle
              cx={logic.dimensions.center}
              cy={logic.dimensions.center}
              r={logic.dimensions.radius}
              color={props.card}
            >
              {/* the actual shadow for the circle */}
              <Shadow
                dx={0}
                dy={2}
                blur={4}
                color="rgba(0,0,0,0.10)"
              />
            </Circle>

            {/* the outer circle itself */}
            <Circle
              cx={logic.dimensions.center}
              cy={logic.dimensions.center}
              r={logic.dimensions.radius}
              color={props.border}
              style="stroke"
              strokeWidth={1}
            />

            {/* the pointers on the clock */}
            {logic.markers.map((marker) => (
              <Line
                key={marker.key}
                p1={marker.start}
                p2={marker.end}
                color={props.foreground}
                strokeWidth={marker.strokeWidth}
                opacity={marker.opacity}
                strokeCap="round"
              />
            ))}

            {/* hour hand */}
            <Line
              p1={{
                x: logic.dimensions.center,
                y: logic.dimensions.center,
              }}
              p2={logic.points.hEnd}
              color={props.foreground}
              strokeWidth={props.size === "LARGE" ? 6 : 3}
              strokeCap="round"
            />

            {/* minute hand */}
            <Line
              p1={{
                x: logic.dimensions.center,
                y: logic.dimensions.center,
              }}
              p2={logic.points.mEnd}
              color={props.foreground}
              strokeWidth={props.size === "LARGE" ? 4 : 2}
              strokeCap="round"
            />

            {/* second hand */}
            {props.size === "LARGE" && props.seconds && (
              <Line
                p1={{
                  x: logic.dimensions.center,
                  y: logic.dimensions.center,
                }}
                p2={logic.points.sEnd}
                color={props.primary}
                strokeWidth={2}
                strokeCap="round"
              />
            )}

            {/* center dot on the clock */}
            <Circle
              cx={logic.dimensions.center}
              cy={logic.dimensions.center}
              r={props.size === "LARGE" ? 4 : 2}
              color={props.primary}
            />
          </Canvas>
        </GestureDetector>
      </ThemedView>
      <View style={styles.box}>
        <View style={styles.time}>
          <InterText
            type="title"
            style={styles.text}
          >
            {logic.time.display_hr}
          </InterText>
          <InterText
            type="title"
            style={styles.text}
          >
            :
          </InterText>
          <InterText
            type="title"
            style={styles.text}
          >
            {logic.time.display_mn}
          </InterText>
          <InterText
            type="title"
            style={styles.period}
          >
            {logic.time.display_period}
          </InterText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  period: {
    fontWeight: "500",
    fontSize: 12,
    marginLeft: 3,
    lineHeight: 14,
    color: COLORS.GRAY_400,
  },
  text: {
    fontWeight: "800",
    fontSize: 30,
  },
  time: {
    flexDirection: "row",
  },
  main: {
    gap: 6,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  box: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  face: {
    borderRadius: 999,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: COLORS.BLACK,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 4,
      },
      default: {
        shadowColor: COLORS.BLACK,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
    }),
  },
});

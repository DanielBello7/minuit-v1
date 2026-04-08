/** This version uses Gesture.Rotation() */
import { Canvas, Circle, Line, Shadow } from "@shopify/react-native-skia";
import { CLOCK_SIZE, CLOCK_SYNC } from "../.";
import { ThemedView } from "@/components/themed";
import { Platform, StyleSheet, View } from "react-native";
import { COLORS } from "@/constants/themes/colors";
import { useLogic } from "./use-logic";
import { GestureDetector } from "react-native-gesture-handler";
import { Digital } from "./digital";
import { useThemeColor } from "@/hooks/use-theme-color";

type Props = {
  mn: number; // minutes
  hr: number; // hours
  date: Date;
  change: CLOCK_SYNC;
  size: CLOCK_SIZE;
  interactive: boolean;
  seconds?: boolean;
};

export const AnalogClock = (props: Props) => {
  const border = useThemeColor("CLOCK_FACE_BORDER");
  const foreground = useThemeColor("FOREGROUND");
  const primary = useThemeColor("PRIMARY");
  const bg = useThemeColor("BACKGROUND");
  const card = useThemeColor("CARD");
  const logic = useLogic(props);

  return (
    <View style={styles.main}>
      <ThemedView
        style={[
          styles.face,
          {
            width: logic.d.face_s,
            height: logic.d.face_s,
            backgroundColor: card,
          },
        ]}
      >
        {/* the whole canvas drawable */}
        <GestureDetector gesture={logic.gesture}>
          <Canvas
            style={{
              width: logic.d.face_s,
              height: logic.d.face_s,
            }}
          >
            {/* the circle for the shadow on the outer circle */}
            <Circle
              cx={logic.d.center}
              cy={logic.d.center}
              r={logic.d.radius}
              color={card}
            >
              {/* ~Tailwind drop-shadow-xl: layered soft shadows */}
              <Shadow
                dx={0}
                dy={8}
                blur={10}
                color="rgba(0, 0, 0, 0.08)"
              />
              <Shadow
                dx={0}
                dy={20}
                blur={250}
                color="rgba(0, 0, 0, 0.15)"
              />
            </Circle>

            {/* the outer circle itself */}
            <Circle
              cx={logic.d.center}
              cy={logic.d.center}
              r={logic.d.radius}
              color={border}
              style="stroke"
              strokeWidth={props.size === "LARGE" ? 2 : 1}
            />

            {/* the pointers on the clock */}
            {logic.markers.map((marker) => (
              <Line
                key={marker.key}
                p1={marker.start}
                p2={marker.end}
                color={foreground}
                strokeWidth={marker.strokeWidth}
                opacity={marker.opacity}
                strokeCap="round"
              />
            ))}

            {/* hour hand */}
            <Line
              p1={{
                x: logic.d.center,
                y: logic.d.center,
              }}
              p2={logic.p.hEnd}
              color={foreground}
              strokeWidth={props.size === "LARGE" ? 6 : 3}
              strokeCap="round"
            />

            {/* minute hand */}
            <Line
              p1={{
                x: logic.d.center,
                y: logic.d.center,
              }}
              p2={logic.p.mEnd}
              color={foreground}
              strokeWidth={props.size === "LARGE" ? 4 : 2}
              strokeCap="round"
            />

            {/* second hand */}
            {props.seconds && (
              <Line
                p1={{
                  x: logic.d.center,
                  y: logic.d.center,
                }}
                p2={logic.p.sEnd}
                color={primary}
                strokeWidth={2}
                strokeCap="round"
              />
            )}

            {/* center dot on the clock */}
            <Circle
              cx={logic.d.center}
              cy={logic.d.center}
              r={props.size === "LARGE" ? 4 : 2}
              color={primary}
            />
          </Canvas>
        </GestureDetector>
      </ThemedView>

      {/* Digital */}
      <Digital
        hr={props.hr}
        mn={props.mn}
        size={props.size}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  period: {
    fontWeight: "500",
    fontSize: 12,
    marginLeft: 3,
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
    gap: 9,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  box: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    marginLeft: 16,
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

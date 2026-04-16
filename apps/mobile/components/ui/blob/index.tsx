import {
  StyleSheet,
  View,
  useColorScheme,
  useWindowDimensions,
} from "react-native";
import {
  Canvas,
  Rect,
  Blur,
  RadialGradient,
  vec,
} from "@shopify/react-native-skia";
import { COLORS } from "@/constants/themes/colors";
import { with_alpha } from "@/libs/with-alpha";

export const Blob = () => {
  const { width, height } = useWindowDimensions();
  const scheme = useColorScheme();
  const multiplier = scheme === "light" ? 0 : 0.03;
  return (
    <View
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
    >
      <Canvas style={StyleSheet.absoluteFill}>
        {/* top-left blob */}
        <Rect
          x={0}
          y={0}
          width={width}
          height={height}
        >
          <RadialGradient
            c={vec(width * 0.05, height * 0.12)}
            r={180}
            colors={[
              with_alpha(COLORS.PINK, 0.42 + multiplier),
              with_alpha(COLORS.PINK, 0.3 + multiplier),
              with_alpha(COLORS.PINK, 0 + multiplier),
            ]}
          />
          <Blur blur={70} />
        </Rect>

        {/* bottom-right blob */}
        <Rect
          x={0}
          y={0}
          width={width}
          height={height}
        >
          <RadialGradient
            c={vec(width * 0.92, height * 0.9)}
            r={180}
            colors={[
              with_alpha(COLORS.PINK, 0.14 + multiplier),
              with_alpha(COLORS.PINK, 0.06 + multiplier),
              with_alpha(COLORS.PINK, 0 + multiplier),
            ]}
          />
          <Blur blur={70} />
        </Rect>
      </Canvas>
    </View>
  );
};

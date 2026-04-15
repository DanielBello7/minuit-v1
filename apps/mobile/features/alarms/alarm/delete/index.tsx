import {
  Canvas,
  BackdropBlur,
  Fill,
  RoundedRect,
} from "@shopify/react-native-skia";

export const DeleteAlarm = () => {
  return (
    <Canvas
      style={{
        borderWidth: 1,
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 1,
      }}
    >
      <BackdropBlur
        blur={16}
        clip={{
          x: 0,
          y: 0,
          width: 220,
          height: 120,
          rx: 20,
          ry: 20,
        }}
      >
        <Fill color="rgba(255,255,255,0.10)" />
      </BackdropBlur>

      <RoundedRect
        x={0}
        y={0}
        width={220}
        height={120}
        r={20}
        color="rgba(255,255,255,0.18)"
        style="stroke"
        strokeWidth={1}
      />
    </Canvas>
  );
};

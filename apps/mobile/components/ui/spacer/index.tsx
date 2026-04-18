import { ThemedView } from "@/components/themed";

type Props = {
  height?: number;
};

/**
 * Vertical gap using transparent layout space.
 *
 * @param props.height - Optional height in logical pixels. **Default: `60`.**
 */
export const Spacer = (props: Props) => {
  return (
    <ThemedView
      style={{
        height: props.height ?? 60,
        backgroundColor: "transparent",
      }}
    />
  );
};

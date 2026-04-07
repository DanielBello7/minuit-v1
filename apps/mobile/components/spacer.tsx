import { ThemedView } from "./themed";

type Props = {
  height?: number;
};
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

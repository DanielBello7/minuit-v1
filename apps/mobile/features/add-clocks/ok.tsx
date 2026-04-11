import { AppTouchable, InterText } from "@/components/themed";
import { COLORS } from "@/constants/themes/colors";

type Props = {
  save: () => void;
};
export const OK = (props: Props) => {
  return (
    <AppTouchable onPress={props.save}>
      <InterText
        style={{
          fontSize: 17,
          fontWeight: "600",
          color: COLORS.PINK,
        }}
      >
        Save
      </InterText>
    </AppTouchable>
  );
};

import { AppTouchable } from "@/components/themed";
import { useThemeColor } from "@/hooks/use-theme-color";

import AntDesign from "@expo/vector-icons/AntDesign";

type Props = {
  type: "close" | "back";
  action?: () => void;
};
export const Back = (props: Props) => {
  const fg = useThemeColor("BUTTON_SECONDARY_FOREGROUND");
  return (
    <AppTouchable
      onPress={props.action}
      style={{
        borderWidth: 0,
      }}
    >
      <AntDesign
        name={props.type === "back" ? "arrow-left" : "close"}
        color={fg}
        size={18}
      />
    </AppTouchable>
  );
};

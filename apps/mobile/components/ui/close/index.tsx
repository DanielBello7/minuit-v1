import { AppTouchable } from "@/components/themed";
import { useThemeColor } from "@/hooks/use-theme-color";

import AntDesign from "@expo/vector-icons/AntDesign";

type Props = {
  size?: number;
  actn?: () => void;
  color?: string;
};
export const CloseBtn = (props: Props) => {
  const color = useThemeColor("BUTTON_SECONDARY_BORDER_DARK");
  return (
    <AppTouchable onPress={props.actn}>
      <AntDesign
        name="close"
        color={props.color ?? color}
        size={props.size ?? 24}
      />
    </AppTouchable>
  );
};

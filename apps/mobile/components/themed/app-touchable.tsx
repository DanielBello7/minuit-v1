import { TouchableOpacity, TouchableOpacityProps } from "react-native";

export const AppTouchable = (props: TouchableOpacityProps) => {
  return (
    <TouchableOpacity
      {...props}
      activeOpacity={props.activeOpacity ?? 0.5}
    />
  );
};

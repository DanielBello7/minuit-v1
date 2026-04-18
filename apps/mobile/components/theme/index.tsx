import Fontisto from "@expo/vector-icons/Fontisto";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Octicons from "@expo/vector-icons/Octicons";

import * as Animatable from "react-native-animatable";

import { StyleSheet } from "react-native";
import { AppTouchable } from "@/components/themed";
import { useLogic } from "./use-logic";

export const Theme = () => {
  // prettier-ignore
  const { 
    animation, 
    mode, 
    busy, 
    color, 
    border, 
    control, 
    action 
  } = useLogic();

  return (
    <AppTouchable
      style={[
        styles.box,
        { borderColor: border, opacity: busy ? 0.7 : 1 },
      ]}
      onPress={action}
      disabled={busy}
    >
      {mode === "light" && (
        <Animatable.View
          animation={animation}
          ref={control}
          duration={400}
        >
          <Fontisto
            name="day-sunny"
            color={color}
            size={18}
          />
        </Animatable.View>
      )}
      {mode === "dark" && (
        <Animatable.View
          animation={animation}
          ref={control}
          duration={400}
        >
          <MaterialIcons
            name="dark-mode"
            color={color}
            size={18}
          />
        </Animatable.View>
      )}
      {mode === "system" && (
        <Animatable.View
          animation={animation}
          ref={control}
          duration={400}
        >
          <Octicons
            name="device-mobile"
            color={color}
            size={18}
          />
        </Animatable.View>
      )}
    </AppTouchable>
  );
};

const styles = StyleSheet.create({
  box: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 999,
    overflow: "hidden",
  },
});

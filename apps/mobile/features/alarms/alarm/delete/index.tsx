import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";

import * as Animatable from "react-native-animatable";

import { AppTouchable } from "@/components/themed";
import { StyleSheet, View } from "react-native";
import { useThemeColor } from "@/hooks/use-theme-color";

export const DeleteAlarm = () => {
  const border = useThemeColor("SIDEBAR_BORDER");
  const overlay = useThemeColor("OVERLAY");
  const isLoading = false;
  return (
    <View
      style={[
        styles.container,
        {
          borderColor: border,
          backgroundColor: overlay,
        },
      ]}
    >
      <Animatable.View animation={"bounceIn"}>
        <AppTouchable
          style={[styles.btn, isLoading && styles.disabled]}
          disabled={isLoading}
        >
          {isLoading ? (
            <Animatable.View
              animation={"rotate"}
              iterationCount={"infinite"}
            >
              <AntDesign
                name="loading"
                color="white"
                size={24}
              />
            </Animatable.View>
          ) : (
            <Feather
              color={"white"}
              name="trash-2"
              size={20}
            />
          )}
        </AppTouchable>
      </Animatable.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    borderWidth: 1,
    zIndex: 2,
    borderRadius: 16,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  btn: {
    width: 40,
    height: 40,
    borderRadius: 99,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "red",
  },
  disabled: {
    backgroundColor: "rgba(255, 0, 0, 0.4)",
  },
});

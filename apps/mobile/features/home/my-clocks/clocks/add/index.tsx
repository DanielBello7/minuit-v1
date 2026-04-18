import AntDesign from "@expo/vector-icons/AntDesign";

import { AppTouchable, InterText } from "@/components/themed";
import { StyleSheet, View } from "react-native";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useRouter } from "expo-router";

export const AddNewClock = () => {
  const bdr = useThemeColor("BUTTON_SECONDARY_BORDER");
  const txt = useThemeColor("MUTED_FOREGROUND");

  const router = useRouter();

  const press = () => {
    return router.navigate("/(main)/(tabs)/home/add-clock");
  };

  return (
    <AppTouchable
      style={[styles.box, { borderColor: bdr }]}
      onPress={press}
    >
      <View style={styles.middle}>
        <AntDesign
          name="plus-circle"
          color={txt}
          size={18}
        />
        <InterText style={[styles.txt, { color: txt }]}>
          Add City
        </InterText>
      </View>
    </AppTouchable>
  );
};

const styles = StyleSheet.create({
  box: {
    width: 150,
    height: 220,
    borderWidth: 1,
    borderRadius: 16,
    borderStyle: "dotted",
    alignItems: "center",
    justifyContent: "center",
  },
  middle: {
    width: "100%",
    gap: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  txt: {
    fontSize: 12,
  },
});

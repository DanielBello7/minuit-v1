import { InterText } from "@/components/themed";
import { useThemeColor } from "@/hooks/use-theme-color";
import { FontAwesome5 } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { Switch } from "@/components/form";

export const Head = () => {
  const color = useThemeColor("MUTED_FOREGROUND");
  return (
    <View style={styles.head}>
      <View style={styles.name}>
        <FontAwesome5
          name="star"
          color={color}
          size={10}
        />
        <InterText style={[styles.name_text, { color }]}>
          ALARM 2
        </InterText>
      </View>
      <Switch size="small" />
    </View>
  );
};

const styles = StyleSheet.create({
  head: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  name: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  name_text: {
    fontSize: 10,
  },
});

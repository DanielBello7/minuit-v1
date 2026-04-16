import AntDesign from "@expo/vector-icons/AntDesign";

import { StyleSheet, TextInput, View } from "react-native";
import { AppTouchable } from "@/components/themed";
import { useThemeColor } from "@/hooks/use-theme-color";

type Props = {
  action: (params: string) => void;
  text: string;
};
export const Search = (props: Props) => {
  const border = useThemeColor("SIDEBAR_BORDER");
  const colors = useThemeColor("TEXT");
  const muted = useThemeColor("MUTED_FOREGROUND");

  return (
    <View style={[styles.box, { borderColor: border }]}>
      <TextInput
        style={[styles.input, { letterSpacing: 0, color: colors }]}
        onChangeText={(e) => props.action(e)}
        placeholderTextColor={muted}
        submitBehavior="submit"
        value={props.text}
        keyboardType="default"
        returnKeyType="search"
        placeholder="Search..."
      />
      {props.text.length > 0 && (
        <AppTouchable onPress={() => props.action("")}>
          <AntDesign
            color={colors}
            name="close"
            size={20}
          />
        </AppTouchable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
    paddingHorizontal: 16,
    borderBottomWidth: 0.4,
  },
  input: {
    flex: 1,
    fontSize: 18,
    paddingVertical: 14,
  },
});

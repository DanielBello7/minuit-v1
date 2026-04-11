import AntDesign from "@expo/vector-icons/AntDesign";

import { AppTouchable } from "@/components/themed";
import { useThemeColor } from "@/hooks/use-theme-color";
import { StyleSheet, TextInput, View } from "react-native";
import { useState } from "react";
import { sonner } from "@/components/sonner";

type Props = {
  action: (params: string) => void;
};
export const Search = (props: Props) => {
  const [text, setText] = useState("");
  const border = useThemeColor("BORDER_DARKER");
  const colors = useThemeColor("TEXT");

  const submit = () => {
    if (!text.trim()) return sonner.error("Please type in something");
    else props.action(text);
  };
  return (
    <View style={[styles.box, { borderColor: border }]}>
      <TextInput
        style={[styles.input, { letterSpacing: 0, color: colors }]}
        placeholder="Search..."
        onChangeText={(e) => setText(e)}
        value={text}
        keyboardType="default"
        submitBehavior="submit"
        returnKeyType="search"
        onSubmitEditing={submit}
      />
      {text.length > 0 && (
        <AppTouchable
          onPress={() => {
            setText("");
            props.action("");
          }}
        >
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
    borderBottomWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 18,
    paddingVertical: 14,
  },
});

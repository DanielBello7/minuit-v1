import { useThemeColor } from "@/hooks/use-theme-color";
import { StyleSheet, TextInput, View } from "react-native";

type Props = {
  setQuery: (val: string) => void;
  query: string;
};
export const Search = (props: Props) => {
  const border = useThemeColor("BORDER_DARKER");

  return (
    <View
      style={[
        styles.box,
        {
          borderColor: border,
        },
      ]}
    >
      <TextInput
        onChangeText={props.setQuery}
        value={props.query}
        placeholder="Search city or timezone"
        autoCorrect={false}
        autoCapitalize="words"
        style={styles.input}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    width: "100%",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  input: {
    letterSpacing: 0,
    fontSize: 16,
    paddingVertical: 10,
    width: "100%",
  },
});

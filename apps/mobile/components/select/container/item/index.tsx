import { AppTouchable, InterText } from "@/components/themed";
import { AntDesign } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/use-theme-color";
import { StyleSheet, View } from "react-native";
import { SelectOption } from "@/components/select/use-logic";

type Props = {
  selected: boolean;
  value: SelectOption;
  onPick: (value: SelectOption) => void;
};
export const SelectItem = (props: Props) => {
  const muted = useThemeColor("MUTED_FOREGROUND");
  const accent = useThemeColor("ACCENT");
  const border = useThemeColor("BORDER_DARKER");
  const primary = useThemeColor("PRIMARY");

  return (
    <AppTouchable
      onPress={() => props.onPick(props.value)}
      style={[
        styles.item,
        { borderColor: border },
        props.selected && { backgroundColor: accent },
      ]}
    >
      <View style={styles.itemText}>
        <InterText style={styles.city}>{props.value.label}</InterText>
        {!!props.value.description && (
          <InterText
            style={[
              styles.meta,
              {
                color: muted,
              },
            ]}
          >
            {props.value.description}
          </InterText>
        )}
        <InterText
          style={[
            styles.meta,
            {
              color: muted,
            },
          ]}
        >
          {props.value.value}
        </InterText>
      </View>

      {props.selected && (
        <AntDesign
          name="check"
          size={16}
          color={primary}
        />
      )}
    </AppTouchable>
  );
};

const styles = StyleSheet.create({
  item: {
    minHeight: 68,
    borderBottomWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    paddingRight: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  itemText: {
    flex: 1,
    gap: 3,
  },
  city: {
    fontSize: 15,
    fontWeight: "600",
  },
  meta: {
    fontSize: 12,
  },
});

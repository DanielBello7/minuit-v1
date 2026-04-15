import { InterText } from "@/components/themed";
import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Back } from "./back";
import { useThemeColor } from "@/hooks/use-theme-color";

type Props = {
  title: string;
  back?: () => void;
  right?: ReactNode;
  backType?: "CLOSE" | "BACK";
};
export const Header = (props: Props) => {
  const border = useThemeColor("BORDER_DARKER");
  return (
    <View
      style={[
        styles.head,
        {
          borderColor: border,
        },
      ]}
    >
      <View style={styles.btn}>
        <Back
          action={props.back}
          type={props.backType === "BACK" ? "back" : "close"}
        />
      </View>
      <InterText
        style={[
          styles.title,
          props.right !== undefined && { paddingLeft: 20 },
        ]}
        numberOfLines={1}
      >
        {props.title}
      </InterText>
      <View style={styles.btn}>{props.right}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  head: {
    paddingHorizontal: 16,
    gap: 10,
    width: "100%",
    borderBottomWidth: 1,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    flex: 1,
    fontSize: 20,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    fontWeight: "600",
  },
  btn: {
    minWidth: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});

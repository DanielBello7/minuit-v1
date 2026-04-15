import { InterText } from "@/components/themed";
import { StyleSheet, View } from "react-native";

type Props = {
  value: number | string;
};
export const Digit = (props: Props) => {
  return (
    <View style={styles.box}>
      <InterText style={styles.text}>
        {typeof props.value === "string"
          ? props.value
          : String(props.value).padStart(2, "0")}
      </InterText>
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  text: {
    textAlign: "center",
    fontSize: 40,
    fontWeight: "800",
  },
});

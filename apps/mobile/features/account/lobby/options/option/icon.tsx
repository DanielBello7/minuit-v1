import { with_alpha } from "@/libs/with-alpha";
import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

type Props = {
  rgba: string;
  icon: ReactNode;
};
export const Icon = (props: Props) => {
  return (
    <View
      style={[
        styles.main,
        { backgroundColor: with_alpha(props.rgba, 0.2) },
      ]}
    >
      {props.icon}
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    padding: 7,
    borderRadius: 99,
  },
});

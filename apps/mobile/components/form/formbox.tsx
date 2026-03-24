import { ReactNode } from "react";
import { StyleSheet, View, ViewProps } from "react-native";

type Props = ViewProps & {
  children?: ReactNode;
};

export const Formbox = (props: Props) => {
  return <View style={styles.box}>{props.children}</View>;
};

const styles = StyleSheet.create({
  box: {
    width: "100%",
    gap: 20,
  },
});

import { StyleSheet, View } from "react-native";
import { useLogic } from "./use-logic";

type Props = {
  back: () => void;
  code: string;
};
export const Password = (props: Props) => {
  const logic = useLogic(props.code);
  return <View style={styles.box}></View>;
};

const styles = StyleSheet.create({
  box: {
    width: "100%",
  },
});

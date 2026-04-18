import { StyleSheet, View } from "react-native";
import { useLogic } from "./use-logic";

type Props = {
  continue: (v: string) => void;
};

export const RecoveryBody = (props: Props) => {
  const logic = useLogic(props);
  return <View style={styles.box}></View>;
};

const styles = StyleSheet.create({
  box: {
    width: "100%",
  },
});

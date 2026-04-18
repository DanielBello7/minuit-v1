import { AppSafeArea } from "@/components/themed";
import { StyleSheet, View } from "react-native";
import { Title } from "./title";
import { Info } from "./info";
import { Clocks } from "./clocks";

export const MyClocks = () => {
  return (
    <AppSafeArea
      style={{
        flex: 1,
        paddingHorizontal: 0,
      }}
    >
      <View style={styles.box}>
        <Title />
        <View style={styles.body}>
          <Info />
          <Clocks />
        </View>
      </View>
    </AppSafeArea>
  );
};

const styles = StyleSheet.create({
  box: {
    flex: 1,
    gap: 10,
  },
  body: {
    flex: 1,
    borderColor: "red",
  },
});

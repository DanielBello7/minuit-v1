import { AppSafeArea } from "@/components/themed";
import { StyleSheet, View } from "react-native";
import { Head } from "./head";

export const Account = () => {
  return (
    <AppSafeArea>
      <View style={styles.box}>
        <Head />
      </View>
    </AppSafeArea>
  );
};

const styles = StyleSheet.create({
  box: {
    flex: 1,
  },
});

import {
  AppSafeArea,
  ButtonA,
  ButtonC,
  ButtonTextA,
  ButtonTextC,
} from "@/components/themed";
import { Dimensions, ScrollView, StyleSheet, View } from "react-native";
import { Head } from "./head";
import { Title } from "./title";
import { Options } from "./options";
import { useLogic } from "./use-logic";
import { Spacer } from "@/components/ui";
import { useState } from "react";

const D_HEIGHT = Dimensions.get("screen").height;

/** Account Lobby */
export const Lobby = () => {
  const [addSpace, setAddSpace] = useState(false);
  const { secton_1, secton_2 } = useLogic();

  return (
    <AppSafeArea>
      <View style={styles.box}>
        <Head />
        <ScrollView
          style={styles.box}
          showsVerticalScrollIndicator={false}
          onLayout={(e) => {
            const { height } = e.nativeEvent.layout;
            if (height > D_HEIGHT) setAddSpace(true);
          }}
        >
          <Title />
          <Options data={secton_1} />
          <Options data={secton_2} />
          <Spacer height={34} />
          <ButtonA>
            <ButtonTextA>Log Out</ButtonTextA>
          </ButtonA>
          <Spacer height={20} />
          <ButtonC>
            <ButtonTextC>Delete Account</ButtonTextC>
          </ButtonC>
          <Spacer height={addSpace ? 120 : 60} />
        </ScrollView>
      </View>
    </AppSafeArea>
  );
};

const styles = StyleSheet.create({
  box: {
    flex: 1,
  },
});

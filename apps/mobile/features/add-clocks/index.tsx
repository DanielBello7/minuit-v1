import { AppSafeArea } from "@/components/themed";
import { Header } from "@/components/header";
import { useThemeColor } from "@/hooks/use-theme-color";
import { View, StyleSheet } from "react-native";
import { Cities } from "./cities";
import { Notice } from "./notice";
import { OK } from "./ok";
import { Search } from "./search";
import { ToTop } from "./top";
import { useLogic } from "./use-logic";
import { SafeAreaProvider } from "react-native-safe-area-context";

export const AddClocks = () => {
  const bg = useThemeColor("BASE");
  const logic = useLogic();
  return (
    <SafeAreaProvider>
      <AppSafeArea
        style={[styles.flex, { backgroundColor: bg }]}
        edges={["top"]}
      >
        <Header
          title="Add City"
          right={<OK save={() => {}} />}
          back={() => {
            logic.goback();
          }}
        />
        <Search
          action={(val) => {
            logic.setSearch(val);
          }}
        />
        <Notice
          selected={logic.current}
          clear={() => logic.setCurrent([])}
        />
        <View style={styles.box}>
          <Cities
            rf={logic.ref}
            reset={() => logic.setSearch("")}
            current={logic.current}
            search={logic.search}
            data={logic.rs}
            insert={(val) => {
              logic.add([val]);
            }}
          />
          <ToTop link={logic.ref} />
        </View>
      </AppSafeArea>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  box: {
    flex: 1,
  },
  flex: {
    flex: 1,
    paddingHorizontal: 0, // necessary
  },
});

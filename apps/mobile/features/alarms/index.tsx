import Feather from "@expo/vector-icons/Feather";

import { AppSafeArea, ThemedSafeArea } from "@/components/themed";
import { FlatList, StyleSheet, View } from "react-native";
import { Head } from "./head";
import { Alarm } from "./alarm";
import { Empty } from "@/components/empty";
import { useRouter } from "expo-router";
import { FloatingAddBtn } from "./add-fl-btn";
import { SafeAreaView } from "react-native-safe-area-context";

export const Alarms = () => {
  const router = useRouter();

  const press = () => {
    return router.navigate("/(main)/(tabs)/alarms/add-alarms");
  };

  return (
    <AppSafeArea edges={["top"]}>
      <View style={styles.box}>
        <Head />
        <View style={styles.box}>
          <FlatList
            data={[]}
            renderItem={({ item }) => <Alarm />}
            keyExtractor={(i, idx) => `${idx + i}`}
            showsVerticalScrollIndicator={false}
            style={styles.list}
            ListEmptyComponent={
              <Empty
                retry={press}
                title="No alarms set"
                sub="Add alarms with locations to make them special"
                retryText="Create"
                img={
                  <Feather
                    color="black"
                    name="bell"
                    size={50}
                  />
                }
              />
            }
          />
        </View>
        <FloatingAddBtn />
      </View>
    </AppSafeArea>
  );
};

const styles = StyleSheet.create({
  box: {
    flex: 1,
  },
  list: {
    width: "100%",
  },
});

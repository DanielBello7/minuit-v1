import Feather from "@expo/vector-icons/Feather";

import { AppSafeArea } from "@/components/themed";
import { FlatList, StyleSheet, View } from "react-native";
import { Head } from "./head";
import { Alarm } from "./alarm";
import { Empty } from "@/components/form/empty";
import { useRouter } from "expo-router";
import { FloatingAddBtn } from "./add-fl-btn";
import { Spacer } from "@/components/ui/spacer";

export const MyAlarms = () => {
  const router = useRouter();

  const press = () => {
    return router.navigate("/(main)/(tabs)/alarms/add-alarms");
  };

  const data: any[] = [1, 2, 3];

  return (
    <AppSafeArea
      edges={["top"]}
      style={{ paddingHorizontal: 0 }}
    >
      <View style={styles.box}>
        <Head data={data} />
        <View style={styles.inside}>
          <FlatList
            data={data}
            renderItem={({ item }) => <Alarm />}
            keyExtractor={(i, idx) => `${idx + i}`}
            showsVerticalScrollIndicator={false}
            style={styles.list}
            contentContainerStyle={styles.content}
            ListFooterComponent={<Spacer height={80} />}
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
        {data.length > 1 && <FloatingAddBtn />}
      </View>
    </AppSafeArea>
  );
};

const styles = StyleSheet.create({
  inside: {
    paddingHorizontal: 16,
    flex: 1,
  },
  box: {
    flex: 1,
  },
  list: {
    width: "100%",
    paddingTop: 20,
  },
  content: {
    width: "100%",
    gap: 14,
  },
});

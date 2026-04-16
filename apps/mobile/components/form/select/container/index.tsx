import { AppSafeArea } from "@/components/themed";
import { FlatList, Modal, StyleSheet, View } from "react-native";
import { Done } from "./done";
import { SelectOption } from "../use-logic";
import { CenterHeader } from "@/components/ui/center-header";
import { Search } from "./search";
import { SelectItem } from "./item";
import { Empty } from "@/components/form/empty";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Spacer } from "@/components/ui/spacer";

type Props = {
  title: string;
  open: boolean;
  close: () => void;
  query: string;
  setQuery: (val: string) => void;
  data: SelectOption[];
  value: SelectOption | null;
  onPick: (val: SelectOption) => void;
};

export const Container = (props: Props) => {
  return (
    <Modal
      onRequestClose={props.close}
      visible={props.open}
      animationType="slide"
      transparent={true}
    >
      <SafeAreaProvider>
        <AppSafeArea
          style={styles.flex}
          edges={["top"]}
        >
          <View style={styles.sheet}>
            <View style={styles.head}>
              <CenterHeader
                right={<Done action={props.close} />}
                back={props.close}
                title={props.title}
                backType="CLOSE"
              />

              <Search
                setQuery={props.setQuery}
                query={props.query}
              />
            </View>

            <FlatList
              data={props.data}
              keyboardShouldPersistTaps="handled"
              keyExtractor={(item, idx) => `${item.label}-${idx}`}
              showsVerticalScrollIndicator={false}
              ListFooterComponent={<Spacer />}
              ListEmptyComponent={
                <Empty
                  sub="No results currently available"
                  title="No Results"
                />
              }
              renderItem={({ item }) => (
                <SelectItem
                  onPick={(val) => {
                    props.onPick(val);
                  }}
                  selected={
                    props.value
                      ? props.value.label === item.label
                        ? true
                        : false
                      : false
                  }
                  value={item}
                />
              )}
            />
          </View>
        </AppSafeArea>
      </SafeAreaProvider>
    </Modal>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    paddingHorizontal: 0,
  },
  sheet: {
    flex: 1,
    width: "100%",
    gap: 10,
  },
  head: {
    width: "100%",
  },
});

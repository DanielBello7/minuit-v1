import { SectionList, StyleSheet, View } from "react-native";
import { InterText } from "@/components/themed";
import { Item } from "./item";
import { CityData } from "city-timezones";
import { RefObject } from "react";
import { Empty } from "@/components/empty";
import { AlphabetRail } from "./rail";

const ROW_HEIGHT = 70;

type Props = {
  data: { key: string; data: CityData[] }[];
  insert: (val: string) => void;
  current: string[];
  rf: RefObject<SectionList | null>;
  search: string;
  reset: () => void;
};
export const Cities = (props: Props) => {
  return (
    <View style={styles.item}>
      <SectionList
        ref={props.rf}
        sections={props.data}
        initialNumToRender={15}
        getItemLayout={(data, index) => ({
          index,
          length: ROW_HEIGHT,
          offset: ROW_HEIGHT * index,
        })}
        ListEmptyComponent={
          <Empty
            title="No Results"
            sub={`Couldn't find what you were searching for "${props.search}"`}
            retryText="Refresh"
          />
        }
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) =>
          `${item.city}-${item.timezone}-${item.lat}`
        }
        renderSectionHeader={(i) => {
          return (
            <InterText style={styles.key}>
              {i.section.key?.toUpperCase()}
            </InterText>
          );
        }}
        renderItem={({ item: i }) => (
          <Item
            pick={props.insert}
            selected={props.current.includes(i.city.toLowerCase())}
            data={i}
          />
        )}
      />
      <AlphabetRail
        rf={props.rf}
        sections={props.data}
        current={props.current}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    width: "100%",
  },
  key: {
    height: ROW_HEIGHT,
    paddingLeft: 16,
    fontSize: 30,
    fontWeight: "700",
    textAlignVertical: "center",
    includeFontPadding: false,
    lineHeight: ROW_HEIGHT,
  },
});

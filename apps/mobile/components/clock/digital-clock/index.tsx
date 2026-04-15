import { InterText } from "@/components/themed";
import { FlatList, StyleSheet, View } from "react-native";
import { CLOCK_SIZE } from "..";
import { useLogic } from "./use-logic";
import { Digit } from "./number";

const DIGIT_HEIGHT = 90;
const DIGIT_WIDTH = 100;

type Props = {
  size: CLOCK_SIZE;
  hr: number;
  mn: number;
};

export const DigitalClock = (props: Props) => {
  // prettier-ignore
  const {
    hr_data,
    hr_index,
    hr_ref,
    mn_data,
    mn_index,
    mn_ref
  } = useLogic(props);

  return (
    <View style={styles.container}>
      <View style={styles.dw}>
        <FlatList
          ref={hr_ref}
          initialScrollIndex={hr_index}
          data={hr_data}
          showsVerticalScrollIndicator={false}
          snapToInterval={DIGIT_HEIGHT}
          decelerationRate="fast"
          style={styles.digit}
          contentContainerStyle={styles.inside}
          keyExtractor={(_, index) => `hr-${index}`}
          renderItem={(i) => <Digit value={i.item} />}
          getItemLayout={(_, index) => ({
            length: DIGIT_HEIGHT,
            offset: DIGIT_HEIGHT * index,
            index,
          })}
        />
      </View>

      <InterText style={styles.inter}>:</InterText>

      <View style={styles.dw}>
        <FlatList
          ref={mn_ref}
          initialScrollIndex={mn_index}
          data={mn_data}
          showsVerticalScrollIndicator={false}
          snapToInterval={DIGIT_HEIGHT}
          decelerationRate="fast"
          style={styles.digit}
          contentContainerStyle={styles.inside}
          keyExtractor={(_, index) => `mn-${index}`}
          renderItem={(i) => <Digit value={i.item} />}
          getItemLayout={(_, index) => ({
            length: DIGIT_HEIGHT,
            offset: DIGIT_HEIGHT * index,
            index,
          })}
        />
      </View>

      <View style={styles.dw}>
        <FlatList
          data={["AM", "PM"]}
          showsVerticalScrollIndicator={false}
          snapToInterval={DIGIT_HEIGHT}
          decelerationRate="fast"
          style={styles.digit}
          contentContainerStyle={styles.inside}
          keyExtractor={(_, index) => `mn-${index}`}
          renderItem={(i) => <Digit value={i.item} />}
          getItemLayout={(_, index) => ({
            length: DIGIT_HEIGHT,
            offset: DIGIT_HEIGHT * index,
            index,
          })}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  inside: {
    width: "100%",
    height: "100%",
  },
  dw: {
    width: DIGIT_WIDTH,
    height: DIGIT_HEIGHT,
    borderWidth: 1,
  },
  digit: {
    width: "100%",
    height: "100%",
  },
  inter: {
    fontWeight: "900",
    fontSize: 50,
  },
});

import { InterText } from "@/components/themed";
import { StyleSheet, View } from "react-native";
import { DP } from "./dp";
import { Zoned } from "@/libs/zoned";
import { User } from "@/libs/user";

export const Greeting = () => {
  const zone = new Zoned();
  const user = new User();

  return (
    <View style={styles.box}>
      <DP img={user.values?.avatar} />
      <View style={styles.textbox}>
        <InterText
          style={styles.title}
          type="title"
        >
          Hi, {user.values === null ? "You" : user.values.display_name}
        </InterText>
        <InterText
          style={styles.sub}
          type="subtitle"
        >
          Good {zone.period}
        </InterText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 20,
  },
  sub: {
    fontSize: 13,
    lineHeight: 16,
    textTransform: "capitalize",
  },
  textbox: {
    gap: 0,
  },
});

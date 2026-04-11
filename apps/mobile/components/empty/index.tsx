import { InterText } from "@/components/themed";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";
import { Retry } from "./retry";

import Feather from "@expo/vector-icons/Feather";

type Props = {
  title?: string;
  sub?: string;
  img?: string;
  retry?: () => void;
  retryText?: string;
};
export const Empty = (props: Props) => {
  const color = useThemeColor("MUTED_FOREGROUND");
  return (
    <View style={styles.box}>
      {props.img ? (
        <Image
          style={styles.img}
          source={props.img}
          contentFit="cover"
          contentPosition={"center"}
        />
      ) : (
        <View>
          <Feather
            name="alert-circle"
            color="black"
            size={24}
          />
        </View>
      )}
      <View style={styles.text}>
        <InterText style={styles.title}>
          {props.title ?? "Nothing to show"}
        </InterText>
        <InterText style={[styles.sub, { color }]}>
          {props.sub ?? "Try again"}
        </InterText>
      </View>
      {props.retry && (
        <Retry
          action={props.retry}
          title={props.retryText}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    maxWidth: 220,
    textAlign: "center",
  },
  sub: {
    fontSize: 14,
    maxWidth: 180,
    textAlign: "center",
  },
  img: {
    width: 100,
    height: 100,
    borderRadius: 999,
  },
  box: {
    gap: 14,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 100,
  },
});

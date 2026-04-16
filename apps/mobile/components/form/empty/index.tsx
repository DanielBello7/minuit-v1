import { InterText } from "@/components/themed";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";
import { ReactNode } from "react";
import { Retry } from "./retry";

import Feather from "@expo/vector-icons/Feather";

type Props = {
  title?: string;
  sub?: string;
  img?: string | ReactNode;
  retry?: () => void;
  retryText?: string;
};
export const Empty = (props: Props) => {
  const color = useThemeColor("MUTED_FOREGROUND");
  const icon = useThemeColor("TEXT");
  return (
    <View style={styles.box}>
      {props.img ? (
        typeof props.img === "string" ? (
          <Image
            style={styles.img}
            source={props.img}
            contentFit="cover"
            contentPosition={"center"}
          />
        ) : (
          props.img
        )
      ) : (
        <View>
          <Feather
            name="alert-circle"
            color={icon}
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
    gap: 5,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    maxWidth: 220,
    textAlign: "center",
  },
  sub: {
    fontSize: 14,
    maxWidth: 240,
    textAlign: "center",
  },
  img: {
    width: 100,
    height: 100,
    borderRadius: 999,
  },
  box: {
    gap: 16,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 100,
  },
});

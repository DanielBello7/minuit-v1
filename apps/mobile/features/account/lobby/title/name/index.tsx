import { InterText } from "@/components/themed";
import { useThemeColor } from "@/hooks/use-theme-color";
import { User } from "@/libs/user";
import { StyleSheet, View } from "react-native";

export const Name = () => {
  const sub = useThemeColor("MUTED_FOREGROUND");
  const users = new User();
  const name = users.values?.display_name ?? "User";
  const username = users.values?.email ?? "User@example.com";
  return (
    <View style={styles.main}>
      <InterText style={styles.name}>{name}</InterText>
      <InterText
        style={[
          styles.username,
          {
            color: sub,
          },
        ]}
      >
        {username}
      </InterText>
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
  },
  username: {
    fontSize: 13,
  },
});

import { AppTouchable } from "@/components/themed";
import { COLORS } from "@/constants/themes/colors";
import { useRouter } from "expo-router";

import AntDesign from "@expo/vector-icons/AntDesign";

export const AddAlarm = () => {
  const router = useRouter();

  const press = () => {
    return router.navigate("/(main)/(tabs)/alarms/add-alarms");
  };

  return (
    <AppTouchable onPress={press}>
      <AntDesign
        name="plus"
        size={18}
        color={COLORS.PINK}
      />
    </AppTouchable>
  );
};

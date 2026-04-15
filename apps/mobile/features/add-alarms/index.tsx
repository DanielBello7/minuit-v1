import { Header } from "@/components/header";
import { Select } from "@/components/select";
import {
  AppSafeArea,
  ButtonC,
  ButtonTextC,
  InterText,
} from "@/components/themed";
import { StyleSheet, View } from "react-native";
import { useLogic } from "./use-logic";
import { Picker } from "@/components/picker";
import { Clock } from "@/components/clock";
import { User } from "@/libs/user";
import { Spacer } from "@/components/spacer";
import { Save } from "./save";

export const AddAlarms = () => {
  const logic = useLogic();
  const users = new User();
  return (
    <AppSafeArea
      edges={["top"]}
      style={styles.box}
    >
      <Header
        title="Add Alarm"
        back={logic.back}
        right={<Save action={() => {}} />}
      />
      <View style={styles.flex}>
        <InterText>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Sint
          nostrum, cum, magnam quam cupiditate atque
        </InterText>

        <View style={styles.clock}>
          <Clock
            tz={logic.form.city?.value ?? users.timezone}
            city={logic.form.city?.label ?? users.city}
            type="ANALOG"
            size="LARGE"
            interactive={true}
            showCity={true}
            dateType="long"
            showHowTo={true}
            showDays={true}
          />
        </View>

        <Select
          selected={logic.form.city}
          onChange={logic.pick}
          placeholder="Select a city"
          data={logic.cities}
          label="City"
          title="Select a city"
        />
        <Spacer height={10} />
        <Picker
          selected={logic.form.repeat}
          onPick={logic.choose}
          items={logic.weeks}
          label="Repeat"
        />

        <Spacer height={20} />

        <View style={styles.footer}>
          <ButtonC>
            <ButtonTextC>Save Alarm</ButtonTextC>
          </ButtonC>
        </View>
      </View>
    </AppSafeArea>
  );
};

const styles = StyleSheet.create({
  footer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  box: {
    paddingHorizontal: 0,
  },
  flex: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  clock: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
});

import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Clock } from "@/components/clock";

type TIME_TYPE = { hrs: number; min: number };

export const Clocks = () => {
  const [now, setNow] = useState(new Date());
  const [custom, setCustom] = useState<TIME_TYPE | null>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const hrs = custom?.hrs ?? now.getHours();
  const min = custom?.min ?? now.getMinutes();

  return (
    <View style={styles.box}>
      <Clock
        interactive={true}
        type="ANALOG"
        city="Local"
        size="LARGE"
        hr={hrs}
        mn={min}
        date={now}
        seconds={true}
        showCity={true}
        onTimeChange={(hr, mn) => {
          setCustom({ hrs: hr, min: mn });
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    flex: 1,
  },
  top: {
    width: "100%",
    flex: 0.3,
    borderWidth: 1,
  },
  bottom: {
    width: "100%",
    flex: 0.7,
    borderWidth: 1,
    borderColor: "red",
  },
});

import { useRootStore } from "@/stores";
import { useColorScheme as useColorSchemes } from "react-native";

export const useColorScheme = () => {
  const { data } = useRootStore((state) => state);
  const scheme = useColorSchemes() ?? "light";
  return data.theme === "system" ? scheme : data.mode;
};

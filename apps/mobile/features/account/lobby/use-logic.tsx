import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Feather from "@expo/vector-icons/Feather";
import React from "react";

import { useRouter } from "expo-router";

const ORANGE = "rgba(249, 115, 22, 1)";
const PURPLE = "rgba(147, 51, 234, 1)";
const BLUE = "rgba(0, 0, 255, 1)";
const GREEN = "rgba(0, 255, 0, 1)";

export type OptionsType = {
  action: () => void;
  icon: React.ReactNode;
  label: string;
  rgba: string;
};

// prettier-ignore
export const useLogic = () => {
  const router = useRouter();

  const secton_1: OptionsType[] = [
    {
      icon: <Feather name="user" size={18} color={BLUE} />,
      label: "Personal Information",
      rgba: BLUE,
      action: () => {},
    },
    {
      icon: <FontAwesome5 name="bell" size={18} color={ORANGE} />,
      label: "Notifications",
      rgba: ORANGE,
      action: () => {},
    },
    {
      icon: <Feather name="shield" size={18} color={GREEN} />,
      rgba: "rgba(0, 255, 0, 1)",
      label: "Security",
      action: () => {},
    },
    {
      icon: <Feather name="settings" size={18} color={PURPLE} />,
      label: "General Preferences",
      rgba: PURPLE,
      action: () => {},
    },
  ];

  const secton_2: OptionsType[] = [
    {
      icon: <Feather name="help-circle" size={18} color={BLUE} />,
      label: "Help & Support",
      rgba: BLUE,
      action: () => {},
    },
  ];

  return {
    secton_1,
    secton_2,
  };
};

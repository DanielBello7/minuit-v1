import { sonner } from "@/components/sonner";
import { useMultiscreen } from "@/hooks/use-multiscreen";
import { useRouter } from "expo-router";
import { useState } from "react";
import { SignupBody } from "./body";
import { OTP } from "@/components/form/otp";
import { sleep } from "@repo/libs";

export enum SIGNUP_SCREEN {
  FORM = "FORM",
  OTP = "OTP",
}

export const useLogic = () => {
  const [email, setEmail] = useState("");
  const router = useRouter();

  const multiscreen = useMultiscreen(
    [
      {
        name: SIGNUP_SCREEN.FORM,
        index: 0,
        component: (
          <SignupBody
            continue={(v) => {
              setEmail(v);
              multiscreen.goto(SIGNUP_SCREEN.OTP);
            }}
          />
        ),
      },
      {
        name: SIGNUP_SCREEN.OTP,
        index: 1,
        component: (
          <OTP
            back={() => multiscreen.goto(0)}
            email={email}
            type="SIGNUP"
            oncomplete={async (v) => {
              await sleep(2);
              router.replace("/(main)/(tabs)/home");
              sonner.success(
                "You have successfully signed in",
                "Account created",
              );
            }}
          />
        ),
      },
    ],
    SIGNUP_SCREEN.FORM,
  );

  return {
    multiscreen,
    email,
  };
};

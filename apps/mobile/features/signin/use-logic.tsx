import { useMultiscreen } from "@/hooks/use-multiscreen";
import { SigninBody } from "./body";
import { OTP } from "@/components/form/otp";
import { useRouter } from "expo-router";
import { sleep } from "@repo/libs";
import { sonner } from "@/components/sonner";
import { useState } from "react";

export enum SIGNIN_SCREEN_ENUM {
  FORM = "FORM",
  OTP = "OTP",
}

export const useLogic = () => {
  const [email, setEmail] = useState("");
  const router = useRouter();

  const { screen, goto } = useMultiscreen(
    [
      {
        name: SIGNIN_SCREEN_ENUM.FORM,
        component: (
          <SigninBody
            /** continue function to be called when the email was verified and we need to move to the otp screen */
            continue={(v) => {
              setEmail(v);
              goto(SIGNIN_SCREEN_ENUM.OTP);
            }}
          />
        ),
        index: 0,
      },
      {
        name: SIGNIN_SCREEN_ENUM.OTP,
        component: (
          <OTP
            back={() => goto(0)}
            email={email}
            type="SIGNIN"
            /** complete function to be called when the otp is successfully verified */
            oncomplete={async (v: string) => {
              await sleep(2);
              sonner.success(
                "You have successful signed in",
                "Login successful",
              );
              router.replace("/(main)/(tabs)");
            }}
          />
        ),
        index: 1,
      },
    ],
    SIGNIN_SCREEN_ENUM.FORM,
  );

  return {
    screen,
  };
};

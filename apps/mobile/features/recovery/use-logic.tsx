import { useMultiscreen } from "@/hooks/use-multiscreen";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Password } from "./password";
import { OTP } from "@/components/otp";
import { sleep } from "@repo/libs";
import { sonner } from "@/components/sonner";
import { RecoveryBody } from "./body";

export enum RECOVERY_SCREENS {
  EMAIL = "EMAIL",
  OTP = "OTP",
  PASSWORD = "PASSWORD",
}

export const useLogic = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const router = useRouter();

  const screens = useMultiscreen(
    [
      {
        index: 0,
        component: (
          <RecoveryBody
            continue={(v) => {
              setEmail(v);
              screens.goto(1);
            }}
          />
        ),
        name: RECOVERY_SCREENS.EMAIL,
      },
      {
        index: 1,
        component: (
          <OTP
            type="RECOVER"
            back={() => screens.goto(0)}
            email={email}
            oncomplete={async (v) => {
              await sleep(2);
              screens.goto(2);
              setOtp(v);
              sonner.success(
                "The otp has been verified successfully",
                "OTP Verified",
              );
            }}
          />
        ),
        name: RECOVERY_SCREENS.OTP,
      },
      {
        index: 2,
        component: (
          <Password
            back={() => screens.goto(0)}
            code={otp}
          />
        ),
        name: RECOVERY_SCREENS.PASSWORD,
      },
    ],
    RECOVERY_SCREENS.EMAIL,
  );

  return {
    router,
    email,
    screens,
  };
};

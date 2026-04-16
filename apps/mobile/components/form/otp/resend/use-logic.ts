import { api } from "@/libs/api";
import { useAsync } from "@/hooks/use-async";
import { useEffect, useState } from "react";
import { sonner } from "@/components/sonner";
import { OTP_TYPE } from "../use-logic";

const COOLDOWN_SECONDS = 30;

export const useLogic = (email: string, type: OTP_TYPE) => {
  const [timeLeft, setTimeLeft] = useState(COOLDOWN_SECONDS);
  const { run, isLoading } = useAsync();

  const resend = async () =>
    run(async () => {
      if (type === "SIGNIN") {
        await api.auth.signin_verify({ email });
      } else if (type === "SIGNUP") {
        await api.signup.send_verify_otp({ email });
      } else if (type === "RECOVER") {
        await api.auth.recovery_verify({ email });
      } else {
        throw new Error("unknown type");
      }
      sonner.alert("An OTP has been sent to your email");
      setTimeLeft(COOLDOWN_SECONDS);
    });

  useEffect(() => {
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [timeLeft]);

  const isDisabled = isLoading || timeLeft > 0;

  return {
    isDisabled,
    resend,
    email,
    timeLeft,
  };
};

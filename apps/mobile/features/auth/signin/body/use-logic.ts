import { sonner } from "@/components/sonner";
import { useAsync } from "@/hooks/use-async";
import { sleep } from "@repo/libs";
import { useRouter } from "expo-router";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  email: z.email().trim().nonempty(),
});

type SCHEMA_TYPE = z.infer<typeof schema>;

export const useLogic = (complete: (val: string) => void) => {
  const form = useForm<SCHEMA_TYPE>({
    defaultValues: { email: "" },
  });

  const values = useWatch({ control: form.control });
  const router = useRouter();
  const asyncs = useAsync();

  const click = () => router.navigate("/(main)/(auth)/signup.screen");

  /**
   * handles the sending of the email to the backend and if
   * the email is valid - the sending of the otp token to the email of the user
   * @returns
   */
  const submit = () => {
    return asyncs.run(async () => {
      const parsed = schema.parse(values);

      await sleep(2);
      complete(parsed.email);

      sonner.alert(
        `We've sent a token to your email at ${parsed.email}`,
        "OTP Sent",
      );
    });
  };

  return {
    submit,
    click,
    watch: values,
    handler: asyncs,
    form,
  };
};

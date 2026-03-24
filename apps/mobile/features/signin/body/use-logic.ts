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
  const form = useForm<SCHEMA_TYPE>({ defaultValues: { email: "" } });
  const router = useRouter();
  const handler = useAsync();
  const watch = useWatch({ control: form.control });

  const click = () => router.navigate("/(main)/(auth)/signup.screen");

  const submit = () => {
    return handler.run(async () => {
      const parsed = schema.parse(watch);

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
    watch,
    handler,
    form,
  };
};

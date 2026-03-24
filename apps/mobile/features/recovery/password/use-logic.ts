import { sonner } from "@/components/sonner";
import { useAsync } from "@/hooks/use-async";
import { sleep } from "@repo/libs";
import { useRouter } from "expo-router";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  oldPassword: z.string().trim().nonempty().min(8),
  newPassword: z.string().trim().nonempty().min(8),
});

type SCHEMA_TYPE = z.infer<typeof schema>;

// code == otp
export const useLogic = (code: string) => {
  const handler = useAsync();
  const form = useForm<SCHEMA_TYPE>();
  const watch = useWatch({ control: form.control });
  const router = useRouter();

  const submit = () => {
    return handler.run(async () => {
      const parsed = schema.parse(watch);
      console.log(parsed, code);
      await sleep(2);
      router.replace("/(main)/(auth)/signin.screen");
      sonner.success(
        "Your password has been changed successfully",
        "Password Change Success",
      );
    });
  };

  return {
    submit,
    handler,
    form,
    watch,
  };
};

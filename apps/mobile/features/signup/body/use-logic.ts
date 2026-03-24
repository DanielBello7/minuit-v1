import { sonner } from "@/components/sonner";
import { useAsync } from "@/hooks/use-async";
import { sleep } from "@repo/libs";
import { useRouter } from "expo-router";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  email: z.email().trim().nonempty(),
  name: z.string().trim().nonempty(),
});

type SCHEMA_TYPE = z.infer<typeof schema>;

type Props = {
  continue: (val: string) => void;
};

export const useLogic = (props: Props) => {
  const handler = useAsync();
  const form = useForm<SCHEMA_TYPE>();
  const watch = useWatch({ control: form.control });
  const router = useRouter();

  const click = () => router.replace("/(main)/(auth)/signin.screen");

  const submit = () => {
    return handler.run(async () => {
      const parsed = schema.parse(watch);
      await sleep(2);
      props.continue(parsed.email);
      sonner.success(
        `We've sent a 6-digit code to ${parsed.email}`,
        "OTP Sent",
      );
    });
  };

  return {
    handler,
    submit,
    form,
    watch,
    schema,
    click,
  };
};

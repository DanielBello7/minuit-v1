import { sonner } from "@/components/sonner";
import { useAsync } from "@/hooks/use-async";
import { sleep } from "@repo/libs";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  email: z.email().trim().nonempty(),
});

type SCHEMA_TYPE = z.infer<typeof schema>;

type Props = {
  continue: (v: string) => void;
};

export const useLogic = (props: Props) => {
  const handler = useAsync();
  const form = useForm<SCHEMA_TYPE>();
  const watch = useWatch({ control: form.control });

  const submit = () => {
    return handler.run(async () => {
      const parsed = schema.parse(watch);
      await sleep(2);
      sonner.success("OTP has been sent to your email", "OTP Sent");
      props.continue(parsed.email);
    });
  };

  return {
    submit,
    handler,
    form,
    watch,
    schema,
  };
};

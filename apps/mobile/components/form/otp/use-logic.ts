import { useAsync } from "@/hooks/use-async";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";

export type OTP_TYPE = "SIGNUP" | "SIGNIN" | "RECOVER";

const schema = z.object({
  token: z.string().trim().min(6).max(6),
});

type SCHEMA_TYPE = z.infer<typeof schema>;

type Props = {
  oncomplete: (v: string) => Promise<void>;
};

export const useLogic = (props: Props) => {
  const handler = useAsync();

  const form = useForm<SCHEMA_TYPE>({
    defaultValues: { token: "" },
  });

  const values = useWatch({ control: form.control });

  const submit = () =>
    handler.run(async () => {
      const parsed = schema.parse(form.getValues());
      return await props.oncomplete(parsed.token);
    });

  return {
    submit,
    isLoading: handler.isLoading,
    schema,
    form,
    values,
  };
};

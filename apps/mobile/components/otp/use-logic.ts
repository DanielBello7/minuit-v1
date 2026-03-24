import { useAsync } from "@/hooks/use-async";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";

export type OTP_TYPE = "SIGNUP" | "SIGNIN";

const schema = z.object({
  token: z.string().trim().min(6).max(6),
});

type SCHEMA_TYPE = z.infer<typeof schema>;

export const useLogic = (action: (value: string) => Promise<void>) => {
  const handler = useAsync();

  const form = useForm<SCHEMA_TYPE>({
    defaultValues: { token: "" },
  });

  const values = useWatch({ control: form.control });

  const submit = () =>
    handler.run(async () => {
      const parsed = schema.parse(form.getValues());
      return await action(parsed.token);
    });

  return {
    submit,
    isLoading: handler.isLoading,
    schema,
    form,
    values,
  };
};

import { SelectOption } from "@/components/form/select/use-logic";
import { useAsync } from "@/hooks/use-async";
import { City } from "@/libs/city";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { WEEKDAYS_ENUM } from "@repo/types";
import { PickerItemType } from "@/components/form/picker/item";

const schema = z.object({
  hr: z.string().trim(),
  mn: z.string().trim(),
  meridiem: z.enum(["AM", "PM"]),
  city: z
    .object({
      label: z.string(),
      value: z.string(),
      description: z.string().nullable(),
    })
    .nullable(),
  repeat: z.array(z.enum(WEEKDAYS_ENUM)),
});

type FORM_SCHEMA = {
  hr: string;
  mn: string;
  period: "AM" | "PM";
  city: SelectOption | null;
  repeat: PickerItemType[];
};

export const useLogic = () => {
  const [form, setForm] = useState<FORM_SCHEMA>({
    hr: "00",
    mn: "00",
    city: null,
    period: "AM",
    repeat: [],
  });
  const handler = useAsync();
  const router = useRouter();

  const submit = () => {
    return handler.run(async () => {
      const parsed = schema.parse(form);
      console.log(parsed);
    });
  };

  const back = () => {
    return router.back();
  };

  const weeks = Object.keys(WEEKDAYS_ENUM).map((i) => {
    return {
      label: i[0],
      value: i,
    } satisfies PickerItemType;
  });

  const cities: SelectOption[] = useMemo(() => {
    return City.list().map((a) => {
      return {
        label: a.city,
        value: a.timezone,
        description: a.country,
      };
    });
  }, []);

  const pick = (city: SelectOption | null) => {
    setForm((prev) => ({
      ...prev,
      city,
    }));
  };

  const choose = (val: PickerItemType) => {
    return setForm((prev) => {
      const find = prev.repeat.find((i) => i.value === val.value);
      if (find)
        return {
          ...prev,
          repeat: prev.repeat.filter((a) => a.value !== val.value),
        };
      else return { ...prev, repeat: [...prev.repeat, val] };
    });
  };

  return {
    cities,
    weeks,
    list: City.list,
    back,
    submit,
    pick,
    form,
    setForm,
    handler,
    choose,
  };
};

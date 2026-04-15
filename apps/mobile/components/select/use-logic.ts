import { useMemo, useState } from "react";

export type SelectOption = {
  label: string;
  value: string;
  description?: string;
};

type Props = {
  data: SelectOption[];
  onChange: (val: SelectOption | null) => void;
};

export const useLogic = (props: Props) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const list = props.data;

  const results = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) return list;

    return list.filter((item) => {
      const haystack = [item.label, item.value, item.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(text);
    });
  }, [list, query]);

  const pick = (item: SelectOption) => {
    props.onChange?.(item);
    setOpen(false);
    setQuery("");
  };

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  return {
    open,
    setOpen,
    query,
    setQuery,
    results,
    pick,
    close,
  };
};

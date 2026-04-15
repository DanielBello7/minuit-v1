import { useAsync } from "@/hooks/use-async";
import { useMemo, useRef, useState } from "react";
import { SectionList } from "react-native";
import { useRouter } from "expo-router";
import { City } from "@/libs/city";

export const useLogic = () => {
  const [current, setCurrent] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const ref = useRef<SectionList | null>(null);
  const handler = useAsync();
  const router = useRouter();

  const results = City.sectioned();

  const goback = () => {
    return router.back();
  };

  const add = (val: string[]) => {
    return setCurrent((prev) => {
      let next = prev;

      for (const item of val) {
        const lowered = item.toLowerCase();
        const exists = next.some((city) => city.toLowerCase() === lowered);

        next = exists
          ? next.filter((city) => city.toLowerCase() !== lowered)
          : [lowered, ...next];
      }

      return next;
    });
  };

  const rs = useMemo(() => {
    return Object.keys(results)
      .filter((i) => {
        if (!search.trim()) return i;
        return i.toLowerCase().startsWith(search.toLocaleLowerCase());
      })
      .map((i) => ({
        key: i,
        data: results[i],
      }))
      .sort((a, b) => {
        return a.key.localeCompare(b.key);
      });
  }, [results, search]);

  const submit = () => {
    return handler.run(async () => {});
  };

  return {
    list: City.list,
    results,
    rs,
    goback,
    ref,
    add,
    submit,
    current,
    setCurrent,
    search,
    setSearch,
  };
};

import { useAsync } from "@/hooks/use-async";
import { useMemo, useRef, useState } from "react";
import { SectionList } from "react-native";
import { useRouter } from "expo-router";
import { City } from "@/libs/city";
import { CityData } from "city-timezones";

const ab = "a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z".split(
  ",",
);

export const useLogic = () => {
  const [current, setCurrent] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const ref = useRef<SectionList | null>(null);
  const handler = useAsync();
  const router = useRouter();

  const results = useMemo(() => {
    const text = search.trim().toLowerCase();
    const list = City.list();

    const filtered = !text
      ? list
      : list.filter((item) => {
          const haystack = [item.city, item.country, item.timezone]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return haystack.includes(text);
        });

    return filtered.reduce(
      (acc, item) => {
        const st = item.city[0]?.toLowerCase() ?? "#";
        const key = ab.includes(st) ? st : "#";
        if (acc[key]) {
          acc[key].push(item);
        } else {
          acc[key] = [item];
        }
        return acc;
      },
      {} as Record<string, CityData[]>,
    );
  }, [search]);

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
      .map((i) => ({
        key: i,
        data: results[i],
      }))
      .sort((a, b) => {
        return a.key.localeCompare(b.key);
      });
  }, [results]);

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

import { cityMapping, CityData } from "city-timezones";
import { useAsync } from "@/hooks/use-async";
import { useMemo, useRef, useState } from "react";
import { SectionList } from "react-native";
import { useRouter } from "expo-router";

const ab = "a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z".split(
  ",",
);

export const useLogic = () => {
  const [current, setCurrent] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const ref = useRef<SectionList | null>(null);
  const handler = useAsync();
  const router = useRouter();

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

  const results = useMemo(() => {
    return cityMapping.reduce(
      (a, b) => {
        const st = b.city[0]?.toLowerCase() ?? "*";
        if (ab.includes(st)) {
          if (a[st]) a[st].push(b);
          else a[st] = [b];
          return a;
        } else {
          if (a["#"]) a["#"].push(b);
          else a["#"] = [b];
          return a;
        }
      },
      {} as Record<string, CityData[]>,
    );
  }, []);

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
    list: cityMapping,
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

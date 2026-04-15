import { cityMapping, CityData } from "city-timezones";

const ab = "a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z".split(
  ",",
);

export class City {
  public static sectioned = () => {
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
  };

  public static list = () => {
    return cityMapping;
  };
}

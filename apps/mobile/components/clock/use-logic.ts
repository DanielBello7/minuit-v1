import { useEffect, useState } from "react";
import { TIME_TYPE } from "@/features/home/my-clocks/clocks";
import { Zoned } from "@/libs/zoned";
import { CLOCK_CUSTOM, CLOCK_SYNC } from ".";

type Props = {
  tz: string; // the timezone of the clock
  set?: CLOCK_SYNC;
  setCustom?: CLOCK_CUSTOM;
  sync?: Zoned | null;
  custom?: TIME_TYPE | null;
  showDate?: boolean;
  dateType?: "short" | "long";
};

export const useLogic = (props: Props) => {
  const [internalCustom, setInternalCustom] = useState<TIME_TYPE | null>(
    null,
  );
  const [zone, setZone] = useState(
    props.sync
      ? new Zoned(props.tz).sync(props.sync)
      : new Zoned(props.tz),
  );
  const controlled = props.custom !== undefined;
  const custom = controlled ? props.custom : internalCustom;

  const change = (params: TIME_TYPE | null) => {
    if (!controlled) {
      setInternalCustom(params);
    }

    props.setCustom?.(params);

    if (!params) {
      props.set?.(null);
      return;
    }

    const zoned = new Zoned(props.tz, zone.base.toJSDate());
    zoned.set_time(params.hr, params.mn);

    props.set?.(zoned);
  };

  useEffect(() => {
    if (props.sync) {
      setZone(new Zoned(props.tz).sync(props.sync));
      return;
    } else {
      setZone(new Zoned(props.tz));
    }
  }, [props.tz, props.sync]);

  useEffect(() => {
    const id = setInterval(() => {
      if (props.sync) {
        setZone(new Zoned(props.tz).sync(props.sync));
        return;
      } else {
        setZone(new Zoned(props.tz));
      }
    }, 1000);

    return () => clearInterval(id);
  }, [props.tz, props.sync]);

  return {
    change,
    custom,
    proper: zone.parsed_date(props.dateType),
    now: zone,
  };
};

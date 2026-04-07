import { useThemeColor } from "@/hooks/use-theme-color";
import { get_day_status } from "@/libs/get-day-status";
import { TIME_CHANGE_TYPE } from ".";
import { useEffect, useMemo, useState } from "react";
import { TIME_TYPE } from "@/features/home/clocks";
import { get_date } from "@/libs/get-date";
import { get_tz_parts } from "@/libs/get-tz-parts";
import { get_relative_day } from "@/libs/get-relative-day";

type Props = {
  custom?: TIME_TYPE | null;
  date?: Date | null;
  timezone?: string;
  onTimeChange?: TIME_CHANGE_TYPE;
};

const wrap_24 = (n: number) => ((n % 24) + 24) % 24;

export const useLogic = (props: Props) => {
  const [custom, setCustomState] = useState<TIME_TYPE | null>(null);
  const [now, setNow] = useState(props.date ?? new Date());

  const border = useThemeColor("BORDER_DARKER");
  const clock_face_border = useThemeColor("CLOCK_FACE_BORDER");
  const muted = useThemeColor("MUTED_FOREGROUND");
  const primary = useThemeColor("PRIMARY");
  const card = useThemeColor("BACKGROUND");
  const foreground = useThemeColor("FOREGROUND");

  const local_timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const clock_tz = props.timezone ?? local_timezone;

  // this should probably be your home clock timezone instead
  const reference_tz = local_timezone;

  const controlled = props.custom !== undefined;

  const active_time = useMemo(() => {
    return props.custom ?? custom;
  }, [props.custom, custom]);

  const zoned_now = useMemo(() => {
    return get_tz_parts(now, clock_tz);
  }, [now, clock_tz]);

  const status = useMemo(() => {
    return get_relative_day(now, clock_tz, reference_tz);
  }, [now, clock_tz, reference_tz]);

  const formatted_date = get_date(now, clock_tz);

  const setCustom = (val: TIME_TYPE | null) => {
    if (!controlled) {
      setCustomState(val);
    }

    props.onTimeChange?.(val);
  };

  const reset = () => {
    if (!controlled) {
      setCustomState(null);
    }

    props.onTimeChange?.(null);
  };

  useEffect(() => {
    if (props.date) {
      setNow(props.date);
    }
  }, [props.date]);

  useEffect(() => {
    const id = setInterval(() => {
      const next_n = props.date ?? new Date();
      setNow(next_n);

      // if user has manually adjusted the clock,
      // keep that custom value advancing by one minute
      if (!controlled && custom !== null) {
        const next_parts = get_tz_parts(next_n, clock_tz);

        if (next_parts.sec === 0) {
          setCustomState((prev) => {
            if (prev === null) return null;

            const nextMinute = prev.mn + 1;
            const nextHour =
              nextMinute >= 60 ? wrap_24(prev.hr + 1) : prev.hr;

            const value = {
              hr: nextHour,
              mn: nextMinute % 60,
            };

            props.onTimeChange?.(value);
            return value;
          });
        }
      }
    }, 1000);

    return () => clearInterval(id);
  }, [custom, controlled, props.date, props.onTimeChange, clock_tz]);

  return {
    reset,
    formatted_date,
    status,
    foreground,
    card,
    muted,
    border,
    clock_face_border,
    primary,
    clock_tz,
    now,
    zoned_now,
    custom: active_time,
    setCustom,
  };
};

import { useThemeColor } from "@/hooks/use-theme-color";
import { get_day_status } from "@/libs/get-day-status";

type Props = {
  timezone?: string;
  date?: Date;
};

export const useLogic = (props: Props) => {
  const border = useThemeColor("BORDER_DARKER");
  const muted = useThemeColor("MUTED_FOREGROUND");
  const primary = useThemeColor("PRIMARY");
  const card = useThemeColor("BACKGROUND");
  const foreground = useThemeColor("FOREGROUND");

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const status = get_day_status(timezone);

  // prettier-ignore
  const formatted_date =
    props.date &&
    (props.timezone
      ? props.date.toLocaleDateString("en-US", { timeZone: props.timezone, month: "short", day: "numeric", weekday: "long" })
      : props.date.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "short" }));

  return {
    formatted_date,
    status,
    foreground,
    card,
    muted,
    border,
    primary,
  };
};

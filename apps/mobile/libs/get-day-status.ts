import { get_tz_date } from "./get-tz-date";

export const get_day_status = (
  targetTimezone: string,
  localTimezone: string = Intl.DateTimeFormat().resolvedOptions().timeZone,
) => {
  const now = new Date();

  const local = get_tz_date(localTimezone, now);
  const target = get_tz_date(targetTimezone, now);

  const local_date = new Date(local.year, local.month - 1, local.day);
  const target_date = new Date(target.year, target.month - 1, target.day);

  const diff_ms = target_date.getTime() - local_date.getTime();
  const diff_days = Math.round(diff_ms / (1000 * 60 * 60 * 24));

  if (diff_days === 0) return "today";
  if (diff_days === 1) return "tomorrow";
  if (diff_days === -1) return "yesterday";

  return target.date_f;
};

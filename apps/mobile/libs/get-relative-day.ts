import { get_tz_parts } from "./get-tz-parts";

export const get_relative_day = (
  date: Date,
  target_timezone: string,
  reference_timezone: string,
) => {
  const target = get_tz_parts(date, target_timezone);
  const reference = get_tz_parts(date, reference_timezone);

  const target_day = Date.UTC(target.year, target.month - 1, target.day);
  const reference_day = Date.UTC(
    reference.year,
    reference.month - 1,
    reference.day,
  );

  const diff_days = Math.round(
    (target_day - reference_day) / (1000 * 60 * 60 * 24),
  );

  if (diff_days === 0) return "Today";
  if (diff_days === 1) return "Tomorrow";
  if (diff_days === -1) return "Yesterday";

  return target.weekday;
};

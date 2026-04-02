type TIMEZONE_DATE_TYPE = {
  month: number;
  day: number;
  year: number;
  hr: number;
  mn: number;
  date_f: string; // Monday 24th July 2024
  time_f: string; // 17:23
  timezone: string;
  date: string;
};

const to_ordinal = (n: number) => {
  if (n % 100 >= 11 && n % 100 <= 13) return `${n}th`;

  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
};

export const get_timezone_timedate = (
  timezone: string,
  now: Date = new Date(),
): TIMEZONE_DATE_TYPE => {
  const numeric_parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const text_parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).formatToParts(now);

  const get_number = (parts: Intl.DateTimeFormatPart[], type: string) =>
    Number(parts.find((p) => p.type === type)?.value ?? 0);

  const get_text = (parts: Intl.DateTimeFormatPart[], type: string) =>
    parts.find((p) => p.type === type)?.value ?? "";

  const month = get_number(numeric_parts, "month");
  const day = get_number(numeric_parts, "day");
  const year = get_number(numeric_parts, "year");
  const hr = get_number(numeric_parts, "hour");
  const mn = get_number(numeric_parts, "minute");

  const weekday = get_text(text_parts, "weekday");
  const month_name = get_text(text_parts, "month");

  return {
    month,
    day,
    year,
    hr,
    mn,
    date_f: `${weekday} ${to_ordinal(day)} ${month_name} ${year}`,
    time_f: `${String(hr).padStart(2, "0")}:${String(mn).padStart(2, "0")}`,
    timezone,
    date: new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(now),
  };
};

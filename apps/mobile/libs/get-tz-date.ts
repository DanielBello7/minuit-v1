type RESPONSE = {
  month: number;
  day: number;
  year: number;

  hr_24: number; // 0 - 23
  hr_12: number; // 1 - 12
  mn: number;

  period: "AM" | "PM";

  time_24: string; // 17:23
  time_12: string; // 05:23 PM

  date_f: string; // Monday 24th July 2024
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

export const get_tz_date = (
  timezone: string,
  now: Date = new Date(),
): RESPONSE => {
  const parts24 = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const parts12 = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(now);

  const text_parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).formatToParts(now);

  const get_number = (parts: Intl.DateTimeFormatPart[], key: string) => {
    return Number(parts.find((p) => p.type === key)?.value ?? 0);
  };

  const get_text = (parts: Intl.DateTimeFormatPart[], key: string) => {
    return parts.find((p) => p.type === key)?.value ?? "";
  };

  const month = get_number(parts24, "month");
  const day = get_number(parts24, "day");
  const year = get_number(parts24, "year");

  const hr_24 = get_number(parts24, "hour");
  const mn = get_number(parts24, "minute");

  const hr_12 = get_number(parts12, "hour");
  const period = get_text(parts12, "dayPeriod").toUpperCase() as
    | "AM"
    | "PM";

  const weekday = get_text(text_parts, "weekday");
  const monthText = get_text(text_parts, "month");

  const time_24 = `${String(hr_24).padStart(2, "0")}:${String(mn).padStart(2, "0")}`;
  const time_12 = `${String(hr_12).padStart(2, "0")}:${String(mn).padStart(2, "0")} ${period}`;

  return {
    month,
    day,
    year,

    hr_24,
    hr_12,
    mn,

    period,

    time_24,
    time_12,

    date_f: `${weekday} ${to_ordinal(day)} ${monthText} ${year}`,
    timezone: timezone,

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

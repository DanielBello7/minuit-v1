const options: Partial<Intl.DateTimeFormatOptions> = {
  month: "long",
  day: "numeric",
  weekday: "long",
};

const tuple = ["en-US", options] as [string, object];

export const get_date = (date?: Date, timezone?: string) => {
  const result = !date
    ? new Date().toLocaleDateString(...tuple)
    : !timezone
      ? date.toLocaleDateString(...tuple)
      : date.toLocaleDateString("en-US", {
          timeZone: timezone,
          ...options,
        });

  return result;
};

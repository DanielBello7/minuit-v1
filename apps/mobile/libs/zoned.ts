import { DateTime } from "luxon";

export class Zoned {
  public tz: string;
  public base: DateTime;

  constructor(tz?: string, date?: Date) {
    this.tz = tz ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.base = date
      ? DateTime.fromJSDate(date).setZone(tz)
      : DateTime.now().setZone(tz);
  }

  get year() {
    return this.base.year;
  }

  get month() {
    return this.base.month;
  }

  get day() {
    return this.base.day;
  }

  get hr() {
    return this.base.hour;
  }

  get mn() {
    return this.base.minute;
  }

  get sc() {
    return this.base.second;
  }

  get parsed() {
    return this.base.toFormat("cccc, LLLL d");
  }

  public parts = () => {
    return {
      time_24: this.base.toFormat("HH:mm"),
      time_12: this.base.toFormat("hh:mm a"),
      period: this.base.toFormat("a") as "AM" | "PM",
      hr_24: this.base.hour,
      hr_12: this.base.hour % 12 || 12,
      instant: this.base.toJSDate(),
      weekday: this.base.weekdayLong ?? "",
      year: this.base.year,
      month: this.base.month,
      day: this.base.day,
      hr: this.base.hour,
      mn: this.base.minute,
      sc: this.base.second,
      tz: this.tz,
      parsed: this.base.toFormat("cccc, LLLL d"),
    };
  };

  public sync = (source: Zoned) => {
    this.base = source.base.setZone(this.tz);
    return this;
  };

  public static relative_day = (
    in_tgt: Zoned | string,
    in_ref: Zoned | string,
    date?: Date,
  ) => {
    const instant =
      in_tgt instanceof Zoned
        ? in_tgt.base
        : in_ref instanceof Zoned
          ? in_ref.base
          : DateTime.fromJSDate(date ?? new Date());

    const tgt =
      in_tgt instanceof Zoned ? in_tgt.base : instant.setZone(in_tgt);

    const ref =
      in_ref instanceof Zoned ? in_ref.base : instant.setZone(in_ref);

    const tgt_day = Date.UTC(tgt.year, tgt.month - 1, tgt.day);
    const ref_day = Date.UTC(ref.year, ref.month - 1, ref.day);

    const diff_days = Math.round(
      (tgt_day - ref_day) / (1000 * 60 * 60 * 24),
    );

    if (diff_days === 0) return "Today";
    if (diff_days === 1) return "Tomorrow";
    if (diff_days === -1) return "Yesterday";

    return tgt.weekdayLong ?? "";
  };

  public parsed_date = (
    type: "short" | "long" = "long",
    date?: Date,
    tz?: string,
  ) => {
    const base = date ? DateTime.fromJSDate(date) : this.base;
    const zone = tz ? base.setZone(tz) : base;
    return zone
      .setLocale("en-US")
      .toFormat(type === "long" ? "cccc, LLLL d" : "ccc, LLL d");
  };

  public set_time = (hr: number, mn: number) => {
    this.base = this.base.set({
      hour: hr,
      minute: mn,
    });

    return this;
  };
}

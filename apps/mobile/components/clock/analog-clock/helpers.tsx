import { CLOCK_SIZE } from "..";

export const to_radians = (deg: number) => (deg * Math.PI) / 180;

export const size = (clock_size: CLOCK_SIZE) => {
  switch (clock_size) {
    case "LARGE":
      return 230;
    case "MEDIUM":
      return 170;
    case "SMALL":
      return 90;
    default:
      return 100;
  }
};

export const coordinates = (
  angle: number,
  radius: number,
  center: number,
) => ({
  x: center + radius * Math.cos(to_radians(angle - 90)),
  y: center + radius * Math.sin(to_radians(angle - 90)),
});

export const wrap_24 = (value: number) => {
  return ((value % 24) + 24) % 24;
};

export const normalize_delta_angle = (delta: number) => {
  if (delta > 180) return delta - 360;
  if (delta < -180) return delta + 360;
  return delta;
};

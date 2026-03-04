import { Matches } from 'class-validator';

type Is24HourTimeOptions = {
  each: boolean;
};

export function Is24hrTime(
  params: Partial<Is24HourTimeOptions> = { each: false },
) {
  return Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    each: params.each,
    message: 'time must be in 24-hour format HH:mm (e.g 21:00)',
  });
}

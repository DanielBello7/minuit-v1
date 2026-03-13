import { Matches } from 'class-validator';

type Is12HourTimeOptions = {
  each: boolean;
};

export function Is12hrTime(params: Partial<Is12HourTimeOptions> = { each: false }) {
  return Matches(/^(0?[1-9]|1[0-2]):[0-5][0-9](am|pm)$/, {
    each: params.each,
    message: 'time must be in 12-hour format like 10:00pm, 12:00am, or 04:30pm',
  });
}

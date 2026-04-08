import { CLOCK_SIZE } from "../..";

const size_style = (val: CLOCK_SIZE) => {
  switch (val) {
    case "LARGE":
      return { fontSize: 30 };
    case "MEDIUM":
      return { fontSize: 20 };
    case "SMALL":
      return { fontSize: 15 };
    default:
      return { fontSize: 10 };
  }
};

type Props = {
  hr: number;
  mn: number;
  size: CLOCK_SIZE;
};

export const useLogic = (props: Props) => {
  // time
  const hr_12 = props.hr % 12 === 0 ? 12 : props.hr % 12;
  const mn = String(props.mn).padStart(2, "0");
  const hr = String(hr_12).padStart(2, "0");
  const period = props.hr >= 12 ? "PM" : "AM";

  return {
    hr,
    mn,
    period,
    style: size_style(props.size),
  };
};

import { useRef, useMemo } from "react";
import { FlatList } from "react-native";
import { CLOCK_SIZE } from "..";

const LOOP_COUNT = 50;

const build_loop = (count: number) => {
  const base = Array.from({ length: count }, (_, idx) => idx);
  return Array.from({ length: LOOP_COUNT }, () => base).flat();
};

const get_mid_index = (length: number, value: number) => {
  const mid = Math.floor(LOOP_COUNT / 2) * length;
  return mid + value;
};

type Props = {
  size: CLOCK_SIZE;
  hr: number;
  mn: number;
};

export const useLogic = (props: Props) => {
  const hr_ref = useRef<FlatList<number>>(null);
  const mn_ref = useRef<FlatList<number>>(null);

  const hr_data = useMemo(() => build_loop(24), []);
  const mn_data = useMemo(() => build_loop(60), []);

  const hr_index = useMemo(() => get_mid_index(24, props.hr), [props.hr]);
  const mn_index = useMemo(() => get_mid_index(60, props.mn), [props.mn]);

  return {
    hr_ref,
    mn_ref,
    hr_data,
    mn_data,
    hr_index,
    mn_index,
  };
};

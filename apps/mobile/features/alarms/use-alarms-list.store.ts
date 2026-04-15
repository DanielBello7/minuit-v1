import { create } from "zustand";

type AlarmListData = {
  edit: boolean;
};

type State = {
  data: AlarmListData;
  set_data: (params: Partial<AlarmListData>) => void;
  reset: () => void;
};

const initial: AlarmListData = {
  edit: false,
};

export const useAlarmListStore = create<State>()((set, get) => ({
  data: initial,
  reset() {
    set({
      data: initial,
    });
  },
  set_data(params) {
    const now = get().data;
    set({
      data: {
        ...now,
        ...params,
      },
    });
  },
}));

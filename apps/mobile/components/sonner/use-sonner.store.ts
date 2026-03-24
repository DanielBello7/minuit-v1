import { create } from "zustand";
import * as Animatable from "react-native-animatable";
import React from "react";

type SonnerData = {
  title?: string;
  msg: string;
  visible: boolean;
  state: "alert" | "success" | "error";
  ref: React.RefObject<Animatable.View | null>;
};

type State = {
  data: SonnerData;
  hide: () => void;
  show: () => void;
  set_data: (params: Partial<SonnerData>) => void;
  reset: () => void;
};

const initial: SonnerData = {
  title: undefined,
  msg: "",
  visible: false,
  state: "alert",
  ref: React.createRef(),
};

export const useSonnerStore = create<State>()((set, get) => ({
  data: initial,
  reset() {
    set({
      data: initial,
    });
  },
  set_data(param) {
    const now = get().data;
    set({ data: { ...now, ...param } });
  },
  hide: () => {
    const prev = get().data;

    if (!prev.visible) {
      return;
    }

    if (prev.ref?.current) {
      prev.ref.current.animate({
        from: { top: 0 },
        to: { top: -500 },
      });
    }

    set({
      data: {
        ...prev,
        visible: false,
        title: undefined,
      },
    });
  },
  show: () => {
    const prev = get().data;
    if (prev.visible) {
      return;
    }

    if (prev.ref?.current) {
      prev.ref.current.animate({
        from: { top: -500 },
        to: { top: 0 },
      });
    }

    set({
      data: {
        ...prev,
        visible: true,
      },
    });
  },
}));

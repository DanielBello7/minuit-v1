import { InterText, ThemedView } from "@/components/themed";
import { COLORS } from "@/constants/themes/colors";
import { useThemeColor } from "@/hooks/use-theme-color";
import { CityData } from "city-timezones";
import { RefObject, useMemo, useRef, useState } from "react";
import {
  GestureResponderEvent,
  LayoutChangeEvent,
  SectionList,
  StyleSheet,
  View,
} from "react-native";

type Props = {
  sections: { key: string; data: CityData[] }[];
  rf: RefObject<SectionList | null>;
  current: string[];
};
export const AlphabetRail = (props: Props) => {
  const border = useThemeColor("BUTTON_SECONDARY_BORDER_DARK");
  const text = useThemeColor("TEXT");
  const railRef = useRef<View | null>(null);
  const railHeight = useRef(0);
  const railPageY = useRef(0);
  const lastIndex = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const keys = useMemo(() => {
    return new Map(
      props.sections.map((section, index) => [
        section.key.toLowerCase(),
        index,
      ]),
    );
  }, [props.sections]);

  const selectedInitials = useMemo(() => {
    return new Set(
      props.current
        .map((city) => city[0]?.toLowerCase())
        .filter((letter): letter is string => Boolean(letter)),
    );
  }, [props.current]);

  const selectByIndex = (index: number) => {
    if (index < 0 || index >= props.sections.length) return;
    if (lastIndex.current === index) return;

    const section = props.sections[index];
    const sectionIndex = keys.get(section.key.toLowerCase());
    if (sectionIndex == null) return;

    lastIndex.current = index;
    setActiveIndex(index);
    props.rf.current?.scrollToLocation({
      animated: false,
      sectionIndex,
      itemIndex: 0,
    });
  };

  const selectByTouch = (event: GestureResponderEvent) => {
    if (!props.sections.length || railHeight.current <= 0) return;

    const itemHeight = railHeight.current / props.sections.length;
    const touchY = event.nativeEvent.pageY - railPageY.current;
    const rawIndex = Math.floor(touchY / itemHeight);
    const nextIndex = Math.max(
      0,
      Math.min(props.sections.length - 1, rawIndex),
    );

    selectByIndex(nextIndex);
  };

  const handleLayout = (event: LayoutChangeEvent) => {
    railHeight.current = event.nativeEvent.layout.height;
    railRef.current?.measureInWindow((_, y) => {
      railPageY.current = y;
    });
  };

  const clearSelection = () => {
    lastIndex.current = null;
    setActiveIndex(null);
  };

  return (
    <View
      ref={railRef}
      style={[styles.box, { borderColor: border }]}
      onLayout={handleLayout}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={selectByTouch}
      onResponderMove={selectByTouch}
      onResponderRelease={clearSelection}
      onResponderTerminate={clearSelection}
    >
      {props.sections.map((section, idx) => (
        <ThemedView
          key={`${section.key}+${idx}`}
          pointerEvents="none"
          style={[styles.item]}
        >
          <InterText
            style={[
              styles.text,
              {
                color: selectedInitials.has(section.key.toLowerCase())
                  ? COLORS.PINK
                  : text,
              },
              activeIndex === idx && styles.activeText,
            ]}
          >
            {section.key.toUpperCase()}
          </InterText>
        </ThemedView>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    position: "absolute",
    right: 10,
    top: 0,
    bottom: 0,
    borderRadius: 99,
    borderWidth: 0,
    gap: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  item: {
    minWidth: 20,
    borderRadius: 99,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  text: {
    fontSize: 12,
    textTransform: "uppercase",
    paddingVertical: 1,
  },
  activeText: {
    fontWeight: "700",
  },
});

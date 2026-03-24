import {
	ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";

const EmptyScreen = () => <></>;

export type Screen<Name extends string = string> = {
	index?: number;
	name: Name;
	component: ReactNode;
};

export const useMultiscreen = <Name extends string = string>(
	screens: Screen<Name>[],
	initial?: Name
) => {
	const managed = useMemo<Screen<Name>[]>(() => {
		return screens.length === 0
			? [{ name: "empty" as Name, component: <EmptyScreen /> }]
			: screens;
	}, [screens]);

	const initialIndex = useMemo(() => {
		if (!initial) return 0;
		const found = managed.findIndex((s) => s.name === initial);
		return found >= 0 ? found : 0;
	}, [initial, managed]);

	const [index, setIndex] = useState<number>(() => initialIndex);

	const prevInitialRef = useRef<Name | undefined>(undefined);

	useEffect(() => {
		if (!initial) return;

		if (prevInitialRef.current === initial) return;

		const found = managed.findIndex((s) => s.name === initial);
		if (found >= 0) {
			setIndex(found);
		}
		prevInitialRef.current = initial;
	}, [initial, managed]);

	useEffect(() => {
		if (managed.length === 0) {
			setIndex(0);
			return;
		}

		if (index >= managed.length) {
			setIndex(Math.max(0, managed.length - 1));
			return;
		}

		const currentName = managed[index]?.name;
		if (!currentName || !managed.some((s) => s.name === currentName)) {
			setIndex(0);
		}
	}, [managed, index]);

	const next = useCallback(() => {
		setIndex((i) => Math.min(i + 1, managed.length - 1));
	}, [managed.length]);

	const prev = useCallback(() => {
		setIndex((i) => Math.max(i - 1, 0));
	}, []);

	const goto = useCallback(
		(target: number | Name) => {
			if (typeof target === "number") {
				if (target >= 0 && target < managed.length) setIndex(target);
				return;
			}
			const found = managed.findIndex((s) => s.name === target);
			if (found >= 0) setIndex(found);
		},
		[managed]
	);

	const screen = managed[index] ?? managed[0];

	return {
		screens: managed,
		index,
		next,
		prev,
		goto,
		screen,
	};
};

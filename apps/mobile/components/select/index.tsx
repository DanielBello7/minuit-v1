import { Fragment } from "react";
import { Box } from "./box";
import { SelectOption, useLogic } from "./use-logic";
import { Container } from "./container";

type Props = {
  label?: string;
  title?: string;
  placeholder?: string;
  data: SelectOption[];
  selected: SelectOption | null;
  onChange: (val: SelectOption | null) => void;
};
export const Select = (props: Props) => {
  const logic = useLogic({
    data: props.data,
    onChange: props.onChange,
  });

  return (
    <Fragment>
      <Box
        placeholder={props.placeholder ?? "Select"}
        label={props.label ?? "Select"}
        value={props.selected}
        toggle={logic.setOpen}
        open={logic.open}
      />

      <Container
        title={props.label ?? "Select"}
        setQuery={logic.setQuery}
        data={logic.results}
        close={logic.close}
        query={logic.query}
        open={logic.open}
        onPick={logic.pick}
        value={props.selected}
      />
    </Fragment>
  );
};

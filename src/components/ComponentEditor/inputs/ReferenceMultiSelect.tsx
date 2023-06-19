import { SelectableValue } from "@grafana/data";
import { MultiSelect, InputControl } from "@grafana/ui";
import { Control } from "react-hook-form";
import { useState } from "react";
import { toOptions } from "./ReferenceSelect";

import { useComponentContext } from "../../../state";

const ReferenceMultiSelect = ({
  control,
  name,
  exportName,
}: {
  control: Control<Record<string, any>>;
  name: string;
  exportName: string;
}) => {
  const { components } = useComponentContext();
  const [value, setValue] = useState<Array<SelectableValue<object>>>(
    control.defaultValuesRef.current[name].map((x: SelectableValue<object>) => {
      if ("-reference" in x) return { label: x["-reference"], value: x };
      else return { label: JSON.stringify(x), value: x };
    })
  );
  const [customOptions, setCustomOptions] = useState<
    Array<SelectableValue<any>>
  >([]);
  const targetComponents = toOptions(
    components.map((x) => x.block),
    exportName
  );
  return (
    <InputControl
      render={({ field: { onChange, ref, ...field } }) => (
        <MultiSelect
          {...field}
          options={[...targetComponents, ...customOptions]}
          allowCustomValue={true}
          onChange={(v) => {
            onChange(v.map((x) => x.value));
            setValue(v);
          }}
          value={value}
          onCreateOption={(newOption) => {
            const customValue: SelectableValue<object> = {
              value: JSON.parse(newOption),
              label: newOption,
            };
            setCustomOptions([...customOptions, customValue]);
            setValue([...value, customValue]);
          }}
        />
      )}
      control={control}
      name={name}
    />
  );
};

export default ReferenceMultiSelect;

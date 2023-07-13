import { SelectableValue } from "@grafana/data";
import { MultiSelect, InputControl } from "@grafana/ui";
import { Control } from "react-hook-form";
import { useState } from "react";
import { toOptions } from "./ReferenceSelect";

import { useComponentContext } from "../../../state";
import { ExportType } from "../../../lib/components";

const ReferenceMultiSelect = ({
  control,
  name,
  exportName,
  rules,
  width,
}: {
  control: Control<Record<string, any>>;
  name: string;
  exportName: ExportType;
  rules?: Object;
  width?: number;
}) => {
  const { components } = useComponentContext();
  const defaultValue = name
    .split(".")
    .reduce((o, k) => (o ? o[k] : null), control.defaultValuesRef.current);
  const [value, setValue] = useState<Array<SelectableValue<object>>>(() => {
    if (!defaultValue) return [];
    return defaultValue.map((x: SelectableValue<object>) => {
      if ("-reference" in x)
        return { label: x["-reference"], value: x, key: x["-reference"] };
      else return { label: JSON.stringify(x), value: x };
    });
  });
  const [customOptions, setCustomOptions] = useState<
    Array<SelectableValue<any>>
  >([]);
  const targetComponents = toOptions(
    components.map((x) => x.block),
    exportName
  );
  return (
    <InputControl
      defaultValue={value}
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
          width={width}
        />
      )}
      control={control}
      name={name}
      rules={rules || {}}
    />
  );
};

export default ReferenceMultiSelect;

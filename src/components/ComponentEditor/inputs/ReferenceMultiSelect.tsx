import { SelectableValue } from "@grafana/data";
import { InputControl, MultiSelect } from "@grafana/ui";
import { get } from "react-hook-form";
import { useState } from "react";

import { useComponentContext } from "../../../state";
import { ReferenceSelectProps, toOptions } from "./ReferenceSelectBase";

const ReferenceMultiSelect = ({
  control,
  name,
  exportName,
  rules,
  width,
  defaultValue,
}: ReferenceSelectProps<{ "-reference": string }[]>) => {
  const { components } = useComponentContext();
  defaultValue = defaultValue ?? get(control.defaultValuesRef.current, name);
  const [value, setValue] = useState<SelectableValue<object>[]>(() => {
    if (!defaultValue) return [];
    return defaultValue.map((v) => ({ label: v["-reference"], value: v }));
  });
  const targetComponents = toOptions(
    components.map((x) => x.block),
    exportName,
  );
  return (
    <InputControl
      defaultValue={value}
      render={({ field: { onChange, ref, ...field } }) => (
        <MultiSelect
          {...field}
          options={targetComponents}
          allowCustomValue={true}
          onChange={(v) => {
            onChange(v.map((e: SelectableValue) => e.value));
            setValue(v);
          }}
          value={value}
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

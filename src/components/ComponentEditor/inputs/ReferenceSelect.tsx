import { SelectableValue } from "@grafana/data";
import { MultiSelect, InputControl } from "@grafana/ui";
import { Control } from "react-hook-form";
import { useState } from "react";

import { useComponentContext } from "../../../state";

const ComponentLookup: Record<string, string[]> = {
  targets: ["prometheus.exporter.redis"],
  receiver: ["prometheus.remote_write"],
};

const ReferenceSelect = ({
  control,
  name,
  exportName,
}: {
  control: Control<Record<string, any>>;
  name: string;
  exportName: string;
}) => {
  console.log(control.defaultValuesRef);
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
  return (
    <InputControl
      render={({ field: { onChange, ref, ...field } }) => (
        <MultiSelect
          {...field}
          options={[
            ...components
              .filter(({ block }) =>
                ComponentLookup[exportName].includes(block.name)
              )
              .map(({ block }) => {
                return {
                  label: `${block.label} [${block.name}]`,
                  value: {
                    "-reference": `${block.name}.${block.label}.${exportName}`,
                  },
                };
              }),
            ...customOptions,
          ]}
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

export default ReferenceSelect;

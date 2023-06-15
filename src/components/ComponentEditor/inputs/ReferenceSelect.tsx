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
  const { components } = useComponentContext();
  const [value, setValue] = useState<Array<SelectableValue<object>>>([]);
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
              .filter((component) =>
                ComponentLookup[exportName].includes(component.name)
              )
              .map((component) => {
                return {
                  label: `${component.label} [${component.name}]`,
                  value: {
                    "-reference": `${component.name}.${component.label}.${exportName}`,
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

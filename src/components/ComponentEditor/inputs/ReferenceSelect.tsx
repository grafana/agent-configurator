import { SelectableValue } from "@grafana/data";
import { Select, InputControl } from "@grafana/ui";
import { Control } from "react-hook-form";
import { useState } from "react";
import { Block } from "../../../lib/river";

import { useComponentContext } from "../../../state";

const ComponentLookup: Record<string, string[]> = {
  targets: ["prometheus.exporter.redis"],
  receiver: ["prometheus.remote_write"],
};

export function toOptions(
  components: Block[],
  exportName: string
): SelectableValue<object>[] {
  return components
    .filter((component) => ComponentLookup[exportName].includes(component.name))
    .map((component) => {
      return {
        label: `${component.label} [${component.name}]`,
        value: {
          "-reference": `${component.name}.${component.label}.${exportName}`,
        },
      };
    });
}

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
  const defaultValue = control.defaultValuesRef.current[name];
  const [value, setValue] = useState<SelectableValue<object>>(() => {
    if ("-reference" in defaultValue)
      return { label: defaultValue["-reference"], value: defaultValue };
    else return { label: JSON.stringify(defaultValue), value: defaultValue };
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
      render={({ field: { onChange, ref, ...field } }) => (
        <Select
          {...field}
          options={[...targetComponents, ...customOptions]}
          allowCustomValue={true}
          onChange={(v) => {
            onChange(v.value);
            setValue(v);
          }}
          value={value}
          onCreateOption={(newOption) => {
            const customValue: SelectableValue<object> = {
              value: JSON.parse(newOption),
              label: newOption,
            };
            setCustomOptions([...customOptions, customValue]);
            setValue(customValue);
          }}
        />
      )}
      control={control}
      name={name}
    />
  );
};

export default ReferenceSelect;

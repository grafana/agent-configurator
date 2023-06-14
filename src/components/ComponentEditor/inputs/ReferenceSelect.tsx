import { SelectableValue } from "@grafana/data";
import { MultiSelect, InputControl } from "@grafana/ui";
import { useState } from "react";
import { encodeValue } from "../../../lib/river";

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
  control: any;
  name: string;
  exportName: string;
}) => {
  const { components } = useComponentContext();
  const [value, setValue] = useState<Array<SelectableValue<any>>>([]);
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
              .filter((c) => ComponentLookup[exportName].includes(c.name))
              .map((c) => {
                return {
                  label: `${c.label} [${c.name}]`,
                  value: { "-reference": `${c.name}.${c.label}.targets` },
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
          onCreateOption={(v) => {
            const customValue: SelectableValue<any> = {
              value: encodeValue(v),
              label: v,
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

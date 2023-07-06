import { SelectableValue } from "@grafana/data";
import { Select, InputControl } from "@grafana/ui";
import { Control } from "react-hook-form";
import { useState } from "react";
import { Attribute, Block } from "../../../lib/river";

import { useComponentContext } from "../../../state";
import {
  BlockType,
  ExportType,
  KnownComponents,
  KnownModules,
} from "../../../lib/components";

export function toOptions(
  components: Block[],
  exportName: ExportType
): SelectableValue<object>[] {
  const options: SelectableValue<object>[] = [];
  for (const component of components) {
    let spec: BlockType | null = null;
    if (component.name.startsWith("module.git")) {
      const repo = component.attributes.find(
        (x) => x.name === "repository"
      ) as Attribute | null;
      const path = component.attributes.find(
        (x) => x.name === "path"
      ) as Attribute | null;
      if (repo && path && KnownModules[repo.value]) {
        spec = KnownModules[repo.value][path.value];
      }
    } else {
      spec = KnownComponents[component.name];
    }
    if (!spec) continue;
    for (const en of Object.keys(spec.exports)) {
      if (spec.exports[en] === exportName) {
        options.push({
          label: `${component.label} [${component.name}]`,
          value: {
            "-reference": `${component.name}.${component.label}.${en}`,
          },
        });
      }
    }
  }
  return options;
}

const ReferenceSelect = ({
  control,
  name,
  exportName,
}: {
  control: Control<Record<string, any>>;
  name: string;
  exportName: ExportType;
}) => {
  const { components } = useComponentContext();
  const defaultValue = control.defaultValuesRef.current[name];
  const [value, setValue] = useState<SelectableValue<object>>(() => {
    if (!defaultValue) return null;
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

import { SelectableValue } from "@grafana/data";
import { Control } from "react-hook-form";
import { Attribute, Block } from "../../../lib/river";

import {
  BlockType,
  ExportType,
  KnownComponents,
  KnownModules,
} from "../../../lib/components";

export function toOptions(
  components: Block[],
  exportName: ExportType,
): SelectableValue<object>[] {
  const options: SelectableValue<object>[] = [];
  for (const component of components) {
    let spec: BlockType | null = null;
    if (component.name.startsWith("module.git")) {
      const repo = component.attributes.find(
        (x) => x.name === "repository",
      ) as Attribute | null;
      const path = component.attributes.find(
        (x) => x.name === "path",
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
        if (component.label) {
          options.push({
            label: `${component.label} [${component.name}]`,
            value: {
              "-reference": `${component.name}.${component.label}.${en}`,
            },
          });
        } else {
          options.push({
            label: `${component.name}`,
            value: {
              "-reference": `${component.name}.${en}`,
            },
          });
        }
      }
    }
  }
  return options;
}

export type ReferenceSelectProps<T> = {
  control: Control<Record<string, any>>;
  name: string;
  exportName: ExportType;
  width?: number;
  defaultValue?: T;
  rules?: object;
};

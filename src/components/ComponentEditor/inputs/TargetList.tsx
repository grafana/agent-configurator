import { Select } from "@grafana/ui";

import { useComponentContext } from "../../../state";
const TargetList = ({ register }: { register: any }) => {
  const { components } = useComponentContext();
  return (
    <Select
      options={components.map((c) => {
        return {
          label: `${c.label} [${c.name}]`,
          value: `${c.name}.${c.label}`,
        };
      })}
      onChange={(_) => { }}
    />
  );
};

export default TargetList;

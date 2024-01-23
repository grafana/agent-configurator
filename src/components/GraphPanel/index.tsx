import { useComponentContext } from "../../state";
import { useEffect, useState } from "react";
import { ComponentGraph, ComponentInfo } from "../ComponentGraph";
import { Alert } from "@grafana/ui";
import { collectReferences } from "../../lib/river";

const GraphPanel = () => {
  const [infos, setInfo] = useState<ComponentInfo[]>([]);

  const { components } = useComponentContext();
  useEffect(() => {
    let i = components.map((c) => {
      const references = collectReferences(c.block);
      return {
        moduleID: "",
        localID: `${c.block.name}.${c.block.label}`,
        name: `${c.block.name}`,
        label: c.block.label ?? undefined,
        referencedBy: [] as string[],
        referencesTo: references.map((s) =>
          s
            .split(".")
            .slice(0, s.startsWith("module") ? -2 : -1)
            .join("."),
        ),
      };
    });
    i = i.map((c) => {
      c.referencedBy = i
        .filter((o) => o.referencesTo.includes(c.localID))
        .map((o) => o.localID);
      return c;
    });
    setInfo(i);
  }, [components, setInfo]);

  return (
    <>
      {infos.length < 1 && <Alert title="Unable to render graph" />}
      {infos.length > 1 && <ComponentGraph components={infos} />}
    </>
  );
};

export default GraphPanel;

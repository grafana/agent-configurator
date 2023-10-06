import Parser from "web-tree-sitter";
import * as monaco from "monaco-editor";
import { Attribute, Block } from "./river";
import { KnownComponents, KnownModules, ComponentType } from "./components";

export const markersFor = (
  node: Parser.SyntaxNode,
  block: Block,
): monaco.editor.IMarkerData[] => {
  let c: ComponentType | null = null;
  if (block.name.startsWith("module.git")) {
    const repo = block.attributes.find(
      (x) => x.name === "repository",
    ) as Attribute | null;
    const path = block.attributes.find(
      (x) => x.name === "path",
    ) as Attribute | null;
    if (repo && path && KnownModules[repo.value]) {
      c = KnownModules[repo.value][path.value];
    }
  } else {
    c = KnownComponents[block.name];
  }
  if (!c) return [];
  if (c.markersFor === undefined) return [];
  return c.markersFor(node, block);
};

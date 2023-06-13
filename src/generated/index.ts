import specs_raw from "./component_spec.json";

export interface BlockSpec {
  Attributes: Record<string,AttributeSpec>,
}

export interface AttributeSpec {
  Name: string,
  Type: string,
  Default: any,
  Required: boolean,
  BlockSpec?: BlockSpec
}

export const ComponentSpecs: Map<string, BlockSpec> = new Map(Object.entries(specs_raw));

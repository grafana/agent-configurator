import { Form, Field, Input, Button, Switch } from "@grafana/ui";
import { Block, Attribute, Argument } from "../../lib/river";
import React from "react";
import specs_raw from "../../generated/component_spec.json";
import { ComponentSpecs } from "../../generated";
import BlockEditor from "./inputs/BlockEditor";


const specs: Map<string, any> = new Map(Object.entries(specs_raw));

interface ComponentEditorProps {
  updateComponent: (component: Block) => void;
  component: Block;
}
const DynamicInput = ({ attr, register }: { attr: any; register: any }) => {
  switch (attr.Type) {
    case "bool":
      return <Switch {...register(attr.Name)} />;
    case "[]string":
      return (
        <Input
          {...register(attr.Name, {
            required: attr.Required,
            setValueAs: (v: string) => {
              if (v === "") return [];
              if (Array.isArray(v)) return v;
              return v.split(",");
            },
          })}
        />
      );
    case "int":
    case "int64":
      return (
        <Input
          type="number"
          {...register(attr.Name, {
            valueAsNumber: true,
            required: attr.Required,
          })}
        />
      );
    default:
      return <Input {...register(attr.Name, { required: attr.Required })} />;
  }
};
const ComponentEditor = ({
  updateComponent,
  component,
}: ComponentEditorProps) => {
  const cspec = ComponentSpecs.get(component.name)!;
  const values = component.args.reduce((map: any, a: Argument) => {
    if (a instanceof Attribute) {
      if(Array.isArray(a.value)) {
        map[a.key] = a.value.join(',');
      } else {
        map[a.key] = a.value;
      }
    }
    return map
  },{ label: component.label});

  for (k in cspec.Attributes) {
    if(!(k in values))
      values[k] = cspec.Attributes[k].Default
  }


  return (
    <Form
      onSubmit={async (values) => {
        const changed = [];
        for (const [key, value] of Object.entries(values)) {
          const attrSpec = attrMap.get(key);
          if (attrSpec === undefined) continue;
          if (value === attrSpec.Default) continue;
          if (attrSpec.Type.startsWith("[]") && attrSpec.Default == null && (value as string[]).length === 0) continue;
          changed.push(new Attribute(key, value));
        }
        updateComponent(new Block(component.name, values.label, changed));
      }}
      defaultValues={values}
    >
      {({ register, errors }) => {
        return (
          <>
            <Field label="Label" description="Component Label">
              <Input {...register("label")} />
            </Field>
            <Button type="submit">Save</Button>
          </>
        );
      }}
    </Form>
  );
};

export default ComponentEditor;

import { Form, Field, Input, Button, Switch } from "@grafana/ui";
import { Component, Attribute } from "../../lib/river";
import React from "react";
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
  const cspec = specs.get(component.name);
  const attrMap = cspec.Attributes.reduce(
    (map: Map<string, any>, attr: any) => {
      return map.set(attr.Name, attr);
    },
    new Map<string, any>()
  );
  const parsedAttrs = component.attributes.reduce((map: any, a: Attribute) => {
    if(Array.isArray(a.value)) {
      map[a.key] = a.value.join(',');
    } else {
      map[a.key] = a.value;
    }
    return map
  },{ label: component.label});

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
        updateComponent(new Component(component.name, values.label, changed));
      }}
      defaultValues={cspec.Attributes.filter((x: any) => x.Default).reduce(
        (map: any, x: any) => {
          if (!(x.Name in map))
            map[x.Name] = x.Default;
          return map;
        },
        parsedAttrs
      )}
    >
      {({ register, errors }) => {
        return (
          <>
            <Field label="Label" description="Component Label">
              <Input {...register("label")} />
            </Field>
            {cspec.Attributes.map((attr: any, i: number) => {
              return (
                <Field
                  label={attr.Name}
                  key={i}
                  invalid={!!errors[attr.Name]}
                  error="Attribute is required"
                >
                  <DynamicInput attr={attr} register={register} />
                </Field>
              );
            })}
            <Button type="submit">Save</Button>
          </>
        );
      }}
    </Form>
  );
};

export default ComponentEditor;

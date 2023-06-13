import { Form, Field, Input, Button, Switch } from "@grafana/ui";
import { Block, Attribute } from "../../../lib/river";
import React from "react";

interface BlockEditorProps {
  block: Block;
  register: any;
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
const BlockEditor = ({block,register}: BlockEditorProps) => {
  return (
    <>
    </>
  );
};

export default BlockEditor;

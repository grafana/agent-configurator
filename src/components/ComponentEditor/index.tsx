import { Form, Field, Input, Button } from "@grafana/ui";
import { Component } from "../../lib/river";

interface ComponentEditorProps {
  updateComponent: (component: Component) => void;
  component: Component;
}

const ComponentEditor = ({
  updateComponent,
  component,
}: ComponentEditorProps) => {
  return (
    <Form
      onSubmit={async (values) =>
        updateComponent(new Component(component.name, values.label))
      }
      defaultValues={{ label: component.label }}
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

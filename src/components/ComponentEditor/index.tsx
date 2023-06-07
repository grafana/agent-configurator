import { Field, Input, Button } from "@grafana/ui";

interface ComponentEditorProps {
  updateComponent: (component: string) => void;
}

const ComponentEditor = ({ updateComponent }: ComponentEditorProps) => {
  return (
    <>
      <Field label="Redis Address" description="IP Address or Hostname">
        <Input name="importantInput" required />
      </Field>
      <Button
        onClick={() => {
          updateComponent("");
        }}
      >
        Save
      </Button>
    </>
  );
};

export default ComponentEditor;

import {
  Button,
  FieldArray,
  FieldSet,
  InlineField,
  InlineFieldRow,
  Input,
} from "@grafana/ui";
import { Control } from "react-hook-form";

const GenericStringMap = ({
  control,
  name,
  title,
}: {
  control: Control<Record<string, any>>;
  name: string;
  title: string;
}) => {
  return (
    <FieldSet label={<h5>{title}</h5>}>
      <FieldArray control={control} name={`${name}` as const}>
        {({ fields, append, remove }) => (
          <>
            {fields.map((field, index) => (
              <InlineFieldRow key={field.id}>
                <InlineField label="Key">
                  <Input
                    defaultValue={field["key"]}
                    {...control.register(`${name}[${index}].key` as const)}
                  />
                </InlineField>
                <InlineField label="Value">
                  <Input
                    defaultValue={field["value"]}
                    {...control.register(`${name}[${index}].value` as const)}
                  />
                </InlineField>
                <Button
                  fill="outline"
                  variant="secondary"
                  icon="trash-alt"
                  tooltip="Delete this entry"
                  onClick={(e) => {
                    remove(index);
                    e.preventDefault();
                  }}
                />
              </InlineFieldRow>
            ))}
            <Button onClick={() => append({})} icon="plus" variant="secondary">
              Add
            </Button>
          </>
        )}
      </FieldArray>
    </FieldSet>
  );
};

export default GenericStringMap;

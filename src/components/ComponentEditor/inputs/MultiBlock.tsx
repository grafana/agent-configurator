import {
  Button,
  Card,
  Field,
  FieldArray,
  FieldSet,
  FormAPI,
  IconButton,
  Input,
  VerticalGroup,
} from "@grafana/ui";
import { useFieldArray } from "react-hook-form";

const MultiBlock = ({
  methods,
  name,
  title,
  children,
}: {
  methods: FormAPI<Record<string, any>>;
  name: string;
  title: string;
  children: (field: any, index: number) => React.ReactNode[] | React.ReactNode;
}) => {
  console.log(methods.control.defaultValuesRef);

  return (
    <FieldSet label={title}>
      <FieldArray control={methods.control} name={name}>
        {({ fields, append, remove }) => (
          <>
            {fields.map((field, index) => (
              <Card key={field.id}>
                <VerticalGroup>{children(field, index)}</VerticalGroup>
                <Card.SecondaryActions>
                  <IconButton
                    key="delete"
                    name="trash-alt"
                    tooltip="Delete this filter"
                    onClick={(e) => {
                      remove(index);
                      e.preventDefault();
                    }}
                  />
                </Card.SecondaryActions>
              </Card>
            ))}
            <Button onClick={() => append({})} icon="plus">
              Add
            </Button>
          </>
        )}
      </FieldArray>
    </FieldSet>
  );
};

export default MultiBlock;

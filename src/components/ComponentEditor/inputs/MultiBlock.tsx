import {
  Button,
  Card,
  FieldArray,
  FieldSet,
  FormAPI,
  IconButton,
} from "@grafana/ui";

const MultiBlock = ({
  methods,
  name,
  title,
  children,
}: {
  methods: FormAPI<Record<string, any>>;
  name: string;
  title: string;
  children: (
    field: Record<string, any>,
    index: number
  ) => React.ReactNode[] | React.ReactNode;
}) => {
  return (
    <FieldSet label={title}>
      <FieldArray control={methods.control} name={name}>
        {({ fields, append, remove }) => (
          <>
            {fields.map((field, index) => (
              <Card key={field.id}>
                {children(field, index)}
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

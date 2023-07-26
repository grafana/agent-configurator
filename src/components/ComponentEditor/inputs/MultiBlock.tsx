import { css } from "@emotion/css";
import { GrafanaTheme2 } from "@grafana/data";
import {
  Button,
  Card,
  FieldArray,
  FieldSet,
  FormAPI,
  IconButton,
} from "@grafana/ui";
import { useStyles } from "../../../theme";

const MultiBlock = ({
  methods,
  name,
  title,
  children,
  newBlock,
}: {
  methods: FormAPI<Record<string, any>>;
  name: string;
  title: string;
  children: (
    field: Record<string, any>,
    index: number
  ) => React.ReactNode[] | React.ReactNode;
  newBlock?: any;
}) => {
  const styles = useStyles(getStyles);
  newBlock = newBlock ?? {};
  return (
    <FieldSet label={title}>
      <FieldArray control={methods.control} name={name}>
        {({ fields, append, remove }) => (
          <>
            {fields.map((field, index) => (
              <Card key={field.id} className={styles.card}>
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
            <Button onClick={() => append(newBlock)} icon="plus">
              Add
            </Button>
          </>
        )}
      </FieldArray>
    </FieldSet>
  );
};

const getStyles = (theme: GrafanaTheme2) => {
  return {
    card: css`
      background: none !important;
      border: 1px solid ${theme.colors.border.weak};
    `,
  };
};

export default MultiBlock;

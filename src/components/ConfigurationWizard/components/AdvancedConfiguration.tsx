import { css } from "@emotion/css";
import { GrafanaTheme2 } from "@grafana/data";
import { Alert, Button, FieldSet, Modal } from "@grafana/ui";
import { FormProvider, useForm } from "react-hook-form";
import { useStyles } from "../../../theme";
import { WizardFormBasicValues } from "../types/form";
import { Source } from "../types/source";

const AdvancedConfiguration = ({
  onSubmit,
  dismiss,
  basicValues,
}: {
  onSubmit: (
    basic: WizardFormBasicValues,
    advanced: Record<string, any>
  ) => void;
  dismiss: () => void;
  basicValues: WizardFormBasicValues;
}) => {
  const defaults: Record<string, any> = {};
  for (const source of basicValues.sources) {
    defaults[source.value] = (source as Source).defaults;
  }
  const formAPI = useForm<Record<string, any>>({
    mode: "onSubmit",
    defaultValues: defaults,
    shouldFocusError: true,
  });
  const { handleSubmit } = formAPI;

  const styles = useStyles(getStyles);
  return (
    <FormProvider {...formAPI}>
      <form onSubmit={(e) => e.preventDefault()} className={styles.form}>
        {basicValues.sources.map((source) => {
          source = source as Source;
          return (
            <FieldSet label={source.label} key={source.value}>
              {source.advancedForm && (
                <source.advancedForm basicValues={basicValues} />
              )}
              {!source.advancedForm && (
                <Alert
                  severity="info"
                  title={`"${source.label}" does not offer a customization wizard. You can further customize the components after creating the configuration.`}
                />
              )}
            </FieldSet>
          );
        })}
        <Modal.ButtonRow>
          <Button variant="secondary" fill="outline" onClick={dismiss}>
            Cancel
          </Button>
          <Button
            variant="success"
            type="button"
            onClick={handleSubmit((data) => onSubmit(basicValues, data))}
          >
            Create Configuration
          </Button>
        </Modal.ButtonRow>
      </form>
    </FormProvider>
  );
};

const getStyles = (theme: GrafanaTheme2) => {
  return {
    form: css`
      width: 100%;
    `,
  };
};
export default AdvancedConfiguration;

import { css } from "@emotion/css";
import { GrafanaTheme2 } from "@grafana/data";
import {
  Button,
  Checkbox,
  Field,
  Input,
  Modal,
  VerticalGroup,
} from "@grafana/ui";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useModelContext } from "../../state";
import { useStyles } from "../../theme";
import DestinationTypePicker from "./components/destination-type/DestinationTypePicker";
import SourcesInput from "./components/SourcesInput";
import { Step } from "./components/Step";
import { CloudDestination } from "./destinations/cloud";
import { LocalDestination } from "./destinations/local";
import { Destination } from "./types/destination";
import { WizardFormDefaults, WizardFormValues } from "./types/form";

const ConfigurationWizard = ({ dismiss }: { dismiss: () => void }) => {
  const { setModel } = useModelContext();
  const formAPI = useForm<WizardFormValues>({
    mode: "onSubmit",
    defaultValues: WizardFormDefaults,
    shouldFocusError: true,
  });
  const { register, control, handleSubmit, watch } = formAPI;
  const destination = watch("destination");

  const submit = (data: WizardFormValues) => {
    const destination: Destination =
      data.destination === "cloud"
        ? CloudDestination(data.stackName)
        : LocalDestination;

    destination.metrics.enabled = data.telemetry.metrics;
    destination.logs.enabled = data.telemetry.logs;
    destination.traces.enabled = data.telemetry.traces;
    destination.profiles.enabled = data.telemetry.profiles;

    let out = destination.template();
    for (const t of data.sources) {
      out += t(destination);
      out += "\n";
    }
    setModel(out);
    dismiss();
  };
  const styles = useStyles(getStyles);
  return (
    <FormProvider {...formAPI}>
      <form onSubmit={(e) => e.preventDefault()} className={styles.form}>
        <Step
          title="Destination"
          stepNo={1}
          description="Where do you want to send your data?"
        >
          <Controller
            render={({ field: { ref, ...f } }) => (
              <DestinationTypePicker selected={f.value} onChange={f.onChange} />
            )}
            name="destination"
            defaultValue="cloud"
            control={control}
          />
          {destination === "cloud" && (
            <Field
              label="Stack name"
              description="The stack name can be found in you Grafana Cloud account console"
            >
              <Input placeholder="mycloudstack" {...register("stackName")} />
            </Field>
          )}
        </Step>
        <Step
          title="Telemetry"
          stepNo={2}
          description="What kind of telemetry do you want to collect?"
        >
          <VerticalGroup>
            <Checkbox
              label="Metrics"
              description="Generate or Scrape prometheus metrics"
              {...register("telemetry.metrics")}
            />
            <Checkbox
              label="Logs"
              description="Collect logs from files or external systems"
              {...register("telemetry.logs")}
            />
            <Checkbox
              label="Traces"
              description="Receive traces from instrumented applications using the OpenTelemetry protocol"
              {...register("telemetry.traces")}
            />
            <Checkbox
              label="Profiles"
              description="Collect or scrape profiling data from instrumented applications"
              {...register("telemetry.profiles")}
            />
          </VerticalGroup>
        </Step>
        <Step
          title="Sources"
          description="Which systems do you want to monitor? Select one or more!"
          stepNo={3}
        >
          <SourcesInput />
        </Step>
        <Modal.ButtonRow>
          <Button variant="secondary" fill="outline" onClick={dismiss}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit(submit)}>
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
export default ConfigurationWizard;

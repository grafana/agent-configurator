import {
  Button,
  FieldArray,
  FieldSet,
  FormAPI,
  InlineField,
  InputControl,
  RadioButtonGroup,
  VerticalGroup,
} from "@grafana/ui";

import { useStyles } from "../../../theme";
import ReferenceSelect from "../inputs/ReferenceSelect";
import ReferenceMultiSelect from "../inputs/ReferenceMultiSelect";
import TypedInput from "../inputs/TypedInput";
import { css } from "@emotion/css";
import { GrafanaTheme2 } from "@grafana/data";
import LabelsInput from "../inputs/LabelsInput";

type Target = {
  address: string;
  labels: {
    key: string;
    value: string;
  }[];
};

const Component = ({ methods }: { methods: FormAPI<Record<string, any>> }) => {
  const styles = useStyles(getStyles);
  const watchTargetType = methods.watch("target_type");

  return (
    <>
      <VerticalGroup>
        <InlineField
          label="Forward to"
          tooltip="Receivers for the data scraped by this component"
          labelWidth={14}
          error="You must specify the destination"
          invalid={!!methods.errors["forward_to"]}
        >
          <ReferenceMultiSelect
            name="forward_to"
            exportName="PrometheusReceiver"
            control={methods.control}
          />
        </InlineField>
        <InputControl
          name="target_type"
          control={methods.control}
          defaultValue="reference"
          render={({ field: { ref, ...f } }) => (
            <RadioButtonGroup
              {...f}
              className={styles.targetTypeSelector}
              options={[
                {
                  value: "reference",
                  label: "Reference",
                },
                {
                  value: "static",
                  label: "Static",
                },
              ]}
            />
          )}
        />
      </VerticalGroup>
      {watchTargetType !== "static" && (
        <VerticalGroup>
          <InlineField
            label="Targets"
            tooltip="List of targets to scrape."
            labelWidth={14}
            error="You must specify the targets parameter"
            invalid={!!methods.errors["targets"]}
          >
            <ReferenceSelect
              name="targets"
              exportName="list(PrometheusTarget)"
              control={methods.control}
            />
          </InlineField>
        </VerticalGroup>
      )}
      {watchTargetType === "static" && (
        <FieldSet>
          <FieldArray control={methods.control} name="static_targets">
            {({ fields, append, remove }) => (
              <VerticalGroup>
                {fields.map((field, index) => (
                  <div key={field.id} className={styles.targetBox}>
                    <VerticalGroup>
                      <InlineField
                        label="Address"
                        tooltip="Hostname/IP Address and port of the target to be scraped"
                        labelWidth={14}
                        error="An address must be defined"
                        invalid={
                          !!methods.errors?.static_targets?.[index]?.address
                        }
                      >
                        <TypedInput
                          name={`static_targets[${index}].address` as const}
                          control={methods.control}
                          rules={{ required: true }}
                        />
                      </InlineField>
                      <LabelsInput
                        control={methods.control}
                        name={`static_targets[${index}].labels`}
                      />
                      <Button
                        fill="outline"
                        variant="secondary"
                        icon="trash-alt"
                        tooltip="Delete this target"
                        onClick={(e) => {
                          remove(index);
                          e.preventDefault();
                        }}
                      >
                        Delete Target
                      </Button>
                    </VerticalGroup>
                  </div>
                ))}
                <Button onClick={() => append({})} icon="plus">
                  Add Target
                </Button>
              </VerticalGroup>
            )}
          </FieldArray>
        </FieldSet>
      )}
    </>
  );
};

const getStyles = (theme: GrafanaTheme2) => {
  return {
    targetBox: css`
      border: 1px solid ${theme.colors.border.weak};
      padding: 1em;
      width: fit-content;
    `,
    targetTypeSelector: css`
      margin-bottom: 1em;
    `,
  };
};

const PrometheusScrape = {
  preTransform(data: Record<string, any>): Record<string, any> {
    if (Array.isArray(data["targets"])) {
      const static_targets: Target[] = [];
      for (const target of data["targets"]) {
        static_targets.push({
          address: target["__address__"] as string,
          labels: Object.keys(target)
            .filter((k) => k !== "__address__")
            .map((k) => {
              return { key: k, value: target[k] };
            }),
        });
      }
      data["static_targets"] = static_targets;
      data["target_type"] = "static";
      delete data["targets"];
    }
    return data;
  },
  postTransform(data: Record<string, any>): Record<string, any> {
    if (data["target_type"] === "static") {
      const targets = data["static_targets"].map((target: Target) => {
        const obj: Record<string, any> = { __address__: target.address };
        for (const l of target.labels) {
          obj[l.key] = l.value;
        }
        return obj;
      });
      data["targets"] = targets;
    }
    delete data["static_targets"];
    delete data["target_type"];
    return data;
  },
  Component,
};

export default PrometheusScrape;

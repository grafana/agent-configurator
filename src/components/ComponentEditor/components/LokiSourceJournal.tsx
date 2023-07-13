import {
  Button,
  FieldArray,
  FieldSet,
  FormAPI,
  InlineField,
  InlineFieldRow,
  InlineSwitch,
  Input,
} from "@grafana/ui";
import ReferenceSelect from "../inputs/ReferenceSelect";
import ReferenceMultiSelect from "../inputs/ReferenceMultiSelect";
import TypedInput from "../inputs/TypedInput";

const Component = ({ methods }: { methods: FormAPI<Record<string, any>> }) => {
  const commonOptions = { labelWidth: 24 };
  return (
    <>
      <InlineField
        label="Format as JSON"
        tooltip="Whether to forward the original journal entry as JSON."
        {...commonOptions}
      >
        <InlineSwitch {...methods.register("format_as_json")} />
      </InlineField>
      <InlineField
        label="Max age"
        tooltip="The oldest relative time from process start that will be read."
        {...commonOptions}
      >
        <TypedInput name="max_age" control={methods.control} placeholder="7h" />
      </InlineField>
      <InlineField
        label="Path"
        tooltip="Path to a directory to read entries from."
        {...commonOptions}
      >
        <TypedInput
          name="path"
          control={methods.control}
          placeholder="/var/log/journal"
        />
      </InlineField>
      <InlineField
        label="Matches"
        tooltip="Journal matches to filter. The + character is not supported, only logical AND matches will be added."
        {...commonOptions}
      >
        <TypedInput name="matches" control={methods.control} />
      </InlineField>
      <InlineField
        label="Relabel Rules"
        tooltip="Relabeling rules to apply on log entries."
        {...commonOptions}
      >
        <ReferenceSelect
          name="relabel_rules"
          exportName="RelabelRules"
          control={methods.control}
          width={27}
        />
      </InlineField>
      <InlineField
        label="Forward to"
        tooltip="List of receivers to send log entries to."
        {...commonOptions}
        error="You must specify the destination"
        invalid={!!methods.errors["forward_to"]}
      >
        <ReferenceMultiSelect
          name="forward_to"
          exportName="LokiReceiver"
          control={methods.control}
          rules={{ required: true }}
          width={27}
        />
      </InlineField>
      <FieldSet label="Labels">
        <FieldArray control={methods.control} name="labels_array">
          {({ fields, append, remove }) => (
            <>
              {fields.map((field, index) => (
                <InlineFieldRow key={field.id}>
                  <InlineField label="Key">
                    <Input
                      defaultValue={field["key"]}
                      {...methods.register(
                        `labels_array[${index}].key` as const
                      )}
                    />
                  </InlineField>
                  <InlineField label="Value">
                    <Input
                      defaultValue={field["value"]}
                      {...methods.register(
                        `labels_array[${index}].value` as const
                      )}
                    />
                  </InlineField>
                  <Button
                    fill="outline"
                    variant="secondary"
                    icon="trash-alt"
                    tooltip="Delete this filter"
                    onClick={(e) => {
                      remove(index);
                      e.preventDefault();
                    }}
                  />
                </InlineFieldRow>
              ))}
              <Button onClick={() => append({})} icon="plus">
                Add
              </Button>
            </>
          )}
        </FieldArray>
      </FieldSet>
    </>
  );
};

const LokiSourceJournal = {
  preTransform(data: Record<string, any>): Record<string, any> {
    const existingLabels: Record<string, string>[] = [];
    for (const k of Object.keys(data["labels"] || {})) {
      existingLabels.push({ key: k, value: data["labels"][k] });
    }
    data["labels_array"] = existingLabels;
    delete data["labels"];
    return data;
  },
  postTransform(data: Record<string, any>): Record<string, any> {
    const newLabels: Record<string, string> = {};
    for (const l of data["labels_array"]) {
      newLabels[l.key] = l.value;
    }
    data["labels"] = newLabels;
    delete data["labels_array"];
    return data;
  },
  Component,
};
export default LokiSourceJournal;

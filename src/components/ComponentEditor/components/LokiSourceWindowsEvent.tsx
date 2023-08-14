import { FormAPI, InlineField, InlineSwitch } from "@grafana/ui";
import ReferenceMultiSelect from "../inputs/ReferenceMultiSelect";
import TypedInput from "../inputs/TypedInput";

const Component = ({ methods }: { methods: FormAPI<Record<string, any>> }) => {
  const commonOptions = { labelWidth: 24 };
  return (
    <>
      <InlineField
        label="Event log name"
        tooltip="Event log to read from."
        {...commonOptions}
      >
        <TypedInput
          name="eventlog_name"
          control={methods.control}
          placeholder="Application"
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
      <InlineField
        label="XPath query"
        tooltip="Event log to read from."
        {...commonOptions}
      >
        <TypedInput
          name="xpath_query"
          control={methods.control}
          placeholder="*"
        />
      </InlineField>
      <InlineField
        label="Bookmark path"
        tooltip="Keeps position in event log"
        {...commonOptions}
      >
        <TypedInput name="bookmark_path" control={methods.control} />
      </InlineField>
      <InlineField
        label="Poll interval"
        tooltip="How often to poll the event log."
        {...commonOptions}
      >
        <TypedInput
          name="poll_interval"
          control={methods.control}
          placeholder="3s"
        />
      </InlineField>
      <InlineField
        label="Locale"
        tooltip="Locale ID for event rendering. 0 default is Windows Locale."
        {...commonOptions}
      >
        <TypedInput name="locale" control={methods.control} type="number" />
      </InlineField>
      <InlineField
        label="Exclude event data"
        tooltip="Exclude event data."
        {...commonOptions}
      >
        <InlineSwitch {...methods.register("exclude_event_data")} />
      </InlineField>
      <InlineField
        label="Exclude user data"
        tooltip="Exclude user data."
        {...commonOptions}
      >
        <InlineSwitch {...methods.register("exclude_user_data")} />
      </InlineField>
      <InlineField
        label="Use incoming timestamp"
        tooltip="When false, assigns the current timestamp to the log when it was processed."
        {...commonOptions}
      >
        <InlineSwitch {...methods.register("use_incoming_timestamp")} />
      </InlineField>
    </>
  );
};

const LokiSourceWindowsEvent = {
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
export default LokiSourceWindowsEvent;

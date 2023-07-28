import { useFormContext } from "react-hook-form";
import { Argument, Attribute, Block, toArgument } from "../../../lib/river";
import StaticTargets from "../../ComponentEditor/common/StaticTargets";
import { Destination } from "../types/destination";
import { TelemetryType } from "../types/telemetry";
import { MBadge } from "./badges";

const AdvancedForm = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext<Record<string, any>>();
  return (
    <>
      <StaticTargets.Component
        control={control}
        parent="staticprometheus"
        errors={errors?.staticprometheus}
      />
    </>
  );
};

const StaticPrometheus = {
  label: "Static Prometheus Target",
  value: "staticprometheus",
  imgUrl: `https://grafana.com/api/plugins/prometheus/versions/5.0.0/logos/small`,
  component: MBadge,
  supports: ["metrics"] as TelemetryType[],
  template(d: Destination, advanced?: Record<string, any>) {
    const args: Argument[] = [
      new Attribute("forward_to", [{ "-reference": d.metrics.receiver }]),
    ];
    if (advanced?.staticprometheus?.static_targets) {
      advanced = StaticTargets.postTransform(advanced.staticprometheus);
      const arg = toArgument("targets", advanced.targets);
      if (arg) args.push(arg);
    }
    return new Block("prometheus.scrape", "static", args).marshal();
  },
  advancedForm: AdvancedForm,
  defaults: {
    static_targets: [
      {
        address: "localhost:8080",
        labels: [],
      },
    ],
  },
};
export default StaticPrometheus;

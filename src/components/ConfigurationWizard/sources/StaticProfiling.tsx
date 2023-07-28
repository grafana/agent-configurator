import { useFormContext } from "react-hook-form";
import { Argument, Attribute, Block, toArgument } from "../../../lib/river";
import StaticTargets from "../../ComponentEditor/common/StaticTargets";
import { Destination } from "../types/destination";
import { TelemetryType } from "../types/telemetry";
import { PBadge } from "./badges";

const AdvancedForm = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext<Record<string, any>>();
  return (
    <>
      <StaticTargets.Component
        control={control}
        parent="profiling"
        errors={errors?.profiling}
      />
    </>
  );
};

const StaticProfiling = {
  label: "Static Profiling Target",
  value: "profiling",
  imgUrl: `${process.env.PUBLIC_URL}/logos/pyroscope.svg`,
  component: PBadge,
  supports: ["profiles"] as TelemetryType[],
  template(d: Destination, advanced?: Record<string, any>) {
    const args: Argument[] = [
      new Attribute("forward_to", [{ "-reference": d.profiles.receiver }]),
    ];
    if (advanced?.profiling?.static_targets) {
      advanced = StaticTargets.postTransform(advanced.profiling);
      const arg = toArgument("targets", advanced.targets);
      if (arg) args.push(arg);
    }
    return new Block("pyroscope.scrape", "static", args).marshal();
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
export default StaticProfiling;

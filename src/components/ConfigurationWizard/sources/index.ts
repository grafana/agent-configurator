import { Source } from "../types/source";
import GitHub from "./GitHub";
import LinuxNode from "./LinuxNode";
import OTLPReceiver from "./OTLPReceiver";
import StaticProfiling from "./StaticProfiling";
import StaticPrometheus from "./StaticPrometheus";
const Sources: Source[] = [
  LinuxNode,
  OTLPReceiver,
  StaticPrometheus,
  StaticProfiling,
  GitHub,
];
export default Sources;

export type DestinationFormType = "cloud" | "local";
export interface Destination {
  metrics: {
    receiver: string;
    enabled: boolean;
  };
  logs: {
    receiver: string;
    enabled: boolean;
  };
  traces: {
    receiver: string;
    enabled: boolean;
  };
  profiles: {
    receiver: string;
    enabled: boolean;
  };
  template(): string;
}

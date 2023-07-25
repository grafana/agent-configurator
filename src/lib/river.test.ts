import { toArgument, UnmarshalBlock, Attribute, Block, toBlock } from "./river";
import Parser from "web-tree-sitter";
import { KnownComponents } from "./components";

describe("argument parsing", () => {
  test("construct plain arguments", () => {
    expect(toArgument("key", 7)).toEqual(new Attribute("key", 7));
  });

  test("construct array arguments", () => {
    expect(toArgument("key", ["foo"])).toEqual(new Attribute("key", ["foo"]));
  });
  test("construct block arguments", () => {
    expect(
      toArgument("name", {
        foo: "bar",
      })
    ).toEqual(new Block("name", null, [new Attribute("foo", "bar")]));
  });
});

describe("marshall/unmarshal", () => {
  let parser: Parser;
  beforeAll(async () => {
    // disable console.error as an error is logged by tree-sitter trying to fetch the wasm files via HTTP
    const spy = jest.spyOn(console, "error").mockReturnValue();
    await Parser.init({
      locateFile(scriptName: string, scriptDirectory: string) {
        return `public/${scriptName}`;
      },
    });
    const river = await Parser.Language.load("public/tree-sitter-river.wasm");
    parser = new Parser();
    parser.setLanguage(river);
    spy.mockRestore();
  });
  test("marshal empty block", () => {
    const emptyBlock = new Block("prometheus.exporter.redis", "my_redis", []);
    expect(emptyBlock.marshal()).toEqual(`prometheus.exporter.redis "my_redis" {
}`);
    const emptyBlockNoLabel = new Block("prometheus.exporter.redis", null, []);
    expect(emptyBlockNoLabel.marshal()).toEqual(`prometheus.exporter.redis {
}`);
  });
  test("marshal simple block", () => {
    const emptyBlock = new Block("prometheus.exporter.redis", "my_redis", [
      new Attribute("redis_addr", "localhost:6379"),
    ]);
    expect(emptyBlock.marshal()).toEqual(`prometheus.exporter.redis "my_redis" {
  redis_addr = "localhost:6379"
}`);
  });
  test("marshal blocks with arrays", () => {
    const emptyBlock = new Block("prometheus.exporter.redis", "my_redis", [
      new Attribute("check_streams", ["session"]),
    ]);
    expect(emptyBlock.marshal()).toEqual(`prometheus.exporter.redis "my_redis" {
  check_streams = [
    "session",
  ]
}`);
  });
  test("marshal nested block", () => {
    const emptyBlock = new Block("prometheus.remote_write", "grafana_cloud", [
      new Block("endpoint", null, [
        new Attribute(
          "url",
          "https://prometheus-prod-24-prod-eu-west-2.grafana.net/api/prom"
        ),
      ]),
    ]);
    expect(emptyBlock.marshal())
      .toEqual(`prometheus.remote_write "grafana_cloud" {
  endpoint {
    url = "https://prometheus-prod-24-prod-eu-west-2.grafana.net/api/prom"
  }
}`);
  });
  test("marshal reference", () => {
    const emptyBlock = new Block("prometheus.scrape", "redis", [
      new Attribute("targets", [
        { "-reference": "prometheus.exporter.redis.my_redis.target" },
      ]),
    ]);
    expect(emptyBlock.marshal()).toEqual(`prometheus.scrape "redis" {
  targets = [
    prometheus.exporter.redis.my_redis.target,
  ]
}`);
  });
  test("marshal mixed array", () => {
    const emptyBlock = new Block("prometheus.scrape", "redis", [
      new Attribute("targets", [
        { "-reference": "prometheus.exporter.redis.my_redis.target" },
        { __address__: "localhost:8080" },
      ]),
    ]);
    expect(emptyBlock.marshal()).toEqual(`prometheus.scrape "redis" {
  targets = [
    prometheus.exporter.redis.my_redis.target,
    {
      "__address__" = "localhost:8080",
    },
  ]
}`);
  });

  test("unmarshal empty block", () => {
    const tree = parser.parse(`prometheus.exporter.redis "my_redis" {}`);
    const out = UnmarshalBlock(tree.rootNode.namedChild(0)!);
    expect(out).toEqual(new Block("prometheus.exporter.redis", "my_redis", []));
  });

  test("unmarshal attributes", () => {
    const tree = parser.parse(`prometheus.exporter.redis "my_redis" {
  redis_addr = "localhost:6379" // comment
}`);
    const out = UnmarshalBlock(tree.rootNode.namedChild(0)!);
    expect(out).toEqual(
      new Block("prometheus.exporter.redis", "my_redis", [
        new Attribute("redis_addr", "localhost:6379"),
      ])
    );
  });

  test("unmarshal nested blocks", () => {
    const tree = parser.parse(`prometheus.remote_write "grafana_cloud" {
  endpoint {
    url = "https://prometheus-prod-24-prod-eu-west-2.grafana.net/api/prom"
  }
}`);
    const out = UnmarshalBlock(tree.rootNode.namedChild(0)!);
    expect(out).toEqual(
      new Block("prometheus.remote_write", "grafana_cloud", [
        new Block("endpoint", null, [
          new Attribute(
            "url",
            "https://prometheus-prod-24-prod-eu-west-2.grafana.net/api/prom"
          ),
        ]),
      ])
    );
  });
  test("unmarshal references", () => {
    const tree = parser.parse(`prometheus.scrape "redis" {
targets = [prometheus.exporter.redis.target]
}`);
    const out = UnmarshalBlock(tree.rootNode.namedChild(0)!);
    expect(out).toEqual(
      new Block("prometheus.scrape", "redis", [
        new Attribute("targets", [
          { "-reference": "prometheus.exporter.redis.target" },
        ]),
      ])
    );
  });
  test("unmarshal mixed array", () => {
    const tree = parser.parse(`prometheus.scrape "redis" {
  targets = [
    {"__address__" = "localhost:1234"},
    prometheus.exporter.redis.default.targets,
  ]
  forward_to = [
    prometheus.remote_write.default.receiver,
  ]
}`);
    const out = UnmarshalBlock(tree.rootNode.namedChild(0)!);
    expect(out).toEqual(
      new Block("prometheus.scrape", "redis", [
        new Attribute("targets", [
          { __address__: "localhost:1234" },
          { "-reference": "prometheus.exporter.redis.default.targets" },
        ]),
        new Attribute("forward_to", [
          { "-reference": "prometheus.remote_write.default.receiver" },
        ]),
      ])
    );
  });
  test("to form with spec", () => {
    const block = new Block("discovery.ec2", "aws", [
      new Block("filter", null, [
        new Attribute("name", "foo"),
        new Attribute("values", ["a", "b"]),
      ]),
    ]);
    const out = block.formValues(KnownComponents["discovery.ec2"]);
    expect(out).toEqual({
      filter: [{ name: "foo", values: ["a", "b"] }],
    });
  });
  test("from form with spec", () => {
    const fv = {
      filter: [
        { name: "foo", values: ["a", "b"] },
        { name: "bar", values: ["b", "c"] },
      ],
    };
    const out = toBlock(
      "discovery.ec2",
      fv,
      "aws",
      KnownComponents["discovery.ec2"]
    );
    expect(out).toEqual(
      new Block("discovery.ec2", "aws", [
        new Block("filter", null, [
          new Attribute("name", "foo"),
          new Attribute("values", ["a", "b"]),
        ]),
        new Block("filter", null, [
          new Attribute("name", "bar"),
          new Attribute("values", ["b", "c"]),
        ]),
      ])
    );
  });
  test("omit default values", () => {
    const fv = {
      grpc: {
        endpoint: "0.0.0.0:4137",
        include_metadata: false,
      },
    };
    const out = toBlock(
      "otelcol.receiver.otlp",
      fv,
      "default",
      KnownComponents["otelcol.receiver.otlp"]
    );
    expect(out).toEqual(
      new Block("otelcol.receiver.otlp", "default", [
        new Block("grpc", null, [new Attribute("endpoint", "0.0.0.0:4137")]),
      ])
    );
  });
  test("fill default values", () => {
    const block = new Block("otelcol.exporter.prometheus", "default", []);
    const out = block.formValues(
      KnownComponents["otelcol.exporter.prometheus"]
    );
    expect(out).toEqual({
      include_scope_info: true,
      include_target_info: true,
    });
  });
  test("allow empty block according to spec", () => {
    const fv = {
      grpc: {},
    };
    const out = toBlock(
      "otelcol.receiver.otlp",
      fv,
      "default",
      KnownComponents["otelcol.receiver.otlp"]
    );
    expect(out).toEqual(
      new Block("otelcol.receiver.otlp", "default", [
        new Block("grpc", null, []),
      ])
    );
  });
  test("unmarshal blocks with dot in name", () => {
    const tree = parser.parse(`pyroscope.scrape "default" {
  profiling_config {
    profile.memory {
      enabled = true
      delta = false
    }
  }
}`);
    const out = UnmarshalBlock(tree.rootNode.namedChild(0)!);
    expect(out).toEqual(
      new Block("pyroscope.scrape", "default", [
        new Block("profiling_config", null, [
          new Block("profile.memory", null, [
            new Attribute("enabled", true),
            new Attribute("delta", false),
          ]),
        ]),
      ])
    );
  });
  test("preserve dots in form value", () => {
    expect(
      new Block("pyroscope.scrape", "default", [
        new Block("profiling_config", null, [
          new Attribute("path_prefix", "/app"),
          new Block("profile.memory", null, [
            new Attribute("enabled", true),
            new Attribute("delta", false),
          ]),
        ]),
      ]).formValues(KnownComponents["pyroscope.scrape"])["profiling_config"]
    ).toEqual({
      path_prefix: "/app",
      "profile.memory": {
        path: "/debug/pprof/memory",
        delta: false,
        enabled: true,
      },
      "profile.mutex": {
        path: "/debug/pprof/mutex",
        delta: false,
        enabled: true,
      },
      "profile.process_cpu": {
        path: "/debug/pprof/profile",
        delta: true,
        enabled: true,
      },
      "profile.goroutine": {
        path: "/debug/pprof/goroutine",
        delta: false,
        enabled: true,
      },
      "profile.fgprof": {
        path: "/debug/fgprof",
        delta: true,
        enabled: false,
      },
      "profile.custom": {
        path: "",
        delta: false,
        enabled: false,
      },
      "profile.block": {
        path: "/debug/pprof/block",
        delta: false,
        enabled: true,
      },
    });
  });
  test("reproducability", () => {
    const testcases: { raw: string; parsed: Block }[] = [
      {
        raw: `prometheus.exporter.redis "redis" {
  redis_addr = "localhost:6379"
}`,
        parsed: new Block("prometheus.exporter.redis", "redis", [
          new Attribute("redis_addr", "localhost:6379"),
        ]),
      },
      {
        raw: `prometheus.scrape "redis" {
  targets = [
    prometheus.exporter.redis.target,
  ]
}`,
        parsed: new Block("prometheus.scrape", "redis", [
          new Attribute("targets", [
            { "-reference": "prometheus.exporter.redis.target" },
          ]),
        ]),
      },
      {
        raw: `prometheus.remote_write "grafana_cloud" {
  endpoint {
    url = "https://prometheus-prod-24-prod-eu-west-2.grafana.net/api/prom"
    basic_auth {
      username = "foo"
      password = env("GRAFANA_API_KEY")
    }
  }
}`,
        parsed: new Block("prometheus.remote_write", "grafana_cloud", [
          new Block("endpoint", null, [
            new Attribute(
              "url",
              "https://prometheus-prod-24-prod-eu-west-2.grafana.net/api/prom"
            ),
            new Block("basic_auth", null, [
              new Attribute("username", "foo"),
              new Attribute("password", {
                "-function": {
                  name: "env",
                  params: ["GRAFANA_API_KEY"],
                },
              }),
            ]),
          ]),
        ]),
      },
    ];
    for (const tc of testcases) {
      let parsed = UnmarshalBlock(parser.parse(tc.raw).rootNode.namedChild(0)!);
      expect(parsed).toEqual(tc.parsed);
      expect(parsed.marshal()).toEqual(tc.raw);
      let reparsed = UnmarshalBlock(
        parser.parse(parsed.marshal()).rootNode.namedChild(0)!
      );
      expect(reparsed).toEqual(tc.parsed);
    }
  });
});
                
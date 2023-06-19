import { toArgument, UnmarshalBlock, Attribute, Block } from "./river";
import Parser from "web-tree-sitter";

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
      new Attribute("redis_addr", "localhost:6317"),
    ]);
    expect(emptyBlock.marshal()).toEqual(`prometheus.exporter.redis "my_redis" {
  redis_addr = "localhost:6317"
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
  redis_addr = "localhost:6137"
}`);
    const out = UnmarshalBlock(tree.rootNode.namedChild(0)!);
    expect(out).toEqual(
      new Block("prometheus.exporter.redis", "my_redis", [
        new Attribute("redis_addr", "localhost:6137"),
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
  test("reproducability", () => {
    const testcases: { raw: string; parsed: Block }[] = [
      {
        raw: `prometheus.exporter.redis "redis" {
  redis_addr = "localhost:6137"
}`,
        parsed: new Block("prometheus.exporter.redis", "redis", [
          new Attribute("redis_addr", "localhost:6137"),
        ]),
      },
      {
        raw: `prometheus.scrape "redis" {
targets = [prometheus.exporter.redis.target]
}`,
        parsed: new Block("prometheus.scrape", "redis", [
          new Attribute("targets", [
            { "-reference": "prometheus.exporter.redis.target" },
          ]),
        ]),
      },
    ];
    for (const tc of testcases) {
      let parsed = UnmarshalBlock(parser.parse(tc.raw).rootNode.namedChild(0)!);
      expect(parsed).toEqual(tc.parsed);
      let reparsed = UnmarshalBlock(
        parser.parse(parsed.marshal()).rootNode.namedChild(0)!
      );
      expect(reparsed).toEqual(tc.parsed);
    }
  });
});

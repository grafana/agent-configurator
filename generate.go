package main

import (
	"encoding/json"
	"os"
	"reflect"
	"strings"

	"github.com/grafana/agent/component"
	_ "github.com/grafana/agent/component/all"
	"github.com/grafana/agent/pkg/river"
	"golang.org/x/exp/slog"
)

var goRiverDefaulter = reflect.TypeOf((*river.Defaulter)(nil)).Elem()

type AttributeSpec struct {
	Name      string
	Type      string
	Default   any
	Required  bool
	BlockSpec *BlockSpec `json:",omitempty"`
}

type BlockSpec struct {
	Attributes map[string]AttributeSpec
}

var customMappings = map[string]string{
	"config.TLSVersion": "uint16",
}

func ParseBlock(v reflect.Value) BlockSpec {
	slog.Debug("Parsing Block", slog.String("type", v.Type().String()))
	cs := BlockSpec{Attributes: map[string]AttributeSpec{}}
	for i := 0; i < v.NumField(); i++ {
		f := v.Field(i)
		tf := v.Type().Field(i)
		options := strings.SplitN(tf.Tag.Get("river"), ",", 2)
		slog.Debug("Handling Attribute", slog.String("key", options[0]), slog.String("type", f.Type().String()))
		switch {
		case customMappings[f.Type().String()] != "":
			cs.Attributes[options[0]] = AttributeSpec{
				Name:     options[0],
				Default:  nil,
				Type:     customMappings[f.Type().String()],
				Required: !strings.Contains(options[1], "optional"),
			}
		case strings.Contains(options[1], "block"):
			slog.Debug("Found block attribute", slog.String("key", options[0]), slog.String("type", f.Type().String()))
			switch f.Type().Kind() {
			case reflect.Array, reflect.Slice:
				slog.Debug("Block is array", slog.String("elem", f.Type().Elem().String()))
				switch f.Type().Elem().Kind() {
				case reflect.Pointer:
					slog.Debug("Array contains Pointers")
					bs := ParseBlock(reflect.Zero(f.Type().Elem().Elem()))
					cs.Attributes[options[0]] = AttributeSpec{
						Name:      options[0],
						Default:   nil,
						Type:      "[]block",
						Required:  !strings.Contains(options[1], "optional"),
						BlockSpec: &bs,
					}
				case reflect.Struct:
					slog.Debug("Array contains Structs")
					bs := ParseBlock(reflect.Zero(f.Type().Elem()))
					cs.Attributes[options[0]] = AttributeSpec{
						Name:      options[0],
						Default:   nil,
						Type:      "[]block",
						Required:  !strings.Contains(options[1], "optional"),
						BlockSpec: &bs,
					}
				}
			case reflect.Struct:
				slog.Debug("Block is struct")
				bs := ParseBlock(f)
				cs.Attributes[options[0]] = AttributeSpec{
					Name:      options[0],
					Default:   nil,
					Type:      "block",
					Required:  !strings.Contains(options[1], "optional"),
					BlockSpec: &bs,
				}
			}
		case strings.Contains(options[1], "squash"):
			slog.Debug("Attribute should be squashed", slog.String("type", f.Type().String()))
			switch f.Type().Kind() {
			case reflect.Struct:
				slog.Debug("Squashing Struct")
				bs := ParseBlock(f)
				for k, a := range bs.Attributes {
					cs.Attributes[k] = a
				}
			case reflect.Pointer:
				slog.Debug("Squashing Pointer")
				bs := ParseBlock(reflect.Zero(f.Type().Elem()))
				for k, a := range bs.Attributes {
					cs.Attributes[k] = a
				}
			}
		default:
			cs.Attributes[options[0]] = AttributeSpec{
				Name:     options[0],
				Default:  f.Interface(),
				Type:     f.Type().String(),
				Required: !strings.Contains(options[1], "optional"),
			}
		}
	}
	return cs
}

func main() {
	opts := slog.HandlerOptions{
		Level: slog.LevelDebug,
	}
	textHandler := opts.NewTextHandler(os.Stdout)
	slog.SetDefault(slog.New(textHandler))
	components := []string{
		"prometheus.remote_write",
		"prometheus.exporter.redis",
		"prometheus.exporter.mysql",
	}
	out := map[string]BlockSpec{}
	for _, cname := range components {
		slog.Info("Building Component")
		c, _ := component.Get(cname)

		rv := reflect.ValueOf(c.Args)
		defaults := reflect.New(rv.Type()).Elem()
		if defaults.CanAddr() && defaults.Addr().Type().Implements(goRiverDefaulter) {
			defaults.Addr().Interface().(river.Defaulter).SetToDefault()
		}

		cs := ParseBlock(defaults)

		out[cname] = cs
	}
	f, err := os.Create("src/generated/component_spec.json")
	if err != nil {
		panic(err)
	}
	enc := json.NewEncoder(f)
	if err := enc.Encode(out); err != nil {
		panic(err)
	}
}

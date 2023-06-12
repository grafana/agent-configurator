package main

import (
	"encoding/json"
	"fmt"
	"os"
	"reflect"
	"strings"

	"github.com/grafana/agent/component"
	_ "github.com/grafana/agent/component/all"
	"github.com/grafana/agent/pkg/river"
)

var goRiverDefaulter = reflect.TypeOf((*river.Defaulter)(nil)).Elem()

type AttributeSpec struct {
	Name     string
	Type     string
	Default  any
	Required bool
}

type ComponentSpec struct {
	Attributes []AttributeSpec
}

func main() {
	components := []string{
		"prometheus.exporter.redis",
		"prometheus.exporter.mysql",
	}
	out := map[string]ComponentSpec{}
	for _, cname := range components {
		fmt.Printf("Component %s\n", cname)
		c, _ := component.Get(cname)

		rv := reflect.ValueOf(c.Args)
		defaults := reflect.New(rv.Type()).Elem()
		if defaults.CanAddr() && defaults.Addr().Type().Implements(goRiverDefaulter) {
			defaults.Addr().Interface().(river.Defaulter).SetToDefault()
		}

		cs := ComponentSpec{Attributes: []AttributeSpec{}}
		for i := 0; i < defaults.NumField(); i++ {
			f := defaults.Field(i)
			tf := defaults.Type().Field(i)
			options := strings.SplitN(tf.Tag.Get("river"), ",", 2)
			cs.Attributes = append(cs.Attributes, AttributeSpec{
				Name:     options[0],
				Default:  f.Interface(),
				Type:     f.Type().String(),
				Required: !strings.Contains(options[1], "optional"),
			})
		}
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

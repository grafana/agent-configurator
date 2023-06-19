import { Card } from "@grafana/ui";
import { css } from "@emotion/css";
import { useStyles } from "../../theme";
import { GrafanaTheme2 } from "@grafana/data";
import { useModelContext } from "../../state";

import Examples from "./examples";

const ExamplesCatalog = ({ dismiss }: { dismiss: () => void }) => {
  const styles = useStyles(getStyles);
  const { setModel } = useModelContext();
  return (
    <ul className={styles.catalog}>
      {Examples.map((item) => (
        <Card
          key={item.name}
          onClick={() => {
            setModel(item.source);
            dismiss();
          }}
        >
          <Card.Heading>{item.name}</Card.Heading>
          <Card.Figure>
            <img src={item.logo} alt="Prometheus Logo" height="40" width="40" />
          </Card.Figure>
          <Card.Actions></Card.Actions>
        </Card>
      ))}
    </ul>
  );
};

const getStyles = (theme: GrafanaTheme2) => {
  return {
    catalog: css`
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 12px;
      list-style: none;
      padding-left: 0;
    `,
  };
};

export default ExamplesCatalog;

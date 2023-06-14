import { css } from "@emotion/css";
import { GrafanaTheme2 } from "@grafana/data";
import { useStyles } from "./theme";
import { Alert, LinkButton } from "@grafana/ui";
import Header from "./components/Header";
import ConfigEditor from "./components/ConfigEditor";

function App() {
  const styles = useStyles(getStyles);
  return (
    <div className={styles.container}>
      <Header />
      <section className={styles.section}>
        <div className={styles.content}>
          <Alert
            severity="info"
            title="Welcome to the Grafana Agent Configurator"
          >
            <p>
              This tool allows for easy configuration of Grafana Agents{" "}
              <i>Flow</i> system. To get started click on{" "}
              <code>Add Component</code> in the editor below
            </p>
            <LinkButton
              variant="secondary"
              href="https://grafana.com/docs/agent/latest/flow/"
            >
              View Flow Docs
            </LinkButton>
          </Alert>
        </div>
      </section>
      <section className={styles.section}>
        <div className={styles.window}>
          <ConfigEditor />
        </div>
      </section>
    </div>
  );
}

const getStyles = (theme: GrafanaTheme2) => {
  return {
    section: css`
      width: 100%;
      padding-top: 20px;
      display: flex;
      justify-content: center;
    `,
    content: css`
      width: 80vw;
    `,
    window: css`
      height: 60vh;
      width: 80vw;
      padding: 10px;
      border: rgba(204, 204, 220, 0.07) solid 1px;
      border-radius: 2px;
      background-color: ${theme.colors.background.secondary};
    `,
    container: css`
      display: flex;
      flex-direction: column;
      flex-wrap: wrap;
      background: ${theme.colors.background.primary};
      font-family: Inter, Helvetica, Arial, sans-serif;
      height: 100%;
    `,
  };
};

export default App;

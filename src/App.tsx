import { css } from "@emotion/css";
import { GrafanaTheme2 } from "@grafana/data";
import { useStyles } from "./theme";
import {
  Alert,
  LinkButton,
  Button,
  Modal,
  Input,
  Icon,
  Tooltip,
  VerticalGroup,
  HorizontalGroup,
} from "@grafana/ui";
import Header from "./components/Header";
import ConfigEditor from "./components/ConfigEditor";
import { useState, useMemo } from "react";
import ExamplesCatalog from "./components/ExamplesCatalog";
import { useModelContext } from "./state";
import InstallationInstructions from "./components/InstallationInstructions";

function App() {
  const styles = useStyles(getStyles);
  const [isModalOpen, setModalOpen] = useState(false);
  const { model } = useModelContext();
  const [copied, setCopied] = useState(false);

  const shareLink = useMemo(
    () => `${window.location}?c=${btoa(model)}`,
    [model]
  );

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 5 * 1000);
  };

  return (
    <div className={styles.container}>
      <Header></Header>
      <section className={styles.section}>
        <div className={styles.hero}>
          <h1>Welcome to the Grafana Agent Configuration Generator</h1>
          <p>
            This tool allows for easy configuration of Grafana Agents{" "}
            <i>Flow</i> system. To get started click on{" "}
            <code>Add Component</code> in the editor below
          </p>
          <hr />
          <VerticalGroup>
            <p>
              If this is your first time working with the agent, we reccomend
              you get started with an example configuration, based on your
              usecase.
            </p>
            <HorizontalGroup>
              <Button onClick={() => setModalOpen(true)}>Open catalog</Button>
              <LinkButton
                variant="secondary"
                href="https://grafana.com/docs/agent/latest/flow/"
                target="_blank"
                icon="external-link-alt"
              >
                View Flow Docs
              </LinkButton>
            </HorizontalGroup>
          </VerticalGroup>
        </div>
      </section>
      <section className={styles.section}>
        <div className={styles.editorWindow}>
          <ConfigEditor />
        </div>
      </section>
      <section className={styles.section}>
        <div className={styles.shareSection}>
          <h4>Share this Configuration</h4>
          <p>To share this configuration, use the following link:</p>
          <VerticalGroup>
            <Input
              value={shareLink}
              readOnly
              addonAfter={
                <Tooltip
                  content={(copied ? "Copied" : "Copy") + " link to clipboard"}
                >
                  <Button variant="secondary" onClick={copyLink}>
                    <Icon name={copied ? "check" : "copy"} />
                  </Button>
                </Tooltip>
              }
            />
            <Alert
              severity="warning"
              title="By copying the link to your clipboard you may be unintentionally sharing sensitive data. Check the included information before copying and ensure that you avoid sharing confidential data like secrets or API-Tokens"
            ></Alert>
          </VerticalGroup>
        </div>
      </section>
      <section className={styles.section}>
        <InstallationInstructions />
      </section>
      <Modal
        title="Example Catalog"
        isOpen={isModalOpen}
        onDismiss={() => setModalOpen(false)}
      >
        <ExamplesCatalog dismiss={() => setModalOpen(false)} />
      </Modal>
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
      display: flex;
      flex-wrap: nowrap;
      flex-direction: row;
      justify-content: space-between;
      gap: 10px;
    `,
    shareSection: css`
      width: 80vw;
      display: block;
      border: rgba(204, 204, 220, 0.07) solid 1px;
      background-color: ${theme.colors.background.secondary};
      border-radius: 2px;
      padding: ${theme.spacing(2, 2)};
    `,
    editorWindow: css`
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
      flex-wrap: nowrap;
      background: ${theme.colors.background.primary};
      font-family: Inter, Helvetica, Arial, sans-serif;
      min-height: 100vh;
      justify-content: flex-start;
      padding-bottom: 10em;
    `,
    hero: css`
      width: 80vw;
    `,
    split: css`
      display: flex;
      gap: 2rem;
    `,
    splitLeft: css`
      height: 5rem;
    `,
  };
};

export default App;

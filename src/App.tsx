import React from "react";
import { css } from "@emotion/css";
import { GrafanaTheme2 } from "@grafana/data";
import { useStyles } from "./theme";
import Header from "./components/Header";
import Window from "./components/Window";
import ConfigEditor from "./components/ConfigEditor";

function App() {
  const styles = useStyles(getStyles);
  return (
    <div className={styles.container}>
      <Header />
      <Window>
        <ConfigEditor value="" />
      </Window>
    </div>
  );
}

const getStyles = (theme: GrafanaTheme2) => {
  return {
    container: css`
      display: flex;
      flex-direction: column;
      flex-wrap: wrap;
      background: ${theme.colors.background.primary};
      text-align: center;
      font-family: Inter, Helvetica, Arial, sans-serif;
      min-height: 100vh;
      height: 100%;
    `,
  };
};

export default App;

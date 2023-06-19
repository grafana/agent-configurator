import ReactDOM from "react-dom/client";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "rc-drawer/assets/index.css";
import App from "./App";
import { ThemeProvider } from "./theme";
import { ComponentProvider, ModelProvider } from "./state";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <ThemeProvider>
    <ModelProvider>
      <ComponentProvider>
        <App />
      </ComponentProvider>
    </ModelProvider>
  </ThemeProvider>
);

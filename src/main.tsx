import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.module.scss";
import LayersDrawer from "./LayersDrawer";
import { StyledEngineProvider, ThemeProvider } from "@mui/material";
import "../i18n";
import BaseMap from "./BaseMap";
import { theme } from "./muiTheme";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StyledEngineProvider injectFirst>
      {/*<ThemeProvider theme={theme}>*/}

      <LayersDrawer />
      <BaseMap />
      {/*</ThemeProvider>*/}
    </StyledEngineProvider>
  </StrictMode>,
);

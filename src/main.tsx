import React, {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import "./styles/index.module.scss";
import LayersDrawer from "./LayersDrawer";
import {StyledEngineProvider} from "@mui/material";
import "../i18n";
import BaseMap from "./BaseMap";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StyledEngineProvider injectFirst>
      <LayersDrawer />
      <BaseMap />
    </StyledEngineProvider>
  </StrictMode>,
);

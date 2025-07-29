import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.module.scss";
import LayersDrawer from "./components/LayersDrawer/LayersDrawer";
import { StyledEngineProvider } from "@mui/material";
import "../i18n";
import BaseMap from "./components/BaseMap/BaseMap";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StyledEngineProvider injectFirst>
      <LayersDrawer />
      <BaseMap />
    </StyledEngineProvider>
  </StrictMode>,
);

import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.module.scss";
import "../i18n";
import { StyledEngineProvider } from "@mui/material";
import NavigationHeader from "./components/NavigationHeader/NavigationHeader";
import LayersDrawer from "./components/LayersDrawer/LayersDrawer";
import BaseMap from "./components/BaseMap/BaseMap";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StyledEngineProvider injectFirst>
      <NavigationHeader />
      <LayersDrawer />
      <BaseMap />
    </StyledEngineProvider>
  </StrictMode>,
);
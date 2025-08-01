import { Card, Switch, Typography } from "@mui/material";
import { useState } from "react";
import LayersIcon from "@mui/icons-material/Layers";
import { useTranslation } from "react-i18next";
import StyledSwipeableDrawer from "../StyledSwipeableDrawer/StyledSwipeableDrawer";
import StyledIconButtonWithTooltip from "../StyledIconButtonWithTooltip/StyledIconButtonWithTooltip";
import styles from "./LayersDrawer.module.scss";

interface LayersDrawerProps {
  layerOn: boolean;
  setLayerOn: (val: boolean) => void;
}

export default function LayersDrawer({
  layerOn,
  setLayerOn,
}: LayersDrawerProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };
  const toggleLayer = () => {
    setLayerOn(!layerOn);
  };

  return (
    <div className={styles["LayersDrawer-root"]}>
      <StyledIconButtonWithTooltip
        tooltipText={t("buttons.open_menu")}
        handleOnClick={toggleDrawer(true)}
      >
        <LayersIcon />
      </StyledIconButtonWithTooltip>
      <StyledSwipeableDrawer
        open={open}
        anchor="left"
        onClose={toggleDrawer(false)}
        onOpen={toggleDrawer(true)}
      >
        <h2 style={{ padding: "8px" }}>{t("pollution_layers")}</h2>

        {/*List of collapsible layer toggles go inside here*/}
        <Card sx={{ padding: "8px", backgroundColor: "gray" }}>
          <h3>Sediment</h3>
          <Typography sx={{ display: "inline-block" }}>
            Toggle PMTiles layer
          </Typography>
          <Switch
            sx={{ display: "inline-block" }}
            checked={layerOn}
            onChange={toggleLayer}
          />
        </Card>
        {/* End temp code */}
      </StyledSwipeableDrawer>
    </div>
  );
}

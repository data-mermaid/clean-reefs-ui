import {
  Button,
  Card,
  SwipeableDrawer,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";
import LayersIcon from "@mui/icons-material/Layers";
import { useTranslation } from "react-i18next";
import StyledSwipeableDrawer from "./components/SwipeableDrawer/StyledSwipeableDrawer";

export default function LayersDrawer() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  return (
    <div style={{ zIndex: 4, position: "relative", padding: "8px" }}>
      <Button
        variant="outlined"
        onClick={toggleDrawer(true)}
        style={{
          position: "relative",
          top: "0",
          left: "0",
          backgroundColor: "white",
        }}
      >
        <Tooltip title={t("buttons.open_menu")}>
          <LayersIcon />
        </Tooltip>
      </Button>
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
            Layer to toggle
          </Typography>
          <Switch sx={{ display: "inline-block" }} />
        </Card>
        {/* End temp code */}
      </StyledSwipeableDrawer>
    </div>
  );
}

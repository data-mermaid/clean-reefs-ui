import { Button, IconButton, Tooltip } from "@mui/material";
import styles from "./StyledIconButtonWithTooltip.module.scss";

interface StyledIconButtonWithTooltipProps {
  tooltipText: string;
  children?: React.ReactNode;
  handleOnClick: () => void;
}

export default function StyledIconButtonWithTooltip({
  tooltipText,
  children,
  handleOnClick,
}: StyledIconButtonWithTooltipProps) {
  return (
    <Button
      variant="outlined"
      onClick={handleOnClick}
      className={styles["MuiButton-root"]}
    >
      <Tooltip title={tooltipText}>
        <IconButton>{children}</IconButton>
      </Tooltip>
    </Button>
  );
}

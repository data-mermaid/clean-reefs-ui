import { Button, Tooltip } from '@mui/material'
import styles from './StyledIconButtonWithTooltip.module.scss'

interface StyledIconButtonWithTooltipProps {
  tooltipText: string
  children: React.ReactElement
  handleOnClick: () => void
}

export default function StyledIconButtonWithTooltip({
  tooltipText,
  children,
  handleOnClick,
}: StyledIconButtonWithTooltipProps) {
  return (
    <Button variant="outlined" onClick={handleOnClick} className={styles['MuiButton-root']}>
      <Tooltip title={tooltipText}>{children}</Tooltip>
    </Button>
  )
}

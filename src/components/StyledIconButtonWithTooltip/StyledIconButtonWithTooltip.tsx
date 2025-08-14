import { Button, Tooltip, ButtonProps } from '@mui/material'
import clsx from 'clsx'
import styles from './StyledIconButtonWithTooltip.module.scss'

interface StyledIconButtonWithTooltipProps extends ButtonProps {
  tooltipText?: string
  children: React.ReactElement
  handleOnClick?: () => void
}

export default function StyledIconButtonWithTooltip({
  tooltipText,
  children,
  handleOnClick,
  className,
}: StyledIconButtonWithTooltipProps) {
  const buttonContent = (
    <Button onClick={handleOnClick} className={clsx(styles['MuiButton-root'], className)}>
      {children}
    </Button>
  )

  return tooltipText ? <Tooltip title={tooltipText}>{buttonContent}</Tooltip> : buttonContent
}

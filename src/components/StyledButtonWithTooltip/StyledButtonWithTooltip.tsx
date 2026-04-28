import { Button, IconButton, Tooltip, ButtonProps } from '@mui/material'
import clsx from 'clsx'
import styles from './StyledButtonWithTooltip.module.scss'

interface StyledButtonWithTooltipProps extends ButtonProps {
  tooltipText?: string
  tooltipPlacement?: React.ComponentProps<typeof Tooltip>['placement']
  children: React.ReactElement
  isIconButton?: boolean
}

export default function StyledButtonWithTooltip({
  tooltipText,
  children,
  className,
  isIconButton = false,
  tooltipPlacement = 'bottom',
  onClick,
  ...rest
}: StyledButtonWithTooltipProps) {
  const buttonContent = isIconButton ? (
    <IconButton onClick={onClick} className={clsx(styles['icon-button'], className)} {...rest}>
      {children}
    </IconButton>
  ) : (
    <Button onClick={onClick} className={clsx(styles['button'], className)} {...rest}>
      {children}
    </Button>
  )

  return tooltipText ? (
    <Tooltip
      title={tooltipText}
      placement={tooltipPlacement}
      arrow
      slotProps={{
        tooltip: { className: styles['tooltip'] },
        arrow: { className: styles['tooltip-arrow'] },
      }}
    >
      {buttonContent}
    </Tooltip>
  ) : (
    buttonContent
  )
}

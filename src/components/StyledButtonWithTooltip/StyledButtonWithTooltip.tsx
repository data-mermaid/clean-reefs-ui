import { Button, IconButton, Tooltip, ButtonProps } from '@mui/material'
import clsx from 'clsx'
import styles from './StyledButtonWithTooltip.module.scss'

interface StyledButtonWithTooltipProps extends ButtonProps {
  tooltipText?: string
  tooltipPlacement?: React.ComponentProps<typeof Tooltip>['placement']
  children: React.ReactElement
  handleOnClick?: () => void
  isIconButton?: boolean
}

export default function StyledButtonWithTooltip({
  tooltipText,
  children,
  handleOnClick,
  className,
  isIconButton = false,
  tooltipPlacement = 'bottom',
  ...props
}: StyledButtonWithTooltipProps) {
  const buttonContent = isIconButton ? (
    <IconButton
      onClick={handleOnClick}
      className={clsx(styles['icon-button'], className)}
      {...props}
    >
      {children}
    </IconButton>
  ) : (
    <Button onClick={handleOnClick} className={clsx(styles['button'], className)} {...props}>
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

import { Button, Tooltip, ButtonProps } from '@mui/material'
import clsx from 'clsx'
import styles from './StyledButtonWithTooltip.module.scss'

interface StyledButtonWithTooltipProps extends ButtonProps {
  tooltipText?: string
  tooltipPlacement?: React.ComponentProps<typeof Tooltip>['placement']
  children: React.ReactElement
}

export default function StyledButtonWithTooltip({
  tooltipText,
  children,
  className,
  tooltipPlacement = 'bottom',
  onClick,
  ...rest
}: StyledButtonWithTooltipProps) {
  const buttonContent = (
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
      <span>{buttonContent}</span>
    </Tooltip>
  ) : (
    buttonContent
  )
}

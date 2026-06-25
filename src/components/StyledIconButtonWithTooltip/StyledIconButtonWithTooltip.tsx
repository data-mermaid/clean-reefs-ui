import { IconButton, Tooltip, IconButtonProps } from '@mui/material'
import clsx from 'clsx'
import styles from './StyledIconButtonWithTooltip.module.scss'

interface StyledIconButtonWithTooltipProps extends IconButtonProps {
  tooltipText?: string
  tooltipPlacement?: React.ComponentProps<typeof Tooltip>['placement']
  children: React.ReactElement
}

export default function StyledIconButtonWithTooltip({
  tooltipText,
  children,
  className,
  tooltipPlacement = 'bottom',
  onClick,
  ...rest
}: StyledIconButtonWithTooltipProps) {
  const buttonContent = (
    <IconButton onClick={onClick} className={clsx(styles['icon-button'], className)} {...rest}>
      {children}
    </IconButton>
  )

  return tooltipText ? (
    <Tooltip
      title={tooltipText}
      placement={tooltipPlacement}
      slotProps={{
        tooltip: { className: styles['icon-button__tooltip'] },
      }}
    >
      <span>{buttonContent}</span>
    </Tooltip>
  ) : (
    buttonContent
  )
}

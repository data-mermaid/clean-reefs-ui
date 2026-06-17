import BarChartIcon from '@mui/icons-material/BarChart'
import LayersIcon from '@mui/icons-material/Layers'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import StyledIconButtonWithTooltip from '../StyledIconButtonWithTooltip/StyledIconButtonWithTooltip'
import styles from './Sidebar.module.scss'

export type ActivePanel = 'graphs' | 'layers' | null

interface SidebarProps {
  activePanel: ActivePanel
  onTogglePanel: (panel: Exclude<ActivePanel, null>) => void
}

export default function Sidebar({ activePanel, onTogglePanel }: SidebarProps) {
  const { t } = useTranslation()

  return (
    <nav className={styles['sidebar']} aria-label={t('sidebar')}>
      <StyledIconButtonWithTooltip
        aria-label={t('buttons.graphs')}
        tooltipText={t('buttons.graphs')}
        tooltipPlacement="right"
        onClick={() => onTogglePanel('graphs')}
        className={clsx(
          styles['sidebar-button'],
          activePanel === 'graphs' && styles['sidebar-button--active'],
        )}
      >
        <BarChartIcon />
      </StyledIconButtonWithTooltip>
      <StyledIconButtonWithTooltip
        aria-label={t('buttons.layers')}
        tooltipText={t('buttons.layers')}
        tooltipPlacement="right"
        onClick={() => onTogglePanel('layers')}
        className={clsx(
          styles['sidebar-button'],
          activePanel === 'layers' && styles['sidebar-button--active'],
        )}
      >
        <LayersIcon />
      </StyledIconButtonWithTooltip>
    </nav>
  )
}

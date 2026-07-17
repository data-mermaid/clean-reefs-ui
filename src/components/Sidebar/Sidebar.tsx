import BarChartIcon from '@mui/icons-material/BarChart'
import LayersIcon from '@mui/icons-material/Layers'
import SyncIcon from '@mui/icons-material/Sync'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import StyledIconButtonWithTooltip from '../StyledIconButtonWithTooltip/StyledIconButtonWithTooltip'
import styles from './Sidebar.module.scss'

export type ActivePanel = 'graphs' | 'layers' | null

interface SidebarProps {
  activePanel: ActivePanel
  onTogglePanel: (panel: Exclude<ActivePanel, null>) => void
  isChartsLoading: boolean
}

export default function Sidebar({ activePanel, onTogglePanel, isChartsLoading }: SidebarProps) {
  const { t } = useTranslation()

  return (
    <nav className={styles['sidebar']} aria-label={t('sidebar')}>
      <StyledIconButtonWithTooltip
        aria-label={t('graphs')}
        aria-pressed={activePanel === 'graphs'}
        tooltipText={t('graphs')}
        tooltipPlacement="right"
        onClick={() => onTogglePanel('graphs')}
        className={clsx(
          styles['sidebar__button'],
          activePanel === 'graphs' && styles['sidebar__button--active'],
        )}
      >
        {isChartsLoading ? (
          <SyncIcon className={styles['sidebar__button-icon--spinning']} />
        ) : (
          <BarChartIcon />
        )}
      </StyledIconButtonWithTooltip>
      <StyledIconButtonWithTooltip
        aria-label={t('layers')}
        aria-pressed={activePanel === 'layers'}
        tooltipText={t('layers')}
        tooltipPlacement="right"
        onClick={() => onTogglePanel('layers')}
        className={clsx(
          styles['sidebar__button'],
          activePanel === 'layers' && styles['sidebar__button--active'],
        )}
      >
        <LayersIcon />
      </StyledIconButtonWithTooltip>
    </nav>
  )
}

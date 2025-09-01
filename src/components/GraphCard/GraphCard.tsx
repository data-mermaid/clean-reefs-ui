import { Card } from '@mui/material'
import styles from './GraphCard.module.scss'
import Plot from 'react-plotly.js'
import { useTranslation } from 'react-i18next'
import { plotlyTheme } from './plotlyTheme'
import { ChartedData } from '../../utils/updateGraph'

interface GraphCardProps {
  graphName: string
  graphData: ChartedData[] | null
}
//TODO: Re-implement closed/open graph card and associated styling for mobile/desktop
export default function GraphCard({ graphData, graphName }: GraphCardProps) {
  const { t } = useTranslation()
  return (
    graphData && (
      <Card onClick={() => {}} className={styles['graph-card']}>
        {/*{!open ? (*/}
        {/*  t(graphName)*/}
        {/*) : (*/}
        <Plot
          data={graphData}
          className={styles['graph-plots']}
          config={plotlyTheme.config}
          layout={{ title: t(graphName), barmode: 'stack', ...plotlyTheme.layout }}
        />
        {/*)}*/}
      </Card>
    )
  )
}

import { Card } from '@mui/material'
import styles from './GraphCard.module.scss'
import Plot from 'react-plotly.js'
import { useTranslation } from 'react-i18next'
import { plotlyTheme } from './plotlyTheme'

interface GraphCardProps {
  graphName: string
  graphData: object
}

export default function GraphCard({ graphData, graphName }: GraphCardProps) {
  const { t } = useTranslation()
  return (
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
}

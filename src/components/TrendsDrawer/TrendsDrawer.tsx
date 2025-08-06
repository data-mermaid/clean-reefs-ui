import { Card, IconButton } from '@mui/material'
import StyledSwipeableDrawer from '../StyledSwipeableDrawer/StyledSwipeableDrawer'
import { useTranslation } from 'react-i18next'
import Plot from 'react-plotly.js'
import { useState } from 'react'
import CloseIcon from '@mui/icons-material/Close'

const graphData = [
  {
    x: ['giraffes', 'orangutans', 'monkeys'],
    y: [20, 14, 23],
    type: 'bar',
    title: 'graphs.contributing_watersheds',
  },
]

export default function TrendsDrawer() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const handleCardClick = () => {
    setOpen(!open)
  }

  const GraphPlaceholder = (graphName: string) => (
    <Card
      onClick={handleCardClick}
      style={{
        display: open ? 'block' : 'inline-block',
        float: open ? 'none' : 'left',
        width: open ? '' : '300px',
        height: open ? 'auto' : '55px',
        backgroundColor: '#FAFBFC', //TODO
        marginRight: open ? '' : '5px',
        margin: open ? '0 auto 10px' : '10px',
        padding: '10px',
      }}
    >
      {open && (
        <Plot
          data={graphData}
          layout={{ margin: '0 auto', width: '350', title: { text: { graphName } } }}
        />
      )}
    </Card>
  )

  return (
    // desktop
    // <StyledDrawer variant="persistent"></StyledDrawer>

    // mobile
    <StyledSwipeableDrawer variant="permanent" anchor="bottom" open={open} onClose={() => {}}>
      <div
        style={{
          fontSize: '16px',
          fontWeight: '700',
          position: 'sticky',
          top: -8,
          left: 0,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <h2>{t('global_trends')}</h2>
        {open && (
          <IconButton aria-label={t('buttons.close')} onClick={handleCardClick}>
            <CloseIcon />
          </IconButton>
        )}
      </div>

      <div
        style={{
          overflowY: open ? 'scroll' : 'hidden',
          height: open ? '100vh' : '90px',
          width: open ? '100%' : 'max-content',
        }}
      >
        {GraphPlaceholder('Ecosystem extent exposed')}
        {GraphPlaceholder('Land use through time')}
        {GraphPlaceholder('Ecosystem')}
        {GraphPlaceholder('extent exposed')}
      </div>
    </StyledSwipeableDrawer>
  )
}

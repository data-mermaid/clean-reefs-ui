import { Stack } from '@mui/material'
import StyledSwipeableDrawer from '../StyledSwipeableDrawer/StyledSwipeableDrawer'
import StyledDrawer from '../StyledDrawer/StyledDrawer'
import { useTranslation } from 'react-i18next'
import Plot from 'react-plotly.js'

const graphs = [
  {
    data: [],
    title: 'graphs.contributing_watersheds',
  },
]
const graphData = [
  {
    x: ['giraffes', 'orangutans', 'monkeys'],
    y: [20, 14, 23],
    type: 'bar',
  },
]

const GraphPlaceholder = (graphName: string) => (
  <div
    style={{
      display: 'inline-block',
      float: 'left',
      width: '300px',
      height: '55px',
      backgroundColor: '#FAFBFC',
      marginRight: '5px',
      padding: '10px',
      borderRadius: '5px',
    }}
  >
    <h3>{graphName}</h3>
    {/*<Plot data={graphData} layout={{ width: 320, title: {text: 'LULC Usage'}}}>{graphName}</Plot>*/}
  </div>
)

export default function TrendsDrawer() {
  const { t } = useTranslation()

  return (
    // desktop
    // <StyledDrawer variant="persistent"></StyledDrawer>

    // mobile
    <StyledSwipeableDrawer anchor="bottom" open={true} onOpen={() => {}} onClose={() => {}}>
      <h2 style={{ fontSize: '18px', fontWeight: '700', position: 'sticky', top: -8, left: 0 }}>
        {t('global_trends')}
      </h2>

      <div
        style={{
          overflowY: 'hidden',
          maxHeight: '90px',
          width: 'max-content',
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

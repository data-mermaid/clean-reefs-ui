import { PlotParams } from 'react-plotly.js'

export const plotlyTheme: Partial<PlotParams> = {
  layout: {
    barmode: 'stack',
    bargap: 0.1,
    height: 500,
    autosize: true,
    margin: {
      l: 60,
      t: 80,
      r: 20,
      b: 60,
    },
    dragmode: false,
    xaxis: {
      fixedrange: true,
      linecolor: 'black',
      linewidth: 1,
      title: { standoff: 5 },
    },
    yaxis: {
      fixedrange: true,
      linecolor: 'black',
      linewidth: 1,
      title: { standoff: 5 },
    },
    showlegend: true,
    legend: {
      orientation: 'h',
      y: -0.25,
      font: {
        size: 12,
      },
    },
    modebar: {
      orientation: 'h',
      remove: [
        'zoom2d',
        'pan2d',
        'select2d',
        'lasso2d',
        'zoomIn2d',
        'zoomOut2d',
        'autoScale2d',
        'resetScale2d',
      ],
    },
  },
  config: {
    staticPlot: false,
    displaylogo: false,
    responsive: true,
    displayModeBar: true,
  },
}

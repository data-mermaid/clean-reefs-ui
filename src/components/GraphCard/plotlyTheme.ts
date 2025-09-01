export const plotlyTheme = {
  layout: {
    width: '100%',
    xaxis: {
      title: { standoff: 5 },
    },
    yaxis: {
      title: { standoff: 5 },
    },
    showlegend: true,
    legend: {
      orientation: 'v',
      x: 2,
      y: 10,
    },
  },
  config: {
    staticPlot: false,
    toImageButtonOptions: {
      filename: 'lulc_graph_temp',
    },
    modeBarButtonsToRemove: [
      'zoom2d',
      'pan2d',
      'select2d',
      'lasso2d',
      'zoomIn2d',
      'zoomOut2d',
      'autoScale2d',
      'resetScale2d',
    ],
    displaylogo: false,
    responsive: true,
    displayModeBar: true,
  },
}

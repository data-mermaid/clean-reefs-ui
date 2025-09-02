export const plotlyTheme = {
  layout: {
    barmode: 'stack',
    bargap: 0.1,
    height: 400,
    autosize: true,
    margin: {
      l: 60,
      t: 30,
      r: 20,
      b: 50,
    },
    width: 280,
    dragmode: false,

    xaxis: {
      fixedrange: true,
      linecolor: 'black',
      linewidth: 1,
    },
    yaxis: {
      fixedrange: true,
      linecolor: 'black',
      linewidth: 1,
    },
    showlegend: true,
    legend: {
      orientation: 'h',
      xanchor: 'center',
      x: 0.25,
      y: -0.25,
      font: {
        size: 9,
      },
    },
    modebar: {
      orientation: 'v',
    },
  },
  config: {
    staticPlot: false,
    toImageButtonOptions: {
      filename: 'lulc_graph_temp', //todo: update to match each graph (MVP+)
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

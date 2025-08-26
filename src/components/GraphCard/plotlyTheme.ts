export const plotlyTheme = {
  chartCategoryType: {
    bare_ground: '#FEFECC',
    shrubland_grassland: '#B0B006',
    mixed_forest: '#609C30',
    high_canopy_forest: '#065106',
    surface_water: '#0E39D6',
    cropland: '#FF7D00',
    built_up: '#64DCDC',
  },
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

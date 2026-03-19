# Clean Reefs

UI package for the Global Pollution Watch application - a map-based utility for exploring global pollution data layers. Powered by MERMAID in conjunction with the University of Australia.

## Getting started

Create a `.env` file based off of `.env.example`. [Sign up for Maptiler](https://cloud.maptiler.com/auth/widget?next=https://cloud.maptiler.com/maps/) to create an API key to use in order to render the base map.

- `yarn install`
- `yarn start`
- Builds to `http://localhost:5173`

## Setup notes

mapData.ts holds the main configurations.
The layerId in mapData is used to identify an associated legend and chart, if they exist.

The watersheds data source is used by both a vector layer for outlines and a vector layer for fills. The fills layer updates for sediment export and other layers as needed.

## Code contribution styles:

DRY, re-usable components that can be unit tested. Basic components (Button, Input, Card or other components generally without children) to be visually tested using Storybook.
Use MUI components and style guidelines.

Use SCSS modules to override MUI styling. Most MUI components have a CSS class on the API to be used for overriding styles, which should be used as the target for the SCSS module.
Examples:

- `.MuiDrawer-root`
- `.MuiButton-paper`

Overriding MUI component classes, applied to the component example:

```
classes={{
        root: styles["MuiDrawer-root"],
        paper: styles["MuiDrawer-paper"],
        modal: styles["MuiDrawer-modal"]
      }}
```

We utilize the [BEM naming syntax](https://getbem.com/naming/) for everything beyond the MUI overrides.
BEM naming syntax: `.Mui<MuiComponentNameHere>__<subComponent>--state`
Examples:

- `.TrendsDrawer--open`
- `.form__submit--disabled`

MUI components consist of multiple components and usually render out several children `divs` with subcomponent class names.

Theme style constants go into the `theme.scss` style sheet including:

- colors
- spacing (padding, margins)
- font details
- z-indexes
- heights

Data constants go into 'constants.ts', which include:

- Links
- Data used across the app (years, etc)

## Data Sources

Both raster and vector data types are in use.
Rasters are provided through COGs in TIF format
Vectors are provided via PMTiles
Map clicks check within polygons given (PMTiles) and send requests accordingly

Sediment exposure data is given through the Zonal Stats API

- (API docs)[https://api.zonalstats.datamermaid.org/docs]
- (API Concepts / Property breakdowns)[https://data-mermaid.github.io/zonal-stats/concepts/statistics/]
- (mermaid-zonal-stats-ui repository)[https://github.com/data-mermaid/mermaid-zonal-stats-ui]

## Tests

### Unit tests

Write out tests for functions targeting main and edge cases. Use Jest and React Testing Library.

- `yarn test`

### Visual tests

Use Storybook stories. [Writing Storybook tests and types of tests](https://storybook.js.org/docs/writing-tests)

- `yarn storybook`
- Builds to `http://localhost:6006/`

## Terminology

To enable consistent communications, the terminology used refers to the following:

- Series: A group of related data points
- Trace: A singular set of data points within a series

## Adding more data layers

Add the corresponding data object in layers in mapData.ts in the order of preference for rendering.

## More Resources

- [Translation best practices](https://github.com/data-mermaid/mermaid-webapp/blob/develop/docs/TranslationBestPractices.md)
- [Styling guidelines using BEM methodology](https://github.com/data-mermaid/mermaid-webapp/blob/develop/docs/StylingGuidelines.md)
- [BEM naming guide](https://getbem.com/naming/)

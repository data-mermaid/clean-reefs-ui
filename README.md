# Clean Reefs

Clean Reefs - a map-based utility for exploring global pollution data layers in the context of identifying ideal coral reef restoration locations. This utility provides visual access to navigate data layers throughout time and associated metrics. Powered by MERMAID in conjunction with University of Australia.

## Getting started

Create a `.env` file based off of `.env.example`. [Sign up for Maptiler](https://cloud.maptiler.com/auth/widget?next=https://cloud.maptiler.com/maps/) to create an API key to use in order to render the base map.

- `yarn install`
- `yarn start`
- Builds to `http://localhost:5173`

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

## Tests

### Unit tests

Write out tests for functions targetting main and edge cases. Use Jest and React Testing Library.

- `yarn test`

### Visual tests

Use Storybook stories. [Writing Storybook tests and types of tests](https://storybook.js.org/docs/writing-tests)

- `yarn storybook`
- Builds to `http://localhost:6006/`

## Terminology

To enable consistent communications, the terminology used refers to the following:

- Series: A group of related data points
- Trace: A singular set of data points within a series

## More Resources

- [Translation best practices](https://github.com/data-mermaid/mermaid-webapp/blob/develop/docs/TranslationBestPractices.md)
- [Styling guidelines using BEM methodology](https://github.com/data-mermaid/mermaid-webapp/blob/develop/docs/StylingGuidelines.md)
- [BEM naming guide](https://getbem.com/naming/)

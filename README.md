# Clean Reefs

UI package for the Clean Reefs application - a map-based utility for exploring global pollution data layers. Powered by MERMAID in conjunction with the University of Australia.

## Getting started

- `yarn install`
- `yarn start`
- Builds to `localhost:5173`

## Code focuses:

DRY, re-usable components that can be unit tested. Basic components (Button, Input, Card or other components generally without children) to be visually tested using Storybook.
Use MUI components and style guidelines.

Use SCSS modules to override MUI styling. SCSS syntax for a class name:
`.Mui<MuiComponentNameHere>-<SubComponent>`
Examples:
`.MuiSwipeableDrawer-root`
`.MuiButton-paper`

## More Resources

- [Translation best practices](https://github.com/data-mermaid/mermaid-webapp/blob/develop/docs/TranslationBestPractices.md)
- [Styling guidelines using BEM methodology](https://github.com/data-mermaid/mermaid-webapp/blob/develop/docs/StylingGuidelines.md)

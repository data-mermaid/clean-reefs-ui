# Clean Reefs

UI package for the Clean Reefs application - a map-based utility for exploring global pollution data layers. Powered by MERMAID in conjunction with the University of Australia.

## Getting started

- `yarn install`
- `yarn start`
- Builds to `http://localhost:5173`

## Code focuses:

DRY, re-usable components that can be unit tested. Basic components (Button, Input, Card or other components generally without children) to be visually tested using Storybook.
Use MUI components and style guidelines.

Use SCSS modules to override MUI styling. Class name syntax:
`.Mui<MuiComponentNameHere>-<subComponent>`

Examples:
`.MuiDrawer-root`
`.MuiButton-paper`

Add classes to the MUI component files example:

```
classes={{
        root: styles["MuiDrawer-root"],
        paper: styles["MuiDrawer-paper"],
        modal: styles["MuiDrawer-modal"]
      }}
```

MUI components consist of multiple components and usually render out several children `divs` with subcomponent class names.

## Visual tests

Use Storybook stories. [Writing Storybook tests...](https://storybook.js.org/docs/writing-tests)

- `yarn storybook`
- Builds to `http://localhost:6006/`

## More Resources

- [Translation best practices](https://github.com/data-mermaid/mermaid-webapp/blob/develop/docs/TranslationBestPractices.md)
- [Styling guidelines using BEM methodology](https://github.com/data-mermaid/mermaid-webapp/blob/develop/docs/StylingGuidelines.md)

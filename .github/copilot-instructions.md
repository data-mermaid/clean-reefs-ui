When adding comments to code, follow these guidelines:

- Be concise and clear.
- If the same issue is present in multiple locations within the same file, add the comment only once at the first occurrence with references to the other locations.
- Keep amount of comments lower than 6 per pull request, prioritizing the most critical ones.

## Core Intent

- Respect the existing architecture and coding standards.
- Prefer readable, explicit solutions over clever shortcuts.
- Extend current abstractions before inventing new ones.
- Prioritize maintainability and clarity, short methods and classes, clean code.

## Formatting & Style

- Run the repository's lint/format scripts (e.g., `yarn lint`) before submitting.
- Match the project's indentation, quote style, and trailing comma rules.
- Keep functions focused; extract helpers when logic branches grow.
- Favor immutable data and pure functions when practical.

## Testing Expectations

- Add or update unit tests with the project's framework and naming style.
- Expand integration or end-to-end suites when behavior crosses modules or platform APIs.
- Run targeted test scripts for quick feedback before submitting.
- Avoid brittle timing assertions; prefer fake timers or injected clocks.
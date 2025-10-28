{
  "version": 1,
  "prompt": {
    "description": "Custom Copilot instructions for this repository",
    "context": {
      "style": "Use concise, modern TypeScript with ES6+ syntax. Focus on human legibility and understanding.",
      "documentation": "Add JSDoc comments for all exported functions.",
      "testing": "Prefer Jest for unit tests; include example tests where relevant."
    },
    "examples": [
      {
        "code": "function getUserName(user) { return user.name; }",
        "comment": "Simple, clear function naming preferred."
      }
    ]
  }
}

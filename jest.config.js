export default {
  restoreMocks: true,
  transformIgnorePatterns: [
    '<rootDir>/node_modules/(?!(@iconify-icons|@reach|@fontsource)/.*)', // ignore transforming node_modules except for the libraries inside the inner brackets
  ],
  // testEnvironment: 'jest-environment-jsdom',
  // setupFiles: ['dotenv/config'],
  setupFilesAfterEnv: ['<rootDir>/src/tests/setupTests.ts'],
  transform: {
    '^.+\\.[t|j]sx?$': 'babel-jest',
    '^.+\\.js$': 'babel-jest',
  },
}

export default {
  restoreMocks: true,
  transformIgnorePatterns: [
    '<rootDir>/node_modules/(?!(@iconify-icons|@reach|@fontsource)/.*)', // ignore transforming node_modules except for the libraries inside the inner brackets
  ],
  moduleNameMapper: {
    '^.+\\.svg$': 'jest-svg-transformer',
    '^.+\\.(css|less|scss|png)$': 'identity-obj-proxy',
    '@fontsource/open-sans': 'identity-obj-proxy',
  },
  // testEnvironment: 'jest-environment-jsdom',
  // setupFiles: ['dotenv/config'],
  setupFilesAfterEnv: ['<rootDir>/src/tests/setupTests.ts'],
  transform: {
    '^.+\\.[t|j]sx?$': 'babel-jest',
    '^.+\\.js$': 'babel-jest',
  },
}

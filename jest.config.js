export default {
  restoreMocks: true,
  transformIgnorePatterns: [
    '<rootDir>/node_modules/(?!(@iconify-icons|@reach|@fontsource|uuid)/.*)', // ignore transforming node_modules except for the libraries inside the inner brackets
  ],
  moduleNameMapper: {
    '^.+\\.svg$': 'jest-svg-transformer',
    '^.+\\.(css|less|scss|png)$': 'identity-obj-proxy',
    '@fontsource/titillium-web': 'identity-obj-proxy',
  },
  // setupFilesAfterEnv: ['<rootDir>/src/tests/setupTests.ts'],
  transform: {
    '^.+\\.[t|j]sx?$': 'babel-jest',
    '^.+\\.js$': 'babel-jest',
  },
}

import storybook from 'eslint-plugin-storybook'
import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y'
import { globalIgnores } from 'eslint/config'

export default tseslint.config(
  [
    globalIgnores(['dist', 'node_modules', '.storybook']),
    {
      files: ['**/*.{js,ts,tsx}'],
      plugins: {
        react,
      },
      settings: { react: { version: 'detect' } },
      rules: {
        camelcase: 'off',
        curly: 'error',

        'react/jsx-key': [
          1,
          {
            checkFragmentShorthand: true,
          },
        ],

        'no-underscore-dangle': 'off',
        'react/jsx-props-no-spreading': 'off',
        'react/jsx-boolean-value': 'off',
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'error', // please never override this rule, even locally

        // 'no-console': ['error', { allow: ['warn', 'error'] }],
        'no-undef-init': 'error',

        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            varsIgnorePattern: '^_',
            argsIgnorePattern: '^_',
          },
        ],

        'no-useless-return': 'off',

        'jsx-a11y/label-has-associated-control': [
          'error',
          {
            assert: 'either',
          },
        ],
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-explicit-any': 'error',
        'no-param-reassign': 'error',
        'max-nested-callbacks': ['error', { max: 3 }],
        'consistent-return': 'error',
      },
      extends: [
        js.configs.recommended,
        tseslint.configs.recommended,
        reactHooks.configs['recommended-latest'],
        reactRefresh.configs.vite,
        jsxA11yPlugin.flatConfigs.recommended,
      ],
      languageOptions: {
        ecmaVersion: 2020,
        globals: globals.browser,
      },
    },
  ],
  storybook.configs['flat/recommended'],
)

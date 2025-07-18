import storybook from "eslint-plugin-storybook"
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y'
import reactPlugin from 'eslint-plugin-react'

import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import {globalIgnores} from 'eslint/config'

export default tseslint.config([
    globalIgnores(['dist']),
    {
        files: ['**/*.{ts,tsx}'],
        rules: {
            camelcase: 'off',
            curly: 'error',

            'no-underscore-dangle': 'off',
            'react/jsx-props-no-spreading': 'off',
            'react/jsx-boolean-value': 'off',
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'error', // please never override this rule, even locally

            'no-console': ['error', {allow: ['warn', 'error']}],
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
            'no-param-reassign': 'error',
            'react/no-danger': 'error',
            'max-nested-callbacks': ['error', {max: 3}],
            'consistent-return': 'error',
        },
        extends: [
            js.configs.recommended,
            tseslint.configs.recommended,
            reactPlugin.configs.flat.recommended,
            jsxA11yPlugin.flatConfigs.recommended,
            reactHooks.configs['recommended-latest'],
            reactRefresh.configs.vite,
        ],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
            parserOptions: {
                project: ['./tsconfig.node.json', './tsconfig.app.json'],
                tsconfigRootDir: import.meta.dirname,
            }
        },
    },
], storybook.configs["flat/recommended"]);

// @ts-check

import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import vitest from '@vitest/eslint-plugin'

export default tseslint.config(
  {
    ignores: ['.git/', 'node_modules/', 'dist/', '*.config.*', 'src/generated/'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  vitest.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
    },
  },
)

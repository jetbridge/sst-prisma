import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    ignores: ['.sst', 'web', 'common/generated/graphql'],
  },
  {
    rules: {
      '@typescript-eslint/explicit-module-boundary-types': 0,
      '@typescript-eslint/no-unused-vars': 0,
      '@typescript-eslint/no-non-null-assertion': 0,
      '@typescript-eslint/no-empty-interface': 0,
      '@typescript-eslint/no-explicit-any': 0,
      '@typescript-eslint/no-unsafe-assignment': 0,
      '@typescript-eslint/no-unsafe-argument': 0,
      '@typescript-eslint/no-unsafe-member-access': 0,
      '@typescript-eslint/no-unsafe-call': 0,
      '@typescript-eslint/triple-slash-reference': 0,
      '@typescript-eslint/ban-types': 0,
      'no-case-declarations': 0,
      '@typescript-eslint/require-await': 1,
    },
  },
)

const next = require('@next/eslint-plugin-next')
const globals = require('globals')

module.exports = [
  {
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
    ignore: ['node_modules', '.next', '.vercel'],
    plugins: {
      next,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      'react/jsx-uses-vars': 'error',
    },
  },
]

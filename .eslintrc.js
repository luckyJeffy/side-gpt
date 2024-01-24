module.exports = {
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      impliedStrict: true,
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './web/tsconfig.json', './backend/tsconfig.json'],
  },
  plugins: ['react-hooks', '@typescript-eslint'],
  rules: {
    'no-console': [
      'warn',
      {
        allow: ['error', 'warn'],
      },
    ],
    'no-empty-function': 'off',
    'no-unused-vars': 'off',
    'prefer-const': [
      'error',
      {
        destructuring: 'all',
      },
    ],

    'react-hooks/exhaustive-deps': 'error',

    '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
    '@typescript-eslint/consistent-type-exports': [
      'error',
      {
        fixMixedExportsWithInlineTypeSpecifier: true,
      },
    ],
    '@typescript-eslint/consistent-type-imports': ['error'],
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-this-alias': 'off',
  },
}

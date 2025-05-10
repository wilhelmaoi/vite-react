module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-native/all',
    'plugin:jsx-a11y/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'prettier', // 避免 ESLint 和 Prettier 冲突
  ],
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    requireConfigFile: false,
  },
  plugins: ['react', 'react-native', 'jsx-a11y'],
  rules: {
    'react/react-in-jsx-scope': 'off', // react 17+ 不再需要 import React
    'react-native/no-raw-text': 'warn', // 👈 这里就是检查裸字符串的规则
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};

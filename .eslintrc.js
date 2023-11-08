module.exports = {
  extends: 'standard',
  rules: {
    camelcase: 'off',
    indent: ['error', 2, { VariableDeclarator: 'first', SwitchCase: 1 }],
    quotes: ['error', 'single', { allowTemplateLiterals: true }],
    'comma-dangle': 'off',
    'space-before-function-paren': 'off',
    'no-debugger': 'off',
    'no-var': 'error',
    'one-var': 'off',
    'eol-last': 'off',
    'prefer-const': 'off',
    'no-return-assign': 'off',
    'no-template-curly-in-string': 'off'
  },
  parserOptions: {
    ecmaVersion: 2020
  }
}

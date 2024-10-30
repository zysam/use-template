module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:node/recommended"
  ],
  parserOptions: {
    ecmaVersion: 2022,
  },
  rules: {
    "no-console": "warn",
    "no-unused-vars": "warn",
    "node/no-unsupported-features/es-syntax": "off",
    "node/no-missing-import": "off",
  }
};

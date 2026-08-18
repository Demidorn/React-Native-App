// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
    // Let ESLint resolve TS path aliases (like '@/...') using the TypeScript resolver.
    // Requires: npm i -D eslint-import-resolver-typescript
    settings: {
      'import/resolver': {
        typescript: {
          // always try to resolve types under `<root>@types` directory even it doesn't contain source code
          alwaysTryTypes: true,
        },
      },
    },
  },
]);

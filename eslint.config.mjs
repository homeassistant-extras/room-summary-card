import { createCardEslintConfig } from '@homeassistant-extras/config/eslint/card';

export default createCardEslintConfig({
  tsconfigRootDir: import.meta.dirname,
  ignores: [
    'e2e/**',
    'playwright-report/**',
    'test-results/**',
    'test/**/*.mjs',
  ],
});

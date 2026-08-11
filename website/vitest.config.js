import { mergeConfig, defineConfig } from 'vitest/config'

import viteConfig from './vite.config.js'

export default mergeConfig(viteConfig, defineConfig({
  test: {
    include: ['tests/**/*.spec.js'],
    exclude: ['tests/e2e/**'],
  },
}))

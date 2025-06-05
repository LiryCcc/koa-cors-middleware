import { defineConfig } from 'vitest/config';

const vitestConfig = defineConfig({
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    }
  }
});

export default vitestConfig;

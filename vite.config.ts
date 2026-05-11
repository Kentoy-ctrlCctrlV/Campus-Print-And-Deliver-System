import { defineConfig } from '@angular-devkit/build-angular';

export default defineConfig({
  build: {
    rollupOptions: {
      external: ['@prisma/client', '.prisma/client'],
    },
  },
  ssr: {
    external: ['@prisma/client', '.prisma/client'],
  },
  optimizeDeps: {
    exclude: ['@prisma/client', '.prisma/client'],
  },
  server: {
    fs: {
      allow: ['.']
    }
  },
});
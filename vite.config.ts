import { defineConfig } from 'vite'
import path from 'path';
import react from '@vitejs/plugin-react'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'; 

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), cssInjectedByJsPlugin()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'decent-portal',
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        dir: 'dist',
        globals: { 
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        pure_funcs: ['assert', 'assertNonNullable', 'assertTruthy', 'botch']
      }
    },
    sourcemap: true
  }
});

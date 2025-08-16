import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const isDev = command === 'serve' || mode === 'development'
  
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    // Only add dev server config in development
    ...(isDev && {
      server: {
        // https://bebb4783defa.ngrok-free.app
        allowedHosts: ['bebb4783defa.ngrok-free.app'],
        proxy: {
          '/sc': {
            target: 'https://api-v2.soundcloud.com',
            changeOrigin: true,
            secure: true,
            rewrite: (path) => path.replace(/^\/sc/, ''),
          },
          '/sc1': {
            target: 'https://api.soundcloud.com',
            changeOrigin: true,
            secure: true,
            rewrite: (path) => path.replace(/^\/sc1/, ''),
          },
          '/scm': {
            target: 'https://cf-media.sndcdn.com',
            changeOrigin: true,
            secure: true,
            rewrite: (path) => path.replace(/^\/scm/, ''),
          },
          '/schls': {
            target: 'https://cf-hls-media.sndcdn.com',
            changeOrigin: true,
            secure: true,
            rewrite: (path) => path.replace(/^\/scm/, ''),
          },
          // Playback CDN de SoundCloud para HLS (.m3u8, .m4s)
          '/scpb': {
            target: 'https://playback.media-streaming.soundcloud.cloud',
            changeOrigin: true,
            secure: true,
            rewrite: (path) => path.replace(/^\/scpb/, ''),
          },
        },
      },
    }),
    // Production optimizations
    build: {
      minify: 'esbuild', // Faster than terser, included with Vite
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          },
        },
      },
    },
  }
})

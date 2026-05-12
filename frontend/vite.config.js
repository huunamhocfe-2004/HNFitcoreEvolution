import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],
    server: {
        port: 5173,
        host: true,
        allowedHosts: true,
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:5005',
                changeOrigin: true,
            },
            '/uploads': {
                target: 'http://127.0.0.1:5005',
                changeOrigin: true,
            },
            '/socket.io': {
                target: 'http://127.0.0.1:5005',
                changeOrigin: true,
                ws: true,
            }
        }
    }
})

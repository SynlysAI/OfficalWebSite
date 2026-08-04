import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',  // 监听所有网络接口，允许外部电脑访问
    port: 5175,       // 固定端口，方便外部访问
  },
})

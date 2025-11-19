import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages 部署关键配置
  // 必须与你的仓库名称一致，开头和结尾都要有斜杠
  base: '/NanoPixel-3D/', 
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
})
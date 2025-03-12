import { defineConfig
  /*, loadEnv */
  } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  console.log(mode)
  // Nạp các biến môi trường từ file `.env`
  // const env = loadEnv(mode, process.cwd())
  return {
    plugins: [react()],
    define: {
      "process.env": {},
    },
  }
})

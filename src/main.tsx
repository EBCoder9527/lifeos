import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { initApp } from './db/init'

const root = createRoot(document.getElementById('root')!)

function render() {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  )
}

// 先渲染，不阻塞 UI
render()

// 后台初始化数据库
initApp().catch((err) => {
  console.error('[LifeOS] initApp failed:', err)
})

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

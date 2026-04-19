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

initApp()
  .then(render)
  .catch((err) => {
    console.error('[LifeOS] initApp failed, rendering anyway:', err)
    render()
  })

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

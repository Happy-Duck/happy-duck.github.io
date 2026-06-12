import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MotionConfig } from 'framer-motion'
import './index.css'
import App from './App.jsx'
import { OceanDepthProvider } from './context/OceanDepthContext.jsx'
import { MouseProvider      } from './context/MouseContext.jsx'

window.history.scrollRestoration = 'manual'
window.scrollTo(0, 0)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <OceanDepthProvider>
        <MouseProvider>
          <App />
        </MouseProvider>
      </OceanDepthProvider>
    </MotionConfig>
  </StrictMode>,
)

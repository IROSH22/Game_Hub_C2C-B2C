import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initSecurityShield } from './utils/securityShield'

// Initialize Production Developer Mode Lockdown & Anti-Tamper Shield
initSecurityShield();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

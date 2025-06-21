import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, HashRouter} from 'react-router'
import AppRoutes from './config/MyRoutes.jsx'
import { ChatProvider } from './context/ChatContext.jsx'

createRoot(document.getElementById('root')).render(
  <HashRouter>
    <Toaster />
    <ChatProvider>
      <AppRoutes />
    </ChatProvider>
  </HashRouter>
)

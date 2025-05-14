import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { ChannelProvider } from './context/ChannelContext'
import { MessageProvider } from './context/MessageContext'
import { SocketProvider } from './context/SocketContext'
import { BrowserRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <ChannelProvider>
            <MessageProvider>
              <App />
            </MessageProvider>
          </ChannelProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
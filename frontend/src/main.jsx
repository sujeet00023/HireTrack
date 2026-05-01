import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--surface)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            fontSize: '13px',
            fontFamily: 'var(--font)',
          },
          success: {
            iconTheme: { primary: '#34D399', secondary: 'var(--surface)' },
          },
          error: {
            iconTheme: { primary: '#F87171', secondary: 'var(--surface)' },
          },
          duration: 3000,
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)

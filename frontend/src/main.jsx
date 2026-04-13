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
                position="top-right"
                toastOptions={{
                    style: {
                        background: '#1a1a1a',
                        color: '#fff',
                        border: '1px solid #333',
                    },
                    success: { iconTheme: { primary: '#eab308', secondary: '#000' } },
                    error: { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
                }}
            />
        </BrowserRouter>
    </React.StrictMode>
)

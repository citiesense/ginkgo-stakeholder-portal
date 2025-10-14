import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { initIdentity } from './lib/identity'

initIdentity()
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>)

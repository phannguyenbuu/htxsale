import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import axios from 'axios'

const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const apiBaseURL = import.meta.env.VITE_API_BASE_URL || (isLocalHost ? 'https://sale.quanlyhtx.com' : '/');
axios.defaults.baseURL = apiBaseURL;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

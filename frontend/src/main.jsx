import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import axios from 'axios'

const rawApiBaseURL = import.meta.env.VITE_API_BASE_URL || 'https://sale.quanlyhtx.com';
const apiBaseURL = String(rawApiBaseURL).replace(/\/+$/, '');

// Always use apiBaseURL from ENV
axios.defaults.baseURL = apiBaseURL;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

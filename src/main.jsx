import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import 'dayjs/locale/th'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import './index.css'

const theme = createTheme({
  palette: {
    primary: { main: '#2563eb' },
    background: { default: '#f4f6f8' },
  },
  typography: {
    fontFamily: '"Noto Sans Thai", "Inter", system-ui, sans-serif',
  },
  shape: { borderRadius: 12 },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
        <AuthProvider>
          <App />
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  </React.StrictMode>
)

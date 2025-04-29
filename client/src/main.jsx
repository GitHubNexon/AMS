import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.jsx'
import { SplashProvider } from './context/SplashContext.jsx'
import { MiscContextProvider } from './context/MiscContext.jsx'
import { LoaderProvider } from './context/useLoader.jsx'
import FileHandlerProvider from './context/FileHandlerContext.jsx'
import { DataPreloadProvider } from './context/DataPreloader.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LoaderProvider>
      <SplashProvider>
        <AuthProvider>
          <MiscContextProvider>
            <FileHandlerProvider>
              <DataPreloadProvider>
                <App />
              </DataPreloadProvider>
            </FileHandlerProvider>
          </MiscContextProvider>
        </AuthProvider>
      </SplashProvider>
    </LoaderProvider>
  </StrictMode>,
)

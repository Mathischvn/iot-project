import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import RoutesRoot from "@/RoutesRoot.tsx";
import {AuthProvider} from "@/components/auth/contexte/AuthContext.tsx";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <BrowserRouter>
          <AuthProvider>
            <RoutesRoot />
          </AuthProvider>
      </BrowserRouter>
  </StrictMode>,
)

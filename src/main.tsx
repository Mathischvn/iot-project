import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import RoutesRoot from "@/RoutesRoot.tsx";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <BrowserRouter>
          <RoutesRoot />
      </BrowserRouter>
  </StrictMode>,
)

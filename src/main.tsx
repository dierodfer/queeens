import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Queeens from './app/Queeens';
import './app/Queeens.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Queeens />
  </StrictMode>,
);
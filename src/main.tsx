import { StrictMode } from 'react'
import * as ReactDOMClient from 'react-dom/client'
import App from './App'

const container = document.getElementById('root');

// Resolve createRoot method defensively across bundling formats
const createRoot = ReactDOMClient.createRoot || (ReactDOMClient as any).default?.createRoot;

if (container && typeof createRoot === 'function') {
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} else {
  console.error('Failed to resolve React createRoot function!');
}

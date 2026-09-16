import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './utils/tracking-simulator'
import { initClarity } from './utils/clarity'

initClarity();

createRoot(document.getElementById("root")!).render(<App />);

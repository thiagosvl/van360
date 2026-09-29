import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './utils/tracking-simulator'
import { initClarity } from './utils/clarity'
import { initAnalytics } from './utils/analytics'

initClarity();
initAnalytics();

createRoot(document.getElementById("root")!).render(<App />);

import { createRoot } from 'react-dom/client';
import { App } from './app.tsx';
import './index.css';
import { ThemeProvider } from './components/ThemeProvider'; // adjust the path if needed

const root = createRoot(document.getElementById('app')!);

root.render(
  <ThemeProvider defaultTheme="dark">
    <App />
  </ThemeProvider>
);

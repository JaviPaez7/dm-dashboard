import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import PlayerView from './components/PlayerView.jsx'
import { AuthProvider } from './context/AuthContext'

// Añade esta línea:
import { registerSW } from 'virtual:pwa-register'

// Y ejecutamos la función:
registerSW({ immediate: true })

const Root = () => {
  const path = window.location.pathname;
  
  if (path.startsWith('/player/')) {
    const dmId = path.split('/player/')[1].replace(/\//g, '');
    return <PlayerView dmId={dmId} />;
  }

  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)

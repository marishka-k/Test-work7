import { useState } from 'react';
import { LoginForm } from './components/LoginForm/LoginForm';
import { Messenger } from './components/Messenger/Messenger';
import type { Credentials } from './types';
import { loadCredentials, saveCredentials } from './utils/storage';

export function App() {
  const [creds, setCreds] = useState<Credentials | null>(loadCredentials);

  const login = (value: Credentials) => {
    saveCredentials(value);
    setCreds(value);
  };

  const logout = () => {
    saveCredentials(null);
    setCreds(null);
  };

  if (!creds) return <LoginForm onLogin={login} />;
  return <Messenger key={creds.idInstance} creds={creds} onLogout={logout} />;
}

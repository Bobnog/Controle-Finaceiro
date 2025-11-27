import React from 'react'; // Importa a biblioteca React para criar componentes de UI.
import { createRoot } from 'react-dom/client'; // Importa createRoot do react-dom/client para renderização concorrente.
import App from './App'; // Importa o componente principal da aplicação.
import './index.css'; // Importa os estilos CSS globais.

// Encontra o elemento DOM com o ID 'root', que é onde a aplicação React será montada.
const container = document.getElementById('root');

// Cria uma raiz de renderização React para o container.
// createRoot é o novo método de API para React 18+ que permite recursos como renderização concorrente.
const root = createRoot(container);

// Renderiza o componente principal <App /> dentro do elemento 'root' no DOM.
// <React.StrictMode> é um componente que ativa verificações adicionais e avisos durante o desenvolvimento
// para ajudar a identificar problemas potenciais.
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
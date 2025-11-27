import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

/**
 * Componente PrivateRoute: Protege rotas que só podem ser acessadas por usuários logados.
 * Se o usuário não estiver logado (isLogged é false), ele é redirecionado para a página de login.
 * @param {object} props - As propriedades do componente.
 * @param {React.ReactNode} props.children - Os componentes filhos que serão renderizados se o usuário estiver logado.
 * @param {boolean} props.isLogged - Estado que indica se o usuário está logado.
 */
const PrivateRoute = ({ children, isLogged }) => {
  // Se o usuário estiver logado, renderiza os filhos; caso contrário, redireciona para /login.
  return isLogged ? children : <Navigate to="/login" />;
};

/**
 * Componente AuthRoute: Protege rotas de autenticação (login/registro) para usuários já logados.
 * Se o usuário já estiver logado (isLogged é true), ele é redirecionado para a página principal (dashboard).
 * @param {object} props - As propriedades do componente.
 * @param {React.ReactNode} props.children - Os componentes filhos que serão renderizados se o usuário não estiver logado.
 * @param {boolean} props.isLogged - Estado que indica se o usuário está logado.
 */
const AuthRoute = ({ children, isLogged }) => {
  // Se o usuário estiver logado, redireciona para a raiz; caso contrário, renderiza os filhos.
  return isLogged ? <Navigate to="/" /> : children;
}


/**
 * Componente principal da aplicação.
 * Gerencia o estado de autenticação do usuário e as rotas da aplicação.
 */
export default function App() {
  // `logged` é o estado que indica se o usuário está autenticado.
  // Inicializa com base na existência de um 'token' no localStorage.
  const [logged, setLogged] = useState(!!localStorage.getItem('token'));

  /**
   * useEffect para sincronizar o estado 'logged' com o localStorage.
   * Verifica a existência do token no localStorage na inicialização e em mudanças externas (outras abas).
   */
  useEffect(() => {
    const checkToken = () => {
      setLogged(!!localStorage.getItem('token'));
    };
    // Verifica o token na montagem do componente.
    checkToken();
    // Adiciona um listener para o evento 'storage' para detectar mudanças de localStorage em outras abas/janelas.
    window.addEventListener('storage', checkToken);
    // Remove o listener quando o componente é desmontado para evitar vazamentos de memória.
    return () => window.removeEventListener('storage', checkToken);
  }, []); // O array vazio [] garante que este efeito roda apenas uma vez na montagem e na desmontagem.

  /**
   * Função para lidar com o sucesso do login.
   * Atualiza o estado 'logged' para true.
   */
  const handleLogin = () => {
    setLogged(true);
  };

  /**
   * Função para lidar com o logout.
   * Remove o 'token' do localStorage e atualiza o estado 'logged' para false.
   * Isso acionará o redirecionamento para a página de login via PrivateRoute.
   */
  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove o token de autenticação.
    setLogged(false); // Atualiza o estado para não logado.
  };

  return (
    // BrowserRouter: Habilita o roteamento do lado do cliente para a aplicação.
    <BrowserRouter>
      {/* Routes: Contém todas as definições de rota da aplicação. */}
      <Routes>
        {/* Rota para a página de login. */}
        <Route path="/login" element={
          <AuthRoute isLogged={logged}> {/* Protege esta rota para usuários já logados. */}
            <Login onLogin={handleLogin} /> {/* Renderiza o componente Login, passando a função handleLogin. */}
          </AuthRoute>
        } />
        {/* Rota para a página de registro. */}
        <Route path="/register" element={
          <AuthRoute isLogged={logged}> {/* Protege esta rota para usuários já logados. */}
            <Register /> {/* Renderiza o componente Register. */}
          </AuthRoute>
        } />
        {/* Rota para a página principal (dashboard). */}
        <Route
          path="/"
          element={
            <PrivateRoute isLogged={logged}> {/* Protege esta rota para usuários não logados. */}
              <Dashboard onLogout={handleLogout} /> {/* Renderiza o Dashboard, passando a função handleLogout. */}
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
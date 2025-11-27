import React, { useState } from "react";
import apiClient from '../api'; // Importa a instância configurada do Axios.
import { Link, useNavigate } from 'react-router-dom'; // Importa Link para navegação e useNavigate para redirecionamento programático.
import { Avatar, Button, CssBaseline, TextField, Grid, Box, Typography, Container } from '@mui/material'; // Componentes de UI do Material-UI.
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'; // Ícone de cadeado do Material-UI.
import { createTheme, ThemeProvider } from '@mui/material/styles'; // Para aplicar temas do Material-UI.

// Cria um tema padrão do Material-UI.
const defaultTheme = createTheme();

/**
 * Componente Login: Permite que os usuários façam login na aplicação.
 * @param {object} props - As propriedades do componente.
 * @param {function} props.onLogin - Função de callback executada após o login bem-sucedido.
 */
export default function Login({ onLogin }){
  // Estados para armazenar o email e a senha digitados pelo usuário, e mensagens de erro.
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  // Hook para navegação programática.
  const navigate = useNavigate();

  /**
   * Função para lidar com o envio do formulário de login.
   * @param {Event} e - O evento de submit do formulário.
   */
  async function submit(e){
    e.preventDefault(); // Previne o comportamento padrão de recarregar a página.
    setError(""); // Limpa qualquer erro anterior.

    // Cria um objeto URLSearchParams para formatar os dados para o endpoint de token (form-urlencoded).
    const form = new URLSearchParams();
    form.append("username", email);
    form.append("password", senha);
    
    try {
      // Envia uma requisição POST para o endpoint de token da API para autenticar o usuário.
      const { data } = await apiClient.post("/users/token", form, { 
        headers: { "Content-Type": "application/x-www-form-urlencoded" } // Define o tipo de conteúdo do cabeçalho.
      });
      localStorage.setItem("token", data.access_token); // Armazena o token de acesso no localStorage.
      onLogin(); // Chama a função onLogin passada por props para atualizar o estado de autenticação global.
      navigate("/"); // Redireciona o usuário para a página principal (dashboard) após o login.
    } catch (err) {
      // Em caso de erro na requisição (ex: credenciais inválidas), exibe a mensagem de erro.
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Erro no login. Verifique suas credenciais.");
      }
    }
  }

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs"> {/* Container principal do formulário, centralizado. */}
        <CssBaseline /> {/* Aplica um reset de CSS padrão do Material-UI. */}
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Ícone de cadeado para visualização. */}
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          {/* Título da página de login. */}
          <Typography component="h1" variant="h5">
            Entrar
          </Typography>
          {/* Formulário de login. */}
          <Box component="form" onSubmit={submit} noValidate sx={{ mt: 1 }}>
            {/* Campo de texto para o email. */}
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Endereço de Email"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={e => setEmail(e.target.value)} // Atualiza o estado 'email' ao digitar.
            />
            {/* Campo de texto para a senha. */}
            <TextField
              margin="normal"
              required
              fullWidth
              name="senha"
              label="Senha"
              type="password"
              id="senha"
              autoComplete="current-password"
              value={senha}
              onChange={e => setSenha(e.target.value)} // Atualiza o estado 'senha' ao digitar.
            />
            {/* Exibe mensagem de erro se houver. */}
            {error && (
              <Typography color="error" variant="body2" align="center" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
            {/* Botão de submit para realizar o login. */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Entrar
            </Button>
            {/* Link para a página de registro. */}
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link to="/register" variant="body2">
                  Não tem uma conta? Cadastre-se
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  )
}
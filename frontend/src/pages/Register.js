import React, { useState } from "react";
import apiClient from '../api'; // Importa a instância configurada do Axios.
import { useNavigate, Link } from 'react-router-dom'; // Importa useNavigate para redirecionamento e Link para navegação declarativa.
import { Avatar, Button, CssBaseline, TextField, Grid, Box, Typography, Container } from '@mui/material'; // Componentes de UI do Material-UI.
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'; // Ícone de cadeado do Material-UI.
import { createTheme, ThemeProvider } from '@mui/material/styles'; // Para aplicar temas do Material-UI.

// Cria um tema padrão do Material-UI.
const defaultTheme = createTheme();

/**
 * Componente Register: Permite que novos usuários se cadastrem na aplicação.
 */
export default function Register() {
  // Estados para armazenar o email e a senha digitados pelo usuário, e mensagens de erro.
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  // Hook para navegação programática.
  const navigate = useNavigate();

  /**
   * Função para lidar com o envio do formulário de registro.
   * @param {Event} event - O evento de submit do formulário.
   */
  async function handleSubmit(event) {
    event.preventDefault(); // Previne o comportamento padrão de recarregar a página.
    setError(""); // Limpa qualquer erro anterior.

    // Validação de comprimento da senha no frontend para feedback imediato ao usuário.
    if (senha.length < 4 || senha.length > 72) {
      setError("A senha deve ter entre 4 e 72 caracteres.");
      return;
    }

    try {
      // Envia uma requisição POST para o endpoint de registro da API.
      await apiClient.post("/users/register", {
        email: email,
        senha: senha,
      });
      // Navega para a página de login após o registro bem-sucedido.
      navigate("/login");
    } catch (err) {
      // Em caso de erro na requisição (ex: email já cadastrado), exibe a mensagem de erro.
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Ocorreu um erro ao tentar se cadastrar. Tente novamente.");
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
          {/* Título da página de registro. */}
          <Typography component="h1" variant="h5">
            Cadastrar
          </Typography>
          {/* Formulário de registro. */}
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
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
              autoComplete="new-password" // Sugere ao navegador que é uma nova senha.
              value={senha}
              onChange={e => setSenha(e.target.value)} // Atualiza o estado 'senha' ao digitar.
            />
            {/* Exibe mensagem de erro se houver. */}
            {error && (
              <Typography color="error" variant="body2" align="center">
                {error}
              </Typography>
            )}
            {/* Botão de submit para realizar o registro. */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Registrar
            </Button>
            {/* Link para a página de login. */}
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link to="/login" variant="body2">
                  Já tem uma conta? Entrar
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
import axios from "axios";

// Cria uma instância do Axios com configurações base.
// A URL base da API será lida de uma variável de ambiente.
// Em desenvolvimento, ela usará o valor padrão 'http://127.0.0.1:8000'.
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;

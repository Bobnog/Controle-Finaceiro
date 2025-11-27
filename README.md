# Controle Financeiro - Projeto Full Stack

Este é um projeto de controle financeiro pessoal, construído com um backend em FastAPI (Python) e um frontend em React (JavaScript).

## 💡 Visão Geral

O objetivo deste projeto é fornecer uma plataforma simples para que os usuários possam gerenciar suas finanças, cadastrando cartões de crédito e registrando suas transações diárias.

## ✨ Funcionalidades Principais

-   **Autenticação de Usuários:** Sistema de registro e login.
-   **Dashboard:** Visualização rápida de informações financeiras.
-   **Gerenciamento de Cartões:** Adicione e visualize seus cartões de crédito.
-   **Registro de Transações:** Adicione e acompanhe suas despesas e receitas.

## 🛠️ Tecnologias Utilizadas

#### **Backend**

-   **Python 3**
-   **FastAPI:** Framework web para a construção da API.
-   **SQLModel / SQLAlchemy:** ORM para interação com o banco de dados.
-   **SQLite:** Banco de dados relacional baseado em arquivo.
-   **Uvicorn:** Servidor ASGI para rodar a aplicação.

#### **Frontend**

-   **React:** Biblioteca JavaScript para a construção da interface de usuário.
-   **JavaScript (ES6+)**
-   **CSS:** Estilização básica.

## 🚀 Como Executar o Projeto

Siga os passos abaixo para configurar e executar o ambiente de desenvolvimento localmente.

### **1. Backend (FastAPI)**

-   **Acesse a pasta do backend:**
    ```bash
    cd backend
    ```

-   **Crie e ative um ambiente virtual:**
    ```bash
    # Crie o ambiente
    python -m venv .venv

    # Ative no Windows
    .venv\Scripts\activate

    # Ative no macOS / Linux
    source .venv/bin/activate
    ```

-   **Instale as dependências:**
    ```bash
    pip install -r requirements.txt
    ```

-   **Inicie o servidor:**
    ```bash
    uvicorn app.main:app --reload
    ```

-   O backend estará disponível em `http://127.0.0.1:8000`. Você pode acessar a documentação interativa da API em `http://127.0.0.1:8000/docs`.

### **2. Frontend (React)**

-   **Abra um novo terminal e acesse a pasta do frontend:**
    ```bash
    cd frontend
    ```

-   **Instale as dependências:**
    ```bash
    npm install
    ```

-   **Inicie o servidor de desenvolvimento:**
    ```bash
    npm start
    ```

-   O frontend será aberto automaticamente no seu navegador em `http://localhost:3000`.

## ⚠️ Notas Importantes

-   **Primeiro Usuário:** Para fazer login no frontend, você precisa primeiro registrar um usuário. Utilize a documentação do backend (`/docs`) para enviar uma requisição `POST` para o endpoint `/auth/register`.
-   **Segurança:** A `SECRET_KEY` de exemplo no arquivo `backend/app/auth.py` é insegura e deve ser substituída por uma string aleatória e segura em um ambiente de produção.
-   **Banco de Dados:** A aplicação utiliza um banco de dados SQLite, que é um arquivo local em `backend/finance.db`.
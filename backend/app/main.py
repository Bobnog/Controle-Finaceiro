from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app import database, auth, transacoes, cartoes, dashboard

# Cria uma instância da aplicação FastAPI com um título descritivo.
app = FastAPI(title="Finance API - Controle Financeiro")

# Middleware CORS (Cross-Origin Resource Sharing).
# Permite que o frontend (rodando em um domínio diferente) se comunique com esta API.
app.add_middleware(
    CORSMiddleware,
    # 'allow_origins=["*"]' permite todas as origens. EM PRODUÇÃO, isso deve ser restrito ao(s) domínio(s) do seu frontend
    # para evitar ataques como CSRF (Cross-Site Request Forgery).
    allow_origins=["*"],  # Em produção, restrinja para o domínio do seu frontend
    allow_credentials=True, # Permite o envio de cookies e cabeçalhos de autenticação.
    allow_methods=["*"],    # Permite todos os métodos HTTP (GET, POST, PUT, DELETE, etc.).
    allow_headers=["*"],    # Permite todos os cabeçalhos nas requisições.
)

# Inclui os roteadores definidos em outros módulos da aplicação.
# Isso organiza a API em seções lógicas (autenticação, transações, cartões, dashboard).
app.include_router(auth.router)        # Roteador para autenticação de usuários (registro, login).
app.include_router(transacoes.router)  # Roteador para gerenciamento de transações financeiras.
app.include_router(cartoes.router)     # Roteador para gerenciamento de faturas de cartão.
app.include_router(dashboard.router)   # Roteador para dados e resumos do dashboard financeiro.

@app.on_event("startup")
def on_startup():
    """
    Função que é executada uma vez quando a aplicação FastAPI é iniciada.
    Aqui, ela é usada para criar o banco de dados e todas as tabelas definidas pelos modelos SQLModel,
    garantindo que o schema do banco de dados esteja pronto antes de aceitar requisições.
    """
    database.create_db_and_tables()

@app.get("/")
def root():
    """
    Endpoint da raiz da API.
    Retorna uma mensagem simples para indicar que a API está funcionando.
    """
    return {"message": "Finance API rodando"}
import os
from sqlmodel import SQLModel, create_engine, Session

# A URL do banco de dados de produção será lida da variável de ambiente 'DATABASE_URL'
DATABASE_URL_PROD = os.getenv("DATABASE_URL")

# Se a variável de ambiente existir (estamos em produção)
if DATABASE_URL_PROD:
    # As URLs do Render podem vir com "postgres://" que não é mais suportado no SQLAlchemy 2.0
    # Trocamos para "postgresql://" para garantir a compatibilidade.
    if DATABASE_URL_PROD.startswith("postgres://"):
        DATABASE_URL_PROD = DATABASE_URL_PROD.replace("postgres://", "postgresql://", 1)
    
    # Usa a URL do PostgreSQL e não precisa do 'connect_args'
    engine = create_engine(DATABASE_URL_PROD)
else:
    # Se não (desenvolvimento local), usa o banco de dados SQLite
    DATABASE_URL_LOCAL = "sqlite:///./finance.db"
    # 'connect_args' é necessário apenas para o SQLite.
    engine = create_engine(DATABASE_URL_LOCAL, connect_args={"check_same_thread": False})


def create_db_and_tables():
    """
    Cria as tabelas no banco de dados com base nos modelos definidos no SQLModel.
    Isso é feito usando os metadados dos modelos registrados com SQLModel.
    """
    SQLModel.metadata.create_all(engine)

def get_session():
    """
    Função de dependência para obter uma sessão de banco de dados.
    Esta função é um gerador que abre uma sessão, a retorna (yield), e garante que ela seja fechada
    corretamente após o uso, mesmo em caso de exceções.
    É usada pelo FastAPI para injeção de dependência em endpoints que precisam acessar o banco de dados.
    """
    with Session(engine) as session:
        yield session
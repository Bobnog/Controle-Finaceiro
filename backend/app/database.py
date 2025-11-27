from sqlmodel import SQLModel, create_engine, Session

# Define a URL do banco de dados. Aqui está configurado para usar SQLite com um arquivo local.
# O "sqlite:///./finance.db" indica um banco de dados SQLite chamado 'finance.db' no diretório atual.
DATABASE_URL = "sqlite:///./finance.db"

# Cria a engine do SQLAlchemy/SQLModel.
# 'create_engine' é responsável pela comunicação com o banco de dados.
# 'connect_args={"check_same_thread": False}' é específico para SQLite e permite que múltiplos threads acessem a conexão,
# o que é comum em aplicações web como o FastAPI.
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

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
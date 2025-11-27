from typing import Optional, List
from datetime import date
from sqlmodel import SQLModel, Field, Relationship

# Define o modelo de dados para a tabela 'User' no banco de dados.
# SQLModel combina características de Pydantic (validação de dados) e SQLAlchemy (ORM).
class User(SQLModel, table=True):
    """
    Representa um usuário no sistema.
    Um usuário pode ter múltiplas transações e faturas de cartão associadas.
    """
    id: Optional[int] = Field(default=None, primary_key=True) # ID único do usuário, autoincrementado.
    email: str = Field(unique=True, index=True, nullable=False) # Email único do usuário, usado para login.
    hashed_password: str # Senha do usuário armazenada como hash para segurança.
    salario: Optional[float] = Field(default=0.0) # Salário base do usuário, opcional e com valor padrão.

    # Relacionamentos com outras tabelas. 'back_populates' define a relação inversa.
    transacoes: List["Transacao"] = Relationship(back_populates="user") # Um usuário tem muitas transações.
    cartoes: List["CartaoFatura"] = Relationship(back_populates="user") # Um usuário tem muitas faturas de cartão.


# Define o modelo de dados para a tabela 'Transacao' no banco de dados.
class Transacao(SQLModel, table=True):
    """
    Representa uma transação financeira (receita ou gasto).
    Cada transação é associada a um único usuário.
    """
    id: Optional[int] = Field(default=None, primary_key=True) # ID único da transação.
    user_id: int = Field(foreign_key="user.id") # Chave estrangeira para associar a transação a um usuário.
    tipo: str  # "receita" ou "gasto" - Indica a natureza da transação.
    valor: float # O valor monetário da transação.
    categoria: Optional[str] = None # Categoria da transação (ex: "Alimentação", "Transporte").
    descricao: Optional[str] = None # Descrição detalhada da transação.
    data: date # Data em que a transação ocorreu.

    # Relacionamento inverso com a tabela 'User'.
    user: User = Relationship(back_populates="transacoes") # Uma transação pertence a um usuário.


# Define o modelo de dados para a tabela 'CartaoFatura' no banco de dados.
class CartaoFatura(SQLModel, table=True):
    """
    Representa uma fatura de cartão de crédito ou dívida associada a um mês e ano específicos.
    Cada fatura é associada a um único usuário.
    """
    id: Optional[int] = Field(default=None, primary_key=True) # ID único da fatura.
    user_id: int = Field(foreign_key="user.id") # Chave estrangeira para associar a fatura a um usuário.
    instituicao: str # Nome da instituição financeira (ex: "Nubank", "Banco do Brasil").
    valor: float # Valor total da fatura.
    mes: int # Mês de referência da fatura.
    ano: int # Ano de referência da fatura.
    pago: bool = Field(default=False) # Indica se a fatura foi paga (True) ou está pendente (False).

    # Relacionamento inverso com a tabela 'User'.
    user: User = Relationship(back_populates="cartoes") # Uma fatura de cartão pertence a um usuário.
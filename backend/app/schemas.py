from pydantic import BaseModel, EmailStr, Field
from datetime import date
from typing import Optional, List

# ==== Schemas de Usuário ====
# Base para o modelo de usuário, definindo campos comuns.
class UserBase(BaseModel):
    """
    Schema base para o modelo de usuário, contendo campos como email e salário.
    Serve como base para outros schemas de usuário.
    """
    email: EmailStr # Endereço de email válido.
    salario: Optional[float] = 0.0 # Salário base do usuário, opcional com valor padrão.

class UserCreate(UserBase):
    """
    Schema para criação de um novo usuário.
    Estende UserBase e adiciona o campo 'senha' com validações de comprimento.
    A senha é um campo sensível e não deve ser exposta diretamente em outras operações.
    """
    senha: str = Field(..., min_length=4, max_length=72) # Senha do usuário com requisitos de tamanho.

class UserUpdate(BaseModel):
    """
    Schema para atualização parcial de um usuário.
    Atualmente, permite apenas a atualização do salário, tornando-o opcional.
    """
    salario: Optional[float] = None # Campo opcional para atualização do salário.

class User(UserBase):
    """
    Schema para representar um usuário retornado pela API.
    Inclui o 'id' gerado pelo banco de dados.
    A classe Config com 'orm_mode = True' permite que o Pydantic leia dados de modelos ORM.
    """
    id: int # ID único do usuário.
    class Config:
        orm_mode = True # Habilita compatibilidade com modelos ORM (SQLModel).

# ==== Schemas de Transação ====
class Transacao(BaseModel):
    """
    Schema para representar uma transação financeira (receita ou gasto).
    Utilizado para entrada e saída de dados de transações.
    """
    id: Optional[int] = None # ID único da transação, opcional para criação (gerado pelo DB).
    user_id: Optional[int] = None # ID do usuário proprietário, opcional (definido pelo backend).
    tipo: str # Tipo da transação: "receita" ou "gasto".
    valor: float # Valor monetário da transação.
    categoria: Optional[str] = None # Categoria da transação (ex: "Alimentação").
    descricao: Optional[str] = None # Descrição detalhada da transação.
    data: date # Data em que a transação ocorreu.
    class Config:
        orm_mode = True # Habilita compatibilidade com modelos ORM.

# ==== Schemas de Fatura de Cartão ====
class CartaoFatura(BaseModel):
    """
    Schema para representar uma fatura de cartão de crédito.
    Utilizado para entrada e saída de dados de faturas.
    """
    id: Optional[int] = None # ID único da fatura, opcional para criação.
    user_id: Optional[int] = None # ID do usuário proprietário, opcional.
    instituicao: str # Nome da instituição financeira.
    valor: float # Valor total da fatura.
    mes: int # Mês de referência da fatura.
    ano: int # Ano de referência da fatura.
    pago: bool = False # Status de pagamento da fatura, padrão como não pago.
    class Config:
        orm_mode = True # Habilita compatibilidade com modelos ORM.

# Schema para dados detalhados do usuário (incluindo transações e faturas)
class UserWithDetails(User):
    """
    Schema expandido para o usuário, incluindo listas de suas transações e faturas de cartão.
    Útil para endpoints que precisam retornar uma visão completa do perfil do usuário.
    """
    transacoes: List[Transacao] = [] # Lista de transações associadas ao usuário.
    cartoes: List[CartaoFatura] = [] # Lista de faturas de cartão associadas ao usuário.

# ==== Schema de Token de Autenticação ====
class Token(BaseModel):
    """
    Schema para o token de autenticação JWT retornado após um login bem-sucedido.
    """
    access_token: str # O token JWT em si.
    token_type: str = "bearer" # O tipo de token, geralmente "bearer".

# ==== Schema de Dados do Dashboard ====
class DashboardData(BaseModel):
    """
    Schema para os dados agregados exibidos no dashboard financeiro.
    Contém somatórios e saldos calculados.
    """
    total_receitas: float # Soma total das receitas.
    total_gastos: float # Soma total dos gastos.
    total_dividas_abertas: float # Soma total das dívidas de cartão não pagas.
    saldo_atual: float # Saldo financeiro atual (receitas - gastos).
    placar_dividas: float # Saldo após considerar as dívidas abertas.
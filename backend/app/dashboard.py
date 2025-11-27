from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func
from app import models, schemas, database, auth
from datetime import date
from typing import Optional

# Cria um roteador FastAPI para agrupar endpoints relacionados ao dashboard.
router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/", response_model=schemas.DashboardData)
def get_dashboard_data(
    mes: Optional[int] = None, 
    ano: Optional[int] = None,
    current_user: models.User = Depends(auth.get_current_user), 
    session: Session = Depends(database.get_session)
):
    """
    Endpoint para obter dados sumarizados do dashboard para um usuário autenticado.
    Permite filtrar por mês e ano. Se não fornecidos, usa o mês e ano atuais.
    Calcula receitas, gastos, dívidas abertas, saldo atual e placar de dívidas.
    """
    # Define o mês e ano padrão se não forem fornecidos.
    if mes is None:
        mes = date.today().month
    if ano is None:
        ano = date.today().year

    # Consulta para somar todas as transações do tipo "receita" para o usuário no mês/ano especificado.
    soma_receitas_transacoes = session.exec(
        select(func.sum(models.Transacao.valor))
        .where(models.Transacao.user_id == current_user.id)
        .where(models.Transacao.tipo == "receita")
        .where(func.extract('month', models.Transacao.data) == mes)
        .where(func.extract('year', models.Transacao.data) == ano)
    ).first() or 0.0

    # Consulta para somar todas as transações do tipo "gasto" para o usuário no mês/ano especificado.
    soma_gastos_transacoes = session.exec(
        select(func.sum(models.Transacao.valor))
        .where(models.Transacao.user_id == current_user.id)
        .where(models.Transacao.tipo == "gasto")
        .where(func.extract('month', models.Transacao.data) == mes)
        .where(func.extract('year', models.Transacao.data) == ano)
    ).first() or 0.0

    # Consulta para somar todas as faturas de cartão não pagas para o usuário no mês/ano especificado.
    soma_dividas = session.exec(
        select(func.sum(models.CartaoFatura.valor))
        .where(models.CartaoFatura.user_id == current_user.id)
        .where(models.CartaoFatura.pago == False) # Apenas dívidas não pagas
        .where(models.CartaoFatura.mes == mes)
        .where(models.CartaoFatura.ano == ano)
    ).first() or 0.0
    
    # Calcula o total de receitas, incluindo o salário base do usuário e as receitas de transações.
    total_receitas = (current_user.salario or 0.0) + soma_receitas_transacoes
    # O total de gastos é a soma das transações de gasto.
    total_gastos = soma_gastos_transacoes
    # O total de dívidas abertas é a soma das faturas não pagas.
    total_dividas_abertas = soma_dividas
    
    # Calcula o saldo atual (receitas menos gastos).
    saldo_atual = total_receitas - total_gastos
    # Calcula o "placar de dívidas", que é o saldo ajustado pelas dívidas abertas.
    placar_dividas = saldo_atual - total_dividas_abertas

    # Retorna os dados sumarizados formatados pelo schema DashboardData.
    return schemas.DashboardData(
        total_receitas=total_receitas,
        total_gastos=total_gastos,
        total_dividas_abertas=total_dividas_abertas,
        saldo_atual=saldo_atual,
        placar_dividas=placar_dividas,
    )
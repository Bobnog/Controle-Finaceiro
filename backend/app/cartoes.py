from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from app import models, schemas, database, auth

# Cria um roteador FastAPI para agrupar endpoints relacionados a cartões/faturas.
router = APIRouter(prefix="/cartoes", tags=["cartoes"])

@router.post("/", status_code=201, response_model=schemas.CartaoFatura)
def adicionar_fatura(payload: schemas.CartaoFatura, current_user: models.User = Depends(auth.get_current_user), session: Session = Depends(database.get_session)):
    """
    Adiciona uma nova fatura de cartão de crédito para o usuário autenticado.
    Requer autenticação (token JWT).
    Payload: dados da fatura (instituição, valor, mês, ano, pago).
    """
    # Cria uma nova instância de CartaoFatura associada ao ID do usuário atual.
    c = models.CartaoFatura(
        user_id=current_user.id,
        instituicao=payload.instituicao,
        valor=payload.valor,
        mes=payload.mes,
        ano=payload.ano,
        pago=payload.pago
    )
    # Adiciona a fatura à sessão do banco de dados, comita e atualiza o objeto.
    session.add(c)
    session.commit()
    session.refresh(c)
    return c

@router.get("/", response_model=List[schemas.CartaoFatura])
def listar_faturas(current_user: models.User = Depends(auth.get_current_user), session: Session = Depends(database.get_session)):
    """
    Lista todas as faturas de cartão de crédito do usuário autenticado.
    Requer autenticação (token JWT).
    As faturas são ordenadas por ano e mês de forma decrescente.
    """
    # Busca todas as faturas associadas ao ID do usuário atual e as ordena.
    return session.exec(select(models.CartaoFatura).where(models.CartaoFatura.user_id == current_user.id).order_by(models.CartaoFatura.ano.desc(), models.CartaoFatura.mes.desc())).all()

@router.put("/{cartao_id}", response_model=schemas.CartaoFatura)
def atualizar_fatura(cartao_id: int, payload: schemas.CartaoFatura, current_user: models.User = Depends(auth.get_current_user), session: Session = Depends(database.get_session)):
    """
    Atualiza uma fatura de cartão de crédito existente.
    Requer autenticação (token JWT) e que o usuário seja o proprietário da fatura.
    """
    # Busca a fatura pelo ID. Se não encontrar, retorna 404.
    c = session.get(models.CartaoFatura, cartao_id)
    if not c:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fatura não encontrada")
    # Verifica se o usuário atual é o proprietário da fatura para evitar acesso não autorizado.
    if c.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Não tem permissão para alterar esta fatura")

    # Atualiza os campos da fatura com os dados fornecidos no payload.
    c.instituicao = payload.instituicao
    c.valor = payload.valor
    c.mes = payload.mes
    c.ano = payload.ano
    c.pago = payload.pago

    # Adiciona as alterações à sessão do banco de dados, comita e atualiza o objeto.
    session.add(c)
    session.commit()
    session.refresh(c)
    return c

@router.delete("/{cartao_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_fatura(cartao_id: int, current_user: models.User = Depends(auth.get_current_user), session: Session = Depends(database.get_session)):
    """
    Deleta uma fatura de cartão de crédito existente.
    Requer autenticação (token JWT) e que o usuário seja o proprietário da fatura.
    """
    # Busca a fatura pelo ID. Se não encontrar, retorna 404.
    c = session.get(models.CartaoFatura, cartao_id)
    if not c:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fatura não encontrada")
    # Verifica se o usuário atual é o proprietário da fatura para evitar acesso não autorizado.
    if c.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Não tem permissão para deletar esta fatura")

    # Deleta a fatura da sessão do banco de dados e comita.
    session.delete(c)
    session.commit()
    # Retorna None com status 204 (No Content) para indicar sucesso sem corpo de resposta.
    return None
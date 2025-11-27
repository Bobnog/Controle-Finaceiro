from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from app import models, schemas, database, auth

# Cria um roteador FastAPI para agrupar endpoints relacionados a transações financeiras.
router = APIRouter(prefix="/transacoes", tags=["transacoes"])

@router.post("/", status_code=201, response_model=schemas.Transacao)
def criar_transacao(payload: schemas.Transacao, current_user: models.User = Depends(auth.get_current_user), session: Session = Depends(database.get_session)):
    """
    Cria uma nova transação (receita ou gasto) para o usuário autenticado.
    Requer autenticação (token JWT).
    Payload: dados da transação (tipo, valor, categoria, descrição, data).
    """
    # O ID da transação no payload é ignorado, pois o banco de dados atribui um novo ID automaticamente.
    t = models.Transacao(
        user_id=current_user.id, # Associa a transação ao ID do usuário autenticado.
        tipo=payload.tipo,
        valor=payload.valor,
        categoria=payload.categoria,
        descricao=payload.descricao,
        data=payload.data
    )
    # Adiciona a transação à sessão do banco de dados, comita e atualiza o objeto.
    session.add(t)
    session.commit()
    session.refresh(t)
    return t

@router.get("/", response_model=List[schemas.Transacao])
def listar_transacoes(current_user: models.User = Depends(auth.get_current_user), session: Session = Depends(database.get_session)):
    """
    Lista todas as transações (receitas e gastos) do usuário autenticado.
    Requer autenticação (token JWT).
    As transações são ordenadas por data de forma decrescente.
    """
    # Busca todas as transações associadas ao ID do usuário atual e as ordena pela data mais recente.
    trans = session.exec(select(models.Transacao).where(models.Transacao.user_id == current_user.id).order_by(models.Transacao.data.desc())).all()
    return trans

@router.put("/{transacao_id}", response_model=schemas.Transacao)
def atualizar_transacao(transacao_id: int, payload: schemas.Transacao, current_user: models.User = Depends(auth.get_current_user), session: Session = Depends(database.get_session)):
    """
    Atualiza uma transação existente.
    Requer autenticação (token JWT) e que o usuário seja o proprietário da transação.
    """
    # Busca a transação pelo ID. Se não encontrar, retorna 404.
    t = session.get(models.Transacao, transacao_id)
    if not t:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transação não encontrada")
    # Verifica se o usuário atual é o proprietário da transação para evitar acesso não autorizado.
    if t.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Não tem permissão para alterar esta transação")
    
    # Atualiza os campos da transação com os dados fornecidos no payload.
    t.tipo = payload.tipo
    t.valor = payload.valor
    t.categoria = payload.categoria
    t.descricao = payload.descricao
    t.data = payload.data
    
    # Adiciona as alterações à sessão do banco de dados, comita e atualiza o objeto.
    session.add(t)
    session.commit()
    session.refresh(t)
    return t

@router.delete("/{transacao_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_transacao(transacao_id: int, current_user: models.User = Depends(auth.get_current_user), session: Session = Depends(database.get_session)):
    """
    Deleta uma transação existente.
    Requer autenticação (token JWT) e que o usuário seja o proprietário da transação.
    """
    # Busca a transação pelo ID. Se não encontrar, retorna 404.
    t = session.get(models.Transacao, transacao_id)
    if not t:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transação não encontrada")
    # Verifica se o usuário atual é o proprietário da transação para evitar acesso não autorizado.
    if t.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Não tem permissão para deletar esta transação")
        
    # Deleta a transação da sessão do banco de dados e comita.
    session.delete(t)
    session.commit()
    # Retorna None com status 204 (No Content) para indicar sucesso sem corpo de resposta.
    return None
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app import models, schemas, database
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from dotenv import load_dotenv
from sqlalchemy.exc import IntegrityError
import os

# Carrega variáveis de ambiente do arquivo .env. Essencial para configurações sensíveis como a chave secreta.
load_dotenv()

# Chave secreta para assinar e verificar tokens JWT. Obtida de variáveis de ambiente para segurança.
SECRET_KEY = os.getenv("SECRET_KEY")
# Algoritmo de criptografia usado para os tokens JWT.
ALGORITHM = "HS256"
# Tempo de expiração do token de acesso em minutos (1 dia). Garante que tokens antigos não sejam válidos indefinidamente.
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

# Configuração do contexto para hashing de senhas. 'bcrypt' é um algoritmo seguro e recomendado para senhas.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
# Configuração para o esquema de autenticação OAuth2 com tokens Bearer. 'tokenUrl' aponta para o endpoint de login.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="users/token")

# Cria um roteador FastAPI para agrupar endpoints relacionados a usuários e autenticação.
router = APIRouter(prefix="/users", tags=["users"])

def hash_password(password: str) -> str:
    """
    Gera um hash seguro da senha fornecida.
    É crucial armazenar hashes de senhas, não as senhas em texto puro, para proteger os dados do usuário.
    """
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    """
    Verifica se uma senha em texto puro corresponde a um hash de senha armazenado.
    Essencial para o processo de login, comparando a senha digitada com a armazenada.
    """
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    """
    Cria um token de acesso JWT.
    Inclui um tempo de expiração para invalidar tokens após um período, aumentando a segurança.
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta if expires_delta else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@router.post("/register", status_code=201, response_model=schemas.User)
def register(payload: schemas.UserCreate, session: Session = Depends(database.get_session)):
    """
    Endpoint para registro de novos usuários.
    Garante que o email seja único e a senha seja armazenada de forma segura (hashed).
    """
    # Validação do tamanho da senha antes de processar para evitar dados excessivamente longos.
    if len(payload.senha) > 72:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Senha muito longa. O tamanho máximo é de 72 caracteres.")
    
    # Verifica se o email já está cadastrado para evitar duplicidade e informar o usuário.
    user_exists = session.exec(select(models.User).where(models.User.email == payload.email)).first()
    if user_exists:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email já cadastrado")
    
    # Prepara os dados do usuário, gerando o hash da senha antes de criar o objeto User.
    user_data = payload.model_dump()
    user_data['hashed_password'] = hash_password(user_data.pop('senha'))
    u = models.User(**user_data)
    
    try:
        # Tenta adicionar e persistir o novo usuário no banco de dados.
        session.add(u)
        session.commit()
        session.refresh(u)
    except IntegrityError:
        # Captura erros de integridade (ex: email duplicado) que podem ocorrer se houver condição de corrida.
        session.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email já cadastrado")
        
    return u

@router.post("/token", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(database.get_session)):
    """
    Endpoint para login de usuários e emissão de token JWT.
    Verifica as credenciais e, se válidas, retorna um token de acesso.
    """
    # Busca o usuário pelo email e verifica a senha fornecida.
    user = session.exec(select(models.User).where(models.User.email == form_data.username)).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciais inválidas")
    
    # Cria um token de acesso para o usuário autenticado. 'sub' geralmente guarda um identificador único.
    access_token = create_access_token({"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}

def get_current_user(token: str = Depends(oauth2_scheme), session: Session = Depends(database.get_session)) -> models.User:
    """
    Dependência que extrai e valida o usuário a partir de um token JWT.
    Usada para proteger rotas que exigem autenticação, garantindo que apenas usuários logados possam acessá-las.
    """
    credentials_exception = HTTPException(status_code=401, detail="Não autenticado", headers={"WWW-Authenticate": "Bearer"})
    try:
        # Decodifica o token JWT usando a chave secreta e o algoritmo.
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        # Levanta exceção se o token for inválido ou expirado.
        raise credentials_exception
    
    # Busca o usuário no banco de dados pelo ID extraído do token.
    user = session.get(models.User, int(user_id))
    if user is None:
        raise credentials_exception
    return user

@router.get("/me", response_model=schemas.UserWithDetails)
def get_me(current_user: models.User = Depends(get_current_user)):
    """
    Endpoint para obter os detalhes do usuário atualmente autenticado.
    Requer um token JWT válido para identificar o usuário.
    """
    return current_user

@router.put("/me", response_model=schemas.User)
def update_me(payload: schemas.UserUpdate, current_user: models.User = Depends(get_current_user), session: Session = Depends(database.get_session)):
    """
    Endpoint para atualizar as informações do usuário atualmente autenticado (ex: salário).
    """
    # Atualiza o salário do usuário se um novo valor for fornecido no payload.
    if payload.salario is not None:
        current_user.salario = payload.salario
    
    # Persiste as alterações no banco de dados.
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    return current_user
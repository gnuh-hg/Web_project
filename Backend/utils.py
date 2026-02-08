from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt

# Thiết lập băm mật khẩu
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = "Sieu_Mat_Ma_Cua_Ban" # Trong thực tế hãy để ở file .env
ALGORITHM = "HS256"

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=30) # Token sống trong 30p
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
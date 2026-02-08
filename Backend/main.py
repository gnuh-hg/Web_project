from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import models, schemas, utils, database

app = FastAPI()

# Tạo bảng trong DB (chỉ dùng cho demo, thực tế nên dùng Alembic)
models.Base.metadata.create_all(bind=database.engine)

# --- API ĐĂNG KÝ ---
@app.post("/signup", response_model=schemas.UserResponse)
def signup(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    # 1. Kiểm tra email tồn tại chưa
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email đã được đăng ký!")
    
    # 2. Hash mật khẩu và lưu
    new_user = models.User(email=user.email, hashed_password=utils.hash_password(user.password))
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# --- API ĐĂNG NHẬP ---
@app.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    # 1. Tìm user theo email (form_data.username ở đây chính là email)
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    
    # 2. Kiểm tra user và verify mật khẩu
    if not user or not utils.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Sai tài khoản hoặc mật khẩu")
    
    # 3. Tạo JWT Token
    access_token = utils.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}
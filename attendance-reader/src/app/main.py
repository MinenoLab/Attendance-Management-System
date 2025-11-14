from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import attendance, card, user

# FastAPIアプリケーションのインスタンスを作成
app = FastAPI()

# CORSミドルウェアを設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

app.include_router(attendance.router, prefix="/v1/attendance")
app.include_router(user.router,       prefix="/v1/user")
app.include_router(card.router,       prefix="/v1/card")
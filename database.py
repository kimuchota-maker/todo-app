from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

#DB接続設定
DATABASE_URL = os.getenv("DATABASE_URL","sqlite:///./todo.db")

engine = create_engine(
    DATABASE_URL
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base =declarative_base()
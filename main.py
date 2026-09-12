from fastapi import Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import SessionLocal, engine
from models import Task, Base
from fastapi.staticfiles import StaticFiles

#テーブル作成
Base.metadata.create_all(bind=engine)

app = FastAPI()

templates = Jinja2Templates(directory="templates")

app.mount("/static", StaticFiles(directory="static"), name="static")

#DB接続
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


#POST用データ型
class TaskCreate(BaseModel):
    title: str
    done: bool = False

class TaskUpdate(BaseModel):
    title: str | None = None
    done: bool | None = None


#タスク追加
@app.post("/tasks")
def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    db_task = Task(
        title=task.title,
        done=task.done
    )

    db.add(db_task)
    db.commit()
    db.refresh(db_task)

    return db_task

#タスク一覧取得
@app.get("/tasks")
def get_tasks(db: Session = Depends(get_db)):
    return db.query(Task).all()

#タスク削除
@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()

    if task is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
    )
    db.delete(task)
    db.commit()

    return {"message": f"タスクID {task_id} を削除しました"}

#タスク更新
@app.put("/tasks/{task_id}")
def update_task(task_id: int, task_update: TaskUpdate, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    
    if task is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
    )

    if task_update.title is not None:
        task.title = task_update.title
    if task_update.done is not None:
        task.done = task_update.done

    db.commit()
    db.refresh(task)

    return task

@app.get("/", response_class=HTMLResponse)
def home(request: Request):
    return templates.TemplateResponse(
        name="index.html",
        request = request
    )
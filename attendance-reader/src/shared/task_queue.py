import json
import sqlite3
from datetime import datetime

from shared.config import DB_PATH

def enqueue_task(job_type: str, params: dict):
    """タスクデータベースに新しいタスクを追加する"""
    conn   = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO tasks (job_type, params, status, created_at, updated_at)
        VALUES (?, ?, 'pending', ?, ?)
        """,
        (job_type, json.dumps(params), datetime.now(), datetime.now())
    )

    conn.commit()
    conn.close()

def get_next_pending_task():
    """未処理タスク（status='pending'）の中から最も古いものを1件取得する"""
    conn   = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT id, job_type, params
        FROM tasks
        WHERE status = 'pending'
        ORDER BY created_at ASC
        LIMIT 1
        """
    )
    row = cursor.fetchone()
    conn.close()

    if row is None:
        return None

    task_id, job_type, params_json = row
    try:
        params = json.loads(params_json)
    except json.JSONDecodeError:
        params = {}

    return {"id": task_id, "job_type": job_type, "params": params}

def mark_task_done(task_id: int):
    """タスクを完了済み（status='done'）として更新"""
    conn   = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute(
        """
        UPDATE tasks
        SET status = 'done', updated_at = ?
        WHERE id = ?
        """,
        (datetime.now(), task_id)
    )

    conn.commit()
    conn.close()

def mark_task_failed(task_id: int):
    """タスクを失敗（status='failed'）として更新"""
    conn   = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute(
        """
        UPDATE tasks
        SET status = 'failed', updated_at = ?
        WHERE id = ?
        """,
        (datetime.now(), task_id)
    )

    conn.commit()
    conn.close()
from shared import aws_client

def handle_task(task: dict):
    """タスクハンドラ"""
    # タスクの種類に応じて処理を分岐
    if task["job_type"] == "register_user":
        # ユーザー登録
        res = aws_client.register_user(
            id    = task["params"]["id"],
            name  = task["params"]["name"],
            grade = task["params"]["grade"]
        )
        return res
    elif task["job_type"] == "register_attendance":
        # 出席登録
        res = aws_client.register_attendance(
            id     = task["params"]["id"],
            status = task["params"]["status"]
        )
        return res
    else:
        raise ValueError(f"Unknown job type: {task['job_type']}")
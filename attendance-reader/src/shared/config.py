from pathlib import Path

# プロジェクトルートディレクトリ
BASE_DIR = "/home/pi/attendance_system"

# ログファイルのパス
LOG_PATHS = {
    "register_attendance": Path(BASE_DIR) / "logs" / "register_attendance.log",
    "register_user"      : Path(BASE_DIR) / "logs" / "register_user.log",
    "card_reader"        : Path(BASE_DIR) / "logs" / "card_reader.log",
    "aws_client"         : Path(BASE_DIR) / "logs" / "aws_client.log",
    "worker"             : Path(BASE_DIR) / "logs" / "worker.log",
}

# SQLiteデータベースのパス
DB_PATH = Path(BASE_DIR) / "data" / "tasks.db"
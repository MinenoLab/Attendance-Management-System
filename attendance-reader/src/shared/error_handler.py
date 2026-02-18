import logging
import os
from typing import Union

class ErrorHandler:
    """エラーハンドリングとログ記録を行うクラス"""
    def __init__(self, log_file: str, level: int = logging.INFO):
        self.log_file = log_file
        self.level    = level
        self.logger   = self._setup_logger()

    def _setup_logger(self) -> logging.Logger:
        os.makedirs(os.path.dirname(self.log_file), exist_ok=True)

        logger = logging.getLogger(self.log_file)
        if not logger.handlers:  # 多重設定防止
            handler   = logging.FileHandler(self.log_file, encoding="utf-8")
            formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
            handler.setFormatter(formatter)
            logger.addHandler(handler)
            logger.setLevel(self.level)
        return logger

    def log_error(self, error: Union[str, Exception]) -> None:
        """エラー情報をログファイルに記録する"""
        if isinstance(error, Exception):
            self.logger.error(f"{type(error).__name__}: {str(error)}")
        else:
            self.logger.error(str(error))

    def log_info(self, message: str) -> None:
        """情報レベルのログを出力する"""
        self.logger.info(message)

    def log_warning(self, message: str) -> None:
        """警告レベルのログを出力する"""
        self.logger.warning(message)

    def log_debug(self, message: str) -> None:
        """デバッグレベルのログを出力する"""
        self.logger.debug(message)

    def handle_error(self, error: Exception) -> None:
        """エラーをログに記録し、必要に応じて例外を再送出"""
        self.log_error(error)
        raise error
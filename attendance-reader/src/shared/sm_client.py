import json
import boto3

class SMClient:
    """SecretManagerクライアントクラス"""
    def __init__(self, region_name: str, access_key: str, secret_key: str, session_token: str, secret_arn: str) -> None:
        """コンストラクタ"""
        self.region_name   = region_name
        self.access_key    = access_key
        self.secret_key    = secret_key
        self.session_token = session_token
        self.secret_arn    = secret_arn

    def get_api_key(self) -> dict:
        """SecretManagerからAPIキーを取得する"""
        sm_client = boto3.client(
            "secretsmanager",
            region_name           = self.region_name,
            aws_access_key_id     = self.access_key,
            aws_secret_access_key = self.secret_key,
            aws_session_token     = self.session_token
        )
        secret_response = sm_client.get_secret_value(SecretId=self.secret_arn)

        return {
            "x-api-key": json.loads(secret_response['SecretString'])['x-api-key']
        }
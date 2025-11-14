import boto3
from datetime import datetime, timedelta, timezone

class CognitoClient:
    """Cognitoクライアントクラス"""
    def __init__(self, identity_pool_id: str, region_name: str) -> None:
        """コンストラクタ"""
        self.identity_pool_id = identity_pool_id
        self.region_name      = region_name
        self._cached_creds    = None

    def get_cognito_credentials(self) -> dict:
        """Cognitoから一時的なAWS認証情報を取得する"""
        if self._cached_creds and self._cached_creds["expiration"] > (datetime.now(timezone.utc) + timedelta(minutes=5)):
            return self._cached_creds["credentials"]

        cognito_client = boto3.client("cognito-identity", region_name=self.region_name)

        # CognitoからIDを取得
        response_id = cognito_client.get_id(IdentityPoolId=self.identity_pool_id)
        identity_id = response_id['IdentityId']

        # 取得したIDを使って一時的なAWS認証情報を取得
        response_creds = cognito_client.get_credentials_for_identity(IdentityId=identity_id)
        credentials    = response_creds['Credentials']

        # キャッシュに保存
        self._cached_creds = {
            "credentials": {
                "access_key"   : credentials['AccessKeyId'],
                "secret_key"   : credentials['SecretKey'],
                "session_token": credentials['SessionToken']
            },
            "expiration": credentials['Expiration']
        }

        return self._cached_creds["credentials"]
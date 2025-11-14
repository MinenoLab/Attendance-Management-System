import os
from dotenv import load_dotenv

from shared.api_client     import APIClient
from shared.cognito_client import CognitoClient
from shared.sm_client      import SMClient
from shared.codec          import Codec
from shared.config         import LOG_PATHS
from shared.error_handler  import ErrorHandler

# 初期化
load_dotenv()

logger = ErrorHandler(log_file=str(LOG_PATHS["aws_client"]))

def register_user(id: str, name: str, grade:str):
    """AWS APIでユーザー登録"""
    # 一時的な認証情報を取得する
    cognito_client = CognitoClient(
        identity_pool_id = os.getenv("IDENTITY_POOL_ID"),
        region_name      = os.getenv("REGION_NAME")
    )
    cognito_creds = cognito_client.get_cognito_credentials()

    # SecretManagerからAPIキーを取得する
    # sm_client = SMClient(
    #     region_name   = os.getenv("REGION_NAME"),
    #     access_key    = cognito_creds["access_key"],
    #     secret_key    = cognito_creds["secret_key"],
    #     session_token = cognito_creds["session_token"],
    #     secret_arn    = os.getenv("SECRET_ARN")
    # )
    # sm_creds = sm_client.get_api_key()


    api_client = APIClient(
        access_key    = cognito_creds["access_key"],
        secret_key    = cognito_creds["secret_key"],
        session_token = cognito_creds["session_token"],
        resource_id   = os.getenv("RESOURCE_ID"),
        service_name  = os.getenv("SERVICE_NAME"),
        region_name   = os.getenv("REGION_NAME"),
        x_api_key     = os.getenv("X_API_KEY")
        # x_api_key     = sm_creds["x-api-key"]
    )

    data = {
        "id"   : Codec.base64_encode(id),
        "name" : Codec.base64_encode(name),
        "grade": Codec.base64_encode(grade)
    }
    try:
        res = api_client.send_request("v1/user", "POST", data=data)
        return res.json()

    except Exception as e:
        logger.log_error(f"User registration failed: {e}")
        raise

def register_attendance(id: str, status: str):
    """AWS APIで勤怠登録"""
    # 一時的な認証情報を取得する
    cognito_client = CognitoClient(
        identity_pool_id = os.getenv("IDENTITY_POOL_ID"),
        region_name      = os.getenv("REGION_NAME")
    )
    cognito_creds = cognito_client.get_cognito_credentials()

    # SecretManagerからAPIキーを取得する
    # sm_client = SMClient(
    #     region_name   = os.getenv("REGION_NAME"),
    #     access_key    = cognito_creds["access_key"],
    #     secret_key    = cognito_creds["secret_key"],
    #     session_token = cognito_creds["session_token"],
    #     secret_arn    = os.getenv("SECRET_ARN")
    # )
    # sm_creds = sm_client.get_api_key()


    api_client = APIClient(
        access_key    = cognito_creds["access_key"],
        secret_key    = cognito_creds["secret_key"],
        session_token = cognito_creds["session_token"],
        resource_id   = os.getenv("RESOURCE_ID"),
        service_name  = os.getenv("SERVICE_NAME"),
        region_name   = os.getenv("REGION_NAME"),
        x_api_key     = os.getenv("X_API_KEY")
        # x_api_key     = sm_creds["x-api-key"]
    )

    data = {
        "id"    : Codec.base64_encode(id),
        "status": Codec.base64_encode(status)
    }
    try:
        res = api_client.send_request("v1/attendance", "POST", data=data)
        return res.json()

    except Exception as e:
        logger.log_error(f"Attendance registration failed: {e}")
        raise
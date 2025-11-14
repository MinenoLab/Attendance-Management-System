import json
import requests
from urllib.parse import urlencode

from botocore.auth        import SigV4Auth
from botocore.awsrequest  import AWSRequest
from botocore.credentials import Credentials

class APIClient:
    """APIクライアントクラス"""
    def __init__(self, access_key:str, secret_key:str, session_token: str, resource_id:str, service_name:str, region_name:str, x_api_key:str) -> None:
        """コンストラクタ"""
        self.credentials  = Credentials(access_key=access_key, secret_key=secret_key, token=session_token)
        self.resource_id  = resource_id
        self.service_name = service_name
        self.region_name  = region_name
        self.host         = f"{resource_id}.{service_name}.{region_name}.amazonaws.com"
        self.x_api_key    = x_api_key

    def _create_signed_request(self, method:str, url:str, data:str=None) -> AWSRequest:
        """署名付きリクエストを作成する"""
        request = AWSRequest(method=method, url=url, data=data)
        # SigV4Authを使用してリクエストに署名を追加
        SigV4Auth(
            credentials  = self.credentials,
            service_name = self.service_name,
            region_name  = self.region_name
        ).add_auth(request=request)
        return request

    def _get_headers(self, request:AWSRequest) -> dict:
        """リクエストヘッダーを取得する"""
        headers = {
            "Authorization": request.headers["Authorization"],
            "Host"         : self.host,
            "X-Amz-Date"   : request.headers["X-Amz-Date"],
            "X-Api-Key"    : self.x_api_key,
            "Content-Type" : "application/json"
        }
        # botocoreが署名時に自動で追加したセッショントークンヘッダーをコピー
        if "X-Amz-Security-Token" in request.headers:
            headers["X-Amz-Security-Token"] = request.headers["X-Amz-Security-Token"]
        return headers

    def send_request(self, stage_name:str, method:str, params:dict=None, data:dict=None, timeout:int=10):
        """リクエストを送信する"""
        base_url = f"https://{self.host}/{stage_name}"

        # クエリパラメータをURLに追加
        if method == "GET" and params:
            query_string = urlencode(params)
            full_url = f"{base_url}?{query_string}"
        else:
            full_url = base_url

        # 署名付きリクエストを作成
        request = self._create_signed_request(method=method, url=full_url, data=json.dumps(data) if data else None)
        headers = self._get_headers(request=request)

        # 実際のリクエスト送信
        response = requests.request(
            url     = full_url,
            method  = method,
            headers = headers,
            params  = None if method == "GET" else params,
            data    = json.dumps(data) if data else None,
            timeout = timeout
        )
        return response
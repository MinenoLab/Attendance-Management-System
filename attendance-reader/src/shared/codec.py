import base64
import hashlib

class Codec:
    @staticmethod
    def hash_text(input_str: str) -> str:
        """
        文字列をSHA256でハッシュ化して16進文字列として返す。

        Args:
            input_str (str): ハッシュ化したい文字列

        Returns:
            str: SHA256ハッシュ値（hex形式）
        """
        return hashlib.sha256(input_str.encode("utf-8")).hexdigest()

    @staticmethod
    def base64_encode(input_str: str) -> str:
        """
        文字列をBase64エンコードして返す。

        Args:
            input_str (str): エンコード対象の文字列

        Returns:
            str: Base64エンコード後の文字列
        """
        return base64.b64encode(input_str.encode("utf-8")).decode("utf-8")

    @staticmethod
    def base64_decode(encoded_str: str) -> str:
        """
        Base64エンコードされた文字列をデコードして返す。

        Args:
            encoded_str (str): Base64形式の文字列

        Returns:
            str: デコード後の文字列
        """
        return base64.b64decode(encoded_str.encode("utf-8")).decode("utf-8")
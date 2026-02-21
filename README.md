# 峰野研究室 在室確認システム

## システム概要図

<img width="3131" height="2099" alt="image2" src="https://github.com/user-attachments/assets/357fc189-f87d-4fab-a2fd-cffad3e99a4a" />

## アーキテクチャ図

<img width="2883" height="2206" alt="image" src="https://github.com/user-attachments/assets/86d00483-a738-4fad-b7ec-7f3060cca6b6" />

## 運用方法

- ユーザー登録時のプルダウンに表示される名前を変更（追加・削除）したい時

```
# RaspberryPiにSSHで接続する（認証情報は別途資料参照）
$ cd /home/pi/Attendance-Management-System/attendance-reader/src/web/frontend/
$ sudo nano .env

REACT_APP_API_BASE_URL=http://XXX.XXX.XXX.XXX:XXX/XXX
REACT_APP_USER_NAMES=山田 太郎,佐藤 花子,田中 敬一郎     #←ここに追記・削除（カンマ後は半角スペース不要）
REACT_APP_GRADES=RS,M2,M1,B4,B3

$ sudo reboot
```

- ユーザー登録に関する**全ての情報は毎年4月1日00:00AMに削除される**ため，在校生は再度ユーザー登録が必要となる

## 今後の展望

- 制御部のキューイング処理の改良
  - 現状「失敗した処理（`status='failed'`）」に対して再試行されないため、**指数関数バックオフ＋ジッター**による再試行機能を追加
- 制御部の`.env`の暗号化
  - 現状`.env`の中身は暗号化されていないため、**デバイス固有の情報（例：MACアドレス）で暗号化**しておき、使用時に復号化して使用するように変更
- 重要パラメータの管理方法の改善
  - 制御部の`.env`の`IDENTITY_POOL_ID`を**AWS Secrets Manager**から取得するように変更
# 峰野研究室 在室確認システム

## システム概要図

<img width="3131" height="2099" alt="image2" src="https://github.com/user-attachments/assets/357fc189-f87d-4fab-a2fd-cffad3e99a4a" />

## アーキテクチャ図

<img width="2883" height="2206" alt="image" src="https://github.com/user-attachments/assets/86d00483-a738-4fad-b7ec-7f3060cca6b6" />

## 運用方法

- ユーザー登録時のプルダウンに表示される名前を変更（追加・削除）したい時

```
# RaspberryPiにSSHで接続する（認証情報は別途資料参照）
$ cd ~/attendance-reader/web/frontend/
$ sudo nano .env

REACT_APP_API_BASE_URL=http://XXX.XXX.XXX.XXX:XXX/XXX
REACT_APP_USER_NAMES=山田 太郎,佐藤 花子,田中 敬一郎     #←ここに追記・削除（カンマ後は半角スペース不要）
REACT_APP_GRADES=RS,M2,M1,B4,B3

$ sudo reboot
```

- ユーザー登録に関する**全ての情報は毎年4月1日00:00AMに削除される**ため，在校生は再度ユーザー登録が必要となる

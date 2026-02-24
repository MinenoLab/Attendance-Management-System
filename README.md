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

難易度の低い順に並べています。

### ★☆☆ 制御部の `.env` の暗号化

現状 `/src/.env` の中身が平文のため、**デバイス固有の情報（例：MACアドレス）を鍵として暗号化**し、使用時に復号化して利用するように変更する。

1. `/src/shared/codec.py` に暗号化・復号化関数を作成する
2. `/src/shared/aws_client.py` でパラメータ読み込み時に復号化関数を通すように変更する
3. `/src/.env` 作成時に暗号化関数で各パラメータを暗号化するよう変更し、セットアップ手順ドキュメントも更新する

---

### ★★☆ 重要パラメータの管理方法の改善

`/src/.env` の `IDENTITY_POOL_ID` を **AWS Secrets Manager** から取得するように変更する。

1. `/src/shared/aws_client.py` のコメントアウトしてある該当箇所を解除する（ロジックはすでに書かれている）
2. AWS側の IAMポリシー 周りのエラーを調査・解決する

> ⚠️ IAMポリシー起因のエラーで断念している状態。エラーログの確認から始めること。

---

### ★★☆ タスク処理状況を可視化するダッシュボードの追加

現状 `/src/data/tasks.db` を直接参照しないとタスク状況を確認できないため、運用時に把握しやすくする仕組みを追加する。

- **案A（推奨）：** Flask や FastAPI で簡易 Web UI を構築し、`status` ごとのタスク一覧・`retry_count`・タイムスタンプを表示する。Raspberry Pi 上でローカルネットワーク越しにアクセスできると便利。
- **案B（簡易版）：** `tasks.db` の内容を CSV エクスポートするスクリプトを用意するだけでもデバッグ時の確認コストを大きく下げられる。

---

### ★★★ キューイング処理の改良（失敗タスクの自動再試行）

現状 `status='failed'` のタスクが再試行されないため、**指数関数バックオフ＋ジッター**による再試行機能を追加する。

1. `/src/data/tasks.db` と `/src/data/.init_db.py` に `retry_count` 列を追加する
2. `/src/shared/task_queue.py` の `get_next_pending_task()` を改修する。`status='pending'` のタスクがない場合に、`status='failed'` かつ `retry_count < MAX_RETRY_COUNT` のタスクを古い順に返すようにする
3. `/src/worker/worker_runner.py` に指数関数バックオフ＋ジッターの再試行ロジックを実装し、`MAX_RETRY_COUNT` 超過時は再試行しないようにする

---

### ★★★ 問題発生時に管理者へ通知する機能の追加

バックグラウンドで定期的（数十秒〜数分に1回）にAWSとの疎通確認を行い、連続失敗時に管理者へ通知する機能を追加する。

1. Raspberry Pi → API Gateway → Lambda に定期的に疎通確認リクエストを送信するヘルスチェック機能を実装する
2. `MAX_FAIL_COUNT` 回連続で失敗した場合、Teams や LINE で管理者に通知する
3. 問題発生フラグをファイルや DB に保存し、発生中はタスクを取り出さず、疎通確認できた場合のみ処理を再開するようにする

> 💡 上記のキューイング処理の改良と組み合わせることで、接続回復時の自動再試行も実現できる。
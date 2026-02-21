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

- （難易度：★★★）制御部のキューイング処理の改良
  - 現状「失敗した処理（`status='failed'`）」に対して再試行されないため、**指数関数バックオフ＋ジッター**による再試行機能を追加
    - `/src/worker/worker_runner.py` に修正を加えて、`status='failed'` のタスクに対して一定間隔を空けて再試行するように変更
    - 再試行が無限に繰り返されるのを避けるために「再試行回数の上限（`MAX_RETRY_COUNT`）」を設定できるようにする必要がある。そのためには `/src/data/tasks.db` と `/src/data/.init_db.py` を変更し、`status='failed'` のタスクに対して再試行が実行された回数を記録できる `retry_count` などの列を追加する必要がある
    - 現時点では `status='pending'` のタスクしか処理していないため、失敗したタスクも取り出せるように `/src/shared/task_queue.py` の `get_next_pending_task()` の処理を工夫する必要がある（例：`status='pending'` のタスクが存在しない場合、`status='failed'` かつ `retry_count` が `MAX_RETRY_COUNT` 未満のタスクを古い順に取り出して返すようにする）
- （難易度：★☆☆）制御部の `.env` の暗号化
  - 現状 `/src/.env` の中身は平文のため、**デバイス固有の情報（例：MACアドレス）を鍵として暗号化**しておき、使用時に復号化して利用するように変更
    - `/src/shared/codec.py` に暗号化・復号化関数を作成し、`/src/shared/aws_client.py` で `/src/.env` からパラメータを読み込む際に復号化関数を通して読み込むように変更
    - `/src/.env` 作成時に暗号化関数を使って各パラメータを暗号化するように変更（セットアップ手順を記載したドキュメント類も合わせて更新する）
- （難易度：★★☆）重要パラメータの管理方法の改善
  - 制御部の `/src/.env` に記載している `IDENTITY_POOL_ID` を **AWS Secrets Manager** から取得するように変更
    - `/src/shared/aws_client.py` にコメントアウトしてある該当箇所のコメントアウトを外せば動作するはずだが、AWS側の権限（IAMポリシー）周りのエラーが解決できず断念している状態のため、そこから引き続き調査してほしい
- （難易度：★★★）制御部で問題発生時に管理者へ通知する機能の追加
  - 問題発生を検知するために、バックグラウンドで定期的（数十秒〜数分に1回程度）にAWSとのインターネット接続をヘルスチェックする機能を追加する必要がある（例：Raspberry Pi → API Gateway → Lambda に対して疎通確認用のリクエストを送信する）
  - ヘルスチェックが `MAX_FAIL_COUNT` 回連続して失敗した場合、管理者に通知メッセージを送信する（例：Teams、LINE）
  - この機能と上記のキューイング処理を組み合わせることで、インターネット接続が回復したタイミングで自動的に再試行される仕組みが実現できるはず（例：問題が発生中は `status='pending'` や `status='failed'` を問わず一切タスクを取り出さない → 疎通が確認できた場合のみタスクを処理する）
    - これを実現するには、「`MAX_FAIL_COUNT` 回連続して失敗した場合に問題発生フラグをファイルやDBに保存する」などして、プログラムのどこからでも現在の接続状態を参照できるようにする必要がある
- （難易度：★★☆）タスクの処理状況を可視化するダッシュボードの追加
  - 現状 `/src/data/tasks.db` を直接参照しないとタスクの処理状況を確認できないため、運用時に状況を把握しやすくする仕組みを追加
    - 簡易的な **Web UI**（例：FlaskやFastAPIで構築）を用意し、`status` ごとのタスク一覧や `retry_count`・タイムスタンプなどを一覧表示できるようにする
      - Raspberry Pi上でローカルネットワーク越しにアクセスできるようにしておくと、実機に直接ログインしなくても確認できて便利
    - Web UIの構築が難しい場合は、`tasks.db` の内容を **CSVエクスポートするスクリプト**を用意するだけでもデバッグ時の確認コストを大きく下げられる
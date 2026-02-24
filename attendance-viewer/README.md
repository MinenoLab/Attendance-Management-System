# 【Raspberry Pi】カードリーダー式在籍確認システム（attendance-viewer）

## 表示デバイスの設定手順

### システムの最新化と必須パッケージの導入
```
# システムの完全なアップデート
$ sudo apt update
$ sudo apt full-upgrade -y

# 必須パッケージのインストール
# chromium: 画面表示用ブラウザ
# unclutter: マウスカーソルの自動非表示化
# fonts-noto-color-emoji: 日本語および絵文字の文字化け防止
# chrony: 高精度な時刻同期
$ sudo apt install -y chromium unclutter fonts-noto-color-emoji chrony
```

### 時刻同期の設定
```
# chronyの設定ファイルを上書き(順に入力してください)
$ sudo bash -c 'cat > /etc/chrony/chrony.conf << EOF
pool ntp.nict.jp iburst
driftfile /var/lib/chrony/drift
makestep 1.0 3
rtcsync
logdir /var/log/chrony
EOF'

# サービスの有効化と初回同期の強制実行
$ sudo systemctl enable chrony
$ sudo systemctl restart chrony
$ sudo chronyc makestep
```

### ディスプレイ環境の最適化（X11への移行）
```
# デスクトップ環境を「X11」に設定
$ sudo raspi-config

# メニューから以下を選択します：
# 6 Advanced Options -> A7 Wayland -> W1 X11 を選択
# 設定後，「Finish」を選択して再起動（reboot）します．
$ sudo reboot
```

### 統合した起動スクリプトの配置
画面制御，ネットワーク待機，クラッシュリカバリ，ブラウザ起動の全プロセスを単一のスリプトで一元管理します．
これにより起動時のプロセス競合を防ぎます．
```
# スクリプトの作成
$ nano ~/start_kiosk.sh
```

以下の内容を書き込んでください

```
#!/bin/bash
# Raspberry Pi 5 Kiosk Mode Unified Startup Script

# X11環境変数の明示的宣言
export DISPLAY=:0
export XAUTHORITY=$HOME/.Xauthority

configure_system_and_launch() {
    # ログ出力の設定（トラブルシューティング用）
    local log_file="$HOME/kiosk_error.log"
    exec 1>>"$log_file" 2>&1
    echo "=== Kiosk Startup: $(date) ==="

    # 1. ディスプレイ設定：スクリーンセーバーの無効化とマウスカーソルの隠蔽
    xset s noblank
    xset s off
    xset +dpms
    xset dpms 0 0 0
    unclutter -idle 1 -root &
    echo "Display settings applied."

    # 2. 画面の回転監視：不意な解像度変更時も常に縦画面（left）を維持する非同期処理
    while true; do
        if ! xrandr | grep "HDMI-1 connected" | grep -q "left ("; then
            xrandr --output HDMI-1 --rotate left
        fi
        sleep 5
    done &
    echo "Rotation monitor started."

    # 3. ネットワーク待機：オフライン状態でブラウザが起動しエラー画面で停止するのを防ぐ
    local max_attempts=30
    local attempt=0
    while [ $attempt -lt $max_attempts ]; do
        if curl -s --head http://www.google.com > /dev/null; then
            echo "Network is up."
            break
        fi
        sleep 1
        attempt=$((attempt+1))
    done

    # 4. クラッシュリカバリ：電源断などでブラウザが不正終了した際の「復元ダイアログ」を抑制
    local pref_path="$HOME/.config/chromium/Default/Preferences"
    if [ -f "$pref_path" ]; then
        sed -i 's/"exited_cleanly":false/"exited_cleanly":true/' "$pref_path" 2>/dev/null
        sed -i 's/"exit_type":"Crashed"/"exit_type":"Normal"/' "$pref_path" 2>/dev/null
        echo "Chromium preferences cleaned."
    fi

    # 5. Kioskブラウザの実行：全画面表示かつKeyringのパスワードプロンプトを抑止してURLを開く
    echo "Launching Chromium..."
    chromium --kiosk --noerrdialogs --disable-infobars --disable-extensions --password-store=basic "https://main.XXX.amplifyapp.com/"
}

configure_system_and_launch
```
### 自動起動の設定
```
# 実行権限の付与
$ chmod +x ~/start_kiosk.sh

# 自動起動用デスクトップエントリの作成
$ mkdir -p ~/.config/autostart
$ nano ~/.config/autostart/system_kiosk.desktop

# 以下の内容をすべて書き込んでください
[Desktop Entry]
Type=Application
Name=System Kiosk
Exec=/home/pi/start_kiosk.sh
Comment=Unified Kiosk Startup Script
```
### 定期タスクと省電力制御
```
$ crontab -e

# 以下の内容を書き込んでください
# 毎日午前8時にシステムを再起動し，クリーンな状態で稼働を開始する
0 8 * * * /sbin/reboot

# 毎日午前0時にディスプレイの電源出力をオフにする
0 0 * * * DISPLAY=:0 XAUTHORITY=/home/pi/.Xauthority /usr/bin/xset dpms force off

# 毎日午前7時にディスプレイの電源出力をオンにする
0 7 * * * DISPLAY=:0 XAUTHORITY=/home/pi/.Xauthority /usr/bin/xset dpms force on
```

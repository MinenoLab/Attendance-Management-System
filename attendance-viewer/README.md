# 【Raspberry Pi】カードリーダー式在籍確認システム（attendance-viewer）

## 表示デバイスの設定手順

```
# システムの完全なアップデート
$ sudo apt update
$ sudo apt full-upgrade -y

# 必須パッケージのインストール（Chromium，マウス非表示，フォント，NTP）
$ sudo apt install -y chromium unclutter fonts-noto-color-emoji chrony
```

```
# chronyの設定ファイルを上書き
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

```
# デスクトップ環境を「X11」に設定
$ sudo raspi-config

# メニューから以下を選択します：
# 6 Advanced Options -> A6 Wayland -> W1 X11 を選択
# 設定後，「Finish」を選択して再起動（reboot）します．
# 
```

実行スクリプト
```
$ nano ~/start_kiosk.sh

#!/bin/bash
# Raspberry Pi 5 Kiosk Mode Unified Startup Script

# X11環境変数の明示的宣言
export DISPLAY=:0
export XAUTHORITY=$HOME/.Xauthority

configure_system_and_launch() {
    # ログ出力の設定
    local log_file="$HOME/kiosk_error.log"
    exec 1>>"$log_file" 2>&1
    echo "=== Kiosk Startup: $(date) ==="

    # 1. ディスプレイと入力デバイスの最適化
    xset s noblank
    xset s off
    xset +dpms
    xset dpms 0 0 0
    unclutter -idle 1 -root &
    echo "Display settings applied."

    # 2. 画面の回転維持プロセス（非同期監視）
    while true; do
        if ! xrandr | grep "HDMI-1 connected" | grep -q "left ("; then
            xrandr --output HDMI-1 --rotate left
        fi
        sleep 5
    done &
    echo "Rotation monitor started."

    # 3. ネットワーク接続の確実な待機
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

    # 4. ブラウザのクラッシュリカバリ状態の初期化
    local pref_path="$HOME/.config/chromium/Default/Preferences"
    if [ -f "$pref_path" ]; then
        sed -i 's/"exited_cleanly":false/"exited_cleanly":true/' "$pref_path" 2>/dev/null
        sed -i 's/"exit_type":"Crashed"/"exit_type":"Normal"/' "$pref_path" 2>/dev/null
        echo "Chromium preferences cleaned."
    fi

    # 5. Kioskブラウザの実行（Keyringプロンプト抑止フラグ付き）
    echo "Launching Chromium..."
    # パスワードストアをbasicに指定し，Keyringのプロンプトを抑止する
    chromium --kiosk --noerrdialogs --disable-infobars --disable-extensions --password-store=basic "https://main.xxxx.amplifyapp.com/"
}

configure_system_and_launch
```

```
$ chmod +x ~/start_kiosk.sh
```

```
$ mkdir -p ~/.config/autostart
$ nano ~/.config/autostart/system_kiosk.desktop

[Desktop Entry]
Type=Application
Name=System Kiosk
Exec=/home/pi/start_kiosk.sh
Comment=Unified Kiosk Startup Script
```

```
$ crontab -e

0 8 * * * /sbin/reboot
0 0 * * * DISPLAY=:0 XAUTHORITY=/home/pi/.Xauthority /usr/bin/xset dpms force off
0 7 * * * DISPLAY=:0 XAUTHORITY=/home/pi/.Xauthority /usr/bin/xset dpms force on
```

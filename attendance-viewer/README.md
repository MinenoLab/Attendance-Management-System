# 【Raspberry Pi】カードリーダー式在籍確認システム（attendance-viewer）

## 表示デバイスの設定手順

```
# 初期システム設定
$ sudo apt update
$ sudo apt full-upgrade -y

# マウスカーソルを非表示にするパッケージのインストール
$ sudo apt install unclutter -y

# Chromiumブラウザの自動起動設定
$ mkdir -p ~/.config/autostart
$ nano ~/.config/autostart/kiosk.desktop

# 以下の内容を張り付けて保存
# 注意：http://localhost/の部分は，表示したいウェブページのURLに置き換えてください．
[Desktop Entry]
Type=Application
Name=Kiosk
Comment=Kiosk mode browser
Exec=chromium-browser --kiosk --noerrdialogs --disable-infobars --disable-extensions http://localhost/
```

```
# フォント設定
$ sudo apt-get update
$ sudo apt-get install fonts-noto-color-emoji
$ sudo fc-cache -f -v
$ sudo reboot
```

```
# デスクトップ環境を「X11」に設定
# 6 Advanced Options → A6 Wayland → W1 X11を選択
$ sudo raspi-config

# 省電力機能（DPMS）の有効化
$ sudo nano /etc/xdg/lxsession/LXDE-pi/autostart

# 以下の内容で全て更新して保存（既存の内容は全て削除してから貼り付け）
@lxpanel --profile LXDE-pi
@pcmanfm --desktop --profile LXDE-pi
@xscreensaver -no-splash
@xset s noblank
@xset s off
@xset -dpms
@unclutter -idle 1 -root
@xrandr --output HDMI-1 --rotate left

# 画面の90度回転と設定の維持
$ nano ~/rotation_fix.sh

# 以下の内容を張り付けて保存
# 注意：HDMI-1の部分は，環境に合わせて変更してください．
# 補足：xrandrコマンドを実行し，connectedと表示されているポート名（例：HDMI-2, DSI-1）を使用します．
#!/bin/bash
export DISPLAY=:0
while true; do
    if ! xrandr | grep "HDMI-1 connected" | grep -q "left ("; then
        xrandr --output HDMI-1 --rotate left
    fi
    sleep 5
done

$ chmod +x ~/rotation_fix.sh

# 回転スクリプトの自動起動設定
$ nano ~/.config/autostart/rotation_fix.desktop

# 以下の内容を張り付けて保存
[Desktop Entry]
Type=Application
Name=Rotation Fix
Exec=/home/pi/rotation_fix.sh
Comment=Constantly fixes screen rotation

$ sudo reboot
```

```
# 指定時間の自動スリープ＆復帰設定
$ sudo crontab -e

# 以下の内容を張り付けて保存
0 9 * * * /sbin/reboot
0 22 * * * DISPLAY=:0 XAUTHORITY=/home/pi/.Xauthority /usr/bin/xset dpms force off
0 7 * * * DISPLAY=:0 XAUTHORITY=/home/pi/.Xauthority /usr/bin/xset dpms force on

$ sudo reboot
```

再起動後，ブラウザが縦画面のキオスクモードで立ち上がり，モニターの電源を入れ直しても縦画面が維持され，指定した時間に画面がON/OFFされれば，すべての設定は完了です．

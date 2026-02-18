# 【Raspberry Pi】カードリーダー式在室確認システム（device-reader）

## 制御デバイスの設定手順

```
# 初期システム設定
$ sudo apt update
$ sudo apt full-upgrade -y
```

```
# フォント設定
$ sudo apt-get update
$ sudo apt-get install fonts-noto-color-emoji
$ sudo fc-cache -f -v
$ sudo reboot
```

```
# Gitリポジトリのクローン
$ git clone https://github.com/muumin1107/AttendanceManagementSystem.git
$ pip install -r requirements.txt
```

```
# FastAPIサーバーの起動設定
$ sudo nano /etc/systemd/system/attendance-api.service

# 以下の内容を張り付けて保存
[Unit]
Description=Attendance API Server
After=network.target

[Service]
User=pi
WorkingDirectory=/home/pi/Attendance-Management-System/attendance-reader
ExecStart=/home/pi/Attendance-Management-System/attendance-reader/start_api_server.sh
Restart=always

[Install]
WantedBy=multi-user.target
```

```
# Reactサーバーの起動設定
$ sudo nano /etc/systemd/system/attendance-web.service

# 以下の内容を張り付けて保存
[Unit]
Description=React Frontend Web Server
After=network-online.target
Wants=network-online.target

[Service]
User=pi
WorkingDirectory=/home/pi/Attendance-Management-System/attendance-reader
ExecStart=/home/pi/Attendance-Management-System/attendance-reader/start_web_server.sh
Restart=always

[Install]
WantedBy=multi-user.target
```

```
# ワーカーの起動設定
$ sudo nano /etc/systemd/system/attendance-worker.service

# 以下の内容を張り付けて保存
[Unit]
Description=Attendance Worker Service
After=network.target

[Service]
User=pi
WorkingDirectory=/home/pi/Attendance-Management-System/attendance-reader
ExecStart=/home/pi/Attendance-Management-System/attendance-reader/start_worker.sh
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```
# DB初期化の設定
$ crontab -e

# 以下の内容を張り付けて保存
0 1 * * * /home/pi/attendance_system/start_init_db.sh
```

※ `/home/pi/Attendace-Management-System/attendance-reader/src/data/.init_db.py`を初回だけ手動で実行する

```
# 再起動設定
$ sudo crontab -e

# 以下の内容を張り付けて保存
0 8 * * * /sbin/reboot

$ sudo reboot
```

※ `/home/pi/Attendace-Management-System/attendance-reader/src/app/main.py`のFastAPIサーバーのCORS設定の部分を変更する

## 補足：カードリーダーの設定方法

Raspberry Pi 4BのUSBポートにNFCカードリーダー（RC-S380 S）を接続した状態で起動

- カードリーダーを認識しているかを確認
```
$ lsusb

# 出力例
Bus 002 Device 001: ID 1d6b:0003 Linux Foundation 3.0 root hub
Bus 001 Device 003: ID 054c:06c1 Sony Corp. RC-S380/S          # <-NFCカードリーダーが表示されていればOK
Bus 001 Device 002: ID 2109:3431 VIA Labs, Inc. Hub
Bus 001 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub

# nfcpyのインストール
$ sudo pip install nfcpy
```

- nfcpyが適切インストールされているか確認する
```
$ cd ~
$ git clone https://github.com/nfcpy/nfcpy.git
$ sudo python3 nfcpy/examples/tagtool.py show

$ python3 -m nfc

# 出力例
This is the 1.0.4 version of nfcpy run in Python 3.9.x
on Linux-6.1.x-aarch64-with-glibc2.31
I'm now searching your system for contactless devices
** found usb:054c:06c1 at usb:xxx:xxx but access is denied
-- the device is owned by 'root' but you are '***'
-- also members of the 'root' group would be permitted
-- you could use 'sudo' but this is not recommended
-- better assign the device to the 'plugdev' group
   sudo sh -c 'echo SUBSYSTEM=="usb", ACTION=="add", ATTRS{idVendor}=="054c", ATTRS{idProduct}=="06c1", GROUP="plugdev" >> /etc/udev/rules.d/nfcdev.rules'
   sudo udevadm control -R # then re-attach device
I'm not trying serial devices because you haven't told me
-- add the option '--search-tty' to have me looking
-- but beware that this may break other serial devs
Sorry, but I couldn't find any contactless device

# -- better assign the device to the 'plugdev' group以下に記載のコマンドを実行する
# 上記の出力例の場合
$ sudo sh -c 'echo SUBSYSTEM=="usb", ACTION=="add", ATTRS{idVendor}=="054c", ATTRS{idProduct}=="06c1", GROUP="plugdev" >> /etc/udev/rules.d/nfcdev.rules'
$ sudo udevadm control -R # then re-attach device
```
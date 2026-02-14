# 縲審aspberry Pi縲代き繝ｼ繝峨Μ繝ｼ繝繝ｼ蠑丞惠邀咲｢ｺ隱阪す繧ｹ繝・Β・・ttendance-viewer・・

## 陦ｨ遉ｺ繝・ヰ繧､繧ｹ縺ｮ險ｭ螳壽焔鬆・

```
# 蛻晄悄繧ｷ繧ｹ繝・Β險ｭ螳・
$ sudo apt update
$ sudo apt full-upgrade -y

# 繝槭え繧ｹ繧ｫ繝ｼ繧ｽ繝ｫ繧帝撼陦ｨ遉ｺ縺ｫ縺吶ｋ繝代ャ繧ｱ繝ｼ繧ｸ縺ｮ繧､繝ｳ繧ｹ繝医・繝ｫ
$ sudo apt install unclutter -y

# Chromium繝悶Λ繧ｦ繧ｶ縺ｮ閾ｪ蜍戊ｵｷ蜍戊ｨｭ螳・
$ mkdir -p ~/.config/autostart
$ nano ~/.config/autostart/kiosk.desktop

# 莉･荳九・蜀・ｮｹ繧貞ｼｵ繧贋ｻ倥￠縺ｦ菫晏ｭ・
# 豕ｨ諢擾ｼ喇ttp://localhost/縺ｮ驛ｨ蛻・・・瑚｡ｨ遉ｺ縺励◆縺・え繧ｧ繝悶・繝ｼ繧ｸ縺ｮURL縺ｫ鄂ｮ縺肴鋤縺医※縺上□縺輔＞・・
[Desktop Entry]
Type=Application
Name=Kiosk
Comment=Kiosk mode browser
Exec=chromium-browser --kiosk --noerrdialogs --disable-infobars --disable-extensions http://localhost/
```

```
# 繝・せ繧ｯ繝医ャ繝礼腸蠅・ｒ縲傾11縲阪↓險ｭ螳・
# 6 Advanced Options 竊・A6 Wayland 竊・W1 X11繧帝∈謚・
$ sudo raspi-config

# 逵・崕蜉帶ｩ溯・・・PMS・峨・譛牙柑蛹・
$ sudo nano /etc/xdg/lxsession/LXDE-pi/autostart

# 莉･荳九・蜀・ｮｹ縺ｧ蜈ｨ縺ｦ譖ｴ譁ｰ縺励※菫晏ｭ假ｼ域里蟄倥・蜀・ｮｹ縺ｯ蜈ｨ縺ｦ蜑企勁縺励※縺九ｉ雋ｼ繧贋ｻ倥￠・・
@lxpanel --profile LXDE-pi
@pcmanfm --desktop --profile LXDE-pi
@xscreensaver -no-splash
@xset s noblank
@xset s off
@xset -dpms
@unclutter -idle 1 -root
@xrandr --output HDMI-1 --rotate left

# 逕ｻ髱｢縺ｮ90蠎ｦ蝗櫁ｻ｢縺ｨ險ｭ螳壹・邯ｭ謖・
$ nano ~/rotation_fix.sh

# 莉･荳九・蜀・ｮｹ繧貞ｼｵ繧贋ｻ倥￠縺ｦ菫晏ｭ・
# 豕ｨ諢擾ｼ唏DMI-1縺ｮ驛ｨ蛻・・・檎腸蠅・↓蜷医ｏ縺帙※螟画峩縺励※縺上□縺輔＞・・
# 陬懆ｶｳ・噎randr繧ｳ繝槭Φ繝峨ｒ螳溯｡後＠・慶onnected縺ｨ陦ｨ遉ｺ縺輔ｌ縺ｦ縺・ｋ繝昴・繝亥錐・井ｾ具ｼ唏DMI-2, DSI-1・峨ｒ菴ｿ逕ｨ縺励∪縺呻ｼ・
#!/bin/bash
export DISPLAY=:0
while true; do
    if ! xrandr | grep "HDMI-1 connected" | grep -q "left ("; then
        xrandr --output HDMI-1 --rotate left
    fi
    sleep 5
done

$ chmod +x ~/rotation_fix.sh

# 蝗櫁ｻ｢繧ｹ繧ｯ繝ｪ繝励ヨ縺ｮ閾ｪ蜍戊ｵｷ蜍戊ｨｭ螳・
$ nano ~/.config/autostart/rotation_fix.desktop

# 莉･荳九・蜀・ｮｹ繧貞ｼｵ繧贋ｻ倥￠縺ｦ菫晏ｭ・
[Desktop Entry]
Type=Application
Name=Rotation Fix
Exec=/home/pi/rotation_fix.sh
Comment=Constantly fixes screen rotation

$ sudo reboot
```

```
# 謖・ｮ壽凾髢薙・閾ｪ蜍輔せ繝ｪ繝ｼ繝暦ｼ・ｾｩ蟶ｰ險ｭ螳・
$ sudo crontab -e

# 莉･荳九・蜀・ｮｹ繧貞ｼｵ繧贋ｻ倥￠縺ｦ菫晏ｭ・
0 9 * * * /sbin/reboot
0 22 * * * DISPLAY=:0 XAUTHORITY=/home/pi/.Xauthority /usr/bin/xset dpms force off
0 7 * * * DISPLAY=:0 XAUTHORITY=/home/pi/.Xauthority /usr/bin/xset dpms force on

$ sudo reboot
```

蜀崎ｵｷ蜍募ｾ鯉ｼ後ヶ繝ｩ繧ｦ繧ｶ縺檎ｸｦ逕ｻ髱｢縺ｮ繧ｭ繧ｪ繧ｹ繧ｯ繝｢繝ｼ繝峨〒遶九■荳翫′繧奇ｼ後Δ繝九ち繝ｼ縺ｮ髮ｻ貅舌ｒ蜈･繧檎峩縺励※繧らｸｦ逕ｻ髱｢縺檎ｶｭ謖√＆繧鯉ｼ梧欠螳壹＠縺滓凾髢薙↓逕ｻ髱｢縺薫N/OFF縺輔ｌ繧後・・後☆縺ｹ縺ｦ縺ｮ險ｭ螳壹・螳御ｺ・〒縺呻ｼ・
## 繝・せ繝育畑URL

髢狗匱縺翫ｈ縺ｳ繝・せ繝域凾縺ｫ迚ｹ螳壹・繝壹・繧ｸ繧定｡ｨ遉ｺ縺吶ｋ縺溘ａ縺ｮURL繝代Λ繝｡繝ｼ繧ｿ・・

- **繝ｦ繝ｼ繧ｶ繝ｼ逋ｻ骭ｲ菫・ｲ繝壹・繧ｸ**: `/?test=registration`
  - 4/1縺ｮ繝・・繧ｿ繝ｪ繧ｻ繝・ヨ蠕後↓陦ｨ遉ｺ縺輔ｌ繧九Θ繝ｼ繧ｶ繝ｼ逋ｻ骭ｲ繧剃ｿ・☆繝壹・繧ｸ
  - 螳滄圀縺ｫ繝ｦ繝ｼ繧ｶ繝ｼ繝・・繧ｿ繧貞炎髯､縺帙★縺ｫ繝壹・繧ｸ繧偵・繝ｬ繝薙Η繝ｼ蜿ｯ閭ｽ

- **繧ｨ繝ｩ繝ｼ繝壹・繧ｸ**: `/?test=error`
  - 繧ｨ繝ｩ繝ｼ繝壹・繧ｸ縺ｮ繝・せ繝郁｡ｨ遉ｺ
  - 繝・せ繝育畑縺ｮ繧ｨ繝ｩ繝ｼ繝｡繝・そ繝ｼ繧ｸ縺瑚｡ｨ遉ｺ縺輔ｌ縺ｾ縺
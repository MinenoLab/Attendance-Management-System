# Raspberry Pi 絵文字表示設定

## 絵文字フォントのインストール

Raspberry Pi OSで絵文字を正しく表示するには、絵文字フォントのインストールが必要です。

### 1. システムの更新
```bash
sudo apt-get update
```

### 2. 絵文字フォントのインストール
```bash
# Noto Color Emojiフォント（推奨）
sudo apt-get install fonts-noto-color-emoji

# 代替フォント（上記で解決しない場合）
sudo apt-get install fonts-emojione
```

### 3. フォントキャッシュの更新
```bash
sudo fc-cache -f -v
```

### 4. ブラウザの再起動
フォントインストール後、ブラウザを完全に再起動してください。

### 5. 確認方法
ターミナルで以下のコマンドを実行し、絵文字フォントがインストールされているか確認できます：
```bash
fc-list | grep -i emoji
```

## トラブルシューティング

### それでも表示されない場合

1. **Chromiumの設定（Raspberry Pi OS Bullseye以降）**
   ```bash
   # Chromiumを使用している場合
   chromium-browser --enable-features=FreeType
   ```

2. **フォント設定ファイルの作成**
   ```bash
   sudo nano /etc/fonts/local.conf
   ```
   
   以下の内容を追加：
   ```xml
   <?xml version="1.0"?>
   <!DOCTYPE fontconfig SYSTEM "fonts.dtd">
   <fontconfig>
     <alias>
       <family>sans-serif</family>
       <prefer>
         <family>Noto Color Emoji</family>
       </prefer>
     </alias>
   </fontconfig>
   ```

3. **システムの再起動**
   ```bash
   sudo reboot
   ```

## キオスクモード設定例

### Chromiumでのキオスクモード
```bash
chromium-browser --kiosk --app=http://localhost:3000
```

### Firefoxでのキオスクモード
```bash
firefox --kiosk http://localhost:3000
```

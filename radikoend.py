import mmap
import time
import os
import setting

#変数mmをb"01" -> b"11" に書き換えるためのコード（番組再生状態から番組終了状態に遷移させるトリガーを発生させる)

with open(setting.TXTPATH, "r+b") as f:
    mm = mmap.mmap(f.fileno(), 0)
    mm[:] = b"11" #再生をストップする信号を送っている。
    time.sleep(2) #radiko.pyが終了するまで待機している。
    mm[:] = b"00" #stateを初期化する。

#os.system('pgrep Xvfb  | xargs kill -9') #Webスクレイピング実行時の仮想Dispay Xvfbを停止する。
#os.system('pgrep chromedriver  | xargs kill -9') #chromedriverのProcessを停止する。
#Os.system('pgrep chromium-browse | xargs kill -9') #chromeのProcessを停止する。

print('#FINISH#')

    

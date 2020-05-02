from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException
import time
import pandas as pd
from selenium.webdriver.chrome.options import Options
import subprocess
import os
from pyvirtualdisplay import Display
import sys
from io import TextIOWrapper
import mmap
import json


#以前のXvfbが起動状態のままであれば一旦削除する
#os.system('pgrep Xvfb  | xargs kill -9') #Webスクレイピング実行時の仮想Dispay Xvfbを停止する。
#os.system('pgrep chromedriver  | xargs kill -9') #chromedriverのProcessを停止する。
#os.system('pgrep chromium-browse | xargs kill -9') #chromeのProcessを停止する。


#pyvirtualdisplayパッケージを使って仮想ディスプレイ（Xvfb）を起動させてSeleniumを使う方法
display = Display(visible=0, size=(1024, 1024))
display.start()


f = open('radiko.csv', 'r')  #JSONファイルを開く
#print("A1")
json_dict = json.load(f) #開いたJSONファイルからJSONデータを読み出す。
DATE=json_dict['date'] 
JIKAN=json_dict['jikan']

#print('OUTPUT')
#print(DATE)
#sprint(JIKAN)

#'ascii' codec can't encode characters in position 0-6: ordinal not in range(128)エラー対策実施
#sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8') 
#sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

#chromedriverの設定
options = Options() 
options.add_argument('--headless')
options.add_argument('--disable-gpu')

    

class RADIKOLISTEN():

    def __init__(self,DATE,JIKAN):
    
        self.date=DATE
        self.jikan=JIKAN 
        self.browser=''

    
    ########## 指定した番組を再生する ###########################
    
    def radikoget(self):

        if self.jikan=='2130' or self.jikan=='2115':
            URL='https://radiko.jp/#!/ts/RN1/2020' + self.date + self.jikan +'00'
        else : 
            URL='https://radiko.jp/#!/ts/RN2/2020' + self.date + self.jikan +'00'
        #print("A1")
        #self.browser = webdriver.Chrome(options=options) # Chromeを準備(optionでブラウザ立ち上げ停止にしている)        
        self.browser = webdriver.Chrome(options=options,executable_path="/usr/bin/chromedriver") # Chromeを準備(optionでブラウザ立ち上げ停止にしている)
        #self.browser = webdriver.Chrome(executable_path="/usr/bin/chromedriver") # Chromeを準備(optionでブラウザ立ち上げ停止にしている)
        #print("A2")
        self.browser.set_window_size(1024, 1024)
        self.browser.get(URL)  #サイトを開く。ブラウザ自体は立ち上げない
        xpath0='//*[@id="cboxLoadedContent"]/div[2]/button'
        xpath='//*[@id="now-programs-list"]/div[1]/div[2]/p[4]/a'
        xpath1='//*[@id="colorbox--term"]/p[5]/a'
        try:

            elem_btn0 = self.browser.find_element_by_xpath(xpath0) #始めの警告BOXのボタンを探し出す
            elem_btn0.click() #ボタンをクリックする
            time.sleep(1)

            elem_btn = self.browser.find_element_by_xpath(xpath) #再生ボタンオブジェクトをサーチする
            elem_btn.click() #再生ボタンをクリックする

            time.sleep(3)

            elem_btn2 = self.browser.find_element_by_xpath(xpath1) #注意書きポップアップのOKボタンを探す
            elem_btn2.click() #OKを押す
            #print("START")
        #エラーをキャッチする。
        except Exception as e:
            print(e)
            with open("radiko.txt", "r+b") as f:
                mm[:] = b"11" #スクレイピング作業エラー検出したのでState=2にする               
            self.browser.close() #ブラウザを閉じる          


try:
    with open("radiko.txt", "r+b") as f:
        mm = mmap.mmap(f.fileno(), 0) #ファイルradiko.txtの内容を読み込む。
        mm[:] = b"01" #スクレイピング作業を実施したのでState=1にする



    radiko=RADIKOLISTEN(DATE,JIKAN)  #インスタンスを作成する。
    radiko.radikoget() #指定した番組を再生する。
  
    
    while True:
        mm.seek(0)
        mode=mm.readline()
        #print(mode)
        if mode==b"11":
            break

    #print("END") #何かを入力するとこちらに処理が移る
    mm[:] = b"00"
    radiko.browser.close()#ブラウザを閉じる 

except Exception as e:
    mm[:] = b"00"
    ##radiko.browser.close()#ブラウザを閉じる 

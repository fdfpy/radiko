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


#pyvirtualdisplayパッケージを使って仮想ディスプレイ（Xvfb）を起動させてSeleniumを使う方法
display = Display(visible=0, size=(1024, 1024))
display.start()


f = open('radiko.csv', 'r')  #JSONファイルを開く
json_dict = json.load(f) #開いたJSONファイルからJSONデータを読み出す。
DATE=json_dict['date'] #再生する番組の日付をDATEに格納する
JIKAN=json_dict['jikan'] #再生する番組の時間をDATEに格納する


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
            URL='https://radiko.jp/#!/ts/RN1/2020' + self.date + self.jikan +'00' #ラジオ日経第1にアクセス
        else :  
            URL='https://radiko.jp/#!/ts/RN2/2020' + self.date + self.jikan +'00' #ラジオ日経第2にアクセス
     
        self.browser = webdriver.Chrome(options=options,executable_path="/usr/bin/chromedriver") # Chromeを準備(optionでブラウザ立ち上げ停止にしている)
        self.browser.set_window_size(1024, 1024)
        self.browser.get(URL)  #サイトを開く。ブラウザ自体は立ち上げない
        xpath0='//*[@id="cboxLoadedContent"]/div[2]/button' #警告メッセージのBOXボタンのXPATHを指定している。
        xpath='//*[@id="now-programs-list"]/div[1]/div[2]/p[4]/a' #再生ボタンのBOXボタンのXPATHを指定している。
        xpath1='//*[@id="colorbox--term"]/p[5]/a' #注意書きポップアップのBOXボタンのXPATHを指定している
        try:
            elem_btn0 = self.browser.find_element_by_xpath(xpath0) #始めの警告BOXのボタンを探し出す
            elem_btn0.click() #ボタンをクリックする
            time.sleep(1)

            elem_btn = self.browser.find_element_by_xpath(xpath) #再生ボタンオブジェクトをサーチする
            elem_btn.click() #再生ボタンをクリックする

            time.sleep(3)

            elem_btn2 = self.browser.find_element_by_xpath(xpath1) #注意書きポップアップのOKボタンを探す
            elem_btn2.click() #OKを押す

        #Webスクレイピングにエラーが発生した場合、エラーをキャッチし下記のコードを実行する
        except Exception as e:
            print(e)
            with open("radiko.txt", "r+b") as f:
                mm[:] = b"11" #スクレイピング作業エラー検出したのでState=2にする               
            self.browser.close() #ブラウザを閉じる          



##### 下記よりメインプログラム ########

try:
    with open("radiko.txt", "r+b") as f:
        mm = mmap.mmap(f.fileno(), 0) #ファイルradiko.txtの内容を読み込む。
        mm[:] = b"01" #スクレイピング作業を実施したのでState=1にする

    radiko=RADIKOLISTEN(DATE,JIKAN)  #インスタンスを作成する。
    radiko.radikoget() #指定した番組を再生する。
  
    #mode=b"11"が書き込まれるまで番組再生状態が維持される。
    while True:
        mm.seek(0)
        mode=mm.readline()
        #print(mode)
        if mode==b"11":
            break

    #mode=b"11"が書き込まれたら下記を実行する。
    mm[:] = b"00"
    radiko.browser.close()#ブラウザを閉じる 


#エラーが発生した場合、下記を実行する
except Exception as e:
    mm[:] = b"00"


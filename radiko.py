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
import json,datetime
import setting



#pyvirtualdisplayパッケージを使って仮想ディスプレイ（Xvfb）を起動させてSeleniumを使う方法
display = Display(visible=0, size=(1024, 1024))
display.start()


f = open(setting.CSVPATH, 'r')  #JSONファイルを開く
json_dict = json.load(f) #開いたJSONファイルからJSONデータを読み出す。

#print(json_dict)
DATE=json_dict['date'] #再生する番組の日付をDATEに格納する
JIKAN=json_dict['jikan'] #再生する番組の時間をDATEに格納する
STA=json_dict['sta'] #モード(STA)を読み出す。STA=0,1,2
CNT=json_dict['cnt'] #cntを読み出す。cnt(連続再生何回目か？)
BROD=json_dict['brod'] #brodを読み出す。brod(放送局)

#chromedriverの設定
options = Options() 
options.add_argument('--headless')
options.add_argument('--disable-gpu')

    

class RADIKOLISTEN():

    def __init__(self,DATE,JIKAN,STA,CNT,BROD):
    
        self.date=DATE
        self.jikan=JIKAN
        self.sta=int(STA) 
        self.cnt=int(CNT)
        self.brod=BROD
        self.browser=''



    ########## 指定した番組を再生する ###########################
    
    def radikoget(self):

        #print("self.sta")
        #print(self.sta)        
        if(self.sta==0):
            URL='https://radiko.jp/#!/live/'+ self.brod


        
        elif(self.sta==1 or self.sta==2):

            #sta=1(連続放送)のとき放送日を進める 
            #print("#60")

            URL='https://radiko.jp/#!/ts/RN1/' + self.date + self.jikan +'00' if  (self.jikan=='1900' or self.jikan=='1930' or self.jikan=='2130' or self.jikan=='2115') else 'https://radiko.jp/#!/ts/RN2/' + self.date + self.jikan +'00'

        


        self.browser = webdriver.Chrome(options=options,executable_path="/usr/bin/chromedriver") # Chromeを準備(optionでブラウザ立ち上げ停止にしている)
        self.browser.set_window_size(1024, 1024)

        #print("#61")

        #print("URL0")
        #print(URL)        
        self.browser.get(URL)  #サイトを開く。ブラウザ自体は立ち上げない
        #print("URL")
        #print(URL)
        xpath0='//*[@id="cboxLoadedContent"]/div[2]/button' #警告メッセージのBOXボタンのXPATHを指定している。
        xpath='//*[@id="now-programs-list"]/div[1]/div[2]/p[4]/a' if (self.sta==1 or self.sta==2) else '//*[@id="now-programs-list"]/div[1]/div[2]/p[3]/a' #再生ボタンのXPATHを指定している。
        xpath1='//*[@id="colorbox--term"]/p[5]/a' #注意書きポップアップのBOXボタンのXPATHを指定している。
        #print("#62")

        try:
            elem_btn0 = self.browser.find_element_by_xpath(xpath0) #始めの警告BOXのボタンを探し出す
            elem_btn0.click() #ボタンをクリックする
            time.sleep(1)
            #print("#63")
            elem_btn = self.browser.find_element_by_xpath(xpath) #再生ボタンオブジェクトをサーチする
            elem_btn.click() #再生ボタンをクリックする

            time.sleep(3)
            #print("#65")         
            if(self.sta==1 or self.sta==2):
               elem_btn2 = self.browser.find_element_by_xpath(xpath1) #注意書きポップアップのOKボタンを探す。Liveの場合は不要
               elem_btn2.click() #OKを押す。Liveの場合は不要
               #print("#64")           







         #Webスクレイピングにエラーが発生した場合、エラーをキャッチし下記のコードを実行する
        except Exception as e:
            print(e)
            with open(setting.TXTPATH, "r+b") as f:
                mm[:] = b"11" #スクレイピング作業エラー検出したのでState=2にする               
            self.browser.close() #ブラウザを閉じる    


     #日にちを1日加える。(例)20201224 -> 20201225
    def addnday(self):
        DATE=self.date
        Y=str(DATE[0:4])
        M=str(DATE[4:6])
        D=str(DATE[6:8])
        YMD=Y+"/"+M+"/"+D
        tdate0=datetime.datetime.strptime(YMD, '%Y/%m/%d') #日付0を文字型から日付型に変換する
        tdate1=tdate0+ datetime.timedelta(days=self.cnt)
        self.date = tdate1.strftime('%Y%m%d') #日付型を文字列型に変形する
 
      



##### 下記よりメインプログラム ########




try:

    with open(setting.TXTPATH, "r+b") as f:
        mm = mmap.mmap(f.fileno(), 0) #ファイルradiko.txtの内容を読み込む。
        mm[:] = b"00" #初期化

    #print("#2")

    if mm[:] == b"00":

        radiko=RADIKOLISTEN(DATE,JIKAN,STA,CNT,BROD)  #インスタンスを作成する。
        radiko.radikoget() #指定した番組を再生する。
        #print("5")
        mm[:] = b"01" #スクレイピング作業を実施したのでState=1にする

  
    #mode=b"11"が書き込まれるまで番組再生状態が維持される。
    while True:
        mm.seek(0)
        mode=mm.readline()
        #print(mode)
        if mode==b"11":
            break

    #mode=b"11"が書き込まれたら下記を実行する。
    mm[:] = b"00"
    #print("#7")

    #sta=1であれば日付を一日進める
    if radiko.sta==1:         
        radiko.cnt=1
        radiko.addnday()

    else:
        radiko.sta=0
        radiko.cnt=0
    
    radiko.browser.close()#ブラウザを閉じる 


    kinddat = {"STA" : radiko.sta,"CNT" : radiko.cnt, "DATE" : radiko.date}
    print(kinddat)

#エラーが発生した場合、下記を実行する
except Exception as e:
    mm[:] = b"00"


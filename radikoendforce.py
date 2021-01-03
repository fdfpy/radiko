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


##Xvfb,chromedriver,chromium-browseのプロセスの強制終了を行う。
os.system('pgrep Xvfb  | xargs kill -9') #Webスクレイピング実行時の仮想Dispay Xvfbを停止する。
os.system('pgrep chromedriver  | xargs kill -9') #chromedriverのProcessを停止する。
os.system('pgrep chromium-browse | xargs kill -9') #chromeのProcessを停止する。



print("FORCEDONE")